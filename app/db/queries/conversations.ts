import "server-only";

import { and, desc, eq, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/app/db";
import {
  conversationParticipants,
  conversations,
  messages,
  users,
  type Conversation,
} from "@/app/db/schema";
import type {
  ConversationListItem,
  ConversationWithParticipants,
} from "@/types/conversation";

/**
 * Data access for conversations, participants, and (indirectly) messages.
 */

/**
 * Returns a conversation with its participants, or `null` if it doesn't
 * exist. Messages are never included.
 */
export async function getConversationById(
  conversationId: string,
): Promise<ConversationWithParticipants | null> {
  const rows = await db
    .select({
      conversationId: conversations.id,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
      participantId: users.id,
      participantUsername: users.username,
      participantName: users.name,
      participantImageUrl: users.imageUrl,
    })
    .from(conversations)
    .innerJoin(
      conversationParticipants,
      eq(conversationParticipants.conversationId, conversations.id),
    )
    .innerJoin(users, eq(conversationParticipants.userId, users.id))
    .where(eq(conversations.id, conversationId));

  if (rows.length === 0) {
    return null;
  }

  const [first] = rows;

  return {
    id: first.conversationId,
    createdAt: first.createdAt,
    updatedAt: first.updatedAt,
    participants: rows.map((row) => ({
      id: row.participantId,
      username: row.participantUsername,
      name: row.participantName,
      imageUrl: row.participantImageUrl,
    })),
  };
}

/**
 * Returns the existing one-to-one conversation between two users, or `null`
 * if they have never started one. Every conversation has exactly two
 * participants, so matching both users against the same conversation row
 * uniquely identifies it.
 */
export async function getConversationBetweenUsers({
  currentUserId,
  otherUserId,
}: {
  currentUserId: string;
  otherUserId: string;
}): Promise<Conversation | null> {
  const cp1 = alias(conversationParticipants, "cp1");
  const cp2 = alias(conversationParticipants, "cp2");

  const rows = await db
    .select({ conversation: conversations })
    .from(conversations)
    .innerJoin(
      cp1,
      and(eq(cp1.conversationId, conversations.id), eq(cp1.userId, currentUserId)),
    )
    .innerJoin(
      cp2,
      and(eq(cp2.conversationId, conversations.id), eq(cp2.userId, otherUserId)),
    )
    .limit(1);

  return rows[0]?.conversation ?? null;
}

/**
 * Returns all of a user's conversations, newest activity first, shaped for
 * direct inbox use: the other participant (1:1, so exactly one) plus that
 * conversation's most recent message, if any.
 *
 * Joins through the user's own membership row (`mine`) to find their
 * conversations, then joins the other participant's row directly (excluding
 * the requesting user), and left-joins the latest message per conversation
 * via a `DISTINCT ON` subquery — a single query, no N+1.
 */
export async function getUserConversations(
  userId: string,
): Promise<ConversationListItem[]> {
  const mine = alias(conversationParticipants, "mine");
  const other = alias(conversationParticipants, "other");

  const lastMessages = db
    .selectDistinctOn([messages.conversationId], {
      conversationId: messages.conversationId,
      id: messages.id,
      content: messages.content,
      senderId: messages.senderId,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .orderBy(messages.conversationId, desc(messages.createdAt))
    .as("last_messages");

  const rows = await db
    .select({
      conversationId: conversations.id,
      updatedAt: conversations.updatedAt,
      otherUserId: users.id,
      otherUsername: users.username,
      otherUserImageUrl: users.imageUrl,
      lastMessageId: lastMessages.id,
      lastMessageContent: lastMessages.content,
      lastMessageSenderId: lastMessages.senderId,
      lastMessageCreatedAt: lastMessages.createdAt,
    })
    .from(conversations)
    .innerJoin(
      mine,
      and(eq(mine.conversationId, conversations.id), eq(mine.userId, userId)),
    )
    .innerJoin(
      other,
      and(eq(other.conversationId, conversations.id), ne(other.userId, userId)),
    )
    .innerJoin(users, eq(other.userId, users.id))
    .leftJoin(lastMessages, eq(lastMessages.conversationId, conversations.id))
    .orderBy(desc(conversations.updatedAt), desc(conversations.id));

  return rows.map((row) => ({
    id: row.conversationId,
    updatedAt: row.updatedAt,
    otherUser: {
      id: row.otherUserId,
      username: row.otherUsername,
      imageUrl: row.otherUserImageUrl,
    },
    lastMessage: row.lastMessageId
      ? {
          id: row.lastMessageId,
          content: row.lastMessageContent!,
          senderId: row.lastMessageSenderId!,
          createdAt: row.lastMessageCreatedAt!,
        }
      : null,
  }));
}

/**
 * Returns whether `userId` is a participant in `conversationId`. Used to
 * authorize access to a conversation and its messages.
 */
export async function isConversationParticipant(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const rows = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

/**
 * Creates a conversation and its two participant rows atomically. Callers
 * must already have verified there is no existing conversation between these
 * users (see `getConversationBetweenUsers`).
 */
export async function createConversationRecord(
  userAId: string,
  userBId: string,
): Promise<Conversation> {
  return db.transaction(async (tx) => {
    const [conversation] = await tx.insert(conversations).values({}).returning();

    await tx.insert(conversationParticipants).values([
      { conversationId: conversation.id, userId: userAId },
      { conversationId: conversation.id, userId: userBId },
    ]);

    return conversation;
  });
}
