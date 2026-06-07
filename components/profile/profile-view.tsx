import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfilePostsGrid } from "@/components/profile/profile-posts-grid";
import type { Profile } from "@/types/profile";

type ProfileViewProps = {
  profile: Profile;
  isOwnProfile: boolean;
};

/**
 * Shared profile layout used by both /profile and /username/[username].
 */
export function ProfileView({ profile, isOwnProfile }: ProfileViewProps) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      <ProfilePostsGrid posts={profile.posts} isOwnProfile={isOwnProfile} />
    </div>
  );
}
