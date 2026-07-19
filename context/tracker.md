# Connector — Tracker

## Status

- [x] 01 Project Setup — complete
- [x] 02 Authentication — complete
- [x] 03 Database Schema — complete
- [x] 04 S3 Image Upload — complete
- [x] 05 Create Post UI — complete (UI only, no writes)
- [x] 06 Create Post — complete (real posts created end to end)
- [x] 07 Feed UI — complete (mock data only, no queries)
- [x] 08 Feed — complete (real posts from DB)
- [x] 09 Likes — complete (toggle like/unlike, isLiked in feed)
- [x] 10 Comments — complete (view + create; oldest-first)
- [x] 11 Profile — complete (view, edit name/bio, posts grid)

- [x] 12 Navigation Polish — complete
- [x] 13 Delete Post — complete

- [x] 14 Delete Comment — complete

- [x] 15 Feed Pagination — complete (cursor-based, Load More button)
- [x] 16 Post Details Page — complete (/post/[postId], likes + comments integrated)

- [x] 20 Messaging Foundation — complete (schema + queries + createConversation only, no UI)
- [x] 21 Conversations List — complete (/messages inbox page, no sending)
- [x] 22 Chat Page & Send Messages — complete (/messages/[conversationId], view + send, no real-time)
- [x] 23 Message Pagination — complete (cursor-based "Load older messages", scroll position preserved)
- [x] 24 Profile Message Button — complete (Message button on other users' profiles, wires up createConversation)

## MVP status

All planned sections (01–16) complete. The MVP social flow works: auth, create post (S3), feed with cursor-based pagination, likes, comments, profiles, navigation polish, delete post, delete comment, post details page.

## Section 20 decisions

- Schema: `conversations` (id, createdAt, updatedAt, `lastMessageId` nullable uuid with **no FK** — kept as a plain column to avoid a circular reference with `messages`; will be wired up when sending messages is implemented), `conversationParticipants` (composite PK `(conversationId, userId)`, both FKs cascade), `messages` (id, conversationId, senderId, content varchar(2000), createdAt — both FKs cascade). Files: `app/db/schema/conversations.ts`, `conversation-participants.ts`, `messages.ts`; relations added centrally in `app/db/schema/index.ts`.
- Migration `drizzle/0003_fancy_sauron.sql` generated and applied. Verified live (transactional, rolled back): composite-PK duplicate participant blocked (23505), 2000-char message OK / 2001-char blocked, cascade delete of a conversation removes its participant rows.
- `app/db/queries/conversations.ts`: `getConversationById` (conversation + participants, single join query, null if missing), `getConversationBetweenUsers({ currentUserId, otherUserId })` (self-joins `conversationParticipants` twice via `alias`, since every conversation has exactly 2 participants this uniquely identifies the pair — returns `Conversation | null`), `getUserConversations(userId)` (returns `ConversationListItem[]`, shaped directly for inbox use — joins through the user's own membership row to scope to their conversations, joins the *other* participant directly via `ne(other.userId, userId)` instead of returning all participants, and left-joins the latest message per conversation via a `db.selectDistinctOn([messages.conversationId], ...)` subquery ordered by `conversationId, desc(createdAt)`; newest-`updatedAt`-first, one row per conversation, no JS-side grouping needed). `getUserById` added to `app/db/queries/users.ts` (needed to validate the other user exists).
- `app/actions/conversations.ts` `createConversation(otherUserId)`: validates uuid, auth via `getCurrentUser`, rejects self-conversation, validates other user exists, checks `getConversationBetweenUsers` and returns the existing conversation if found (Rule 2 — no duplicates), otherwise `createConversationRecord` (transactional insert of the conversation + both participant rows). No app-level locking against a concurrent duplicate-create race — matches the spec's application-level "check then create" description; not spec'd as needing DB-level dedup.
- `types/conversation.ts`: `ConversationParticipant` + `ConversationWithParticipants` (used by `getConversationById`), and `ConversationListItem` (`{ id, updatedAt, otherUser, lastMessage }`, used by `getUserConversations` for the future inbox).
- Verified live (transactional, rolled back) with explicit message timestamps: `getUserConversations` resolves the correct *other* user per conversation, picks the most-recent message as `lastMessage` (not just the first), and returns `lastMessage: null` for a conversation with no messages yet. Note: Postgres freezes `now()` per transaction, so a naive test using `defaultNow()` for both messages produces a tie — explicit timestamps are required to test "latest wins" ordering.
- No UI, no send-message action/query, no chat UI — all explicitly out of scope for this section per spec.

## Section 21 decisions

- `/messages` route added at `app/(app)/messages/page.tsx` (inside the existing protected group). Mirrors the Feed page's exact architecture: `force-dynamic`, auth check with `redirect("/sign-in")` if no user, inner async component wrapped in `<Suspense>` fetches data and catches DB errors into a generic "couldn't load" fallback (never exposes internals).
- Reused `getUserConversations(userId)` from Section 20 unchanged — no new query created, per spec.
- New components in `components/messages/`: `conversation-card.tsx` (avatar + username + 2-line-clamped preview + relative timestamp, whole card is a `Link` to `/messages/[conversationId]`), `conversations-empty-state.tsx` ("No conversations yet." + button back to `/`), `conversation-skeleton.tsx` (shadcn `Skeleton` placeholders), `conversation-list.tsx` (renders the empty state or a `<nav aria-label="Conversations"><ul>...` list of cards — `<nav>` used since the list is navigational, per the accessibility "semantic navigation" requirement).
- New `formatMessageTimestamp` added to `lib/format.ts` alongside (not replacing) the existing `formatRelativeTime` — spec's timestamp examples ("Just now", "Yesterday") differ from the existing post/comment format, so a separate function avoids changing behavior other features already depend on.
- Card timestamp shows `lastMessage.createdAt` when a message exists, otherwise falls back to the conversation's `updatedAt` (freshly-created, empty conversation) — the contract only exposes those two dates.
- Added a "Messages" nav entry (`MessageCircleIcon`) to both `components/navbar.tsx` and `components/mobile-nav.tsx` so the route is reachable, matching how Section 11 wired up the Profile link in the same section that introduced its route.
- No sending, no unread indicators, no polling/real-time — everything in "Do not implement" was left out.

## Known Issues (Section 21)

- In real usage `lastMessage` will always be `null` for now since no section has implemented sending yet — the empty-state "Start your conversation." preview text is the only thing users will see until a future section adds it.
- Verified via `npm run build` (route `/messages` compiles, force-dynamic) and a live dev-server check that unauthenticated requests to `/messages` correctly redirect to `/sign-in` (proxy protection). Did not visually verify the rendered card/empty/skeleton UI in a browser (no signed-in session available in this environment) — worth a manual pass once real Clerk credentials are available.

## Section 22 decisions

- `app/db/queries/conversations.ts` gained `isConversationParticipant(conversationId, userId)` — a plain membership-check query, shared by `getMessages` and `sendMessage` for authorization.
- New `app/db/queries/messages.ts`: `getMessages(conversationId, { limit })` internally calls `getCurrentUser()` and `isConversationParticipant` itself (matches the pattern `getFeedPosts` already uses — resolving the current user inside the query rather than requiring the caller to pass one) and returns `null` uniformly for "no session", "conversation doesn't exist", and "not a participant" — never lets a caller distinguish those, so a conversation's existence is never revealed to a non-participant. Fetches `limit` (default 30) most-recent rows ordered `desc(createdAt)` then reverses in JS to return oldest-first — single query, no join needed since bubbles don't need sender profile data (the chat already knows both participants). `insertMessage` wraps the insert + the conversation's `updatedAt`/`lastMessageId` update in one transaction (`updatedAt` set to the inserted message's own `createdAt`, not a fresh `new Date()`, so the two stay consistent).
- Reused the schema-inferred `Message` type (`app/db/schema` → `messages.ts`) everywhere instead of adding a duplicate `types/message.ts` — the spec's Message Contract is an exact match for the raw table shape, so a second type would just be redundant.
- `app/actions/messages.ts` `sendMessage({ conversationId, content })`: validates the conversationId (uuid) and content (new `validations/message.ts`, mirrors `validations/comment.ts` — trim, 1..2000, `MAX_MESSAGE_LENGTH`), authenticates, re-checks membership via `isConversationParticipant`, inserts via `insertMessage`, then `revalidatePath` on both the chat page and `/messages` (so the inbox preview picks up the new `lastMessage`/ordering). Returns `{ ok, message }` so the client can append it immediately.
- Route `app/(app)/messages/[conversationId]/page.tsx`: validates the `conversationId` param as a uuid (`notFound()` if not), auth redirect to `/sign-in`, then a **single** async component wrapped in one `<Suspense>` does the conversation fetch + participant check + message fetch + renders `ChatHeader` and `ChatPanel` together — deliberately not split into a fast header + separate Suspense for messages, so the `ChatSkeleton` fallback genuinely represents the spec's "skeleton header + skeleton bubbles + disabled input" loading state as one unit.
- Authorization order matters: the page checks `participants.some(p => p.id === currentUserId)` **before** deriving `otherUser` via `.find(p => p.id !== currentUserId)` — reversing that order would let a non-participant's request resolve "otherUser" to an arbitrary participant of a conversation they don't belong to.
- `components/messages/`: `chat-header.tsx` (back link to `/messages` + avatar + username, no online status per spec), `message-bubble.tsx` (right-aligned `bg-primary` for the current user's own messages, left-aligned `bg-muted` otherwise, content + relative timestamp), `chat-empty-state.tsx` ("Start your conversation 👋"), `chat-skeleton.tsx`, `chat-panel.tsx` (client — holds message state, Textarea + Send button, Enter submits via `formRef.current.requestSubmit()`, Shift+Enter inserts a newline via the browser's default textarea behavior, `useTransition` while sending, `sonner` toast on error, appends the returned message locally on success for "immediately see their sent message").
- Reused `formatMessageTimestamp` (added in Section 21) for bubble timestamps too, rather than the post/comment `formatRelativeTime` — keeps one relative-time vocabulary across the whole messaging feature.
- Message list area uses a `max-h-[60vh]` scroll region (not a viewport-height flex chain) since the rest of the app doesn't establish a fixed-height layout — this stays self-contained without changing global layout assumptions.
- Added `app/(app)/messages/[conversationId]/not-found.tsx` ("Conversation not found" + button back to `/messages`), matching the precedent set by Section 16's `/post/[postId]/not-found.tsx`.
- No profile-page "Message" button was added — there is still no UI entry point for *starting* a new conversation (Section 20's `createConversation` action remains unused by any component). Section 21's empty-state copy ("Start chatting by visiting another user's profile") implies that's coming in a future section; adding it now would be out of scope for Section 22, which only covers the chat page for an existing `conversationId`.

## Known Issues (Section 22)

- ~~No entry point yet to start a new conversation from the UI~~ — resolved in Section 24 (Message button on profile pages).
- Verified via `npm run build` (both `/messages` and `/messages/[conversationId]` compile as dynamic routes) and a transactional (rolled back) DB check: participant vs. non-participant membership check, 35 inserted messages correctly capped to the most recent 30 in oldest-first order, and `insertMessage`'s transaction correctly updates `conversations.updatedAt`/`lastMessageId` to match the new message. Did not visually verify the rendered chat UI (bubbles, Enter/Shift+Enter behavior, send flow) in a browser — no signed-in Clerk session available in this environment; worth a manual pass once real credentials are available, same caveat as Section 21.

## Section 23 decisions

- `getMessages` in `app/db/queries/messages.ts` changed signature from `(conversationId, options?)` to the spec's single-object form `{ conversationId, cursor?, limit? }`, and now returns `MessagePage | null` (`{ messages, nextCursor, hasMore } | null`) instead of `Message[] | null`. The `null` case (no session / conversation missing / not a participant) is unchanged from Section 22. All existing call sites (the chat page) updated accordingly — this is the only breaking change to an existing function in this section, and it was required by the spec ("Update `getMessages()` to support pagination").
- Cursor design copies `getFeedPosts`' proven approach exactly: base64url-encoded `createdAt|id`, decoded server-side, and **any malformed/invalid cursor silently degrades to "no cursor"** (i.e. the initial/most-recent page) rather than erroring — same "safe degradation" behavior already established for feed pagination, satisfying the spec's "Handle: Invalid cursor" requirement without a separate error path.
- Query fetches `limit + 1` rows ordered `desc(createdAt), desc(id)` to detect `hasMore` cheaply (single query, no count query), takes the oldest row of that page as the next cursor, then reverses the page to ascending order before returning — mirrors `getFeedPosts` line for line, just inverted for "load older" instead of "load more below."
- New `MESSAGE_PAGE_SIZE = 30` exported from `app/db/queries/messages.ts` (the shared constant the spec asked for) and reused by the page's initial load — no more hardcoded `30`.
- New `app/actions/load-messages.ts` `loadOlderMessages({ conversationId, cursor })` — thin wrapper around `getMessages`, structurally identical to `loadFeedPage`, but also turns a `null` (unauthorized/missing) result into a friendly `{ ok: false }` since `getMessages` can return `null` (unlike `getFeedPosts`, which always succeeds).
- `ChatPanel` (`components/messages/chat-panel.tsx`) now owns `nextCursor`/`hasMore` state alongside `messages`. "Load older messages" (`components/messages/load-older-button.tsx`) renders above the bubbles only when `hasMore` — and only when `messages.length > 0`, so it never appears in the empty-conversation state, per spec. `components/messages/message-skeleton-row.tsx` (a couple of bubble-shaped `Skeleton`s) renders below the button while `isLoadingOlder`, satisfying "the existing conversation should remain visible" (nothing is unmounted/replaced during the load).
- **Scroll position preservation**: standard scroll-anchoring technique — before firing the "load older" request, the scroll container's current `scrollHeight`/`scrollTop` are captured into a ref; a `useLayoutEffect` keyed on `messages` then sets `scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight)` right after the prepended messages are in the DOM but before paint, so whatever was on screen stays on screen instead of visually jumping.
- Did not add "scroll to bottom on initial open" — that's a pre-existing Section-22 gap (not something Section 23 asked for), left untouched per "keep changes scoped to the active section." See Known Issues below.

## Known Issues (Section 23)

- The chat page does not auto-scroll to the bottom when a conversation is first opened (carried over from Section 22, out of this section's scope) — for a conversation whose initial 30 messages overflow the `max-h-[60vh]` viewport, the user currently has to scroll down manually to see the latest message on open. Worth a follow-up if it turns out to matter.
- Verified via `npm run build` and a transactional (rolled back) DB check with 75 seeded messages (1 second apart, alternating sender): initial page returns the newest 30 (msg 45–74) with `hasMore: true`; the next cursor correctly loads the next older 30 (msg 15–44) with no overlap; a third page returns the final 15 (msg 0–14) with `hasMore: false` and `nextCursor: null`, correctly signaling the beginning of the conversation; concatenating all three pages in load order reproduces the exact original msg 0…msg 74 sequence; and a garbage cursor string safely degrades to the initial page instead of erroring. Did not visually verify the "Load older messages" button, its loading skeleton, or the scroll-anchoring behavior in a browser — same no-signed-in-session caveat as Sections 21–22.

## Section 24 decisions

- This closes the gap flagged in Section 20/21/22/23's "Known Issues": there was no UI entry point to *start* a conversation. `createConversation` (Section 20) is now finally wired up.
- New `components/profile/message-button.tsx` (client): on click, calls `createConversation(otherUserId)` and on success `router.push('/messages/' + conversationId)` — matches the spec's explicit "small refinement" that the client must never check for an existing conversation itself (that stays entirely server-side in `createConversation`, avoiding a race if both users click "Message" on each other at the same time). `useTransition` drives the disabled/spinner "Creating..." state; a `try/catch` around the action call handles a network/RPC failure distinctly from a normal `{ ok: false }` result (this section's spec explicitly calls out "Network failures," unlike earlier sections' actions).
- Wired into `components/profile/profile-header.tsx`: the existing `isOwnProfile ? <EditProfileDialog /> : null` ternary's `null` branch became `<MessageButton otherUserId={profile.id} username={profile.username} />`. Since `ProfileHeader` is shared by both `/profile` (always `isOwnProfile`) and `/username/[username]` (computed by comparing the resolved current user), both routes automatically get the correct conditional button with no route-specific code — Edit Profile on your own profile, Message on anyone else's.
- No changes to `createConversation`, `getConversationBetweenUsers`, or any query/schema — purely a UI wiring change, per spec ("Do not implement new conversation creation logic").

## Known Issues (Section 20)

- No message-sending or message-fetching query/action yet — intentionally deferred to a future section per spec scope.
- `createConversation`'s existing-conversation check is not race-proof under concurrent simultaneous calls between the same two users (no unique constraint enforces "one conversation per pair" at the DB level); acceptable for now per spec, revisit if this becomes a real issue.

## Section 16 decisions

- Route `/post/[postId]` inside `(app)` group — protected by proxy, `force-dynamic` for per-user `isLiked`/`currentUserId`.
- `getPostById(postId)` in `app/db/queries/get-post-by-id.ts`: same subquery aggregation pattern as `getFeedPosts` for counts + isLiked, then `getPostComments` in a second query. Returns `PostDetail | null`.
- `generateMetadata` awaits params (Next 16 pattern) and fetches the post title; falls back gracefully on DB error.
- `PostComments` gained an optional `initialComments?: Comment[]` prop — when provided, skips the lazy client-side fetch. Feed usage unchanged (no prop → lazy fetch). Details page passes pre-fetched comments.
- `LikeButton` extracted from `PostActions` into `components/feed/like-button.tsx`; manages its own `useTransition`. `PostActions` simplified (removed its own transition/like handler). Post details page uses `LikeButton` directly without needing `PostActions`.
- `not-found.tsx` at `app/(app)/post/[postId]/not-found.tsx` provides a friendly "Post not found" + "Back to feed" link. `notFound()` called for both missing post and invalid UUID.
- Feed image (`PostCard`) wrapped in `<Link href="/post/[id]">` — clicking the image navigates to the detail page.
- Profile grid (`ProfilePostsGrid`) each `<img>` wrapped in `<Link href="/post/[id]">`.

## Section 15 decisions

- `getFeedPosts` updated to accept `{ cursor?, limit? }` and return `{ posts, nextCursor, hasMore }`. Exported `FeedPage` type and `FEED_PAGE_SIZE = 10` constant.
- Cursor encodes `createdAt.toISOString()|id` as base64url for opacity. Decoded on the server; invalid cursors are treated as no-cursor (safe degradation).
- Query orders by `desc(createdAt), desc(id)` and fetches `limit + 1` rows to detect `hasMore`. Cursor condition: `createdAt < cursorDate OR (createdAt = cursorDate AND id < cursorId)`.
- `app/actions/load-feed.ts` `loadFeedPage({ cursor })`: thin server action wrapper; returns `{ ok: true, ...FeedPage }` or `{ ok: false, error }`.
- `FeedList` converted to `"use client"`. Accepts `initialPosts`, `initialNextCursor`, `initialHasMore`. `useTransition` drives the Load More call; accumulated posts append to local state. Skeletons render below existing posts while loading. Load More button hidden when `!hasMore`.
- Feed page (`app/(app)/page.tsx`) passes pagination data down — structure unchanged (server component + Suspense).

## Section 14 decisions

- `FeedPost` contract extended with `currentUserId: string | null`; computed in `getFeedPosts` from the already-resolved `currentUser` (no extra query).
- `deleteComment` DB query uses a userId-scoped `AND` in the WHERE clause — ownership is verified atomically in a single DELETE, no extra SELECT needed.
- `deleteComment` server action validates commentId as UUID, authenticates via `getCurrentUser`, calls the scoped query, revalidates `/`.
- Three-dot menu (`MoreHorizontalIcon`) on each comment; only rendered when `comment.author.id === currentUserId`. Uses existing shadcn `DropdownMenu` + `AlertDialog` (installed in Section 13).
- On successful delete, comment removed from local `comments` state immediately; feed count updates via `revalidatePath("/")`.
- `confirmDeleteId` state (string | null) drives the AlertDialog — avoids one dialog per comment; a single dialog handles whichever comment was selected.

## Section 13 decisions

- `FeedPost` contract extended with `isOwnPost: boolean`; computed in `getFeedPosts` by comparing `posts.userId` with the current DB user id (reuses the `currentUserId` already resolved for `isLiked`; no extra query).
- Post deletion uses a two-step ownership pattern: fetch the post row to confirm ownership and obtain the `imageUrl`, then delete with `AND userId` guard for safety.
- S3 cleanup runs after the DB delete. Failures are logged but swallowed — the post is already gone from the DB and S3 orphans are preferable to leaving a DB row that references a deleted object.
- Three-dot menu (`PostDeleteButton`) uses shadcn `DropdownMenu` + `AlertDialog`; only rendered for `isOwnPost` posts inside `PostHeader`.
- shadcn `dropdown-menu` and `alert-dialog` added.

## Section 12 decisions

- Navbar converted to `"use client"` to use `usePathname` for active state detection; no server-side data needed so there is no cost.
- Desktop nav: Feed/Create/Profile buttons with `variant="secondary"` for the active route and `variant="ghost"` otherwise; top nav links hidden on mobile (`hidden sm:flex`).
- Mobile nav: new `components/mobile-nav.tsx`, fixed bottom bar (`sm:hidden`), same three routes, active indicated via `strokeWidth` and `font-semibold`.
- App layout adds `pb-16 sm:pb-0` to `<main>` so content is not obscured by the mobile bottom nav.
- Page titles: Feed → "Connector", Create → "Create Post | Connector", Profile → "Profile | Connector".
- Feed empty state heading updated to "Create your first post" per spec; button label capitalised to "Create Post".
- Profile empty state button capitalised to "Create Post" (own-profile only, already guarded by `isOwnProfile`).

## Possible follow-ups (not yet specced)

- Profile route is literally `/username/[username]` per spec 11.
- Consider next/image + remotePatterns for S3/CDN images (currently plain <img>).

## Important Decisions

- Next.js 16 renamed Middleware -> Proxy. Auth lives in `proxy.ts` (root). Public routes: `/`, `/sign-in`, `/sign-up`, `/api/webhooks/*`; everything else protected.
- `SignedIn`/`SignedOut` are not exported in Clerk 7.4.3 for App Router; use `<Show when="signed-in" | "signed-out">` instead.
- Sign-in/up use Clerk catch-all routes: `app/sign-in/[[...sign-in]]` and `app/sign-up/[[...sign-up]]`. `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `SIGN_UP_URL` point Clerk at these local pages.
- Users table: `uuid` PK (gen_random_uuid), unique `clerk_id` + `username`, `timestamptz` (UTC) created/updated. id != clerkId.
- Webhook (`app/api/webhooks/clerk`) verifies via `verifyWebhook` with `signingSecret: env.CLERK_WEBHOOK_SECRET` (Clerk's default env name differs, so it's passed explicitly). Handles user.created/updated/deleted. 400 on verify failure, 500 on handler error.
- User sync queries in `app/db/queries/users.ts`; auth helpers `getCurrentUser` / `requireUser` in `app/lib/auth.ts` (server-only, request-cached). db client now registers the schema.
- First migration generated and applied: `drizzle/0000_material_nitro.sql`. `users` table verified live in Postgres (7 columns, unique clerk_id/username indexes).
- `DATABASE_URL` must NOT include a `?schema=public` param — that is Prisma syntax and breaks postgres.js (error 42704). Default schema is already `public`.
- `drizzle.config.ts` loads `.env` via `process.loadEnvFile` (drizzle-kit does not load it automatically).
- Section 03 schema: `posts`, `likes`, `comments` added (uuid PKs, timestamptz). FKs all `ON DELETE CASCADE`. `caption` varchar(2000) optional; comment `content` varchar(500) required. `likes` has unique `(user_id, post_id)`. Indexes: posts(user_id, created_at), likes(user_id, post_id, +unique pair), comments(post_id, user_id).
- Drizzle `relations()` for all tables live centrally in `app/db/schema/index.ts` (after all table imports) to avoid circular imports; per-table files hold only table definitions. Relations are ORM metadata only — FKs enforce at the DB level.
- Migration `drizzle/0001_windy_gideon.sql` generated and applied. Verified live: 4 tables, all FKs CASCADE, duplicate-like prevented (23505), post- and user-deletion cascades all work.
- Section 04 S3 upload: `@aws-sdk/client-s3` installed. Env adds AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_S3_BUCKET_NAME to `app/lib/env.ts`.
- `lib/s3.ts` (per spec location, server-only): `generateObjectKey` -> `uploads/<clerkUserId>/post_<uuid>.<ext>`, `uploadImage` (PutObject), `getPublicUrl` (virtual-hosted style). No business logic.
- `lib/image.ts`: server-side type detection via MAGIC BYTES (jpeg/png/webp) — client Content-Type is not trusted — plus `MAX_UPLOAD_BYTES` (10 MB).
- `app/api/uploads/route.ts` (POST, multipart `file`): auth 401, missing file 400, oversize 413, bad type 415, S3 failure 500 (generic message), success 201 `{ imageUrl }`. Route is protected by proxy and re-checks auth. No post records created (upload only).
- Section 05 Create Post UI (UI ONLY — no writes/uploads/actions): authenticated route group `app/(app)/` with shared `components/navbar.tsx` (logo -> /, Create -> /create, Clerk `UserButton`). `/create` page lives in the group, protected by proxy.
- Create-post components in `components/create-post/`: `image-picker.tsx` (hidden file input + dropzone empty state, accepts jpeg/png/webp, single), `image-preview.tsx` (local object-URL preview, plain <img> since next/image can't optimize blob URLs), `create-post-form.tsx` (local state only; caption Textarea with `len/2000` counter; submit is disabled until an image is picked, then shows a sonner toast — no upload/insert).
- Object URL lifecycle: created in the change handler, revoked on replace/clear and on unmount via a ref (avoids `react-hooks/set-state-in-effect`).
- shadcn components added: `card`, `textarea`, `sonner`, `label` (installed `sonner` + `next-themes`). `<Toaster />` mounted in root layout. This lucide build uses `XxxIcon` suffix exports.
- Section 06 Create Post: `app/actions/create-post.ts` (`"use server"`) authenticates via Clerk, resolves DB user with `getCurrentUser()` (never trusts client user IDs), validates caption (`validations/post.ts` Zod, trimmed, max 2000, empty -> null), validates image server-side (presence + 10 MB + magic bytes via `lib/image.ts`), uploads through shared `lib/s3.ts` (`uploadImage`, keyed by Clerk id), inserts via `app/db/queries/posts.ts` `createPost`. Returns `{ ok:true } | { ok:false, error }`.
- Action does NOT redirect; it `revalidatePath('/')` and returns. The client (`create-post-form.tsx`) does success toast -> clear state -> `router.push('/')`. Submit uses `useTransition` (loading spinner, disabled while pending). Image uploaded once, single insert.
- Server action reuses the shared S3 utility directly (not the /api/uploads HTTP endpoint) — no duplicated S3 logic. `MAX_CAPTION_LENGTH` shared from `validations/post.ts` (used by form + action).
- Section 07 Feed UI (MOCK data only — no queries/actions): feed moved to `/` inside the `(app)` group (`app/(app)/page.tsx`); old public `app/page.tsx` deleted; `/` REMOVED from proxy public routes so the feed requires auth (signed-out -> /sign-in). The only sign-in/up entry is now via /sign-in.
- Feed components in `components/feed/`: `feed-list` (renders cards or empty state), `post-card` (Card with `gap-0 py-0` override for a full-bleed image), `post-header` (shadcn Avatar + `username • 2h`), `post-actions` (inert Like/Comment icon buttons w/ aria-labels), `feed-empty-state` ("No posts yet" + link to /create), `post-skeleton` (avatar/image/text skeletons). Mock data + `FeedPost` type in `components/feed/mock-posts.ts`.
- `lib/format.ts` `formatRelativeTime` for compact timestamps. Feed components are server components (buttons inert), so no hydration recompute.
- Placeholder images use plain `<img>` (picsum/pravatar) so no `next.config` remotePatterns needed; shadcn Avatar image is also a plain radix img. shadcn `avatar` + `skeleton` added.
- NOTE for next section: deleting a route file leaves a stale `.next/types/validator.ts` reference -> `tsc` fails until `.next` is cleared. Run `rm -rf .next` before typecheck after removing pages.
- Section 08 Feed (real data): `types/feed.ts` holds the `FeedPost` contract (the feed source of truth: id, imageUrl, caption, createdAt, nested `author{id,username,imageUrl}`, likesCount, commentsCount). Mock data deleted; `FeedList`/`PostCard` now consume the contract (PostCard reads `post.author.*`).
- `app/db/queries/get-feed-posts.ts` `getFeedPosts()`: inner join posts->users, plus TWO pre-aggregated count subqueries (`like_counts`, `comment_counts`) left-joined on post_id. This avoids N+1 AND the likes×comments cartesian inflation that direct joins+count would cause. Newest first (`desc(posts.createdAt)`). counts coalesced to 0.
- Drizzle gotcha: each subquery aggregate needs a DISTINCT `.as("...")` alias (`likes_count` vs `comments_count`); same alias -> Postgres 42702 "ambiguous", and no alias -> Drizzle "raw SQL field needs alias".
- Feed page `app/(app)/page.tsx`: async server component, `export const dynamic = "force-dynamic"` (always fresh, no build-time DB query). Data fetch wrapped in `<Suspense fallback={<PostSkeleton x3>}>`; DB errors caught (logged, generic fallback UI, never exposed). JSX kept OUT of try/catch (lint rule `react-hooks/error-boundaries`).
- Verified live (transactional, rolled back): newest-first ordering correct; counts correct and NOT inflated (2 likes/1 comment stayed 2/1; 0-likes post still shown via left join).
- Section 09 Likes: `FeedPost` contract extended with `isLiked: boolean`. `getFeedPosts` now resolves the current user (`getCurrentUser`) and computes `isLiked` via an aliased left join (`alias(likes,"user_like")`) on (postId AND userId=current); ≤1 row per post via the unique constraint, so no inflation. Null current user uses a sentinel non-existent UUID so the join matches nothing.
- `app/actions/toggle-like.ts` (`"use server"`): validates postId with `z.uuid()`, resolves DB user (`getCurrentUser`, never trusts client IDs), checks `postExists`, calls `toggleLike(userId, postId)`, `revalidatePath("/")`. Returns `{ ok:true, isLiked } | { ok:false, error }`.
- `app/db/queries/likes.ts` `toggleLike`: delete-or-insert (delete returning; if nothing deleted, insert `onConflictDoNothing`) — single decisive toggle, duplicate-proof via unique (user_id, post_id). `postExists` added to posts queries.
- `PostActions` is now a CLIENT component (`postId`, `isLiked` props), calls the action via `useTransition` (disabled while pending), error toast on failure. No optimistic updates — feed revalidates server-side so count + heart refresh. Liked heart uses `fill-destructive text-destructive` (theme token); unliked is outline.
- Verified live (transactional, rolled back): toggle false->true->false with correct counts; raw duplicate insert blocked (23505).
- Section 10 Comments: feed contract UNCHANGED (commentsCount already shown). `types/comment.ts` Comment contract; `validations/comment.ts` (`commentContentSchema`: trim, 1..500, reject empty; `MAX_COMMENT_LENGTH`).
- `app/db/queries/comments.ts`: `getPostComments(postId)` (inner join users, oldest first asc(createdAt), no N+1) + `insertComment`. `app/actions/comments.ts` (`"use server"`): `getCommentsForPost` (read, used on open) and `createComment(postId, content)` (auth via getCurrentUser, validate content + postExists, insert, `revalidatePath('/')`, returns the created comment). Both return `{ ok, ... } | { ok:false, error }`.
- UI: inline expandable section (simplest option). `PostActions` is now the interactive footer — renders like/comment buttons, the server-rendered metadata passed as `children`, and `<PostComments>` when the comment toggle is open. `components/feed/post-comments.tsx` (client) lazy-loads comments on open (mounted only when open), shows loading/empty ("No comments yet. Be the first to comment.")/list (oldest first, Avatar + username + content + relative time) + shadcn Textarea form w/ loading. On create success appends the returned comment; commentsCount updates via feed revalidation.
- Lint gotcha: do not call setState synchronously in a useEffect body (`react-hooks/set-state-in-effect`); use initial state + set only inside async callbacks.
- Verified live (transactional, rolled back): comments returned oldest-first with author join; commentsCount aggregate correct.
- Section 11 Profile: ADDED `bio text` (nullable) to users (migration `drizzle/0002_giant_carnage.sql`, applied) — needed because the profile contract/edit require bio (Section 02 users had no bio). Webhook still only syncs username/name/imageUrl; bio is app-edited.
- `types/profile.ts` (Profile + ProfilePost contracts); `validations/profile.ts` (`profileSchema`: name <=50, bio <=160, both optional/trimmed; empty -> null). `app/db/queries/get-profile.ts` `getProfileByUsername` (user row, then posts newest-first; postCount = posts.length; null if user missing). `app/db/queries/users.ts` `updateUserProfile(userId, {name,bio})` (scoped by id).
- `app/actions/update-profile.ts` `updateProfile(formData)`: auth via getCurrentUser, validates, updates ONLY the resolved user's row (can't edit others; username/clerkId/createdAt not editable), revalidates `/profile` + `/username/<username>`.
- Routes (in `(app)` group, force-dynamic): `/profile` (own; getCurrentUser -> redirect /sign-in if missing) and `/username/[username]` (public; `notFound()` if missing; `params` is a Promise in Next 16 -> await). Shared `components/profile/profile-view.tsx` = header + grid. Header (avatar/username/name/bio/postCount + EditProfileDialog when own). Grid: responsive 2/3-col image tiles, newest-first, empty state w/ create button (own only). `EditProfileDialog` (client): shadcn Dialog + Input + Textarea, useTransition, success toast. shadcn `input` + `dialog` added.
- Navbar now has a Profile link (-> /profile).
- Verified live (transactional, rolled back): profile shape (postCount 2, posts newest-first) and name/bio update correct.

## Known Issues

- Live auth flow (signup -> webhook -> DB record, sign-in/out, protected redirects) requires real Clerk keys + a publicly reachable webhook URL (e.g. ngrok/Clerk dashboard); not yet exercised end to end.
- Username fallback (email local part / `user_<id>`) can collide since username is unique; revisit if Clerk usernames are not enforced.
