/**
 * A single post shown in a profile's posts grid (image-focused).
 */
export type ProfilePost = {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: Date;
};

/**
 * Profile data contract returned by `getProfileByUsername`.
 */
export type Profile = {
  id: string;
  username: string;
  name: string | null;
  imageUrl: string | null;
  bio: string | null;
  createdAt: Date;

  postCount: number;
  posts: ProfilePost[];
};
