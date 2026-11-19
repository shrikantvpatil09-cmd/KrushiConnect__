import { guard } from "@/lib/guard";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, listings, categories } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { CATEGORIES, IMG } from "@/lib/data";

async function _POST() {
  // Demo accounts and sample data must never be created on a public production deployment.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const existing = await db.select().from(users).where(eq(users.email, "demo@krishiconnect.in")).limit(1);
  if (existing.length) return NextResponse.json({ ok: true, note: "already seeded" });
  const cats: Record<string, string> = {};
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const [row] = await db.insert(categories).values({ slug: c.slug, icon: c.icon, nameEn: c.en, nameHi: c.hi, nameMr: c.mr, sortOrder: i }).returning();
    cats[c.slug] = row.id;
  }
  const [seller] = await db.insert(users).values({ name: "Ramesh Patil", email: "demo@krishiconnect.in", phone: "9876543210", passwordHash: hashPassword("demo1234"), userType: "farmer", state: "Maharashtra", district: "Pune", taluka: "Baramati", village: "Wagholi", pincode: "412207", isVerified: true }).returning();
  const [owner] = await db.insert(users).values({ name: "Suresh Deshmukh", email: "owner@krishiconnect.in", phone: "9876543211", passwordHash: hashPassword("demo1234"), userType: "equipment_owner", state: "Maharashtra", district: "Nashik", taluka: "Sinnar", village: "Nandgaon", pincode: "422101", isVerified: true }).returning();
  const seedListings = [
    { sellerId: seller.id, categoryId: cats.seeds, title: "HD-2967 Wheat Seeds (50kg bag)", description: "High-yielding Sharbati wheat seeds, germination 92%. Suitable for Rabi season in Maharashtra.", listingType: "sell", price: "2850", quantity: 40, unit: "bag", condition: "new", brand: "KrishiBeej", state: "Maharashtra", district: "Pune", village: "Wagholi", images: [IMG.field] },
    { sellerId: seller.id, categoryId: cats.fertilizers, title: "Vermicompost Organic Fertilizer 50kg", description: "Pure vermicompost, rich in nutrients. No chemicals. Ideal for vegetables and cotton.", listingType: "sell", price: "650", quantity: 100, unit: "bag", condition: "new", brand: "OrganicKrishi", state: "Maharashtra", district: "Pune", village: "Wagholi", images: [IMG.field] },
    { sellerId: owner.id, categoryId: cats.tractors, title: "Mahindra 575 DI Tractor 2021 Model", description: "Well maintained, 1200 hours run. New tyres, complete papers. Available for rent with driver option.", listingType: "rent", price: "0", quantity: 1, unit: "day", condition: "used", brand: "Mahindra", model: "575 DI", mfgYear: 2021, state: "Maharashtra", district: "Nashik", village: "Nandgaon", images: [IMG.tractor], dailyPrice: "1800", hourlyPrice: "450", weeklyPrice: "10000", securityDeposit: "5000", deliveryAvailable: true, rentalTerms: "Fuel by renter. Return in clean condition." },
    { sellerId: owner.id, categoryId: cats.harvesting, title: "Combine Harvester for Wheat & Soybean", description: "John Deere combine harvester, 6 feet cutter. Expert operator available.", listingType: "rent", price: "0", quantity: 1, unit: "acre", condition: "used", brand: "John Deere", state: "Maharashtra", district: "Nashik", village: "Nandgaon", images: [IMG.harvester], dailyPrice: "12000", hourlyPrice: "2500", weeklyPrice: "60000", securityDeposit: "20000" },
    { sellerId: seller.id, categoryId: cats.seeds, title: "Soybean Seeds JS-335 (40kg)", description: "Certified soybean seeds, bold grain, high oil content.", listingType: "sell", price: "3200", quantity: 25, unit: "bag", condition: "new", state: "Maharashtra", district: "Pune", village: "Wagholi", images: [IMG.field] },
    { sellerId: seller.id, categoryId: cats.tools, title: "Free: Empty Gunny Bags & Seed Sacks", description: "Around 200 clean gunny bags available for free pickup. First come first serve.", listingType: "free", price: "0", quantity: 200, unit: "piece", condition: "used", state: "Maharashtra", district: "Pune", village: "Wagholi", images: [IMG.field] },
    { sellerId: owner.id, categoryId: cats.equipment, title: "Rotavator 7 Feet - Exchange for Cultivator", description: "Looking to exchange my 7-feet rotavator for a 9-tine cultivator. Both in working condition.", listingType: "exchange", price: "0", quantity: 1, unit: "piece", condition: "used", state: "Maharashtra", district: "Nashik", village: "Nandgaon", images: [IMG.tractor2], exchangeFor: "9-tine cultivator" },
    { sellerId: seller.id, categoryId: cats.pumps, title: "Submersible Water Pump 1.5 HP", description: "Crompton submersible pump, 1 year warranty remaining.", listingType: "sell", price: "8500", quantity: 3, unit: "piece", condition: "new", brand: "Crompton", state: "Maharashtra", district: "Pune", village: "Wagholi", images: [IMG.field] },
    { sellerId: seller.id, categoryId: cats.seeds, title: "Wanted: Cotton Seeds BT (urgent)", description: "Looking to buy 10 bags of certified BT cotton seeds for this season. Please contact with price.", listingType: "wanted", price: "0", quantity: 10, unit: "bag", condition: "new", state: "Maharashtra", district: "Pune", village: "Wagholi", images: [IMG.field] },
  ];
  for (const l of seedListings) await db.insert(listings).values(l as any);
  return NextResponse.json({ ok: true });
}

export const POST = guard(_POST);
