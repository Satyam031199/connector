import "server-only";

import { and, desc, eq, lt, or } from "drizzle-orm";

import { db } from "@/app/db";
import { conversations, messages, type Message } from "@/app/db/schema";
import { isConversationParticipant } from "@/app/db/queries/conversations";
import { getCurrentUser } from "@/app/lib/auth";

/**
 * Data access for messages.
 */

export const MESSAGE_PAGE_SIZE = 30;

export type MessagePage = {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
};

/** Cursor represents the oldest message loaded so far: `createdAt|id`. */
function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`).toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const pipeIndex = decoded.indexOf("|");
    if (pipeIndex === -1) return null;
    const iso = decoded.slice(0, pipeIndex);
    const id = decoded.slice(pipeIndex + 1);
    if (!iso || !id) return null;
    const date = new Date(iso);
    if (isNaN(date.getTime())) return null;
    return { createdAt: date, id };
  } catch {
    return null;
  }
}

/**
 * Returns a page of a conversation's messages, oldest first.
 *
 * Without a `cursor`, returns the most recent `limit` messages (default
 * {@link MESSAGE_PAGE_SIZE}) — the initial load. With a `cursor` (the
 * previous response's `nextCursor`, representing the oldest message loaded so
 * far), returns the next `limit` messages older than that one, for "load
 * older messages". An invalid or malformed cursor is treated as no cursor at
 * all (safe degradation), matching `getFeedPosts`.
 *
 * Returns `null` when there is no authenticated user, the conversation
 * doesn't exist, or the user isn't a participant — callers should treat all
 * three the same so a conversation's existence is never revealed to
 * non-participants.
 */
export async function getMessages(input: {
  conversationId: string;
  cursor?: string;
  limit?: number;
}): Promise<MessagePage | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const isParticipant = await isConversationParticipant(
    input.conversationId,
    user.id,
  );
  if (!isParticipant) {
    return null;
  }

  const limit = input.limit ?? MESSAGE_PAGE_SIZE;
  const parsedCursor = input.cursor ? decodeCursor(input.cursor) : null;

  const cursorCondition = parsedCursor
    ? or(
        lt(messages.createdAt, parsedCursor.createdAt),
        and(
          eq(messages.createdAt, parsedCursor.createdAt),
          lt(messages.id, parsedCursor.id),
        ),
      )
    : undefined;

  const rows = await db
    .select()
    .from(messages)
    .where(and(eq(messages.conversationId, input.conversationId), cursorCondition))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  // Still newest-first here — used to find the oldest row in this page for the next cursor.
  const pageRowsDesc = hasMore ? rows.slice(0, limit) : rows;
  const oldestInPage = pageRowsDesc[pageRowsDesc.length - 1];
  const nextCursor =
    hasMore && oldestInPage
      ? encodeCursor(oldestInPage.createdAt, oldestInPage.id)
      : null;

  return {
    messages: [...pageRowsDesc].reverse(),
    nextCursor,
    hasMore,
  };
}

type InsertMessageValues = Pick<
  typeof messages.$inferInsert,
  "conversationId" | "senderId" | "content"
>;

/**
 * Inserts a message and updates the conversation's `updatedAt`/`lastMessageId`
 * in the same transaction, so inbox ordering and previews stay consistent.
 */
export async function insertMessage(
  values: InsertMessageValues,
): Promise<Message> {
  return db.transaction(async (tx) => {
    const [message] = await tx.insert(messages).values(values).returning();

    await tx
      .update(conversations)
      .set({ updatedAt: message.createdAt, lastMessageId: message.id })
      .where(eq(conversations.id, values.conversationId));

    return message;
  });
}
