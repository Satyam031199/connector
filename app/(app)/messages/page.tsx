import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getUserConversations } from "@/app/db/queries/conversations";
import { getCurrentUser } from "@/app/lib/auth";
import { ConversationList } from "@/components/messages/conversation-list";
import { ConversationSkeleton } from "@/components/messages/conversation-skeleton";
import type { ConversationListItem } from "@/types/conversation";

export const metadata: Metadata = { title: "Messages | Connector" };

// Conversation previews are per-user, so the page must render per request.
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-foreground">
        Messages
      </h1>
      <Suspense fallback={<ConversationsSkeleton />}>
        <Conversations userId={user.id} />
      </Suspense>
    </div>
  );
}

async function Conversations({ userId }: { userId: string }) {
  let conversations: ConversationListItem[] | null = null;

  try {
    conversations = await getUserConversations(userId);
  } catch (error) {
    // Never expose internal database errors to the user.
    console.error("Failed to load conversations:", error);
  }

  if (conversations === null) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        Couldn&apos;t load your conversations. Please try again later.
      </div>
    );
  }

  return <ConversationList conversations={conversations} />;
}

function ConversationsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <ConversationSkeleton key={index} />
      ))}
    </div>
  );
}
