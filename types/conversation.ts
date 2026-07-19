/**
 * Conversation data contracts (reused by the queries and future inbox UI).
 */
export type ConversationParticipant = {
  id: string;
  username: string;
  name: string | null;
  imageUrl: string | null;
};

export type ConversationWithParticipants = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  participants: ConversationParticipant[];
};

/** One row of a user's conversation list — shaped for direct inbox use. */
export type ConversationListItem = {
  id: string;
  updatedAt: Date;

  otherUser: {
    id: string;
    username: string;
    imageUrl: string | null;
  };

  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
};
