"use client";

import { useState } from "react";
import { MessageCircleIcon } from "lucide-react";

import { LikeButton } from "@/components/feed/like-button";
import { PostComments } from "@/components/feed/post-comments";
import { cn } from "@/lib/utils";

type PostActionsProps = {
  postId: string;
  isLiked: boolean;
  currentUserId: string | null;
  /** Post metadata (counts + caption), server-rendered and shown below the actions. */
  children: React.ReactNode;
};

/**
 * Interactive post footer: action buttons, the server-rendered metadata
 * (passed as children), and the expandable comments section.
 *
 * The Like button triggers `toggleLike`; the Comment button toggles an inline
 * comments section. The feed revalidates server-side so counts and liked state
 * refresh without optimistic updates.
 */
export function PostActions({ postId, isLiked, currentUserId, children }: PostActionsProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-0.5 px-2 pt-1.5">
        <LikeButton postId={postId} isLiked={isLiked} />
        <button
          type="button"
          onClick={() => setCommentsOpen((open) => !open)}
          aria-label="Comments"
          aria-expanded={commentsOpen}
          className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <MessageCircleIcon
            className={cn("size-6", commentsOpen && "fill-muted")}
          />
        </button>
      </div>

      {children}

      {commentsOpen ? <PostComments postId={postId} currentUserId={currentUserId} /> : null}
    </>
  );
}
