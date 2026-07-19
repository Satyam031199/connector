import { relations } from "drizzle-orm";

import { users } from "./users";
import { posts } from "./posts";
import { likes } from "./likes";
import { comments } from "./comments";
import { conversations } from "./conversations";
import { conversationParticipants } from "./conversation-participants";
import { messages } from "./messages";

export * from "./users";
export * from "./posts";
export * from "./likes";
export * from "./comments";
export * from "./conversations";
export * from "./conversation-participants";
export * from "./messages";

/**
 * ORM-level relationships.
 *
 * Defined centrally so every table is imported before relations are resolved,
 * avoiding circular imports between the per-table files. These are metadata for
 * Drizzle's relational queries and do not affect generated migrations — the
 * foreign keys on each table enforce the relationships in the database.
 */
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  likes: many(likes),
  comments: many(comments),
  conversationParticipants: many(conversationParticipants),
  messages: many(messages),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  likes: many(likes),
  comments: many(comments),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
