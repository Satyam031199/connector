import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import { getConversationById } from "@/app/db/queries/conversations";
import {
  getMessages,
  MESSAGE_PAGE_SIZE,
  type MessagePage,
} from "@/app/db/queries/messages";
import { getCurrentUser } from "@/app/lib/auth";
import { ChatHeader } from "@/components/messages/chat-header";
import { ChatPanel } from "@/components/messages/chat-panel";
import { ChatSkeleton } from "@/components/messages/chat-skeleton";

export const metadata: Metadata = { title: "Chat | Connector" };

// Membership and message history are per-user, so the page must render per request.
export const dynamic = "force-dynamic";

const conversationIdSchema = z.uuid();

type Props = { params: Promise<{ conversationId: string }> };

export default async function ChatPage({ params }: Props) {
  const { conversationId } = await params;

  if (!conversationIdSchema.safeParse(conversationId).success) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-8">
      <div className="flex flex-col rounded-xl border border-border bg-card">
        <Suspense fallback={<ChatSkeleton />}>
          <Chat conversationId={conversationId} currentUserId={user.id} />
        </Suspense>
      </div>
    </div>
  );
}

async function Chat({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  currentUserId: string;
}) {
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    notFound();
  }

  const isParticipant = conversation.participants.some((p) => p.id === currentUserId);
  if (!isParticipant) {
    notFound();
  }

  const otherUser = conversation.participants.find((p) => p.id !== currentUserId)!;

  let page: MessagePage | null = null;

  try {
    page = await getMessages({ conversationId, limit: MESSAGE_PAGE_SIZE });
  } catch (error) {
    // Never expose internal database errors to the user.
    console.error("Failed to load messages:", error);
  }

  if (page === null) {
    return (
      <>
        <ChatHeader otherUser={otherUser} />
        <div className="px-6 py-16 text-center text-sm text-muted-foreground">
          Couldn&apos;t load this conversation. Please try again later.
        </div>
      </>
    );
  }

  return (
    <>
      <ChatHeader otherUser={otherUser} />
      <ChatPanel
        conversationId={conversationId}
        currentUserId={currentUserId}
        initialMessages={page.messages}
        initialNextCursor={page.nextCursor}
        initialHasMore={page.hasMore}
      />
    </>
  );
}
