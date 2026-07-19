import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ConversationNotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
        <div className="space-y-1">
          <h1 className="font-heading text-lg font-semibold text-foreground">
            Conversation not found
          </h1>
          <p className="text-sm text-muted-foreground">
            This conversation may not exist, or you don&apos;t have access to it.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/messages">Back to messages</Link>
        </Button>
      </div>
    </div>
  );
}
