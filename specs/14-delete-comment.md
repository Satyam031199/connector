# 14 Delete Comment

## Goal

Allow users to delete their own comments.

After this spec, users should have full ownership of comments they create.

---

## Scope

Implement:

* Delete comment action
* Delete comment confirmation
* Authorization checks
* Comment count updates
* Feed updates after deletion

Do not implement:

* Edit comment
* Soft deletes
* Comment recovery
* Admin moderation
* Bulk deletion

---

# User Experience

Users can:

1. View comments.
2. Open comment actions.
3. Delete their own comments.
4. See comments removed immediately.

---

# Authorization

Only the comment owner may delete a comment.

Requirements:

* verify authenticated user
* verify ownership
* reject unauthorized deletion attempts

Users must never be able to delete another user's comments.

---

# Comment Actions

Provide a comment actions menu.

Recommended:

* dropdown menu
* three-dot menu

Example option:

```text
Delete Comment
```

Only show delete controls for comments owned by the current user.

---

# Delete Confirmation

Require confirmation before deletion.

Requirements:

* confirmation dialog
* cancel action
* confirm action

Example text:

```text
Are you sure you want to delete this comment?

This action cannot be undone.
```

---

# Server Action

Create:

```ts
deleteComment(commentId)
```

Responsibilities:

* authenticate user
* validate ownership
* delete comment
* revalidate affected views

---

# Database Behavior

Delete the target comment.

Requirements:

* comment removed permanently
* related post remains untouched
* other comments remain untouched

---

# Feed Integration

After deletion:

* commentsCount updates
* feed remains functional

Requirements:

* no stale counts
* no stale comments

---

# Comments Integration

After deletion:

* comment disappears
* comment list updates
* ordering remains correct

Users should not need to manually refresh.

---

# Empty State

When the final comment is deleted:

Display:

```text
No comments yet.

Be the first to comment.
```

Reuse the existing comments empty state.

---

# Error Handling

Handle:

* unauthenticated user
* unauthorized user
* missing comment
* database failures

Display user-friendly messages.

Do not expose internal errors.

---

# UI Requirements

Reuse existing styling.

Recommended components:

* DropdownMenu
* AlertDialog
* Button

Do not redesign the comments UI.

---

# Revalidation

After successful deletion:

Revalidate:

* comments view
* feed data

Comment counts should remain accurate.

---

# Deliverables

Implement:

* delete comment action
* ownership checks
* confirmation dialog
* comment list updates
* comment count updates

---

# Acceptance Criteria

Users can:

1. Delete their own comments.
2. Confirm before deletion.
3. See comments removed immediately.
4. See comment counts update correctly.

Users cannot:

1. Delete another user's comments.

Deleted comments:

* no longer exist in the database
* no longer appear in comment lists
* no longer contribute to comment counts

Posts remain unaffected.
