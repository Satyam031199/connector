import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/app/db";
import { comments, users, type NewComment } from "@/app/db/schema";
import type { Comment } from "@/types/comment";

/**
 * Data access for the comments table.
 */

/**
 * Returns a post's comments, oldest first, with author info.
 * A single join (no N+1) provides the author for every comment.
 */
export async function getPostComments(postId: string): Promise<Comment[]> {
  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      authorId: users.id,
      authorUsername: users.username,
      authorImageUrl: users.imageUrl,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    createdAt: row.createdAt,
    author: {
      id: row.authorId,
      username: row.authorUsername,
      imageUrl: row.authorImageUrl,
    },
  }));
}

type InsertCommentValues = Pick<NewComment, "userId" | "postId" | "content">;

export async function insertComment(values: InsertCommentValues) {
  const result = await db.insert(comments).values(values).returning();
  return result[0] ?? null;
}

/** Deletes a comment owned by userId. Returns true if a row was deleted. */
export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(comments)
    .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
    .returning({ id: comments.id });
  return result.length > 0;
}
