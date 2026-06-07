import "server-only";

import { auth } from "@clerk/nextjs/server";
import { cache } from "react";

import { getUserByClerkId } from "@/app/db/queries/users";
import type { User } from "@/app/db/schema";

/**
 * Returns the database user for the currently authenticated Clerk session, or
 * `null` when there is no session or no synced record yet.
 *
 * Memoized per request with React `cache` so repeated calls in a single render
 * pass hit the database once.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return getUserByClerkId(userId);
});

/**
 * Like {@link getCurrentUser} but guarantees an authenticated, synced user.
 *
 * Redirects to sign-in when there is no session, and throws when a session
 * exists but no database record has been synced yet (the webhook should create
 * it). Callers receive a non-null user.
 */
export async function requireUser(): Promise<User> {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    redirectToSignIn();
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authenticated user has no synced database record.");
  }

  return user;
}
