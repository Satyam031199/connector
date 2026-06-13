import Link from "next/link";
import { ImagePlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FeedEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <ImagePlusIcon className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-medium text-foreground">
          Create your first post
        </h2>
        <p className="text-sm text-muted-foreground">
          Share a photo with everyone on Connector.
        </p>
      </div>
      <Button asChild>
        <Link href="/create">Create Post</Link>
      </Button>
    </div>
  );
}
