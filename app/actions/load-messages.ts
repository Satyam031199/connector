"use server";

import { getMessages, type MessagePage } from "@/app/db/queries/messages";

type LoadOlderMessagesResult =
  | ({ ok: true } & MessagePage)
  | { ok: false; error: string };

/**
 * Loads the next page of older messages for the "Load older messages" button.
 */
export async function loadOlderMessages(input: {
  conversationId: string;
  cursor: string;
}): Promise<LoadOlderMessagesResult> {
  try {
    const page = await getMessages(input);
    if (page === null) {
      return { ok: false, error: "Couldn't load older messages." };
    }
    return { ok: true, ...page };
  } catch (error) {
    console.error("Failed to load older messages:", error);
    return {
      ok: false,
      error: "Couldn't load older messages. Please try again.",
    };
  }
}
