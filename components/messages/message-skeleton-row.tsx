import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder bubbles shown above the list while older messages load. */
export function MessageSkeletonRow() {
  return (
    <div className="space-y-3 pb-3">
      <Skeleton className="h-10 w-2/3 rounded-2xl" />
      <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
    </div>
  );
}
