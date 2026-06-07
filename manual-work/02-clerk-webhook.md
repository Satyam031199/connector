# Manual Work 02 — Clerk Webhook Setup

The app syncs Clerk users into the database through a webhook at:

```
POST /api/webhooks/clerk
```

Clerk's servers must be able to reach this endpoint. In local development your
machine isn't public, so you expose it with a tunnel.

---

## 1. Run the app

```powershell
npm run dev
```

This serves the app at `http://localhost:3000`.

---

## 2. Expose localhost with a tunnel

Use either tool (pick one) and point it at port 3000.

**ngrok**

```powershell
ngrok http 3000
```

**cloudflared**

```powershell
cloudflared tunnel --url http://localhost:3000
```

Copy the public HTTPS URL it prints, e.g. `https://abc123.ngrok-free.app`.

> Keep the tunnel running. A free ngrok URL changes every restart — update the
> Clerk endpoint URL whenever it changes.

---

## 3. Create the webhook in the Clerk Dashboard

1. Go to <https://dashboard.clerk.com> → your app → **Webhooks** → **Add Endpoint**.
2. **Endpoint URL**: `https://<your-tunnel-host>/api/webhooks/clerk`
3. **Subscribe to events** (these are the only ones the handler processes):
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. **Create**.

---

## 4. Set the signing secret

1. On the endpoint page, copy the **Signing Secret** (starts with `whsec_`).
2. Put it in `.env`, replacing the placeholder:

   ```
   CLERK_WEBHOOK_SECRET=whsec_your_real_secret
   ```

3. Restart `npm run dev` so the new value is loaded.

---

## 5. Verify

- In the Clerk Dashboard endpoint page, use **Send test event** → `user.created`.
  - Expect a `200` response in Clerk's delivery log.
  - A row should appear in the `users` table.
- Or sign up a brand-new user in the app and confirm a row is created.

Check the database row count:

```powershell
node -e "process.loadEnvFile('.env'); const p=require('postgres'); const s=p(process.env.DATABASE_URL); s`select clerk_id, username from users`.then(r=>{console.table([...r]); return s.end()})"
```

---