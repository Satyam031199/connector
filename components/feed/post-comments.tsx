"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2Icon, MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createComment,
  deleteComment,
  getCommentsForPost,
} from "@/app/actions/comments";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/format";
import type { Comment } from "@/types/comment";
import { MAX_COMMENT_LENGTH } from "@/validations/comment";

export function PostComments({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string | null;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, startSubmit] = useTransition();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

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

  function handleConfirmDelete() {
    if (!confirmDeleteId || isDeleting) return;
    const id = confirmDeleteId;
    startDelete(async () => {
      const result = await deleteComment(id);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
      setConfirmDeleteId(null);
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
            const isOwn =
              currentUserId !== null && comment.author.id === currentUserId;
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
                {isOwn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Comment actions"
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setConfirmDeleteId(comment.id)}
                      >
                        Delete comment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-2 border-t border-border pt-4"
      >
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

      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
