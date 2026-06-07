import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/app/db";
import { likes } from "@/app/db/schema";

/**
 * Data access for the likes table.
 */

/**
 * Toggles a like for (userId, postId) in a single decisive operation:
 * delete the like if it exists, otherwise create it. The insert relies on the
 * unique (userId, postId) constraint (no-op on conflict) so duplicate likes are
 * impossible even under concurrent requests.
 *
 * @returns the resulting liked state (`true` if the post is now liked).
 */
export async function toggleLike(userId: string, postId: string): Promise<boolean> {
  const deleted = await db
    .delete(likes)
    .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
    .returning({ id: likes.id });

  if (deleted.length > 0) {
    return false;
  }

  await db.insert(likes).values({ userId, postId }).onConflictDoNothing();
  return true;
}
