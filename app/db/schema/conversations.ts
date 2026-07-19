import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * One-to-one conversations between two users.
 *
 * `lastMessageId` is reserved for efficient inbox queries in a future section
 * and intentionally has no foreign key — it will be wired up once messages can
 * be sent, avoiding a circular reference with the `messages` table for now.
 */
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastMessageId: uuid("last_message_id"),
  },
  (table) => [index("conversations_updated_at_idx").on(table.updatedAt)],
);

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
