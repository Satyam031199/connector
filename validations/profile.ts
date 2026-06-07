import { z } from "zod";

/** Editable profile field limits. */
export const MAX_NAME_LENGTH = 50;
export const MAX_BIO_LENGTH = 160;

/**
 * Edit-profile validation: name and bio are optional and trimmed. An empty
 * string is valid here and is normalized to null by the action.
 */
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(MAX_NAME_LENGTH, `Name must be ${MAX_NAME_LENGTH} characters or fewer.`),
  bio: z
    .string()
    .trim()
    .max(MAX_BIO_LENGTH, `Bio must be ${MAX_BIO_LENGTH} characters or fewer.`),
});
