import { guard } from "@/lib/guard";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";

async function _POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action;
  if (action === "register") {
    const { name, email, password, confirmPassword, phone, userType, state, district, taluka, village, pincode, preferredLanguage } = body;
    if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing.length) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const [u] = await db.insert(users).values({
      name, email: email.toLowerCase(), phone, passwordHash: hashPassword(password),
      userType: userType || "farmer", state, district, taluka, village, pincode,
      preferredLanguage: preferredLanguage || "en",
    }).returning();
    await createSession(u.id);
    return NextResponse.json({ user: { id: u.id, name: u.name, email: u.email, isAdmin: u.isAdmin } });
  }
  if (action === "login") {
    const { email, password } = body;
    const rows = await db.select().from(users).where(eq(users.email, (email || "").toLowerCase())).limit(1);
    const u = rows[0];
    if (!u || !verifyPassword(password || "", u.passwordHash)) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    if (u.isSuspended) return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    await createSession(u.id);
    return NextResponse.json({ user: { id: u.id, name: u.name, email: u.email, isAdmin: u.isAdmin, preferredLanguage: u.preferredLanguage } });
  }
  if (action === "logout") { await destroySession(); return NextResponse.json({ ok: true }); }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export const POST = guard(_POST);
