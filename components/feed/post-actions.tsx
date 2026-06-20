"use client";

import { useState, useTransition } from "react";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { toggleLike } from "@/app/actions/toggle-like";
import { PostComments } from "@/components/feed/post-comments";
import { cn } from "@/lib/utils";

type PostActionsProps = {
  postId: string;
  isLiked: boolean;
  likesCount: number;
  currentUserId: string | null;
  /** Caption and comments count — rendered below the likes count. */
  children: React.ReactNode;
};

function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function PostActions({
  postId,
  isLiked,
  likesCount,
  currentUserId,
  children,
}: PostActionsProps) {
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(likesCount);
  const [likePending, startLikeTransition] = useTransition();
  const [commentsOpen, setCommentsOpen] = useState(false);

  function handleLike() {
    if (likePending) return;
    startLikeTransition(async () => {
      const result = await toggleLike(postId);
      if (result.ok) {
        setLiked(result.isLiked);
        setCount((prev) => (result.isLiked ? prev + 1 : prev - 1));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-0.5 px-2 pt-1.5">
        <button
          type="button"
          onClick={handleLike}
          disabled={likePending}
          aria-label={liked ? "Unlike" : "Like"}
          aria-pressed={liked}
          className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
        >
          <HeartIcon
            className={cn(
              "size-6 transition-colors",
              liked && "fill-destructive text-destructive",
            )}
          />
        </button>
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

      <div className="space-y-1.5 px-4 pb-4 pt-1.5">
        <p className="text-sm font-semibold text-foreground">
          {pluralize(count, "like")}
        </p>
        {children}
      </div>

      {commentsOpen ? (
        <PostComments postId={postId} currentUserId={currentUserId} />
      ) : null}
    </>
  );
}
