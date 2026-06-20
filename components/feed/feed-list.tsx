"use client";

import { useState, useTransition } from "react";

import { loadFeedPage } from "@/app/actions/load-feed";
import { Button } from "@/components/ui/button";
import { FeedEmptyState } from "@/components/feed/feed-empty-state";
import { PostCard } from "@/components/feed/post-card";
import { PostSkeleton } from "@/components/feed/post-skeleton";
import type { FeedPost } from "@/types/feed";

type Props = {
  initialPosts: FeedPost[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
};

export function FeedList({
  initialPosts,
  initialNextCursor,
  initialHasMore,
}: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    if (!nextCursor || isPending) return;
    setLoadError(null);

    startTransition(async () => {
      const result = await loadFeedPage({ cursor: nextCursor });
      if (!result.ok) {
        setLoadError(result.error);
        return;
      }
      setPosts((prev) => [...prev, ...result.posts]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    });
  }

  if (posts.length === 0) {
    return <FeedEmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {isPending && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {loadError && (
        <p className="text-center text-sm text-muted-foreground">{loadError}</p>
      )}

      {hasMore && !isPending && (
        <div className="flex justify-center pb-2">
          <Button variant="outline" onClick={handleLoadMore} disabled={isPending}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
