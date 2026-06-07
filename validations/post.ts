import { z } from "zod";

/** Caption limit mirrors the posts.caption column (varchar 2000). */
export const MAX_CAPTION_LENGTH = 2000;

/**
 * Caption validation: optional free text, trimmed, capped at the column limit.
 * An empty string is valid here and is normalized to "no caption" by callers.
 */
export const captionSchema = z
  .string()
  .trim()
  .max(MAX_CAPTION_LENGTH, `Caption must be ${MAX_CAPTION_LENGTH} characters or fewer.`);
