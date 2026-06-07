# 02 Authentication

## Goal

Implement authentication using Clerk and synchronize authenticated users into the application database.

This spec establishes the application's identity layer and user records.

---

## Scope

Implement:

- Clerk provider integration
- Clerk middleware protection
- Sign In page
- Sign Up page
- User database schema
- Clerk webhook handler
- User synchronization
- Current user helper utilities

Do not implement:

- Posts
- Feed
- Likes
- Comments
- Profiles
- Image uploads

---

## Requirements

### Authentication Provider

Use Clerk as the authentication provider.

Authentication state must be managed entirely by Clerk.

Do not create custom JWT authentication.

---

## Routes

### Public Routes

The following routes must be accessible without authentication:

- /
- /sign-in
- /sign-up

### Protected Routes

Any future application routes must require authentication.

Protection must be implemented using Clerk middleware.

---

## Database

### Users Table

Create a users table.

Fields:

- id
- clerkId
- username
- name
- imageUrl
- createdAt
- updatedAt

Requirements:

- clerkId must be unique
- username must be unique
- timestamps should be stored in UTC

---

## Clerk Webhook

Create a webhook endpoint for Clerk events.

Supported events:

### user.created

Create a user record.

### user.updated

Update:

- username
- name
- imageUrl

### user.deleted

Delete the corresponding user record.

---

## User Synchronization Rules

Database user records are considered the application's source of truth.

Every authenticated Clerk user must have a corresponding database record.

The application should never assume Clerk data without verifying a database record exists.

---

## Helper Functions

Create reusable helpers for:

### getCurrentUser()

Returns:

- database user record

Requirements:

- Uses Clerk authentication
- Returns null when unauthenticated

### requireUser()

Returns:

- authenticated database user

Requirements:

- Throws or redirects when unauthenticated

---

## Layout Integration

Configure ClerkProvider at the root application layout.

Authentication UI should use Clerk components.

---

## Environment Variables

The following variables must be available:

- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- CLERK_WEBHOOK_SECRET

Environment validation should already exist from Project Setup.

---

## Error Handling

Webhook failures must:

- Return appropriate HTTP status codes
- Log useful error messages

Database failures should never expose internal errors to users.

---

## Acceptance Criteria

A user can:

1. Sign up using Clerk.
2. Sign in using Clerk.
3. Sign out using Clerk.
4. Access protected routes when authenticated.
5. Be redirected when unauthenticated.
6. Automatically create a database user record after signup.
7. Update their Clerk profile and have changes synchronized.
8. Delete their Clerk account and have the database record removed.

No feed, post, like, comment, or profile functionality should exist after completing this spec.