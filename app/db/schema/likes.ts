import {
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { posts } from "./posts";
import { users } from "./users";

/**
 * Likes on posts.
 *
 * A user can like many posts and a post can be liked by many users. The
 * (userId, postId) pair is unique to prevent duplicate likes. Deleting either
 * the user or the post cascades to the like.
 */
export const likes = pgTable(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("likes_user_id_post_id_idx").on(table.userId, table.postId),
    index("likes_user_id_idx").on(table.userId),
    index("likes_post_id_idx").on(table.postId),
  ],
);

export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
