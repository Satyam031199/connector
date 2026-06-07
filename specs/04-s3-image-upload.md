# 04 S3 Image Upload

## Goal

Implement image upload infrastructure using AWS S3.

This spec is responsible only for uploading and validating images.

No post creation functionality should be implemented.

---

## Scope

Implement:

* AWS S3 configuration
* S3 upload utility
* Upload endpoint
* Image validation
* Authentication protection
* Public image URL generation

Do not implement:

* Create Post page
* Feed
* Likes
* Comments
* Profiles
* Multiple image uploads
* Image editing
* Image deletion

---

# Storage Provider

Use:

AWS S3

Uploaded images should be stored in a dedicated bucket.

---

# Authentication

Uploads require authentication.

Only authenticated users may upload images.

Unauthenticated requests must be rejected.

Use Clerk authentication.

---

# Allowed File Types

Accept only:

* image/jpeg
* image/png
* image/webp

Reject all other file types.

---

# File Size Limits

Maximum upload size:

10 MB

Requests exceeding the limit must be rejected.

---

# Bucket Structure

Use the following structure:

uploads/

user-id/

generated-file-name.ext

Example:

uploads/123/post_a1b2c3d4.jpg

Do not use original filenames directly.

Generate unique filenames.

---

# Upload Utility

Create a reusable upload utility.

Location:

lib/s3.ts

Responsibilities:

* upload image
* generate object key
* return public URL

The utility should not contain application business logic.

---

# Upload Endpoint

Create a dedicated upload endpoint.

Location:

app/api/uploads/route.ts

Responsibilities:

* verify authentication
* validate file
* upload file
* return public image URL

Response:

Success:

* imageUrl

Failure:

* error message

---

# Validation

Validate:

## Authentication

User must be signed in.

---

## File Presence

File must exist.

---

## File Type

Must be:

* jpeg
* png
* webp

---

## File Size

Maximum:

10 MB

---

# Security

Do not trust client-provided metadata.

Validate file type server-side.

Reject unsupported content types.

Do not expose AWS credentials to the client.

AWS credentials must only be used on the server.

---

# Environment Variables

Required:

* AWS_REGION
* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY
* AWS_S3_BUCKET_NAME

Environment validation should be added if missing.

---

# Error Handling

Handle:

* missing file
* invalid file type
* oversized file
* unauthenticated user
* S3 upload failure

Return appropriate status codes.

Do not expose internal AWS errors.

---

# Deliverables

Create:

* S3 utility
* Upload endpoint
* Validation logic

No UI components.

---

# Acceptance Criteria

An authenticated user can:

1. Select an image.
2. Upload the image.
3. Receive a public image URL.

The image exists in S3.

Invalid files are rejected.

Unauthenticated uploads are rejected.

No post records are created as part of this spec.
