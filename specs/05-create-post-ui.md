# 05 Create Post UI

## Goal

Build the Create Post user interface.

This spec is focused entirely on user experience and visual structure.

No post records should be created.

No database writes should occur.

No feed functionality should be implemented.

---

## Scope

Implement:

* Authenticated application layout
* Top navigation
* Create Post page
* Image selection UI
* Image preview
* Caption input
* Form layout
* Loading and empty states

Do not implement:

* Post creation
* Database writes
* Feed
* Likes
* Comments
* Profiles
* Edit Post
* Delete Post

---

# Application Layout

Create the primary authenticated layout.

Requirements:

* Responsive
* Mobile friendly
* Uses shadcn components where appropriate

---

## Navigation

Create a top navigation bar.

Items:

### Logo

Display:

Connector (will provide with the actual logo later)

Navigate to:

/

---

### Create

Navigate to:

/create

---

### User Menu

Display authenticated user avatar.

Use Clerk user button.

---

# Create Post Page

Route:

/create

Authentication required.

---

# Page Layout

Use a centered container.

Recommended width:

max-w-2xl

The page should contain:

1. Page heading
2. Image upload area
3. Image preview
4. Caption input
5. Submit button

---

# Page Heading

Display:

Create Post

Optional helper text:

Share a photo with your followers.

---

# Image Selection UI

Provide image selection using standard browser file picker.

Requirements:

* Accept image files
* Single image only

No upload should occur yet.

---

# Empty State

Before an image is selected:

Display a dropzone-style card.

Content:

* Upload icon
* Instruction text

Example:

Select an image to preview.

---

# Image Preview

After image selection:

Display image preview.

Requirements:

* Responsive
* Maintain aspect ratio
* Fit within container

Preview should use local browser state only.

Do not upload the image.

---

# Caption Input

Use shadcn Textarea.

Requirements:

* Maximum length indicator
* Multiline support

Validation is visual only.

No submission validation required yet.

---

# Submit Button

Use primary button styling.

Text:

Create Post

Current behavior:

Disabled placeholder action.

The button should not create anything yet.

Optional:

Show toast:

Post creation will be implemented in the next section.

---

# Component Structure

Recommended:

components/

create-post/

* create-post-form.tsx
* image-picker.tsx
* image-preview.tsx

Keep components focused and reusable.

---

# Styling Rules

Follow project theme tokens.

Use:

* bg-background
* bg-card
* border-border
* text-foreground
* text-muted-foreground

Do not use hardcoded Tailwind colors.

Use shadcn Button, Card, Input, Textarea where appropriate.

---

# Accessibility

Requirements:

* Labels for inputs
* Keyboard accessible controls
* Proper button types
* Meaningful alt text for previews

---

# Mock Data Rules

Local component state is allowed.

No API calls.

No database calls.

No S3 uploads.

No server actions.

---

# Deliverables

Create:

* authenticated layout
* navigation
* create page
* image picker
* image preview
* caption input

---

# Acceptance Criteria

Authenticated users can:

1. Navigate to /create
2. Select an image
3. Preview the image
4. Enter a caption
5. Click the Create Post button

The UI behaves correctly.

No uploads occur.

No post records are created.

No database writes occur.
