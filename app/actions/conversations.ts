"use server";

import { z } from "zod";

import {
  createConversationRecord,
  getConversationBetweenUsers,
} from "@/app/db/queries/conversations";
import { getUserById } from "@/app/db/queries/users";
import { getCurrentUser } from "@/app/lib/auth";

const otherUserIdSchema = z.uuid();

export type CreateConversationResult =
  | { ok: true; conversationId: string }
  | { ok: false; error: string };

/**
 * Starts a one-to-one conversation with another user, or returns the
 * existing one if the two users have already started one.
 */
export async function createConversation(
  otherUserId: string,
): Promise<CreateConversationResult> {
  if (!otherUserIdSchema.safeParse(otherUserId).success) {
    return { ok: false, error: "Invalid user." };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { ok: false, error: "You must be signed in to start a conversation." };
  }

  if (currentUser.id === otherUserId) {
    return { ok: false, error: "You cannot start a conversation with yourself." };
  }

  try {
    const otherUser = await getUserById(otherUserId);
    if (!otherUser) {
      return { ok: false, error: "User not found." };
    }

    const existing = await getConversationBetweenUsers({
      currentUserId: currentUser.id,
      otherUserId,
    });

    if (existing) {
      return { ok: true, conversationId: existing.id };
    }

    const conversation = await createConversationRecord(currentUser.id, otherUserId);
    return { ok: true, conversationId: conversation.id };
  } catch (error) {
    console.error("Create conversation failed:", error);
    return { ok: false, error: "Could not start the conversation. Please try again." };
  }
}
