"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { createConversation } from "@/app/actions/conversations";
import { Button } from "@/components/ui/button";

type MessageButtonProps = {
  otherUserId: string;
  username: string;
};

/**
 * Starts (or reuses) a conversation with the viewed profile's owner and
 * redirects to the chat. The server alone decides whether to create or reuse
 * a conversation (`createConversation`) — this component never checks for an
 * existing one itself, avoiding a client/server race.
 */
export function MessageButton({ otherUserId, username }: MessageButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await createConversation(otherUserId);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        router.push(`/messages/${result.conversationId}`);
      } catch (error) {
        // A network failure calling the server action itself (not a `result.ok`
        // failure) — never surface the raw error to the user.
        console.error("Failed to start conversation:", error);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Message ${username}`}
      className="transition-all hover:border-ring hover:bg-muted hover:shadow-sm active:scale-95"
    >
      {isPending ? (
        <>
          <Loader2Icon className="animate-spin" />
          Creating...
        </>
      ) : (
        "Message"
      )}
    </Button>
  );
}
