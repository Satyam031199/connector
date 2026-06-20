import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getPostById, type PostDetail } from "@/app/db/queries/get-post-by-id";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LikeButton } from "@/components/feed/like-button";
import { PostComments } from "@/components/feed/post-comments";
import { PostHeader } from "@/components/feed/post-header";
import { PostImage } from "@/components/feed/post-image";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ postId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;

  try {
    const post = await getPostById(postId);
    if (!post) return { title: "Post not found | Connector" };

    return {
      title: `Post by ${post.author.username} | Connector`,
      description: post.caption ?? undefined,
    };
  } catch {
    return { title: "Connector" };
  }
}

export default function PostPage({ params }: Props) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetailLoader params={params} />
      </Suspense>
    </div>
  );
}

async function PostDetailLoader({ params }: Props) {
  const { postId } = await params;

  let post: PostDetail | null = null;
  let dbError = false;

  try {
    post = await getPostById(postId);
  } catch (error) {
    console.error("Failed to load post:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        Couldn&apos;t load this post. Please try again later.
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  const pluralize = (n: number, noun: string) =>
    `${n} ${noun}${n === 1 ? "" : "s"}`;

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <PostHeader
        postId={post.id}
        username={post.author.username}
        userImage={post.author.imageUrl}
        createdAt={post.createdAt}
        isOwnPost={post.isOwnPost}
      />

      <PostImage
        src={post.imageUrl}
        alt={
          post.caption
            ? `${post.author.username}: ${post.caption}`
            : `Post by ${post.author.username}`
        }
      />

      <div className="flex items-center gap-0.5 px-2 pt-1.5">
        <LikeButton postId={post.id} isLiked={post.isLiked} />
      </div>

      <div className="space-y-1.5 px-4 pb-4 pt-1.5">
        <p className="text-sm font-semibold text-foreground">
          {pluralize(post.likesCount, "like")}
        </p>

        {post.caption ? (
          <p className="whitespace-pre-wrap wrap-break-word text-sm leading-snug text-foreground">
            <Link
              href={`/username/${post.author.username}`}
              className="font-semibold transition-colors hover:underline"
            >
              {post.author.username}
            </Link>{" "}
            {post.caption}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          {pluralize(post.commentsCount, "comment")}
        </p>
      </div>

      <PostComments
        postId={post.id}
        currentUserId={post.currentUserId}
        initialComments={post.comments}
      />
    </Card>
  );
}

function PostDetailSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Image */}
      <Skeleton className="aspect-square w-full rounded-none" />

      {/* Actions */}
      <div className="flex items-center gap-0.5 px-2 pt-1.5">
        <Skeleton className="size-9 rounded-full" />
      </div>

      {/* Metadata */}
      <div className="space-y-2 px-4 pb-4 pt-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-20" />
      </div>

      {/* Comments placeholder */}
      <div className="space-y-4 border-t border-border px-4 py-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </Card>
  );
}
