"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { createPost as insertPost } from "@/app/db/queries/posts";
import { getCurrentUser } from "@/app/lib/auth";
import { detectImageType, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/image";
import { uploadImage } from "@/lib/s3";
import { captionSchema } from "@/validations/post";

export type CreatePostResult = { ok: true } | { ok: false; error: string };

/**
 * Creates a post: authenticates, validates input, uploads the image to S3 via
 * the shared utility, and inserts a single post row.
 *
 * The owning user is resolved server-side from the Clerk session — client
 * supplied user identifiers are never trusted. On success the client clears the
 * form and redirects; this action only revalidates and reports the outcome.
 */
export async function createPost(
  formData: FormData,
): Promise<CreatePostResult> {
  // 1. Authentication + resolve the database user.
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { ok: false, error: "Authentication required." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Authentication required." };
  }

  // 2. Validate caption (optional, trimmed, max length).
  const captionRaw = formData.get("caption");
  const parsedCaption = captionSchema.safeParse(
    typeof captionRaw === "string" ? captionRaw : "",
  );
  if (!parsedCaption.success) {
    return { ok: false, error: parsedCaption.error.issues[0].message };
  }
  const caption = parsedCaption.data.length > 0 ? parsedCaption.data : null;

  // 3. Validate the image (presence, size, real type via magic bytes).
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please select an image." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: `Image exceeds the ${MAX_UPLOAD_MB} MB limit.` };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectImageType(bytes);
  if (!detected) {
    return {
      ok: false,
      error: "Invalid image. Allowed types: JPEG, PNG, WebP.",
    };
  }

  // 4. Upload to S3 (reuses the shared utility — no duplicated S3 logic).
  let imageUrl: string;
  try {
    imageUrl = await uploadImage({
      userId: clerkId,
      body: bytes,
      contentType: detected.contentType,
      extension: detected.extension,
    });
  } catch (error) {
    console.error("Create post: S3 upload failed", error);
    return { ok: false, error: "Image upload failed. Please try again." };
  }

  // 5. Insert the post record.
  try {
    await insertPost({ userId: user.id, imageUrl, caption });
  } catch (error) {
    console.error("Create post: database insert failed", error);
    return { ok: false, error: "Could not create your post. Please try again." };
  }

  revalidatePath("/");
  return { ok: true };
}
