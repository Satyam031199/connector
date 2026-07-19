import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageTimestamp } from "@/lib/format";
import type { ConversationListItem } from "@/types/conversation";

type ConversationCardProps = {
  conversation: ConversationListItem;
};

export function ConversationCard({ conversation }: ConversationCardProps) {
  const { otherUser, lastMessage, updatedAt } = conversation;
  const timestamp = lastMessage?.createdAt ?? updatedAt;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      aria-label={`Conversation with ${otherUser.username}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Avatar size="lg" className="shrink-0">
        {otherUser.imageUrl ? (
          <AvatarImage src={otherUser.imageUrl} alt="" />
        ) : null}
        <AvatarFallback>{otherUser.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {otherUser.username}
          </span>
          <time
            dateTime={timestamp.toISOString()}
            className="shrink-0 text-xs text-muted-foreground"
          >
            {formatMessageTimestamp(timestamp)}
          </time>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {lastMessage ? lastMessage.content : "Start your conversation."}
        </p>
      </div>
    </Link>
  );
}
