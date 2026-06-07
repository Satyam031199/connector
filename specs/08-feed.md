# 08 Feed

## Goal

Connect the feed UI to the database.

Replace mock posts with real post data.

After this spec, authenticated users should be able to view posts created by all users.

---

## Scope

Implement:

* Feed database queries
* Feed data fetching
* Real post rendering
* Feed ordering
* Empty state integration

Do not implement:

* Like functionality
* Comment functionality
* Infinite scrolling
* Pagination
* Search
* Follow system
* Feed ranking algorithm

---

# Feed Source

Use the posts table as the source of truth.

Feed should display all posts.

Ordering:

Newest posts first.

---

# Feed Data Contract

The feed query must return data in the following shape:

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
}
```

This contract should be considered the feed source of truth.

Future specs may extend this contract but should avoid changing it.

Examples of future additions:

```ts
{
  isLiked: boolean;
}
```

```ts
{
  comments: Comment[];
}
```

---

# Database Query

Create a reusable feed query.

Recommended location:

db/queries/get-feed-posts.ts

Example:

getFeedPosts()

Responsibilities:

* Fetch posts
* Fetch author information
* Calculate likes count
* Calculate comments count
* Sort newest first

---

# Query Requirements

The query must return:

## Post

* id
* imageUrl
* caption
* createdAt

---

## Author

Nested object:

```ts
author: {
  id: string;
  username: string;
  imageUrl: string | null;
}
```

Source:

users table

---

## Counts

Return:

```ts
likesCount: number
commentsCount: number
```

Source:

likes table
comments table

Display only.

Do not implement interactive likes or comments.

---

# Performance Requirements

Avoid N+1 queries.

The feed should not:

* query likes per post
* query comments per post
* query users per post

Use joins and aggregation where appropriate.

Feed retrieval should remain efficient as post counts grow.

---

# Feed Rendering

Replace all mock feed data created in:

07-feed-ui.md

Reuse the existing UI components.

Do not redesign the feed.

Do not introduce new visual features.

---

# Empty State

When no posts exist:

Display the existing feed empty state.

Requirements:

* No runtime errors
* Consistent layout
* Existing UI reused

---

# Loading State

Use the existing feed skeleton component.

Requirements:

* Display during loading
* Reuse components from 07-feed-ui.md

---

# Data Fetching Strategy

Preferred:

Server Components

Requirements:

* Fetch feed data on the server
* Avoid client-side fetching
* Avoid API routes

Use direct database access through shared query functions.

---

# Relative Time

Display user-friendly timestamps.

Examples:

* now
* 5m
* 2h
* 3d

Implementation choice is flexible.

---

# Error Handling

Handle:

* database failures
* invalid data
* missing author records

Display a user-friendly fallback.

Do not expose internal errors.

---

# Deliverables

Implement:

* getFeedPosts query
* feed data fetching
* real feed rendering
* author mapping
* likes count mapping
* comments count mapping
* empty state integration

---

# Acceptance Criteria

Authenticated users can:

1. Visit the feed.
2. View posts created by users.
3. View post images.
4. View captions.
5. View author information.
6. View like counts.
7. View comment counts.

Posts appear in newest-first order.

Mock data has been completely removed.

Feed data follows the defined contract.

No like or comment actions are functional yet.
