"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { toggleLike as toggleLikeForUser } from "@/app/db/queries/likes";
import { postExists } from "@/app/db/queries/posts";
import { getCurrentUser } from "@/app/lib/auth";

export type ToggleLikeResult =
  | { ok: true; isLiked: boolean }
  | { ok: false; error: string };

const postIdSchema = z.uuid();

/**
 * Toggles the current user's like on a post.
 *
 * Authenticates and resolves the database user (client-provided IDs are never
 * trusted), validates the target post exists, then flips the like. Revalidates
 * the feed so counts and liked state are correct after navigation/refresh.
 */
export async function toggleLike(postId: string): Promise<ToggleLikeResult> {
  // 1. Validate input shape.
  const parsed = postIdSchema.safeParse(postId);
  if (!parsed.success) {
    return { ok: false, error: "Invalid post." };
  }

  // 2. Authentication + resolve the database user.
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to like posts." };
  }

  // 3. Validate the post exists.
  if (!(await postExists(parsed.data))) {
    return { ok: false, error: "Post not found." };
  }

  // 4. Toggle the like.
  try {
    const isLiked = await toggleLikeForUser(user.id, parsed.data);
    revalidatePath("/");
    return { ok: true, isLiked };
  } catch (error) {
    console.error("Toggle like failed:", error);
    return { ok: false, error: "Could not update your like. Please try again." };
  }
}
