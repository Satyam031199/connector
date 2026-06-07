import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder for a post card: avatar, image, and text skeletons.
 */
export function PostSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Skeleton className="aspect-square w-full rounded-none" />

      <div className="space-y-2 px-4 pb-4 pt-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </Card>
  );
}
