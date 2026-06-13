import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/app/db";
import { comments, likes, posts, users } from "@/app/db/schema";
import { getCurrentUser } from "@/app/lib/auth";
import type { FeedPost } from "@/types/feed";

/** A UUID that cannot exist, used to make the "is liked" join match nothing. */
const NO_USER = "00000000-0000-0000-0000-000000000000";

/**
 * Returns all posts for the feed, newest first, with author info, like /
 * comment counts, and whether the current user has liked each post.
 *
 * Counts come from pre-aggregated subqueries (one row per post) that are then
 * left-joined. This avoids both N+1 queries and the row multiplication that
 * would occur if `likes` and `comments` were joined directly and counted
 * together. `isLiked` uses a separate left join on the current user's like
 * (at most one row per post thanks to the unique (userId, postId) constraint).
 */
export async function getFeedPosts(): Promise<FeedPost[]> {
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
    .orderBy(desc(posts.createdAt));

  return rows.map((row) => ({
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
  }));
}
