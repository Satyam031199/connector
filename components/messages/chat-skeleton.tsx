import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder for the whole chat panel: header, message bubbles, and
 * a disabled-looking input row.
 */
export function ChatSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex max-h-[60vh] min-h-75 flex-col gap-3 overflow-hidden px-4 py-4">
        <Skeleton className="h-10 w-2/3 rounded-2xl" />
        <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
        <Skeleton className="h-10 w-3/5 rounded-2xl" />
      </div>

      <div className="flex items-end gap-2 border-t border-border px-4 py-3">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 w-16 rounded-lg" />
      </div>
    </>
  );
}
