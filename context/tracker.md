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

## MVP status

All planned sections (01–11) complete. The MVP social flow works: auth, create post (S3), feed, likes, comments, profiles.

## Possible follow-ups (not yet specced)

- Comment delete-own (was out of scope in 10).
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
