import type { Metadata } from "next";
import { Suspense } from "react";

import { getFeedPosts, type FeedPage } from "@/app/db/queries/get-feed-posts";
import { FeedList } from "@/components/feed/feed-list";
import { PostSkeleton } from "@/components/feed/post-skeleton";

export const metadata: Metadata = { title: "Connector" };

// The feed reflects all users' posts, so it must render per request.
export const dynamic = "force-dynamic";

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
  let page: FeedPage | null = null;

  try {
    page = await getFeedPosts();
  } catch (error) {
    // Never expose internal database errors to the user.
    console.error("Failed to load feed:", error);
  }

  if (page === null) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        Couldn&apos;t load the feed. Please try again later.
      </div>
    );
  }

  return (
    <FeedList
      initialPosts={page.posts}
      initialNextCursor={page.nextCursor}
      initialHasMore={page.hasMore}
    />
  );
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
