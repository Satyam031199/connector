import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/app/db";
import { posts, users } from "@/app/db/schema";
import type { Profile } from "@/types/profile";

/**
 * Returns a user's public profile by username, including their posts (newest
 * first) and post count, or `null` if the username does not exist.
 *
 * Two queries (user, then posts) — no per-post lookups. The post count is
 * derived from the fetched posts since the grid loads them all (no pagination
 * in this MVP).
 */
export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const userRows = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      imageUrl: users.imageUrl,
      bio: users.bio,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const user = userRows[0];
  if (!user) {
    return null;
  }

  const postRows = await db
    .select({
      id: posts.id,
      imageUrl: posts.imageUrl,
      caption: posts.caption,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(eq(posts.userId, user.id))
    .orderBy(desc(posts.createdAt));

  return {
    ...user,
    postCount: postRows.length,
    posts: postRows,
  };
}
