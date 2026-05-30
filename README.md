# Todo

A personal weekly/daily todo planner built with Next.js, Neon Postgres, and Google sign-in.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Neon Postgres + Prisma ORM
- Auth.js (NextAuth v5) with Google OAuth

## Features

- **Today**, **Tomorrow**, and **This week** lists with drag-and-drop
- Automatic day/week rollovers
- **Future** backlog and **Next week** planning views
- **History** of completed items from previous weeks
- Per-user data stored in Postgres (syncs across devices)

## 1) Create a Neon database

1. Go to [https://neon.tech](https://neon.tech) and create a **new project** for this app.
2. Copy two connection strings from the Neon dashboard:
   - **Pooled connection** → `DATABASE_URL` (keep `pgbouncer=true`)
   - **Direct connection** → `DIRECT_URL`

## 2) Local environment setup

1. Copy the env template:

```bash
cp .env.local.example .env.local
```

2. Fill in `.env.local`:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct connection string |
| `AUTH_URL` | `http://localhost:3000` |
| `AUTH_SECRET` | Random long secret ([generate one](https://generate-secret.vercel.app/32)) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID (step 4) |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret (step 4) |
| `AUTH_ALLOWED_EMAILS` | Comma-separated allowed emails, e.g. `jane.usoskina@gmail.com` |

3. Install dependencies:

```bash
npm install
```

4. Apply the database migration:

```bash
npm run db:migrate
```

When prompted for a migration name you can accept the default, or run deploy if the migration already exists:

```bash
npm run db:migrate:deploy
```

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

## 3) Google OAuth setup (local)

You can reuse the same Google Cloud project as **running** or **recipes**.

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create or edit an **OAuth 2.0 Web application** client.
3. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
4. Copy the **Client ID** and **Client secret** into `.env.local`.

## 4) Vercel deployment

1. Go to [https://vercel.com/new](https://vercel.com/new) and import the GitHub repo `jusoskina/todo`.
2. In **Project Settings → Environment Variables**, add all variables from `.env.local`:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_URL` → your Vercel URL, e.g. `https://todo-xyz.vercel.app`
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `AUTH_ALLOWED_EMAILS`
3. Deploy (default build command `next build` is fine).
4. After the first deploy, run the production migration **once** against your Neon database:

```bash
DATABASE_URL="your-pooled-url" DIRECT_URL="your-direct-url" npm run db:migrate:deploy
```

Run this from your machine with production env vars, or use Neon's SQL editor to confirm tables exist.

## 5) Google OAuth setup (production)

Back in Google Cloud Console, add a second redirect URI to the same OAuth client:

- `https://YOUR-VERCEL-DOMAIN/api/auth/callback/google`

Make sure `AUTH_URL` in Vercel matches that domain exactly (no trailing slash).

## 6) Prisma commands

- Generate client: `npm run db:generate`
- Create/apply local migration: `npm run db:migrate`
- Apply migrations in production: `npm run db:migrate:deploy`

## Notes

- On first sign-in after this update, any todos still in browser `localStorage` are imported automatically, then cleared locally.
- Only emails listed in `AUTH_ALLOWED_EMAILS` can sign in.
- Production data safety: use `db:migrate:deploy` in production, not `db:migrate`.
