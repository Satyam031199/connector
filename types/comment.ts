/**
 * Comment data contract (reused by the query, action, and UI).
 */
export type Comment = {
  id: string;
  content: string;
  createdAt: Date;

  author: {
    id: string;
    username: string;
    imageUrl: string | null;
  };
};
