"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { createComment, getCommentsForPost } from "@/app/actions/comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/format";
import type { Comment } from "@/types/comment";
import { MAX_COMMENT_LENGTH } from "@/validations/comment";

/**
 * Inline comments section for a post.
 *
 * Mounted only when the comments section is open, so it lazily loads comments
 * via a server action. New comments are appended on success; the feed's comment
 * count updates separately via server revalidation.
 */
export function PostComments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    let active = true;

    getCommentsForPost(postId).then((result) => {
      if (!active) return;
      if (result.ok) {
        setComments(result.comments);
      } else {
        setLoadError(true);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [postId]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmitting || content.trim().length === 0) return;

    startSubmit(async () => {
      const result = await createComment(postId, content);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setComments((prev) => [...prev, result.comment]);
      setContent("");
    });
  }

  return (
    <div className="space-y-4 border-t border-border px-4 py-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading comments...</p>
      ) : loadError ? (
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load comments. Please try again.
        </p>
      ) : comments.length === 0 ? (
        <div className="py-2 text-sm">
          <p className="font-medium text-foreground">No comments yet.</p>
          <p className="text-muted-foreground">Be the first to comment.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const profileHref = `/username/${comment.author.username}`;
            return (
              <li key={comment.id} className="flex items-start gap-2.5">
                <Link
                  href={profileHref}
                  className="mt-0.5 shrink-0 rounded-full transition-opacity hover:opacity-80"
                >
                  <Avatar size="sm">
                    {comment.author.imageUrl ? (
                      <AvatarImage
                        src={comment.author.imageUrl}
                        alt={`${comment.author.username}'s avatar`}
                      />
                    ) : null}
                    <AvatarFallback>
                      {comment.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1 text-sm leading-snug">
                  <Link
                    href={profileHref}
                    className="font-semibold text-foreground transition-colors hover:underline"
                  >
                    {comment.author.username}
                  </Link>{" "}
                  <span className="whitespace-pre-wrap wrap-break-word text-foreground">
                    {comment.content}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelativeTime(comment.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-2 border-t border-border pt-4">
        <Textarea
          aria-label="Add a comment"
          placeholder="Add a comment..."
          value={content}
          maxLength={MAX_COMMENT_LENGTH}
          onChange={(event) => setContent(event.target.value)}
          rows={2}
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || content.trim().length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="animate-spin" />
                Posting...
              </>
            ) : (
              "Comment"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
