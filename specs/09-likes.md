# 09 Likes

## Goal

Implement post likes.

Authenticated users should be able to:

* Like a post
* Unlike a post
* See whether they have liked a post
* See updated like counts

---

## Scope

Implement:

* Like post
* Unlike post
* Toggle like action
* Like button state
* Feed integration
* Feed query updates

Do not implement:

* Comments
* Notifications
* Activity feeds
* Reactions
* Bookmarks
* Optimistic updates

---

# User Experience

Users can:

1. View posts in the feed.
2. See whether they have liked a post.
3. Click the Like button.
4. Like a post.
5. Unlike a post.
6. See the count update.

---

# Feed Contract Update

Extend the feed data contract.

Current:

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

Updated:

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

# Like Ownership

A user may like a post once.

This rule is enforced by the database unique constraint:

(userId, postId)

The application should never create duplicate likes.

---

# Feed Query Updates

Update:

getFeedPosts()

Requirements:

* Return likesCount
* Return isLiked

isLiked should be determined using the currently authenticated user.

Example:

```ts
isLiked: true
```

when a like record exists.

---

# Server Action

Create a dedicated server action.

Recommended:

toggleLike(postId)

Responsibilities:

* authenticate user
* validate post
* create like
* remove like
* revalidate feed

---

# Toggle Behavior

## When Like Exists

Delete the like.

Result:

```ts
isLiked = false
```

---

## When Like Does Not Exist

Create the like.

Result:

```ts
isLiked = true
```

---

# Authentication

Only authenticated users may like posts.

Requirements:

* verify authenticated user
* resolve database user
* reject unauthenticated requests

Do not trust client-provided user IDs.

---

# Validation

Validate:

## Post Exists

The target post must exist.

Return a safe error if not found.

---

## User Exists

Authenticated user must have a corresponding database record.

---

# UI Integration

Reuse the existing Like button.

Do not redesign the feed.

Do not create new layouts.

Requirements:

* button reflects liked state
* button triggers server action
* count updates after action

---

# Like Button State

When not liked:

* outline/neutral appearance

When liked:

* visually active

Implementation choice is flexible.

The difference must be clear.

---

# Revalidation

After a successful like action:

Revalidate the feed.

Users should see updated counts immediately after refresh/navigation.

Optimistic updates are not required.

---

# Error Handling

Handle:

* unauthenticated user
* missing post
* database failure

Display user-friendly messages.

Do not expose internal errors.

---

# Performance

Requirements:

* single toggle action
* avoid unnecessary queries
* use existing indexes

The likes table unique constraint should be relied upon.

---

# Deliverables

Implement:

* toggleLike server action
* feed query update
* isLiked support
* feed UI integration
* count updates

---

# Acceptance Criteria

Authenticated users can:

1. Like a post.
2. Unlike a post.
3. See whether a post is liked.
4. See updated like counts.

Feed data includes:

```ts
{
  isLiked: boolean;
}
```

Duplicate likes are impossible.

Feed UI reflects the current like state.

Comments functionality remains untouched.
