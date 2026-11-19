import { guard } from "@/lib/guard";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { notifications, messages, conversations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

async function _GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null, unread: 0 });
  const notifs = await db.select().from(notifications).where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));
  const convs = await db.select({ id: conversations.id }).from(conversations).where(eq(conversations.sellerId, user.id));
  let unreadMsg = 0;
  for (const c of convs) {
    const m = await db.select().from(messages).where(and(eq(messages.conversationId, c.id), eq(messages.isRead, false)));
    unreadMsg += m.filter((x) => x.senderId !== user.id).length;
  }
  const { passwordHash, ...safe } = user;
  return NextResponse.json({ user: safe, unread: notifs.length + unreadMsg });
}

export const GET = guard(_GET);
