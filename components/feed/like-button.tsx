"use client";

import { useTransition } from "react";
import { HeartIcon } from "lucide-react";
import { toast } from "sonner";

import { toggleLike } from "@/app/actions/toggle-like";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  postId: string;
  isLiked: boolean;
};

export function LikeButton({ postId, isLiked }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    if (isPending) return;
    startTransition(async () => {
      const result = await toggleLike(postId);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={isPending}
      aria-label={isLiked ? "Unlike" : "Like"}
      aria-pressed={isLiked}
      className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
    >
      <HeartIcon
        className={cn(
          "size-6 transition-colors",
          isLiked && "fill-destructive text-destructive",
        )}
      />
    </button>
  );
}
