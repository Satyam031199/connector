import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PostNotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
        <div className="space-y-1">
          <h1 className="font-heading text-lg font-semibold text-foreground">
            Post not found
          </h1>
          <p className="text-sm text-muted-foreground">
            This post may have been deleted or the link is invalid.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Back to feed</Link>
        </Button>
      </div>
    </div>
  );
}
