import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getProfileByUsername } from "@/app/db/queries/get-profile";
import { getCurrentUser } from "@/app/lib/auth";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = { title: "Profile | Connector" };

export const dynamic = "force-dynamic";

/**
 * The current user's own profile.
 */
export default async function MyProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const profile = await getProfileByUsername(user.username);
  if (!profile) {
    redirect("/sign-in");
  }

  return <ProfileView profile={profile} isOwnProfile />;
}
