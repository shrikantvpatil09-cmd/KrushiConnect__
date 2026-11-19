import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
export function verifyPassword(pw: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(pw, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(candidate));
}
function tokenHash(t: string) { return createHash("sha256").update(t).digest("hex"); }

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  await db.insert(sessions).values({ userId, tokenHash: tokenHash(token), expiresAt: expires });
  const c = await cookies();
  c.set("kc_session", token, { httpOnly: true, sameSite: "lax", path: "/", expires, secure: process.env.NODE_ENV === "production" });
  return token;
}
export async function destroySession() {
  const c = await cookies();
  const token = c.get("kc_session")?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash(token)));
  c.delete("kc_session");
}
export async function getCurrentUser() {
  const c = await cookies();
  const token = c.get("kc_session")?.value;
  if (!token) return null;
  const rows = await db.select({ user: users }).from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}
export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHORIZED");
  if (u.isSuspended) throw new Error("SUSPENDED");
  return u;
}
export async function requireAdmin() {
  const u = await requireUser();
  if (!u.isAdmin) throw new Error("FORBIDDEN");
  return u;
}
export async function notify(userId: string, type: string, title: string, body: string, link?: string) {
  const { notifications } = await import("@/db/schema");
  await db.insert(notifications).values({ userId, type, title, body, link });
}
