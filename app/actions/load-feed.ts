"use server";

import {
  getFeedPosts,
  type FeedPage,
} from "@/app/db/queries/get-feed-posts";

type LoadFeedResult =
  | ({ ok: true } & FeedPage)
  | { ok: false; error: string };

export async function loadFeedPage(input: {
  cursor: string;
}): Promise<LoadFeedResult> {
  try {
    const page = await getFeedPosts({ cursor: input.cursor });
    return { ok: true, ...page };
  } catch (error) {
    console.error("Failed to load feed page:", error);
    return {
      ok: false,
      error: "Failed to load more posts. Please try again.",
    };
  }
}
