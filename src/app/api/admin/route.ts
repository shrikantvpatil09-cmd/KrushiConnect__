import { guard } from "@/lib/guard";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc, count } from "drizzle-orm";
import { db } from "@/db";
import { users, listings, categories, transactions, rentalRequests, reports, reviews, auditLogs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

async function _GET() {
  const admin = await requireAdmin();
  const allUsers = await db.select({ id: users.id, name: users.name, email: users.email, userType: users.userType, isVerified: users.isVerified, isSuspended: users.isSuspended, state: users.state, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)).limit(200);
  const allListings = await db.select({ id: listings.id, title: listings.title, listingType: listings.listingType, status: listings.status, sellerId: listings.sellerId, price: listings.price, createdAt: listings.createdAt }).from(listings).orderBy(desc(listings.createdAt)).limit(200);
  const cats = await db.select().from(categories).orderBy(categories.sortOrder);
  const txs = await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(100);
  const rentals = await db.select().from(rentalRequests).orderBy(desc(rentalRequests.createdAt)).limit(100);
  const reps = await db.select().from(reports).orderBy(desc(reports.createdAt)).limit(100);
  const revs = await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(100);
  const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
  const stats = {
    totalUsers: allUsers.length,
    farmers: allUsers.filter((u) => u.userType === "farmer").length,
    suppliers: allUsers.filter((u) => u.userType === "supplier").length,
    dealers: allUsers.filter((u) => u.userType === "dealer").length,
    totalListings: allListings.length,
    activeListings: allListings.filter((l) => l.status === "active").length,
    totalRentals: rentals.length,
    completedTx: txs.filter((t) => t.status === "completed").length,
    pendingRequests: txs.filter((t) => t.status === "pending").length + rentals.filter((r) => r.status === "pending").length,
    reportedListings: reps.length,
  };
  return NextResponse.json({ stats, users: allUsers, listings: allListings, categories: cats, transactions: txs, rentals, reports: reps, reviews: revs, logs });
}

async function _PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  const b = await req.json();
  async function log(action: string, targetType: string, targetId: string, details: string) {
    await db.insert(auditLogs).values({ adminId: admin.id, action, targetType, targetId, details });
  }
  if (b.action === "suspend-user") { await db.update(users).set({ isSuspended: true }).where(eq(users.id, b.id)); await log("suspend_user", "user", b.id, ""); }
  if (b.action === "activate-user") { await db.update(users).set({ isSuspended: false }).where(eq(users.id, b.id)); await log("activate_user", "user", b.id, ""); }
  if (b.action === "verify-user") { await db.update(users).set({ isVerified: true }).where(eq(users.id, b.id)); await log("verify_user", "user", b.id, ""); }
  if (b.action === "remove-listing") { await db.update(listings).set({ status: "removed" }).where(eq(listings.id, b.id)); await log("remove_listing", "listing", b.id, ""); }
  if (b.action === "resolve-report") { await db.update(reports).set({ status: b.status || "resolved" }).where(eq(reports.id, b.id)); await log("resolve_report", "report", b.id, ""); }
  if (b.action === "hide-review") { await db.update(reviews).set({ isHidden: true }).where(eq(reviews.id, b.id)); await log("hide_review", "review", b.id, ""); }
  if (b.action === "add-category") { await db.insert(categories).values({ slug: b.slug, nameEn: b.nameEn, nameHi: b.nameHi || b.nameEn, nameMr: b.nameMr || b.nameEn, icon: "Sprout" }); await log("add_category", "category", b.slug, ""); }
  if (b.action === "toggle-category") { const c = (await db.select().from(categories).where(eq(categories.id, b.id)).limit(1))[0]; await db.update(categories).set({ isActive: !c.isActive }).where(eq(categories.id, b.id)); await log("toggle_category", "category", b.id, ""); }
  return NextResponse.json({ ok: true });
}

export const GET = guard(_GET);
export const PATCH = guard(_PATCH);
