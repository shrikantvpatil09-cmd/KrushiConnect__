import { guard } from "@/lib/guard";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { listings, transactions, rentalRequests, wishlists, notifications, reviews, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";

async function _GET() {
  const user = await requireUser();
  const myListings = await db.select().from(listings).where(eq(listings.sellerId, user.id)).orderBy(desc(listings.createdAt));
  const purchases = await db.select({ t: transactions, title: listings.title }).from(transactions).leftJoin(listings, eq(transactions.listingId, listings.id)).where(eq(transactions.buyerId, user.id)).orderBy(desc(transactions.createdAt));
  const sales = await db.select({ t: transactions, title: listings.title }).from(transactions).leftJoin(listings, eq(transactions.listingId, listings.id)).where(eq(transactions.sellerId, user.id)).orderBy(desc(transactions.createdAt));
  const myRentals = await db.select({ r: rentalRequests, title: listings.title }).from(rentalRequests).leftJoin(listings, eq(rentalRequests.listingId, listings.id)).where(eq(rentalRequests.renterId, user.id)).orderBy(desc(rentalRequests.createdAt));
  const rentalsIn = await db.select({ r: rentalRequests, title: listings.title }).from(rentalRequests).leftJoin(listings, eq(rentalRequests.listingId, listings.id)).where(eq(rentalRequests.ownerId, user.id)).orderBy(desc(rentalRequests.createdAt));
  const wish = await db.select({ w: wishlists, listing: listings }).from(wishlists).innerJoin(listings, eq(wishlists.listingId, listings.id)).where(eq(wishlists.userId, user.id));
  const notifs = await db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(50);
  const myReviews = await db.select().from(reviews).where(eq(reviews.revieweeId, user.id));
  const stats = {
    totalListings: myListings.length,
    activeListings: myListings.filter((l) => l.status === "active").length,
    productsSold: sales.filter((s) => s.t.status === "completed").length,
    productsPurchased: purchases.filter((s) => s.t.status === "completed").length,
    equipmentListed: myListings.filter((l) => l.listingType === "rent").length,
    equipmentRented: rentalsIn.filter((r) => ["completed", "active", "confirmed"].includes(r.r.status)).length,
    pendingRequests: sales.filter((s) => s.t.status === "pending").length + rentalsIn.filter((r) => r.r.status === "pending").length,
    completedTx: [...sales, ...purchases].filter((s) => s.t.status === "completed").length,
    avgRating: myReviews.length ? (myReviews.reduce((a, b) => a + b.rating, 0) / myReviews.length).toFixed(1) : "0",
  };
  return NextResponse.json({ stats, myListings, purchases, sales, myRentals, rentalsIn, wishlist: wish.map((w) => w.listing), notifications: notifs, reviews: myReviews });
}

async function _PATCH(req: NextRequest) {
  const user = await requireUser();
  const b = await req.json();
  if (b.action === "tx") {
    const tx = (await db.select().from(transactions).where(eq(transactions.id, b.id)).limit(1))[0];
    if (!tx || (tx.buyerId !== user.id && tx.sellerId !== user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await db.update(transactions).set({ status: b.status, completedAt: b.status === "completed" ? new Date() : null }).where(eq(transactions.id, b.id));
    if (b.status === "completed" && tx.listingId) {
      const l = (await db.select().from(listings).where(eq(listings.id, tx.listingId)).limit(1))[0];
      if (l) { const left = Math.max(0, l.quantity - tx.quantity); await db.update(listings).set({ quantity: left, status: left === 0 ? "sold" : l.status }).where(eq(listings.id, tx.listingId)); }
    }
    return NextResponse.json({ ok: true });
  }
  if (b.action === "rental") {
    const r = (await db.select().from(rentalRequests).where(eq(rentalRequests.id, b.id)).limit(1))[0];
    if (!r || (r.renterId !== user.id && r.ownerId !== user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!["pending", "accepted", "rejected", "confirmed", "active", "completed", "cancelled", "disputed"].includes(b.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    // Only the equipment owner can accept/reject/hand over; renters may only cancel or dispute.
    if (user.id !== r.ownerId && !["cancelled", "disputed", "pending"].includes(b.status)) return NextResponse.json({ error: "Only the owner can change this status" }, { status: 403 });
    if (["confirmed", "active"].includes(b.status)) {
      const conflicts = await db.select().from(rentalRequests).where(and(eq(rentalRequests.listingId, r.listingId), inArray(rentalRequests.status, ["confirmed", "accepted", "active"])));
      for (const c of conflicts) {
        if (c.id !== r.id && new Date(r.startDate) < new Date(c.endDate) && new Date(r.endDate) > new Date(c.startDate)) {
          return NextResponse.json({ error: "Equipment already booked for these dates" }, { status: 409 });
        }
      }
    }
    await db.update(rentalRequests).set({ status: b.status }).where(eq(rentalRequests.id, b.id));
    return NextResponse.json({ ok: true });
  }
  if (b.action === "profile") {
    const allowed: Record<string, any> = {};
    for (const k of ["name", "phone", "userType", "preferredLanguage", "state", "district", "taluka", "village", "pincode", "avatarUrl", "licenceNo"]) if (b[k] !== undefined) allowed[k] = b[k];
    const [u] = await db.update(users).set({ ...allowed, updatedAt: new Date() }).where(eq(users.id, user.id)).returning();
    const { passwordHash, ...safe } = u;
    return NextResponse.json({ user: safe });
  }
  if (b.action === "notif-read") {
    if (b.all) await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, user.id));
    else await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, b.id), eq(notifications.userId, user.id)));
    return NextResponse.json({ ok: true });
  }
  if (b.action === "review") {
    const tx = (await db.select().from(transactions).where(eq(transactions.id, b.transactionId)).limit(1))[0];
    if (!tx || tx.status !== "completed") return NextResponse.json({ error: "Only completed transactions can be reviewed" }, { status: 400 });
    if (tx.buyerId !== user.id && tx.sellerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const reviewee = tx.buyerId === user.id ? tx.sellerId : tx.buyerId;
    const ex = await db.select().from(reviews).where(and(eq(reviews.transactionId, b.transactionId), eq(reviews.reviewerId, user.id)));
    if (ex.length) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
    await db.insert(reviews).values({ transactionId: b.transactionId, reviewerId: user.id, revieweeId: reviewee, rating: Number(b.rating), comment: b.comment });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown" }, { status: 400 });
}

export const GET = guard(_GET);
export const PATCH = guard(_PATCH);
