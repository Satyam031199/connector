"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getPostComments, insertComment } from "@/app/db/queries/comments";
import { postExists } from "@/app/db/queries/posts";
import { getCurrentUser } from "@/app/lib/auth";
import type { Comment } from "@/types/comment";
import { commentContentSchema } from "@/validations/comment";

const postIdSchema = z.uuid();

export type CreateCommentResult =
  | { ok: true; comment: Comment }
  | { ok: false; error: string };

export type GetCommentsResult =
  | { ok: true; comments: Comment[] }
  | { ok: false; error: string };

/**
 * Loads a post's comments (oldest first) for the inline comments section.
 */
export async function getCommentsForPost(
  postId: string,
): Promise<GetCommentsResult> {
  if (!postIdSchema.safeParse(postId).success) {
    return { ok: false, error: "Invalid post." };
  }

  try {
    const comments = await getPostComments(postId);
    return { ok: true, comments };
  } catch (error) {
    console.error("Failed to load comments:", error);
    return { ok: false, error: "Couldn't load comments. Please try again." };
  }
}

/**
 * Creates a comment on a post.
 *
 * Authenticates and resolves the database user (client IDs are never trusted),
 * validates the content and that the post exists, inserts the comment, and
 * revalidates the feed so the comment count updates. Returns the created
 * comment so the UI can show it immediately.
 */
export async function createComment(
  postId: string,
  content: string,
): Promise<CreateCommentResult> {
  // 1. Validate input.
  if (!postIdSchema.safeParse(postId).success) {
    return { ok: false, error: "Invalid post." };
  }

  const parsedContent = commentContentSchema.safeParse(content);
  if (!parsedContent.success) {
    return { ok: false, error: parsedContent.error.issues[0].message };
  }

  // 2. Authentication + resolve the database user.
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to comment." };
  }

  // 3. Validate the post exists.
  if (!(await postExists(postId))) {
    return { ok: false, error: "Post not found." };
  }

  // 4. Insert.
  try {
    const inserted = await insertComment({
      userId: user.id,
      postId,
      content: parsedContent.data,
    });

    if (!inserted) {
      return { ok: false, error: "Could not post your comment. Please try again." };
    }

    revalidatePath("/");

    return {
      ok: true,
      comment: {
        id: inserted.id,
        content: inserted.content,
        createdAt: inserted.createdAt,
        author: {
          id: user.id,
          username: user.username,
          imageUrl: user.imageUrl,
        },
      },
    };
  } catch (error) {
    console.error("Create comment failed:", error);
    return { ok: false, error: "Could not post your comment. Please try again." };
  }
}
