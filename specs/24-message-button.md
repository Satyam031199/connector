# 19 Profile Message Button

## Goal

Allow users to start or continue a conversation directly from another user's profile.

When viewing someone else's profile, display a **Message** button.

Clicking the button should create a conversation if one does not already exist, or open the existing conversation.

---

# Scope

Implement:

* Message button on user profiles
* Conditional rendering
* Conversation creation/reuse
* Navigation to chat page
* Loading state

Do not implement:

* Follow functionality
* Block users
* User search
* Message requests
* Group conversations

---

# User Experience

When viewing your own profile:

Display:

```text
[ Edit Profile ]
```

Do not display a Message button.

---

When viewing another user's profile:

Display:

```text
[ Message ]
```

Do not display the Edit Profile button.

---

# Button Behavior

When the user clicks **Message**:

1. Check if a conversation already exists.
2. If it exists:

   * Return the existing conversation.
3. Otherwise:

   * Create a new conversation.
4. Redirect to:

```text
/messages/[conversationId]
```

The user should not be aware whether the conversation was created or reused.

---

# Conversation Creation

Reuse:

```ts
createConversation(otherUserId)
```

from the Messaging Foundation.

Do not implement new conversation creation logic.

---

# Routing

Successful navigation should redirect to:

```text
/messages/[conversationId]
```

The chat page should open immediately.

---

# Button State

While creating or retrieving a conversation:

* Disable the button.
* Show a loading spinner.

Example:

```text
[ Creating... ]
```

Prevent duplicate requests.

---

# Conditional Rendering

Determine whether the viewed profile belongs to the authenticated user.

If:

```ts
profile.userId === currentUser.id
```

Display:

```text
Edit Profile
```

Otherwise display:

```text
Message
```

---

# Authorization

Requirements:

* User must be authenticated.
* Users cannot message themselves.
* Users may only create conversations with valid users.

---

# Error Handling

Handle:

* Invalid user
* Failed conversation creation
* Database failures
* Network failures

Display user-friendly error messages.

Do not expose internal errors.

---

# Accessibility

Requirements:

* Keyboard accessible
* Visible focus state
* Screen-reader label
* Disabled while loading

---

# Performance

Requirements:

* Reuse the existing `createConversation()` action.
* Do not perform duplicate conversation checks on the client.
* Let the server determine whether to create or reuse a conversation.

---

# Deliverables

Implement:

* Conditional Message button
* Conditional Edit Profile button
* Conversation creation/reuse
* Navigation to chat page
* Loading state

---

# Acceptance Criteria

Users can:

1. View their own profile and see **Edit Profile**.
2. View another user's profile and see **Message**.
3. Click **Message** to open a chat.
4. Reuse an existing conversation without creating duplicates.
5. Be redirected to the correct conversation.

The messaging flow should be:

Feed → User Profile → Message → Chat

# Small refinement

Since you're using Next.js Server Actions, I'd have the Message button call only:

```
const conversation = await createConversation(otherUserId);
router.push(`/messages/${conversation.id}`);
```

The client shouldn't check whether a conversation already exists. That responsibility belongs entirely to the server, keeping the client simple and preventing race conditions if two users try to start a conversation at the same time.