import Link from "next/link";
import { MessageCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ConversationsEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <MessageCircleIcon className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-medium text-foreground">
          No conversations yet.
        </h2>
        <p className="text-sm text-muted-foreground">
          Start chatting by visiting another user&apos;s profile.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to Feed</Link>
      </Button>
    </div>
  );
}
