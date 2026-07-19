# 23 Message Pagination

## Goal

Implement cursor-based pagination for chat messages.

Users should initially load the most recent messages and be able to load older messages without fetching the entire conversation.

The user's scroll position should remain stable while older messages are loaded.

---

# Scope

Implement:

* Cursor-based pagination
* Load older messages
* Pagination query
* Loading states
* Scroll position preservation

Do not implement:

* Infinite scrolling
* Real-time updates
* Message search
* Jump to message
* Virtualized lists

---

# Pagination Strategy

Use:

Cursor-based pagination.

Do not use:

* Page numbers
* Offset pagination

---

# Initial Load

When opening a conversation:

Load the most recent:

```text
30 messages
```

Use a shared constant.

Example:

```ts
const MESSAGE_PAGE_SIZE = 30;
```

---

# Message Query

Update:

```ts
getMessages()
```

to support pagination.

Input:

```ts
{
  conversationId: string;

  cursor?: string;

  limit?: number;
}
```

---

# Response Contract

Return:

```ts
{
  messages: Message[];

  nextCursor: string | null;

  hasMore: boolean;
}
```

---

# Cursor

The cursor should represent the oldest loaded message.

Recommended:

* `createdAt`
* `id`

This guarantees stable ordering even when timestamps are identical.

---

# Ordering

Messages should always display:

Oldest → Newest

The newest message should remain at the bottom of the conversation.

---

# Load Older Messages

Display a button above the oldest loaded message.

Example:

```text
──────────────

Load older messages

──────────────

Hello!

Hi 👋

How are you?
```

Requirements:

* Only visible when additional messages exist.
* Hidden once the beginning of the conversation is reached.
* Disabled while loading.

---

# Scroll Position

When older messages are loaded:

* Preserve the current scroll position.
* Do not jump to the top.
* Previously visible messages should remain in view.

Users should not lose their reading position.

---

# Empty Conversation

Reuse the existing empty conversation state.

Do not display pagination controls.

---

# Loading State

While loading older messages:

Display:

* Loading indicator
* Skeleton message placeholders

The existing conversation should remain visible.

---

# Performance

Requirements:

* Never load the complete conversation.
* Single database query.
* No N+1 queries.
* Efficient cursor lookup.

---

# Authorization

Users may only paginate conversations they participate in.

Unauthorized users must never receive message data.

---

# Error Handling

Handle:

* Invalid cursor
* Invalid conversation
* Unauthorized access
* Database failures

Display user-friendly errors.

Do not expose internal errors.

---

# Future Compatibility

The pagination implementation should support future features without breaking changes:

* Infinite scrolling
* Real-time messaging
* Jump to message
* Search results
* Virtualized message lists

---

# Deliverables

Implement:

* Cursor-based message pagination
* Updated `getMessages()`
* Load older messages
* Loading state
* Scroll position preservation

---

# Acceptance Criteria

Users can:

1. Open a conversation.
2. View the latest 30 messages.
3. Load older messages.
4. Continue loading until the beginning of the conversation.
5. Maintain their scroll position while older messages are added.

The conversation remains performant regardless of message history size.
