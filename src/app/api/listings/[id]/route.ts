import { guard } from "@/lib/guard";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import { listings, users, reviews, wishlists, transactions, rentalRequests, reports } from "@/db/schema";
import { requireUser, notify } from "@/lib/auth";

async function _GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db.select({ listing: listings, seller: users }).from(listings).innerJoin(users, eq(listings.sellerId, users.id)).where(eq(listings.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.update(listings).set({ views: sql`${listings.views} + 1` }).where(eq(listings.id, id));
  const revs = await db.select().from(reviews).where(eq(reviews.revieweeId, rows[0].seller.id));
  const avg = revs.length ? revs.reduce((a, b) => a + b.rating, 0) / revs.length : 0;
  const { passwordHash, ...seller } = rows[0].seller;
  return NextResponse.json({ listing: { ...rows[0].listing, sellerName: seller.name, sellerRating: avg, sellerVerified: seller.isVerified, seller }, reviews: revs });
}

async function _PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const b = await req.json();
  const rows = await db.select().from(listings).where(and(eq(listings.id, id), eq(listings.sellerId, user.id))).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const allowed: Record<string, any> = {};
  for (const k of ["title", "description", "price", "quantity", "unit", "condition", "brand", "status", "images", "state", "district", "village", "pincode", "dailyPrice", "hourlyPrice", "weeklyPrice", "securityDeposit", "exchangeFor", "rentalTerms"]) {
    if (b[k] !== undefined) allowed[k] = b[k];
  }
  if (allowed.status && !["active", "paused", "sold", "removed"].includes(allowed.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const [row] = await db.update(listings).set({ ...allowed, updatedAt: new Date() }).where(eq(listings.id, id)).returning();
  return NextResponse.json({ listing: row });
}

async function _DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await db.update(listings).set({ status: "removed" }).where(and(eq(listings.id, id), eq(listings.sellerId, user.id)));
  return NextResponse.json({ ok: true });
}

async function _POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const b = await req.json();
  const rows = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  const listing = rows[0];
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.sellerId === user.id) return NextResponse.json({ error: "Cannot buy your own listing" }, { status: 400 });
  if (b.action === "wishlist") {
    const ex = await db.select().from(wishlists).where(and(eq(wishlists.userId, user.id), eq(wishlists.listingId, id)));
    if (ex.length) { await db.delete(wishlists).where(eq(wishlists.id, ex[0].id)); return NextResponse.json({ wished: false }); }
    await db.insert(wishlists).values({ userId: user.id, listingId: id });
    return NextResponse.json({ wished: true });
  }
  if (b.action === "report") {
    await db.insert(reports).values({ reporterId: user.id, listingId: id, reason: b.reason || "other", details: b.details });
    return NextResponse.json({ ok: true });
  }
  if (b.action === "purchase") {
    const qty = Number(b.quantity || 1);
    if (qty < 1 || qty > listing.quantity) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    const type = listing.listingType === "free" ? "free" : listing.listingType === "exchange" ? "exchange" : "purchase";
    const [tx] = await db.insert(transactions).values({ listingId: id, buyerId: user.id, sellerId: listing.sellerId, type, quantity: qty, agreedPrice: String(listing.price), status: "pending", notes: b.note || b.exchangeFor || "" }).returning();
    await notify(listing.sellerId, "purchase_request", "New purchase request", `${user.name} requested: ${listing.title}`, `/dashboard?tab=sales`);
    return NextResponse.json({ transaction: tx });
  }
  if (b.action === "rental") {
    if (listing.status !== "active" || listing.listingType !== "rent") return NextResponse.json({ error: "Equipment is not available for rent" }, { status: 400 });
    const start = new Date(b.startDate), end = new Date(b.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
    const overlap = await db.select().from(rentalRequests).where(and(eq(rentalRequests.listingId, id), inArray(rentalRequests.status, ["confirmed", "accepted", "active"])));
    for (const r of overlap) {
      if (start < new Date(r.endDate) && end > new Date(r.startDate)) return NextResponse.json({ error: "Equipment already booked for these dates" }, { status: 409 });
    }
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const daily = Number(listing.dailyPrice || listing.price || 0);
    const [rr] = await db.insert(rentalRequests).values({ listingId: id, renterId: user.id, ownerId: listing.sellerId, startDate: b.startDate, endDate: b.endDate, estimatedAmount: String(daily * days), deposit: String(listing.securityDeposit || 0), status: "pending", note: b.note }).returning();
    await notify(listing.sellerId, "rental_request", "New rental request", `${user.name} wants to rent ${listing.title}`, `/dashboard?tab=rentals-in`);
    return NextResponse.json({ rental: rr });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export const GET = guard(_GET);
export const POST = guard(_POST);
export const PATCH = guard(_PATCH);
export const DELETE = guard(_DELETE);
