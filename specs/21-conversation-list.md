# 21 Conversations List

## Goal

Implement the Inbox page that displays all conversations for the authenticated user.

Users should be able to browse their conversations, view the latest message preview, and navigate to a chat.

No messaging functionality should be implemented in this phase.

---

# Scope

Implement:

* Inbox page
* Conversations list
* Conversation preview cards
* Empty state
* Loading state
* Navigation to chat page

Do not implement:

* Sending messages
* Real-time updates
* Unread indicators
* Search
* Conversation deletion
* Conversation archiving
* Typing indicators

---

# Route

Create:

```text
/messages
```

This page serves as the user's inbox.

---

# User Experience

Users can:

1. View all conversations.
2. See who each conversation is with.
3. See the latest message preview.
4. See when the latest message was sent.
5. Open a conversation.

---

# Data Source

Use:

```ts
getUserConversations()
```

from the Messaging Foundation spec.

Do not create another query.

---

# Conversation Contract

Each conversation should contain:

```ts
type ConversationListItem = {
  id: string;

  updatedAt: Date;

  otherUser: {
    id: string;
    username: string;
    imageUrl: string | null;
  };

  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
}
```

---

# Conversation Card

Each conversation card should display:

* User avatar
* Username
* Latest message
* Relative timestamp

Example:

```
────────────────────────────

👤 satyam

Hey! How's the project going?

2m

────────────────────────────
```

---

# Message Preview

Display:

* Latest message
* Maximum two lines
* Truncate overflowing content

If no messages exist:

```
Start your conversation.
```

---

# Timestamp

Display a relative timestamp.

Examples:

```
Just now

5m

2h

Yesterday

3d
```

---

# Ordering

Order conversations by:

Newest activity first.

Use the conversation's `updatedAt`.

---

# Empty State

When the user has no conversations:

Display:

```
No conversations yet.

Start chatting by visiting another user's profile.
```

Provide a button linking back to the feed.

---

# Loading State

Create a loading skeleton.

Display placeholder conversation cards while loading.

Use shadcn Skeleton components.

---

# Navigation

Clicking a conversation should navigate to:

```text
/messages/[conversationId]
```

The chat page will be implemented in the next spec.

---

# Authorization

Only display conversations belonging to the authenticated user.

Never expose conversations belonging to other users.

---

# Error Handling

Handle:

* database failures
* unauthorized access

Display user-friendly error messages.

Do not expose internal errors.

---

# Accessibility

Requirements:

* Keyboard accessible
* Focus states
* Semantic navigation
* Screen-reader friendly labels

---

# Performance

Requirements:

* Single query
* No N+1 queries
* Efficient ordering
* Reuse existing conversation query

---

# Deliverables

Implement:

* /messages page
* Conversation list
* Conversation cards
* Empty state
* Loading state
* Navigation to chat page

No messaging functionality should be implemented.

---

# Acceptance Criteria

Users can:

1. View all conversations.
2. See the latest message preview.
3. See the other participant's avatar and username.
4. See the latest activity timestamp.
5. Open a conversation.

Conversations are ordered by recent activity.

Users with no conversations see an appropriate empty state.
