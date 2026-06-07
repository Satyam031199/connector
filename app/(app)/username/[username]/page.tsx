import { notFound } from "next/navigation";

import { getProfileByUsername } from "@/app/db/queries/get-profile";
import { getCurrentUser } from "@/app/lib/auth";
import { ProfileView } from "@/components/profile/profile-view";

export const dynamic = "force-dynamic";

/**
 * A user's public profile by username.
 */
export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const profile = await getProfileByUsername(username);
  if (!profile) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser?.id === profile.id;

  return <ProfileView profile={profile} isOwnProfile={isOwnProfile} />;
}
