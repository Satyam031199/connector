import { FeedEmptyState } from "@/components/feed/feed-empty-state";
import { PostCard } from "@/components/feed/post-card";
import type { FeedPost } from "@/types/feed";

/**
 * Renders the vertically stacked feed, or the empty state when there are no
 * posts.
 */
export function FeedList({ posts }: { posts: FeedPost[] }) {
  if (posts.length === 0) {
    return <FeedEmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
