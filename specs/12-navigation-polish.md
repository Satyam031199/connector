# 12 Navigation Polish

## Goal

Improve application navigation and overall user experience.

This spec focuses on discoverability, consistency, and navigation between existing features.

No new business functionality should be introduced.

---

## Scope

Implement:

* Active navigation states
* Consistent navigation links
* Profile navigation improvements
* Feed navigation improvements
* Mobile navigation
* Empty state improvements
* Page metadata improvements

Do not implement:

* Search
* Notifications
* Messaging
* Follow system
* Bookmarks
* New database schema

---

# Navigation Structure

The application currently contains:

* Feed
* Create Post
* Profile

These should be easily accessible from anywhere in the application.

---

# Primary Navigation

Ensure navigation contains:

## Feed

Route:

```text
/
```

Label:

```text
Feed
```

---

## Create

Route:

```text
/create
```

Label:

```text
Create
```

---

## Profile

Route:

```text
/profile
```

Label:

```text
Profile
```

---

# Active Navigation State

The currently active route should be visually highlighted.

Examples:

* active icon
* active text
* active background

Implementation is flexible.

The active page should always be obvious.

---

# Mobile Navigation

Create a mobile-friendly navigation experience.

Requirements:

* Easy thumb access
* Consistent with desktop navigation
* Access to Feed, Create, Profile

Recommended:

Bottom navigation bar.

---

# Desktop Navigation

Desktop navigation should remain visible and intuitive.

Requirements:

* Consistent placement
* Reuse existing navigation components

---

# Profile Navigation

Improve profile discoverability.

Requirements:

* Clicking avatar navigates to profile
* Profile link exists in navigation
* User can easily return to feed

---

# Empty State Improvements

Review existing empty states.

---

## Feed Empty State

Provide clear action:

```text
Create your first post
```

Button:

```text
Create Post
```

Route:

```text
/create
```

---

## Profile Empty State

Provide clear action:

```text
Create your first post
```

Button:

```text
Create Post
```

Only for the current user.

---

# Page Titles

Add meaningful page titles.

Examples:

Feed:

```text
Connector
```

Create:

```text
Create Post | Connector
```

Profile:

```text
Profile | Connector
```

---

# Loading Experience

Review existing loading states.

Requirements:

* Consistent skeleton usage
* No layout shift
* Reuse existing loading components

---

# Accessibility

Requirements:

* Keyboard accessible navigation
* Proper aria labels
* Active navigation indication
* Focus states

---

# Styling

Continue using theme tokens.

Preferred:

* bg-background
* bg-card
* border-border
* text-foreground
* text-muted-foreground

Use shadcn components where appropriate.

Do not use hardcoded Tailwind colors.

---

# Refactoring Rules

This spec may:

* clean up navigation components
* simplify layouts
* improve consistency

This spec must not:

* introduce new business logic
* change database schema
* modify existing social features

---

# Deliverables

Implement:

* active navigation states
* mobile navigation
* desktop navigation improvements
* empty state improvements
* page metadata improvements

---

# Acceptance Criteria

Users can:

1. Navigate to Feed.
2. Navigate to Create Post.
3. Navigate to Profile.
4. Clearly identify the active page.
5. Use navigation comfortably on mobile.
6. Recover easily from empty states.

No new application features are introduced.

Existing functionality continues to work unchanged.
