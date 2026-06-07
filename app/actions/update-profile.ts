"use server";

import { revalidatePath } from "next/cache";

import { updateUserProfile } from "@/app/db/queries/users";
import { getCurrentUser } from "@/app/lib/auth";
import { profileSchema } from "@/validations/profile";

export type UpdateProfileResult = { ok: true } | { ok: false; error: string };

/**
 * Updates the current user's editable profile fields (name, bio).
 *
 * The target row is always the authenticated user resolved server-side, so a
 * user can never update another user's profile. username / clerkId / createdAt
 * are not editable.
 */
export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResult> {
  // 1. Authentication + resolve the database user.
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to edit your profile." };
  }

  // 2. Validate input.
  const parsed = profileSchema.safeParse({
    name: typeof formData.get("name") === "string" ? formData.get("name") : "",
    bio: typeof formData.get("bio") === "string" ? formData.get("bio") : "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const name = parsed.data.name.length > 0 ? parsed.data.name : null;
  const bio = parsed.data.bio.length > 0 ? parsed.data.bio : null;

  // 3. Update only the current user's row.
  try {
    await updateUserProfile(user.id, { name, bio });
  } catch (error) {
    console.error("Update profile failed:", error);
    return { ok: false, error: "Could not update your profile. Please try again." };
  }

  revalidatePath("/profile");
  revalidatePath(`/username/${user.username}`);
  return { ok: true };
}
