# 07 Feed UI

## Goal

Build the feed user interface.

This spec is focused on visual structure and user experience only.

Posts should be rendered from mock data.

No database queries should be implemented.

No likes or comments functionality should be connected.

---

## Scope

Implement:

* Feed page
* Feed layout
* Post card component
* Post header
* Post image
* Post actions UI
* Post metadata UI
* Empty state UI
* Loading state UI

Do not implement:

* Feed queries
* Likes functionality
* Comments functionality
* Infinite scrolling
* Pagination
* Search
* Follow system
* Notifications

---

# Feed Route

Route:

/

Authentication required.

The feed is the primary application page after login.

---

# Feed Layout

Create a centered feed layout.

Recommended:

* max-w-2xl
* vertically stacked posts
* responsive design

Requirements:

* Mobile friendly
* Consistent spacing
* Clean reading experience

---

# Mock Data

Use local mock data.

Example fields:

* id
* username
* userImage
* imageUrl
* caption
* createdAt
* likesCount
* commentsCount

No database access.

No server actions.

---

# Feed Page

Display a list of posts.

Requirements:

* Render multiple mock posts
* Proper spacing between posts
* Reusable post card component

---

# Post Card

Create a reusable post card component.

Recommended:

components/feed/post-card.tsx

Each card should contain:

1. Header
2. Image
3. Actions
4. Metadata
5. Caption

---

# Post Header

Display:

* User avatar
* Username
* Relative timestamp

Example:

satyam • 2h

Use shadcn Avatar component.

---

# Post Image

Display image prominently.

Requirements:

* Responsive
* Rounded corners
* Maintain aspect ratio
* Full card width

Use placeholder images for mock data.

---

# Post Actions

Display action buttons only.

No functionality.

Actions:

* Like
* Comment

Use icons.

Requirements:

* Hover states
* Accessible labels

Buttons should not perform actions yet.

---

# Post Metadata

Display:

* Like count
* Comment count

Example:

24 likes

3 comments

Values should come from mock data.

---

# Caption

Display:

username caption

Example:

satyam First post on Connector 🚀

Requirements:

* Handle long captions gracefully
* Preserve whitespace reasonably

---

# Empty State

Create an empty feed state.

Display when no mock posts exist.

Content:

Title:

No posts yet

Description:

Create your first post to get started.

Optional:

Button linking to:

/create

---

# Loading State

Create a feed skeleton component.

Use shadcn Skeleton.

Display:

* avatar skeleton
* image skeleton
* text skeleton

No actual loading logic required.

---

# Component Structure

Recommended:

components/feed/

* feed-list.tsx
* post-card.tsx
* post-header.tsx
* post-actions.tsx
* feed-empty-state.tsx
* post-skeleton.tsx

Keep components focused and reusable.

---

# Styling Rules

Use theme tokens only.

Preferred classes:

* bg-background
* bg-card
* border-border
* text-foreground
* text-muted-foreground

Use shadcn components where appropriate.

Do not use hardcoded Tailwind colors.

---

# Accessibility

Requirements:

* Meaningful alt text
* Accessible buttons
* Keyboard navigation
* Proper semantic structure

---

# Deliverables

Create:

* Feed page
* Feed layout
* Post card
* Feed empty state
* Feed skeleton state

Use mock data only.

---

# Acceptance Criteria

Authenticated users can:

1. Visit the feed page.
2. View multiple mock posts.
3. View post images.
4. View post metadata.
5. View placeholder like/comment actions.

Feed appears visually complete.

No database queries occur.

No likes or comments are functional.
