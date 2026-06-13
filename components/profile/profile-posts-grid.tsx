import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { ProfilePost } from "@/types/profile";

type ProfilePostsGridProps = {
  posts: ProfilePost[];
  isOwnProfile: boolean;
};

/**
 * Responsive 3-column grid of a user's post images (newest first), or an empty
 * state. The create button only shows on the current user's own profile.
 */
export function ProfilePostsGrid({ posts, isOwnProfile }: ProfilePostsGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-medium text-foreground">
            No posts yet
          </h2>
          <p className="text-sm text-muted-foreground">
            Create your first post to get started.
          </p>
        </div>
        {isOwnProfile ? (
          <Button asChild>
            <Link href="/create">Create Post</Link>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2">
      {posts.map((post) => (
        <li key={post.id} className="overflow-hidden rounded-md bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt={post.caption ?? "Post image"}
            className="aspect-square w-full object-cover"
          />
        </li>
      ))}
    </ul>
  );
}
