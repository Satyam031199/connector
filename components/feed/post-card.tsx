import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PostActions } from "@/components/feed/post-actions";
import { PostHeader } from "@/components/feed/post-header";
import { PostImage } from "@/components/feed/post-image";
import type { FeedPost } from "@/types/feed";

function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function PostCard({ post }: { post: FeedPost }) {
  const { author } = post;

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <PostHeader
        postId={post.id}
        username={author.username}
        userImage={author.imageUrl}
        createdAt={post.createdAt}
        isOwnPost={post.isOwnPost}
      />

      <PostImage
        src={post.imageUrl}
        alt={
          post.caption
            ? `${author.username}: ${post.caption}`
            : `Post by ${author.username}`
        }
      />

      <PostActions postId={post.id} isLiked={post.isLiked}>
        <div className="space-y-1.5 px-4 pb-4 pt-1.5">
          <p className="text-sm font-semibold text-foreground">
            {pluralize(post.likesCount, "like")}
          </p>

          {post.caption ? (
            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-snug text-foreground">
              <Link
                href={`/username/${author.username}`}
                className="font-semibold transition-colors hover:underline"
              >
                {author.username}
              </Link>{" "}
              {post.caption}
            </p>
          ) : null}

          <p className="text-xs text-muted-foreground">
            {pluralize(post.commentsCount, "comment")}
          </p>
        </div>
      </PostActions>
    </Card>
  );
}
