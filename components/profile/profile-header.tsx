import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import type { Profile } from "@/types/profile";

type ProfileHeaderProps = {
  profile: Profile;
  isOwnProfile: boolean;
};

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-6 border-b border-border pb-8 sm:flex-row sm:items-start sm:gap-10">
      <Avatar
        size="lg"
        className="size-24 text-3xl ring-1 ring-border sm:size-28"
      >
        {profile.imageUrl ? (
          <AvatarImage src={profile.imageUrl} alt={`${profile.username}'s avatar`} />
        ) : null}
        <AvatarFallback className="text-3xl">
          {profile.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col items-center gap-5 text-center sm:items-start sm:text-left">
        {/* Identity + edit action */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {profile.username}
          </h1>
          {isOwnProfile ? (
            <EditProfileDialog name={profile.name} bio={profile.bio} />
          ) : null}
        </div>

        {/* Stats */}
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {profile.postCount}
          </span>{" "}
          {profile.postCount === 1 ? "post" : "posts"}
        </p>

        {/* Display name + bio */}
        {profile.name || profile.bio ? (
          <div className="max-w-prose space-y-1">
            {profile.name ? (
              <p className="text-sm font-semibold text-foreground">
                {profile.name}
              </p>
            ) : null}
            {profile.bio ? (
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
