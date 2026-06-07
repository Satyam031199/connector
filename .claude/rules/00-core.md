---
description: Core Connector project behavior and scope control.
alwaysApply: true
---

# Project Foundation

## Project Name

Connector

---

# Overview

A simplified Instagram-like social media platform.

Users can:

- Sign up / Sign in
- Create profile
- Upload image posts
- View feed
- Like posts
- Comment on posts

Future versions:

- Follow system
- Notifications
- Direct Messages
- Search

Current scope intentionally excludes these features.

---

# MVP Scope

## Authentication

Users can:

- Register
- Login
- Logout
- Maintain session

Authentication Provider:

- Clerk

---

## Feed

Users can:

- Create post
- Upload image
- Add caption
- View feed
- View post details

---

## Engagement

Users can:

- Like post
- Unlike post
- Add comment
- Delete own comment

---

## Profile

Users can:

- View profile
- Edit profile
- View own posts

---

# Out Of Scope

The following will NOT be implemented during MVP:

- Direct messages
- Notifications
- Search
- Follow system

---

# Technology Stack

## Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui

## Authentication

- Clerk

## Database

- PostgreSQL

Reason:

- Strong relational data
- Better support for likes/comments relationships
- Easier future implementation of:
  - follows
  - direct messages
  - notifications

## ORM

- Drizzle ORM

## File Storage

- AWS S3

Future alternatives:
- Cloudinary

---

# System Architecture

Client
↓
Next.js Server Actions
↓
Drizzle ORM
↓
PostgreSQL

Images
↓
AWS S3
↓
CDN URL stored in database

Authentication
↓
Clerk
↓
User synced into database

---

# Folder Structure

├── app/
│ ├── (auth)
│ ├── (protected)
│ ├── api
│
├── components/
│ ├── ui
│ ├── feed
│ ├── profile
│ ├── comments
│
├── actions/
│
├── db/
│ ├── schema
│ ├── queries
│
├── lib/
│
├── hooks/
│
├── types/
│
├── services/
│
└── validations/

---

# Database Design

## Users

Stores application users.

Fields:

- id
- clerkId
- username
- name
- bio
- imageUrl
- createdAt

---

## Posts

Fields:

- id
- userId
- imageUrl
- caption
- createdAt

---

## Likes

Fields:

- id
- userId
- postId

Unique:

(userId, postId)

---

## Comments

Fields:

- id
- userId
- postId
- content
- createdAt

---

# Authentication Flow

1. User signs up via Clerk.
2. Clerk webhook triggers.
3. User record created in database.
4. User accesses protected routes.
5. Session verified using Clerk middleware.

---

# Coding Standards

## TypeScript

- Strict mode enabled
- Avoid any
- Prefer inferred types

## Components

- Server Components by default
- Client Components only when necessary

## Data Fetching

Preferred order:

1. Server Components
2. Server Actions
3. API Routes

Avoid unnecessary client-side fetching.

---

# Error Handling

Every action must:

- Validate input
- Handle database errors
- Return typed responses

---

# Validation

Use Zod.

Required for:

- Create post
- Create comment
- Edit profile

---

# Security

- Clerk protected routes
- Server-side authorization
- File upload validation
- Input validation using Zod

---

# Development Phases

## Phase 1

Project Setup

- Clerk
- PostgreSQL
- Drizzle
- AWS S3

Deliverable:
Authentication working.

---

## Phase 2

Database

- User schema
- Post schema
- Comment schema
- Like schema

Deliverable:
Database migrations complete.

---

## Phase 3

Feed

- Create post
- Feed page
- Post card

Deliverable:
Users can upload and view posts.

---

## Phase 4

Likes

- Like post
- Unlike post
- Like count

Deliverable:
Post engagement working.

---

## Phase 5

Comments

- Create comment
- View comments

Deliverable:
Basic discussion functionality.

---

## Phase 6

Profile

- User profile page
- Edit profile
- User posts

Deliverable:
Profile management complete.

---

# Success Criteria

A user can:

1. Register
2. Login
3. Create a post
4. View feed
5. Like a post
6. Comment on a post
7. View profile

without any page reloads or API failures.

# Core Rules

- Work on one active section at a time.
- Treat the active `specs/*.md` file as the implementation source of truth.
- Keep implementation changes scoped to the active spec.
- Do not add future features, routes, schemas, pages, packages, or abstractions unless the active spec explicitly asks for them.
- Prefer simple, readable code over over-engineered patterns.
- Do not duplicate broad project instructions inside implementation prompts.
- If a manual setup step is required, place it in `manual-work/*.md` and do not silently invent setup assumptions.
- Update `context/tracker.md` after completing a section.
- Keep `context/tracker.md` short: section status, important decisions, next section, and known issues only.

# Frontend Rules

- Use Next.js App Router conventions.
- Use shadcn/ui components where they fit the feature.
- The shadcn theme is already installed. Use the theme tokens from `app/globals.css`.
- Do not invent random Tailwind colors such as `bg-blue-600`, `text-slate-500`, or `bg-zinc-900`.
- Prefer theme classes:
  - `bg-background`
  - `bg-card`
  - `text-foreground`
  - `text-muted-foreground`
  - `border-border`
  - `bg-primary`
  - `text-primary-foreground`
  - `bg-secondary`
  - `text-secondary-foreground`
  - `bg-muted`
- Use `Button` variants instead of hard-coded button colors where possible.
- Main CTA or submit action should use the primary style.
- Secondary/cancel/navigation actions should use secondary, outline, or ghost styles.
- Cards should usually use `bg-card`, `border`, `border-border`, rounded corners, and consistent padding.
- Keep layouts simple:
  - page containers use a readable max width and horizontal padding
  - card grids should collapse cleanly on mobile
  - forms should be single-column unless the active spec says otherwise
- Do not create Next.js API proxy routes unless an active spec explicitly asks.