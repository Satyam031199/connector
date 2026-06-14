/**
 * Feed data contract (the feed source of truth).
 *
 * Future specs may extend this shape (e.g. `comments`) but should avoid
 * changing existing fields.
 */
export type FeedPost = {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: Date;

  author: {
    id: string;
    username: string;
    imageUrl: string | null;
  };

  likesCount: number;
  commentsCount: number;

  /** Whether the currently authenticated user has liked this post. */
  isLiked: boolean;

  /** Whether the currently authenticated user authored this post. */
  isOwnPost: boolean;

  /** The database ID of the currently authenticated user (null if not signed in). */
  currentUserId: string | null;
};
