import { Suspense } from "react";

import { getFeedPosts } from "@/app/db/queries/get-feed-posts";
import { FeedList } from "@/components/feed/feed-list";
import { PostSkeleton } from "@/components/feed/post-skeleton";
import type { FeedPost } from "@/types/feed";

// The feed reflects all users' posts, so it must render per request.
export const dynamic = "force-dynamic";

/**
 * Feed page (home).
 *
 * Fetches real posts on the server via a shared query (no client fetching, no
 * API routes). The data fetch is wrapped in Suspense so the existing skeleton
 * shows while loading.
 */
export default function FeedPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <Suspense fallback={<FeedSkeleton />}>
        <Feed />
      </Suspense>
    </div>
  );
}

async function Feed() {
  let posts: FeedPost[] | null = null;

  try {
    posts = await getFeedPosts();
  } catch (error) {
    // Never expose internal database errors to the user.
    console.error("Failed to load feed:", error);
  }

  if (posts === null) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        Couldn&apos;t load the feed. Please try again later.
      </div>
    );
  }

  return <FeedList posts={posts} />;
}

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}
