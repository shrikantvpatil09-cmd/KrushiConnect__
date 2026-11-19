import { guard } from "@/lib/guard";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { conversations, messages, listings, users } from "@/db/schema";
import { requireUser, notify } from "@/lib/auth";

async function _GET(req: NextRequest) {
  const user = await requireUser();
  const convId = req.nextUrl.searchParams.get("conv");
  if (convId) {
    const convs = await db.select().from(conversations).where(and(eq(conversations.id, convId), eq(conversations.buyerId, user.id))).limit(1);
    const convs2 = convs.length ? convs : await db.select().from(conversations).where(and(eq(conversations.id, convId), eq(conversations.sellerId, user.id))).limit(1);
    if (!convs2.length) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const msgs = await db.select({ m: messages, sender: users.name }).from(messages).innerJoin(users, eq(messages.senderId, users.id)).where(eq(messages.conversationId, convId)).orderBy(asc(messages.createdAt));
    await db.update(messages).set({ isRead: true }).where(and(eq(messages.conversationId, convId), eq(messages.isRead, false)));
    return NextResponse.json({ messages: msgs.map((m) => ({ ...m.m, senderName: m.sender })) });
  }
  const rows = await db.select({ c: conversations, listingTitle: listings.title, buyer: users.name }).from(conversations)
    .leftJoin(listings, eq(conversations.listingId, listings.id))
    .leftJoin(users, eq(conversations.buyerId, users.id))
    .where(eq(conversations.sellerId, user.id)).orderBy(desc(conversations.lastMessageAt));
  const rows2 = await db.select({ c: conversations, listingTitle: listings.title, buyer: users.name }).from(conversations)
    .leftJoin(listings, eq(conversations.listingId, listings.id))
    .leftJoin(users, eq(conversations.buyerId, users.id))
    .where(eq(conversations.buyerId, user.id)).orderBy(desc(conversations.lastMessageAt));
  const all = [...rows, ...rows2.filter((r) => !rows.find((x) => x.c.id === r.c.id))];
  const out = [];
  for (const r of all) {
    const last = await db.select().from(messages).where(eq(messages.conversationId, r.c.id)).orderBy(desc(messages.createdAt)).limit(1);
    out.push({ ...r.c, listingTitle: r.listingTitle, otherName: r.c.buyerId === user.id ? r.buyer : r.buyer, lastMessage: last[0]?.body || "" });
  }
  return NextResponse.json({ conversations: out });
}

async function _POST(req: NextRequest) {
  const user = await requireUser();
  const b = await req.json();
  let convId = b.conversationId;
  if (!convId) {
    const listing = (await db.select().from(listings).where(eq(listings.id, b.listingId)).limit(1))[0];
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (listing.sellerId === user.id) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    const ex = await db.select().from(conversations).where(and(eq(conversations.listingId, b.listingId), eq(conversations.buyerId, user.id), eq(conversations.sellerId, listing.sellerId))).limit(1);
    if (ex.length) convId = ex[0].id;
    else { const [c] = await db.insert(conversations).values({ listingId: b.listingId, buyerId: user.id, sellerId: listing.sellerId }).returning(); convId = c.id; }
  }
  const conv = (await db.select().from(conversations).where(eq(conversations.id, convId)).limit(1))[0];
  if (!conv || (conv.buyerId !== user.id && conv.sellerId !== user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [m] = await db.insert(messages).values({ conversationId: convId, senderId: user.id, body: b.body }).returning();
  await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, convId));
  const other = conv.buyerId === user.id ? conv.sellerId : conv.buyerId;
  await notify(other, "message", "New message", b.body.slice(0, 120), "/messages");
  return NextResponse.json({ message: m });
}

export const GET = guard(_GET);
export const POST = guard(_POST);
