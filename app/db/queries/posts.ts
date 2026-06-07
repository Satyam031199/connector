import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/app/db";
import { posts, type NewPost } from "@/app/db/schema";

/**
 * Data access for the posts table.
 */

type CreatePostValues = Pick<NewPost, "userId" | "imageUrl" | "caption">;

export async function createPost(values: CreatePostValues) {
  const result = await db.insert(posts).values(values).returning();
  return result[0] ?? null;
}

export async function postExists(postId: string): Promise<boolean> {
  const result = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  return result.length > 0;
}
