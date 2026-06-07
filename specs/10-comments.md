# 10 Comments

## Goal

Implement post comments.

Authenticated users should be able to:

* View comments
* Create comments
* See comment counts update

---

## Scope

Implement:

* Create comment
* View comments
* Comment list UI
* Feed query updates
* Comment count updates

Do not implement:

* Edit comment
* Delete comment
* Replies
* Mentions
* Notifications
* Real-time updates

---

# User Experience

Users can:

1. Open comments for a post.
2. View existing comments.
3. Add a new comment.
4. See comment count update.

---

# Feed Contract

Continue using:

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

No changes required.

commentsCount should already be displayed.

---

# Comment Data Contract

Create a reusable comment type.

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

---

# Comment Query

Create:

getPostComments(postId)

Responsibilities:

* fetch comments
* fetch author information
* sort oldest first

---

# Comment Ordering

Display:

Oldest comments first.

Example:

Comment 1
Comment 2
Comment 3

---

# Create Comment

Create a server action.

Recommended:

createComment()

Responsibilities:

* authenticate user
* validate input
* create comment
* revalidate feed

---

# Validation

Use Zod.

---

## Post

Must exist.

---

## Content

Required.

Trim whitespace.

Maximum length:

500 characters

Reject empty comments.

---

# Authentication

Only authenticated users may comment.

Requirements:

* verify authentication
* resolve database user
* reject unauthenticated users

---

# UI Integration

Reuse the existing Comment button.

Requirements:

* open comments section
* display comments
* display comment form

Implementation choice:

* inline expandable section
* modal
* drawer

Choose the simplest option.

---

# Comment Form

Requirements:

* textarea or input
* submit button
* loading state

Use shadcn components.

---

# Comment Count Updates

After comment creation:

* commentsCount updates
* new comment appears in list

---

# Empty State

When no comments exist:

Display:

No comments yet.

Be the first to comment.

---

# Error Handling

Handle:

* invalid input
* unauthenticated user
* missing post
* database failures

Display user-friendly messages.

Do not expose internal errors.

---

# Performance

Requirements:

* avoid N+1 queries
* fetch comments efficiently
* fetch author information efficiently

---

# Deliverables

Implement:

* comment query
* create comment action
* comments UI
* comment count updates

---

# Acceptance Criteria

Authenticated users can:

1. View comments.
2. Create comments.
3. See new comments immediately.
4. See updated comment counts.

Comments are ordered oldest first.

Feed functionality continues to work correctly.

Likes functionality remains unchanged.
