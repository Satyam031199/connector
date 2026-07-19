import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/app/db";
import { users, type NewUser } from "@/app/db/schema";

/**
 * Data access for the users table.
 *
 * These functions are the only place that reads or writes user rows, keeping
 * Clerk synchronization logic in one spot.
 */

export async function getUserByClerkId(clerkId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return result[0] ?? null;
}

export async function getUserById(userId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] ?? null;
}

export async function createUser(values: NewUser) {
  const result = await db
    .insert(users)
    .values(values)
    .onConflictDoNothing({ target: users.clerkId })
    .returning();

  return result[0] ?? null;
}

type UserProfileUpdate = Pick<NewUser, "username" | "name" | "imageUrl">;

export async function updateUserByClerkId(
  clerkId: string,
  values: UserProfileUpdate,
) {
  const result = await db
    .update(users)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(users.clerkId, clerkId))
    .returning();

  return result[0] ?? null;
}

export async function deleteUserByClerkId(clerkId: string) {
  await db.delete(users).where(eq(users.clerkId, clerkId));
}

type ProfileUpdate = Pick<NewUser, "name" | "bio">;

/**
 * Updates editable profile fields (name, bio) for a specific user by id.
 * Scoped by id so a caller can only update the user it resolved server-side.
 */
export async function updateUserProfile(userId: string, values: ProfileUpdate) {
  const result = await db
    .update(users)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return result[0] ?? null;
}
