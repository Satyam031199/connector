import { z } from "zod";

/** Content limit mirrors the comments.content column (varchar 500). */
export const MAX_COMMENT_LENGTH = 500;

/**
 * Comment content: required, trimmed, non-empty, capped at the column limit.
 */
export const commentContentSchema = z
  .string()
  .trim()
  .min(1, "Comment cannot be empty.")
  .max(MAX_COMMENT_LENGTH, `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.`);
