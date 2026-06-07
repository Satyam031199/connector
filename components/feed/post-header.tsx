import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/format";

type PostHeaderProps = {
  username: string;
  userImage: string | null;
  createdAt: Date;
};

export function PostHeader({ username, userImage, createdAt }: PostHeaderProps) {
  const profileHref = `/username/${username}`;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Link
        href={profileHref}
        className="shrink-0 rounded-full transition-opacity hover:opacity-80"
      >
        <Avatar>
          {userImage ? (
            <AvatarImage src={userImage} alt={`${username}'s avatar`} />
          ) : null}
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex flex-col leading-tight">
        <Link
          href={profileHref}
          className="w-fit text-sm font-semibold text-foreground transition-colors hover:underline"
        >
          {username}
        </Link>
        <time
          dateTime={createdAt.toISOString()}
          className="text-xs text-muted-foreground"
        >
          {formatRelativeTime(createdAt)}
        </time>
      </div>
    </div>
  );
}
