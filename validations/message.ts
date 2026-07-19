import { z } from "zod";

/** Content limit mirrors the messages.content column (varchar 2000). */
export const MAX_MESSAGE_LENGTH = 2000;

/**
 * Message content: required, trimmed, non-empty, capped at the column limit.
 */
export const messageContentSchema = z
  .string()
  .trim()
  .min(1, "Message cannot be empty.")
  .max(MAX_MESSAGE_LENGTH, `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
