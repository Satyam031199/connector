import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ChatHeaderProps = {
  otherUser: {
    id: string;
    username: string;
    imageUrl: string | null;
  };
};

export function ChatHeader({ otherUser }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Link
        href="/messages"
        aria-label="Back to messages"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeftIcon className="size-4" />
      </Link>

      <Avatar className="shrink-0">
        {otherUser.imageUrl ? <AvatarImage src={otherUser.imageUrl} alt="" /> : null}
        <AvatarFallback>{otherUser.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <span className="truncate text-sm font-semibold text-foreground">
        {otherUser.username}
      </span>
    </div>
  );
}
