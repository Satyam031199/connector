# 16 Post Details Page

## Goal

Implement a dedicated page for viewing an individual post.

Users should be able to open a post directly using its URL.

After this spec, posts become first-class resources with their own route.

---

## Scope

Implement:

* Post details route
* Post details query
* Single post page
* Comments integration
* Like integration
* Error states
* Loading states

Do not implement:

* Share buttons
* OpenGraph metadata
* Related posts
* Notifications
* Post editing
* Post deletion from this page

---

# Route

Create:

```text
/post/[postId]
```

Example:

```text
/post/abc123
```

---

# User Experience

Users can:

1. Open a post directly.
2. View post information.
3. View comments.
4. Like the post.
5. Comment on the post.

The page should feel like a standalone post view.

---

# Post Query

Create:

```ts
getPostById(postId)
```

Responsibilities:

* fetch post
* fetch author
* fetch likes count
* fetch comments count
* fetch isLiked
* fetch comments

---

# Post Data Contract

Return:

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

  comments: Comment[];
}
```

---

# Comment Data Contract

Reuse the existing comment contract.

```ts
{
  id: string;

  content: string;

  createdAt: Date;

  author: {
    id: string;
    username: string;
    imageUrl: string | null;
  };
}
```

Do not create a new comment shape.

---

# Page Layout

Recommended:

```text
┌─────────────────────┐
│     Post Image      │
├─────────────────────┤
│ Author              │
│ Caption             │
│ Like Count          │
│ Comment Count       │
│ Actions             │
├─────────────────────┤
│ Comments            │
└─────────────────────┘
```

Mobile-first design.

Responsive on desktop.

---

# Reuse Existing Components

Reuse whenever possible:

* Post card components
* Like button
* Comments UI
* Avatar components

Avoid duplicating feed functionality.

---

# Like Integration

Reuse:

```ts
toggleLike()
```

from the Likes spec.

Requirements:

* like state updates
* count updates

No new like implementation.

---

# Comments Integration

Reuse:

```ts
createComment()
```

and

```ts
deleteComment()
```

from the Comments specs.

Requirements:

* create comment
* delete own comment
* view comments

No duplicate logic.

---

# Navigation

Users should be able to reach this page from:

## Feed

Clicking a post image.

Optional:

Clicking the post card.

---

## Profile

Clicking a post in the profile grid.

---

# Loading State

Create a dedicated loading state.

Requirements:

* image placeholder
* metadata placeholder
* comments placeholder

Use shadcn Skeleton.

---

# Not Found State

When the post does not exist:

Display:

```text
Post not found
```

Requirements:

* friendly message
* link back to feed

Use Next.js notFound() where appropriate.

---

# Authorization

Viewing a post requires authentication.

The same access rules as the feed apply.

---

# Performance

Requirements:

* single post query
* avoid N+1 queries
* efficiently fetch comments
* efficiently fetch counts

---

# Metadata

Basic metadata only.

Title:

```text
Post by {username} | Connector
```

Description:

Use the caption when available.

Advanced sharing metadata will be implemented later.

---

# Error Handling

Handle:

* invalid post id
* missing post
* database failures

Display user-friendly errors.

Do not expose internal errors.

---

# Deliverables

Implement:

* /post/[postId]
* getPostById()
* standalone post page
* comments integration
* likes integration
* loading state
* not found state

---

# Acceptance Criteria

Users can:

1. Open a post directly.
2. View post information.
3. Like a post.
4. View comments.
5. Create comments.
6. Delete their own comments.

Posts can be opened from:

* Feed
* Profile

Invalid post URLs display a not-found experience.

Existing feed functionality remains unchanged.
