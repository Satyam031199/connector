import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { conversations } from "./conversations";
import { users } from "./users";

/**
 * Maps users to the conversations they participate in.
 *
 * Every conversation has exactly two participant rows (enforced at the
 * application level in `createConversation`). Deleting the conversation or
 * the user cascades to the membership row.
 */
export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.conversationId, table.userId] }),
    index("conversation_participants_conversation_id_idx").on(
      table.conversationId,
    ),
    index("conversation_participants_user_id_idx").on(table.userId),
  ],
);

export type ConversationParticipantRow =
  typeof conversationParticipants.$inferSelect;
export type NewConversationParticipant =
  typeof conversationParticipants.$inferInsert;
