# 06 Create Post

## Goal

Implement post creation functionality.

Connect the Create Post UI to:

* S3 uploads
* Database persistence
* Authentication

After this spec, authenticated users should be able to create real posts.

---

## Scope

Implement:

* Create Post server action
* Form validation
* S3 upload integration
* Post database insertion
* Success handling
* Error handling

Do not implement:

* Feed page
* Likes
* Comments
* Profile page
* Post editing
* Post deletion

---

# User Flow

1. User navigates to /create.
2. User selects an image.
3. User enters an optional caption.
4. User submits the form.
5. Image uploads to S3.
6. Post record is created.
7. User is redirected to the home page.

---

# Authentication

Only authenticated users can create posts.

The server action must:

* Verify authentication
* Resolve the database user
* Reject unauthenticated requests

Do not trust client-provided user IDs.

---

# Validation

Use Zod.

---

## Image

Required.

Requirements:

* Must exist
* Must upload successfully

---

## Caption

Optional.

Maximum length:

2000 characters

Trim whitespace before storage.

---

# Server Action

Create a dedicated server action.

Responsibilities:

* Authenticate user
* Validate input
* Upload image
* Create database record
* Return success or error

Do not place business logic directly inside page components.

---

# Database Insert

Create a new post record.

Required fields:

* userId
* imageUrl

Optional:

* caption

createdAt and updatedAt should be handled automatically.

---

# S3 Integration

Use the upload infrastructure created in:

04-s3-image-upload.md

Requirements:

* Upload image
* Receive public URL
* Store URL in posts table

Do not duplicate S3 logic.

Reuse the shared upload utility.

---

# UI Integration

Connect the existing Create Post UI.

Requirements:

* Submit form
* Show loading state
* Disable submit button during submission

Do not redesign the UI.

Reuse existing components.

---

# Success State

After successful creation:

* Redirect to /
  OR
* Redirect to /feed

Choose one route and use it consistently.

Clear local form state.

---

# Error State

Display user-friendly errors.

Examples:

* Upload failed
* Invalid image
* Authentication required
* Post creation failed

Do not expose internal errors.

---

# Performance

Requirements:

* Upload image only once
* Create a single database insert
* Avoid unnecessary re-renders

---

# Deliverables

Implement:

* Create Post server action
* Form validation
* S3 upload integration
* Database insertion
* Success/error handling

---

# Acceptance Criteria

Authenticated users can:

1. Select an image.
2. Enter a caption.
3. Submit the form.
4. Upload image to S3.
5. Create a post record.
6. Be redirected after success.

Database contains:

* post record
* valid imageUrl
* correct userId

Unauthenticated users cannot create posts.

Validation errors are displayed correctly.
