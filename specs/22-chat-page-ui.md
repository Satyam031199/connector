# 22 Chat Page & Send Messages

## Goal

Implement the one-to-one chat page where users can view and send messages.

Users should be able to open a conversation, view its message history, and send new messages.

Real-time updates are **not** part of this spec.

---

# Scope

Implement:

* Chat page
* Message history
* Message bubbles
* Message input
* Send message action
* Auto-refresh after sending
* Loading state
* Empty conversation state

Do not implement:

* Real-time messaging
* Read receipts
* Typing indicators
* Attachments
* Emoji picker
* Message reactions
* Message editing
* Message deletion

---

# Route

Create:

```text
/messages/[conversationId]
```

---

# User Experience

Users can:

1. Open a conversation.
2. View previous messages.
3. Send a new message.
4. Immediately see their sent message after submission.

---

# Data Query

Implement:

```ts
getMessages(
  conversationId: string,
  options?: {
    limit?: number;
  }
)
```

Responsibilities:

* Verify the authenticated user is a participant.
* Fetch messages.
* Order messages by oldest first.
* Return the most recent 30 messages by default.

---

# Message Contract

```ts
type Message = {
  id: string;

  conversationId: string;

  senderId: string;

  content: string;

  createdAt: Date;
}
```

---

# Chat Layout

```
┌──────────────────────────────┐
│ ← John                       │
├──────────────────────────────┤
│                              │
│ Hello 👋                     │
│                              │
│               Hi!            │
│                              │
│ How's Connector going?       │
│                              │
├──────────────────────────────┤
│ Type a message...     [Send] │
└──────────────────────────────┘
```

---

# Header

Display:

* Back button
* Avatar
* Username

No online status.

---

# Message Bubbles

Messages sent by the authenticated user:

* Right aligned

Messages from the other participant:

* Left aligned

Display:

* Message content
* Relative timestamp

---

# Empty Conversation

If no messages exist:

Display:

```text
Start your conversation 👋
```

---

# Send Message

Implement:

```ts
sendMessage({
  conversationId,
  content,
})
```

Responsibilities:

* Validate authentication.
* Verify conversation membership.
* Trim whitespace.
* Reject empty messages.
* Reject messages longer than 2000 characters.
* Insert the message.
* Update:

  * conversation.updatedAt
  * conversation.lastMessageId
* Refresh the page.

---

# Validation

Reject:

* Empty messages
* Messages containing only whitespace
* Messages exceeding 2000 characters

Display user-friendly validation errors.

---

# Authorization

Users may only:

* View conversations they participate in.
* Send messages in conversations they participate in.

Never expose messages belonging to another conversation.

---

# Loading State

Display:

* Skeleton header
* Skeleton message bubbles
* Disabled input

---

# Error Handling

Handle:

* Invalid conversation
* Unauthorized access
* Database failures

Display user-friendly messages.

Do not expose internal errors.

---

# Performance

Requirements:

* Single query for messages
* No N+1 queries
* Default limit of 30 messages

Pagination will be added in a future spec.

---

# Accessibility

Requirements:

* Keyboard accessible
* Send on Enter
* Shift + Enter creates a new line
* Proper focus states
* Screen-reader labels

---

# Deliverables

Implement:

* `/messages/[conversationId]`
* `getMessages()`
* `sendMessage()`
* Chat header
* Message list
* Message input
* Send functionality
* Loading and empty states

---

# Acceptance Criteria

Users can:

1. Open a conversation.
2. View previous messages.
3. Send a message.
4. See the new message immediately after sending.
5. Continue chatting after page refresh.

Only participants can access a conversation.

Conversation metadata (`updatedAt` and `lastMessageId`) is updated after each message.
