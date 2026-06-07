# 03 Database Schema

## Goal

Create the database schema required for the MVP social features.

This spec defines the application's core social data model.

---

## Scope

Implement:

* Posts table
* Likes table
* Comments table
* Table relationships
* Database indexes
* Database migrations

Do not implement:

* Feed UI
* Create post UI
* Image uploads
* Likes functionality
* Comments functionality
* Profiles
* Direct messages
* Notifications
* Follow system

---

## Existing Tables

The following table already exists:

### Users

Fields:

* id
* clerkId
* username
* name
* imageUrl
* createdAt
* updatedAt

This table should not be modified unless absolutely necessary.

---

# Posts

## Purpose

Stores image posts created by users.

---

## Fields

### id

Unique identifier.

### userId

References:

users.id

Required.

### imageUrl

Public image URL.

Required.

### caption

Post caption.

Optional.

Maximum length:

2000 characters.

### createdAt

UTC timestamp.

### updatedAt

UTC timestamp.

---

## Relationships

Post belongs to one user.

User can have many posts.

---

## Likes

## Purpose

Stores post likes.

---

## Fields

### id

Unique identifier.

### userId

References:

users.id

Required.

### postId

References:

posts.id

Required.

### createdAt

UTC timestamp.

---

## Constraints

Prevent duplicate likes.

Unique:

(userId, postId)

---

## Relationships

User can like many posts.

Post can be liked by many users.

---

## Comments

## Purpose

Stores comments on posts.

---

## Fields

### id

Unique identifier.

### userId

References:

users.id

Required.

### postId

References:

posts.id

Required.

### content

Comment text.

Required.

Maximum length:

500 characters.

### createdAt

UTC timestamp.

### updatedAt

UTC timestamp.

---

## Relationships

User can create many comments.

Post can contain many comments.

---

# Cascade Behavior

## Post Deletion

When a post is deleted:

* likes must be deleted
* comments must be deleted

---

## User Deletion

When a user is deleted:

* posts must be deleted
* likes must be deleted
* comments must be deleted

---

# Indexes

Create indexes for:

### Posts

* userId
* createdAt

### Likes

* userId
* postId

### Comments

* postId
* userId

---

# Drizzle Requirements

Create schemas in:

db/schema/

Recommended files:

* users.ts
* posts.ts
* likes.ts
* comments.ts

Export all schemas through a single index file.

---

# Deliverables

Create:

* posts schema
* likes schema
* comments schema
* relationships
* migration files

---

# Acceptance Criteria

Database contains:

* users
* posts
* likes
* comments

Relationships are enforced through foreign keys.

Duplicate likes are prevented.

Cascade deletes function correctly.

Migrations run successfully on a clean database.

No application UI or business logic should be implemented as part of this spec.
