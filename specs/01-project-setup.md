# 01 Project Setup

## Goal

Prepare the application infrastructure required for all future features.

---

## Scope

Implement:

- Clerk authentication setup
- PostgreSQL connection
- Drizzle ORM setup
- Environment variable validation
- Shared database client
- Shared utility structure

Do not implement:

- User schema
- Posts
- Likes
- Comments
- Profiles
- Feed pages

---

## Deliverables

### Dependencies

Install and configure:

- @clerk/nextjs
- drizzle-orm
- drizzle-kit
- postgres
- zod

---

### Environment Variables

Create validation for:

- DATABASE_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- CLERK_WEBHOOK_SECRET

Store validation in:

app/lib/env.ts

---

### Database

Create:

app/db/index.ts

Requirements:

- Export configured database client.
- No schemas yet.

---

### Drizzle

Create:

drizzle.config.ts

Requirements:

- Migration configuration
- Schema location prepared

---

### Clerk

Configure:

- middleware.ts
- ClerkProvider

Requirements:

- Public routes:
  - /
  - /sign-in
  - /sign-up

Everything else protected.

---

## Acceptance Criteria

Application can:

- Start successfully
- Connect to database
- Authenticate with Clerk
- Protect authenticated routes

No business features implemented.