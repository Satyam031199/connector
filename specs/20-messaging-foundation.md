# 20 Messaging Foundation

## Goal

Implement the core messaging domain for Connector.

This spec establishes the database schema, relationships, queries, and server actions required for one-to-one messaging.

No user interface should be implemented in this phase.

---

# Scope

Implement:

* Messaging database schema
* Conversation creation
* Conversation lookup
* Conversation queries
* Message queries
* Server actions
* Validation

Do not implement:

* Inbox UI
* Chat UI
* Sending messages
* Real-time updates
* Read receipts
* Typing indicators
* Attachments
* Group conversations
* Notifications

---

# Messaging Model

Connector currently supports:

* One-to-one conversations only

Each conversation always contains exactly two participants.

Group messaging is out of scope.

---

# Database Schema

Create the following tables.

---

## conversations

Represents a conversation between two users.

Fields:

```ts
{
  id: string;

  createdAt: Date;

  updatedAt: Date;

  lastMessageId: string | null;
}
```

Notes:

* `updatedAt` should be updated whenever a new message is sent.
* `lastMessageId` is reserved for efficient inbox queries.

---

## conversationParticipants

Maps users to conversations.

Fields:

```ts
{
  conversationId: string;

  userId: string;
}
```

Requirements:

* Composite primary key
* Foreign keys with cascade delete
* Exactly two participants per conversation

---

## messages

Represents a single message.

Fields:

```ts
{
  id: string;

  conversationId: string;

  senderId: string;

  content: string;

  createdAt: Date;
}
```

Requirements:

* Foreign keys
* Cascade delete with conversation
* Content required
* Maximum length: 2000 characters

---

# Relationships

Conversation

↓

Many Participants

↓

Exactly Two Users

Conversation

↓

Many Messages

User

↓

Many Messages Sent

---

# Business Rules

## Rule 1

Users cannot start a conversation with themselves.

---

## Rule 2

Only one conversation may exist between the same two users.

If a conversation already exists:

Return the existing conversation.

Do not create another.

---

## Rule 3

Every conversation must have exactly two participants.

---

## Rule 4

Messages belong to exactly one conversation.

---

# Queries

Implement the following queries.

---

## getConversationById

Input:

```ts
conversationId
```

Returns:

* conversation
* participants

No messages.

---

## getConversationBetweenUsers

Input:

```ts
{
  currentUserId;
  otherUserId;
}
```

Returns:

* existing conversation

Returns `null` if one does not exist.

---

## getUserConversations

Input:

```ts
userId
```

Returns:

All conversations for the user.

Ordered by:

Newest activity first.

Messages are not included.

---

# Server Actions

Implement:

---

## createConversation

Input:

```ts
otherUserId
```

Responsibilities:

* Validate users
* Prevent self-conversations
* Return existing conversation if present
* Otherwise create:

  * conversation
  * two participant records

Returns:

```ts
{
  conversationId;
}
```

---

# Validation

Validate:

* authenticated user
* other user exists
* users are different
* duplicate conversation

Return user-friendly errors.

---

# Authorization

Users may only access conversations they participate in.

Never expose another user's conversations.

---

# Performance

Requirements:

* Use indexes on:

  * conversationId
  * userId
  * senderId
  * updatedAt

Avoid N+1 queries.

Design for efficient inbox loading.

---

# Error Handling

Handle:

* invalid conversation id
* invalid user id
* unauthorized access
* duplicate conversation creation
* database failures

Do not expose internal errors.

---

# Future Compatibility

The schema should support future additions without breaking changes:

* Sending messages
* Real-time messaging
* Read receipts
* Unread counts
* Attachments
* Message reactions

---

# Deliverables

Implement:

* conversations table
* conversationParticipants table
* messages table
* createConversation()
* getConversationById()
* getConversationBetweenUsers()
* getUserConversations()

No UI should be created.

---

# Acceptance Criteria

Users can:

1. Create a conversation with another user.
2. Retrieve an existing conversation.
3. Retrieve all their conversations.
4. Never create duplicate conversations.
5. Never create conversations with themselves.

The messaging foundation is ready for the Inbox feature.
