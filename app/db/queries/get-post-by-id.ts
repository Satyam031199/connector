import "server-only";

import { and, count, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/app/db";
import { comments, likes, posts, users } from "@/app/db/schema";
import { getCurrentUser } from "@/app/lib/auth";
import { getPostComments } from "@/app/db/queries/comments";
import type { Comment } from "@/types/comment";

const NO_USER = "00000000-0000-0000-0000-000000000000";

export type PostDetail = {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: Date;

  author: {
    id: string;
    username: string;
    imageUrl: string | null;
  };

  likesCount: number;
  commentsCount: number;

  isLiked: boolean;
  isOwnPost: boolean;
  currentUserId: string | null;

  comments: Comment[];
};

/**
 * Fetches a single post by ID with author, counts, isLiked, and comments.
 * Returns null when the post does not exist.
 *
 * Counts use the same pre-aggregated subquery pattern as the feed to avoid
 * row-multiplication. Comments are fetched in a second query (no N+1 — the
 * post is already resolved before comments are requested).
 */
export async function getPostById(postId: string): Promise<PostDetail | null> {
  const currentUser = await getCurrentUser();
  const currentUserId = currentUser?.id ?? NO_USER;

  const userLike = alias(likes, "user_like");

  const likeCounts = db
    .select({ postId: likes.postId, likesCount: count().as("likes_count") })
    .from(likes)
    .groupBy(likes.postId)
    .as("like_counts");

  const commentCounts = db
    .select({
      postId: comments.postId,
      commentsCount: count().as("comments_count"),
    })
    .from(comments)
    .groupBy(comments.postId)
    .as("comment_counts");

  const rows = await db
    .select({
      id: posts.id,
      imageUrl: posts.imageUrl,
      caption: posts.caption,
      createdAt: posts.createdAt,
      authorId: users.id,
      authorUsername: users.username,
      authorImageUrl: users.imageUrl,
      likesCount: likeCounts.likesCount,
      commentsCount: commentCounts.commentsCount,
      likedId: userLike.id,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(likeCounts, eq(likeCounts.postId, posts.id))
    .leftJoin(commentCounts, eq(commentCounts.postId, posts.id))
    .leftJoin(
      userLike,
      and(eq(userLike.postId, posts.id), eq(userLike.userId, currentUserId)),
    )
    .where(eq(posts.id, postId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const postComments = await getPostComments(postId);

  return {
    id: row.id,
    imageUrl: row.imageUrl,
    caption: row.caption,
    createdAt: row.createdAt,
    author: {
      id: row.authorId,
      username: row.authorUsername,
      imageUrl: row.authorImageUrl,
    },
    likesCount: row.likesCount ?? 0,
    commentsCount: row.commentsCount ?? 0,
    isLiked: row.likedId !== null,
    isOwnPost: row.authorId === currentUserId,
    currentUserId: currentUser?.id ?? null,
    comments: postComments,
  };
}
