import "server-only";

import { and, count, desc, eq, lt, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/app/db";
import { comments, likes, posts, users } from "@/app/db/schema";
import { getCurrentUser } from "@/app/lib/auth";
import type { FeedPost } from "@/types/feed";

export const FEED_PAGE_SIZE = 10;

/** A UUID that cannot exist, used to make the "is liked" join match nothing. */
const NO_USER = "00000000-0000-0000-0000-000000000000";

export type FeedPage = {
  posts: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`).toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const pipeIndex = decoded.indexOf("|");
    if (pipeIndex === -1) return null;
    const iso = decoded.slice(0, pipeIndex);
    const id = decoded.slice(pipeIndex + 1);
    if (!iso || !id) return null;
    const date = new Date(iso);
    if (isNaN(date.getTime())) return null;
    return { createdAt: date, id };
  } catch {
    return null;
  }
}

/**
 * Returns a page of posts for the feed, newest first, with author info,
 * like/comment counts, and whether the current user has liked each post.
 *
 * Uses cursor-based pagination: pass `cursor` (from a previous response's
 * `nextCursor`) to load the next page. Returns `hasMore` to indicate whether
 * more posts exist beyond this page.
 *
 * Counts come from pre-aggregated subqueries (one row per post) to avoid N+1
 * and row-multiplication. `isLiked` uses a separate left join on the current
 * user's like row (at most one per post via the unique constraint).
 */
export async function getFeedPosts(input?: {
  cursor?: string;
  limit?: number;
}): Promise<FeedPage> {
  const currentUser = await getCurrentUser();
  const currentUserId = currentUser?.id ?? NO_USER;
  const limit = input?.limit ?? FEED_PAGE_SIZE;
  const parsedCursor = input?.cursor ? decodeCursor(input.cursor) : null;

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

  const cursorCondition = parsedCursor
    ? or(
        lt(posts.createdAt, parsedCursor.createdAt),
        and(
          eq(posts.createdAt, parsedCursor.createdAt),
          lt(posts.id, parsedCursor.id),
        ),
      )
    : undefined;

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
    .where(cursorCondition)
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = pageRows[pageRows.length - 1];
  const nextCursor =
    hasMore && lastRow ? encodeCursor(lastRow.createdAt, lastRow.id) : null;

  return {
    posts: pageRows.map((row) => ({
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
    })),
    nextCursor,
    hasMore,
  };
}
