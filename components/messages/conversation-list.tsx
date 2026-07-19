import { ConversationCard } from "@/components/messages/conversation-card";
import { ConversationsEmptyState } from "@/components/messages/conversations-empty-state";
import type { ConversationListItem } from "@/types/conversation";

type ConversationListProps = {
  conversations: ConversationListItem[];
};

export function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return <ConversationsEmptyState />;
  }

  return (
    <nav aria-label="Conversations">
      <ul className="flex flex-col gap-2">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <ConversationCard conversation={conversation} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
