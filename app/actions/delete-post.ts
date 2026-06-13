"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { deletePostById, getPostForDeletion } from "@/app/db/queries/posts";
import { getCurrentUser } from "@/app/lib/auth";
import { deleteImage } from "@/lib/s3";

const schema = z.object({ postId: z.string().uuid() });

type DeletePostResult = { ok: true } | { ok: false; error: string };

export async function deletePost(postId: string): Promise<DeletePostResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { ok: false, error: "You must be signed in to delete a post." };
  }

  const parsed = schema.safeParse({ postId });
  if (!parsed.success) {
    return { ok: false, error: "Invalid post." };
  }

  const post = await getPostForDeletion(postId);
  if (!post) {
    return { ok: false, error: "Post not found." };
  }

  if (post.userId !== currentUser.id) {
    return { ok: false, error: "You can only delete your own posts." };
  }

  await deletePostById(postId, currentUser.id);

  // S3 cleanup — log failures but never expose them to the client
  try {
    await deleteImage(post.imageUrl);
  } catch (error) {
    console.error("S3 deletion failed for", post.imageUrl, error);
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/username/${currentUser.username}`);

  return { ok: true };
}
