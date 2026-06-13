import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import type { Profile } from "@/types/profile";

type ProfileHeaderProps = {
  profile: Profile;
  isOwnProfile: boolean;
};

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Main content */}
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        {/* Avatar + header row */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4">
          {/* Avatar */}
          <Avatar className="size-24 text-3xl ring-1 ring-border sm:size-28">
            {profile.imageUrl ? (
              <AvatarImage src={profile.imageUrl} alt={`${profile.username}'s avatar`} />
            ) : null}
            <AvatarFallback className="text-4xl font-semibold">
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Info section */}
          <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            {/* Username + edit button */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {profile.username}
              </h1>
              {isOwnProfile ? (
                <EditProfileDialog name={profile.name} bio={profile.bio} />
              ) : null}
            </div>

            {/* Display name */}
            {profile.name ? (
              <p className="text-lg font-semibold text-foreground">{profile.name}</p>
            ) : null}

            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <p className="text-xl font-bold text-foreground">{profile.postCount}</p>
                <p className="text-xs text-muted-foreground">
                  {profile.postCount === 1 ? "Post" : "Posts"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
