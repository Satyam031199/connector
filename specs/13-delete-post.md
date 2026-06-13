# 13 Delete Post

## Goal

Allow users to delete their own posts.

After this spec, users should be able to permanently remove posts they created.

---

## Scope

Implement:

* Delete post action
* Delete post confirmation
* Authorization checks
* Feed updates after deletion
* Profile updates after deletion

Do not implement:

* Edit post
* Soft deletes
* Post recovery
* Admin deletion
* Bulk deletion

---

# User Experience

Users can:

1. View their own post.
2. Open post actions.
3. Select Delete Post.
4. Confirm deletion.
5. See the post removed from the application.

---

# Authorization

Only the post owner may delete a post.

Requirements:

* Verify authenticated user
* Verify ownership
* Reject unauthorized deletion attempts

Users must never be able to delete another user's post.

---

# Post Actions

Provide a post actions menu.

Recommended:

* Dropdown menu
* More actions button

Example options:

```text
Delete Post
```

Only display delete controls for the post owner.

---

# Delete Confirmation

Require confirmation before deletion.

Requirements:

* Modal or alert dialog
* Clear warning
* Cancel option
* Confirm option

Example text:

```text
Are you sure you want to delete this post?

This action cannot be undone.
```

---

# Server Action

Create:

```ts
deletePost(postId)
```

Responsibilities:

* authenticate user
* validate ownership
* delete post
* revalidate affected pages

---

# Database Behavior

Delete the target post.

The application should rely on existing database relationships.

Associated likes and comments should be removed automatically through cascade behavior established in earlier specs.

Do not manually delete likes and comments unless required by the schema.

---

# S3 Cleanup

Delete the corresponding image from S3.

Requirements:

* Remove image object
* Prevent orphaned uploads

If S3 deletion fails:

* Log the failure
* Do not expose internal errors

Implementation choice is flexible:

* delete image before post deletion
* delete image after post deletion

The final result must be:

* post removed
* image removed

---

# Feed Integration

After deletion:

* feed should update
* deleted post should disappear

Requirements:

* no stale content
* no refresh required beyond normal revalidation

---

# Profile Integration

After deletion:

* post grid updates
* post count updates

Deleted posts should no longer appear.

---

# Error Handling

Handle:

* unauthenticated user
* unauthorized user
* missing post
* database failures
* S3 failures

Display user-friendly messages.

Do not expose internal errors.

---

# UI Requirements

Reuse existing theme styles.

Use shadcn components where appropriate.

Recommended:

* DropdownMenu
* AlertDialog
* Button

Do not redesign feed or profile layouts.

---

# Deliverables

Implement:

* delete post action
* ownership checks
* confirmation dialog
* feed revalidation
* profile revalidation
* S3 cleanup

---

# Acceptance Criteria

Users can:

1. Delete their own posts.
2. Confirm before deletion.
3. See posts removed from the feed.
4. See posts removed from profiles.

Users cannot:

1. Delete another user's post.

Deleted posts:

* no longer exist in the database
* no longer appear in the feed
* no longer appear in profiles
* have their associated image removed from S3

Likes and comments associated with the post are cleaned up automatically.
