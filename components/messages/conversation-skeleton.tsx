import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder for a conversation card: avatar, username, and preview skeletons.
 */
export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
