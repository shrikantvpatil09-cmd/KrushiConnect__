import { guard } from "@/lib/guard";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, asc, sql, ilike, gte, lte, inArray } from "drizzle-orm";
import { db } from "@/db";
import { listings, categories, users, reviews } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { CATEGORIES } from "@/lib/data";

async function ensureCategories() {
  const existing = await db.select().from(categories);
  if (!existing.length) {
    for (let i = 0; i < CATEGORIES.length; i++) {
      const c = CATEGORIES[i];
      await db.insert(categories).values({ slug: c.slug, icon: c.icon, nameEn: c.en, nameHi: c.hi, nameMr: c.mr, sortOrder: i });
    }
  }
}

async function _GET(req: NextRequest) {
  await ensureCategories();
  const sp = req.nextUrl.searchParams;
  const conds: any[] = [eq(listings.status, "active")];
  const q = sp.get("q"); const type = sp.get("type"); const cat = sp.get("category");
  const state = sp.get("state"); const district = sp.get("district"); const village = sp.get("village");
  const min = sp.get("min"); const max = sp.get("max"); const condition = sp.get("condition");
  const sort = sp.get("sort") || "newest"; const mine = sp.get("mine");
  if (q) conds.push(ilike(listings.title, `%${q}%`));
  if (type) conds.push(eq(listings.listingType, type));
  if (cat) conds.push(eq(listings.categoryId, cat));
  if (state) conds.push(eq(listings.state, state));
  if (district) conds.push(eq(listings.district, district));
  if (village) conds.push(eq(listings.village, village));
  if (condition) conds.push(eq(listings.condition, condition));
  if (min) conds.push(gte(listings.price, min));
  if (max) conds.push(lte(listings.price, max));
  if (mine) { const u = await requireUser(); conds.push(eq(listings.sellerId, u.id)); }
  const order = sort === "priceLow" ? asc(listings.price) : sort === "priceHigh" ? desc(listings.price) : sort === "oldest" ? asc(listings.createdAt) : sort === "views" ? desc(listings.views) : desc(listings.createdAt);
  const rows = await db.select({
    listing: listings, sellerName: users.name, sellerVerified: users.isVerified,
    catEn: categories.nameEn, catHi: categories.nameHi, catMr: categories.nameMr,
  }).from(listings)
    .leftJoin(users, eq(listings.sellerId, users.id))
    .leftJoin(categories, eq(listings.categoryId, categories.id))
    .where(and(...conds)).orderBy(order).limit(100);
  const out = [];
  for (const r of rows) {
    const revs = await db.select().from(reviews).where(eq(reviews.revieweeId, r.listing.sellerId));
    const avg = revs.length ? revs.reduce((a, b) => a + b.rating, 0) / revs.length : 0;
    out.push({ ...r.listing, sellerName: r.sellerName, sellerVerified: r.sellerVerified, sellerRating: avg, categoryName: r.catEn, catHi: r.catHi, catMr: r.catMr });
  }
  return NextResponse.json({ listings: out });
}

async function _POST(req: NextRequest) {
  const user = await requireUser();
  await ensureCategories();
  const b = await req.json();
  if (!b.title || !b.listingType) return NextResponse.json({ error: "Title and type required" }, { status: 400 });
  // Regulated products: pesticides require licence details
  if (b.categorySlug === "pesticides" && !b.licenceDetails) return NextResponse.json({ error: "Licence details required for crop protection products" }, { status: 400 });
  if (b.expiryDate && new Date(b.expiryDate) < new Date()) return NextResponse.json({ error: "Expired products cannot be listed" }, { status: 400 });
  const cats = await db.select().from(categories);
  const cat = cats.find((c) => c.slug === b.categorySlug) || cats[0];
  const [row] = await db.insert(listings).values({
    sellerId: user.id, categoryId: cat?.id, title: b.title, description: b.description || "",
    listingType: b.listingType, price: String(b.price || 0), quantity: Number(b.quantity || 1), unit: b.unit || "piece",
    condition: b.condition || "new", brand: b.brand, model: b.model, mfgYear: b.mfgYear ? Number(b.mfgYear) : null,
    state: b.state, district: b.district, taluka: b.taluka, village: b.village, pincode: b.pincode,
    images: Array.isArray(b.images) ? b.images.filter(Boolean) : [], status: "active",
    hourlyPrice: b.hourlyPrice ? String(b.hourlyPrice) : null, dailyPrice: b.dailyPrice ? String(b.dailyPrice) : null,
    weeklyPrice: b.weeklyPrice ? String(b.weeklyPrice) : null, securityDeposit: String(b.securityDeposit || 0),
    deliveryAvailable: !!b.deliveryAvailable, rentalTerms: b.rentalTerms, exchangeFor: b.exchangeFor,
    manufacturer: b.manufacturer, licenceDetails: b.licenceDetails, batchNo: b.batchNo, expiryDate: b.expiryDate || null,
  }).returning();
  return NextResponse.json({ listing: row });
}

export const GET = guard(_GET);
export const POST = guard(_POST);
