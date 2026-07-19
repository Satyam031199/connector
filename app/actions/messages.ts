"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isConversationParticipant } from "@/app/db/queries/conversations";
import { insertMessage } from "@/app/db/queries/messages";
import { getCurrentUser } from "@/app/lib/auth";
import type { Message } from "@/app/db/schema";
import { messageContentSchema } from "@/validations/message";

const conversationIdSchema = z.uuid();

export type SendMessageResult =
  | { ok: true; message: Message }
  | { ok: false; error: string };

/**
 * Sends a message in a conversation the current user participates in.
 *
 * Validates content, authenticates, verifies conversation membership, inserts
 * the message (which also updates the conversation's `updatedAt`/
 * `lastMessageId`), and revalidates both the chat page and the inbox.
 */
export async function sendMessage({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}): Promise<SendMessageResult> {
  if (!conversationIdSchema.safeParse(conversationId).success) {
    return { ok: false, error: "Invalid conversation." };
  }

  const parsedContent = messageContentSchema.safeParse(content);
  if (!parsedContent.success) {
    return { ok: false, error: parsedContent.error.issues[0].message };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to send a message." };
  }

  try {
    const isParticipant = await isConversationParticipant(conversationId, user.id);
    if (!isParticipant) {
      return { ok: false, error: "Conversation not found." };
    }

    const message = await insertMessage({
      conversationId,
      senderId: user.id,
      content: parsedContent.data,
    });

    revalidatePath(`/messages/${conversationId}`);
    revalidatePath("/messages");

    return { ok: true, message };
  } catch (error) {
    console.error("Send message failed:", error);
    return { ok: false, error: "Could not send your message. Please try again." };
  }
}
