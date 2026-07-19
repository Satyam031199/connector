import { formatMessageTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Message } from "@/app/db/schema";

type MessageBubbleProps = {
  message: Message;
  isOwn: boolean;
};

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap wrap-break-word",
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        <p>{message.content}</p>
        <time
          dateTime={message.createdAt.toISOString()}
          className={cn(
            "mt-1 block text-[0.7rem]",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {formatMessageTimestamp(message.createdAt)}
        </time>
      </div>
    </div>
  );
}
