"use client";

import { useLayoutEffect, useRef, useState, useTransition } from "react";
import { Loader2Icon, SendIcon } from "lucide-react";
import { toast } from "sonner";

import { loadOlderMessages } from "@/app/actions/load-messages";
import { sendMessage } from "@/app/actions/messages";
import type { Message } from "@/app/db/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatEmptyState } from "@/components/messages/chat-empty-state";
import { LoadOlderMessagesButton } from "@/components/messages/load-older-button";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageSkeletonRow } from "@/components/messages/message-skeleton-row";
import { MAX_MESSAGE_LENGTH } from "@/validations/message";

type ChatPanelProps = {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
};

export function ChatPanel({
  conversationId,
  currentUserId,
  initialMessages,
  initialNextCursor,
  initialHasMore,
}: ChatPanelProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [content, setContent] = useState("");
  const [isSending, startSendTransition] = useTransition();
  const [isLoadingOlder, startLoadOlderTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingScrollAdjustRef = useRef<{
    scrollHeight: number;
    scrollTop: number;
  } | null>(null);

  // After older messages are prepended, restore the scroll position so
  // whatever was previously visible stays in view instead of jumping.
  useLayoutEffect(() => {
    const pending = pendingScrollAdjustRef.current;
    const container = scrollRef.current;
    if (!pending || !container) return;

    container.scrollTop =
      pending.scrollTop + (container.scrollHeight - pending.scrollHeight);
    pendingScrollAdjustRef.current = null;
  }, [messages]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSending || content.trim().length === 0) return;

    startSendTransition(async () => {
      const result = await sendMessage({ conversationId, content });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setMessages((prev) => [...prev, result.message]);
      setContent("");
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function handleLoadOlder() {
    if (!nextCursor || isLoadingOlder) return;

    const container = scrollRef.current;
    if (container) {
      pendingScrollAdjustRef.current = {
        scrollHeight: container.scrollHeight,
        scrollTop: container.scrollTop,
      };
    }

    startLoadOlderTransition(async () => {
      const result = await loadOlderMessages({ conversationId, cursor: nextCursor });
      if (!result.ok) {
        pendingScrollAdjustRef.current = null;
        toast.error(result.error);
        return;
      }
      setMessages((prev) => [...result.messages, ...prev]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    });
  }

  return (
    <>
      <div
        ref={scrollRef}
        className="flex max-h-[60vh] min-h-75 flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <>
            {hasMore && (
              <LoadOlderMessagesButton
                onClick={handleLoadOlder}
                isLoading={isLoadingOlder}
              />
            )}
            {isLoadingOlder && <MessageSkeletonRow />}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))}
          </>
        )}
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border px-4 py-3"
      >
        <Textarea
          aria-label="Type a message"
          placeholder="Type a message..."
          value={content}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isSending}
          className="min-h-9 resize-none"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isSending || content.trim().length === 0}
          aria-label="Send message"
        >
          {isSending ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
          <span>Send</span>
        </Button>
      </form>
    </>
  );
}
