# 15 Feed Pagination

## Goal

Implement feed pagination.

Users should be able to browse older posts without loading the entire feed at once.

The feed should remain performant as post counts grow.

---

## Scope

Implement:

* Cursor-based pagination
* Feed query updates
* Load More functionality
* Pagination state
* Feed loading states

Do not implement:

* Infinite scroll
* Search
* Feed ranking
* Recommendations
* Following feed
* Real-time feed updates

---

# Pagination Strategy

Use:

Cursor-based pagination

Do not use:

* page numbers
* offset pagination

---

# Feed Query Contract

Update:

```ts
getFeedPosts()
```

to support pagination.

Inputs:

```ts
{
  cursor?: string;
  limit?: number;
}
```

---

# Default Page Size

Load:

```text
10 posts
```

per request.

Use a shared constant.

Example:

```ts
const FEED_PAGE_SIZE = 10;
```

---

# Feed Response Contract

Return:

```ts
{
  posts: FeedPost[];

  nextCursor: string | null;

  hasMore: boolean;
}
```

---

# Cursor Behavior

Feed ordering remains:

Newest first

Cursor should represent the last loaded post.

Recommended:

```ts
createdAt
```

combined with

```ts
id
```

to guarantee stable ordering.

---

# Initial Feed Load

When visiting the feed:

* load first page
* display posts
* determine if more posts exist

---

# Load More Button

Add:

```text
Load More
```

below the feed.

Requirements:

* only display when more posts exist
* hide when feed is exhausted
* disable while loading

---

# Loading State

During pagination:

Display:

```text
Loading...
```

or a skeleton component.

The existing feed content should remain visible.

Do not replace the entire page with a loading state.

---

# Query Requirements

Requirements:

* newest posts first
* include author data
* include likesCount
* include commentsCount
* include isLiked

Continue using the existing feed contract.

---

# Feed Contract

No changes required.

Continue returning:

```ts
{
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

  isLiked: boolean;
}
```

---

# Performance

Requirements:

* avoid loading all posts
* avoid offset pagination
* avoid N+1 queries

Feed performance should remain stable as post counts increase.

---

# Empty Feed

When no posts exist:

Reuse the existing feed empty state.

No pagination controls should appear.

---

# Error Handling

Handle:

* invalid cursor
* database failures
* partial loading failures

Display user-friendly messages.

Do not expose internal errors.

---

# Future Compatibility

Design pagination so it can later support:

* infinite scrolling
* followed users feed
* recommended posts

without changing the pagination contract.

---

# Deliverables

Implement:

* cursor-based feed query
* paginated feed loading
* load more functionality
* pagination loading states

---

# Acceptance Criteria

Users can:

1. Load the initial feed.
2. View the newest posts first.
3. Load older posts.
4. Continue loading until no posts remain.

The feed:

* does not load all posts at once
* uses cursor-based pagination
* remains performant as post counts grow

Existing likes and comments functionality continue to work correctly.
