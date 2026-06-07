# 11 Profile

## Goal

Implement user profiles.

Users should be able to:

* View a profile
* View a user's posts
* Edit their own profile

After this spec, the MVP social experience is complete.

---

## Scope

Implement:

* Profile page
* Profile header
* User posts grid
* Edit profile form
* Profile queries
* Profile updates

Do not implement:

* Followers
* Following
* Follow requests
* Profile privacy
* User search
* Activity feed
* Saved posts

---

# Routes

## Current User

```text
/profile
```

Displays the currently authenticated user's profile.

---

## User Profile

```text
/username/[username]
```

Displays a public profile.

Users can view other users' profiles.

---

# Profile Data Contract

The profile query should return:

```ts
{
  id: string;

  username: string;

  name: string | null;

  imageUrl: string | null;

  bio: string | null;

  createdAt: Date;

  postCount: number;

  posts: ProfilePost[];
}
```

---

# Profile Post Contract

```ts
{
  id: string;

  imageUrl: string;

  caption: string | null;

  createdAt: Date;
}
```

---

# Profile Header

Display:

* avatar
* username
* display name
* bio
* post count

Requirements:

* mobile friendly
* responsive layout
* reuse shadcn components

---

# Post Count

Display:

```text
12 posts
```

Count should come from the database.

---

# User Posts

Display posts in a grid.

Requirements:

* image only
* responsive layout
* newest posts first

Recommended:

* 3-column desktop grid
* collapse cleanly on smaller screens

---

# Empty Profile State

When a user has no posts:

Display:

Title:

```text
No posts yet
```

Description:

```text
Create your first post to get started.
```

Only show the create button on the current user's profile.

---

# Profile Query

Create:

```ts
getProfileByUsername(username)
```

Responsibilities:

* fetch user
* fetch post count
* fetch posts

---

# Edit Profile

Only available for the current user.

---

## Editable Fields

Allow updates to:

* name
* bio

Do not allow:

* clerkId
* username
* createdAt

---

# Edit Profile Form

Requirements:

* pre-filled values
* validation
* loading state
* success state

Use shadcn form components.

---

# Validation

Use Zod.

---

## Name

Optional.

Maximum length:

50 characters

---

## Bio

Optional.

Maximum length:

160 characters

---

# Server Action

Create:

```ts
updateProfile()
```

Responsibilities:

* authenticate user
* validate input
* update profile
* revalidate profile page

---

# Authorization

Users may only edit their own profile.

Users must never update another user's profile.

---

# UI Requirements

Reuse existing theme tokens.

Use:

* bg-background
* bg-card
* border-border
* text-foreground
* text-muted-foreground

Do not use hardcoded Tailwind colors.

---

# Error Handling

Handle:

* invalid username
* missing profile
* validation failures
* database failures

Display user-friendly messages.

Do not expose internal errors.

---

# Deliverables

Implement:

* profile page
* profile query
* profile header
* posts grid
* edit profile form
* update profile action

---

# Acceptance Criteria

Users can:

1. Visit their profile.
2. Visit another user's profile.
3. View user information.
4. View a user's posts.
5. Edit their own name.
6. Edit their own bio.

Profile pages display correct post counts.

Posts are displayed newest first.

Users cannot edit other users' profiles.
