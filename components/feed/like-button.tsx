"use client";

import { useState, useTransition } from "react";
import { HeartIcon } from "lucide-react";
import { toast } from "sonner";

import { toggleLike } from "@/app/actions/toggle-like";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  postId: string;
  isLiked: boolean;
};

export function LikeButton({ postId, isLiked }: LikeButtonProps) {
  const [liked, setLiked] = useState(isLiked);
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    if (isPending) return;
    startTransition(async () => {
      const result = await toggleLike(postId);
      if (result.ok) setLiked(result.isLiked);
      else toast.error(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={isPending}
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
  );
}
