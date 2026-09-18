# Spartan Hub — Codebase Guide

This document explains how Spartan Hub is built, why it's built that way, and how to make changes to it safely. It's written for someone who is new to this specific codebase — you don't need prior Next.js/Mongoose expertise, but basic React/TypeScript/JavaScript knowledge is assumed.

If you only read one section, read **"How do I...?"** near the bottom — it walks through the most common changes step by step.

---

## Table of contents

1. [What this app is](#1-what-this-app-is)
2. [Quick start (running it locally)](#2-quick-start-running-it-locally)
3. [Tech stack](#3-tech-stack)
4. [Project structure](#4-project-structure)
5. [How data flows through the app](#5-how-data-flows-through-the-app)
6. [The data layer (MongoDB / Mongoose)](#6-the-data-layer-mongodb--mongoose)
7. [Authentication & authorization](#7-authentication--authorization)
8. [Design system & styling](#8-design-system--styling)
9. [Shared UI components](#9-shared-ui-components)
10. [Feature tour](#10-feature-tour)
11. [File uploads & storage (Vercel Blob)](#11-file-uploads--storage-vercel-blob)
12. [PDF generation](#12-pdf-generation)
13. [Conventions you should follow](#13-conventions-you-should-follow)
14. [How do I...? (cookbook)](#14-how-do-i-cookbook)
15. [Gotchas — things that will bite you](#15-gotchas--things-that-will-bite-you)
16. [Environment variables reference](#16-environment-variables-reference)

---

## 1. What this app is

Spartan Hub is a management app for **Spartan FC**, a football (soccer) club. It has two audiences:

- **The public site** — anyone can visit and see the squad, player profiles, statistics/leaderboards, session (match/training) history, a downloadable "Squad Poster," and a photo/video gallery.
- **The admin area** (`/admin/...`) — club staff log in to manage players, record sessions and player performances, upload gallery media, export reports, and enter historical ("legacy") data from before the app existed.

There is no self-serve signup. Admin accounts are provisioned by running a script (see [§7](#7-authentication--authorization)).

## 2. Quick start (running it locally)

1. **MongoDB** — you need a local MongoDB instance running (e.g. `brew services start mongodb-community`). The app expects it at `mongodb://localhost:27017/spartan-hub` by default.
2. **Environment variables** — copy `.env.example` to `.env.local` and fill in the values. See [§16](#16-environment-variables-reference) for what each one is for. For local dev you need at minimum `MONGODB_URI`, `AUTH_SECRET` (generate with `npx auth secret`), and `BLOB_READ_WRITE_TOKEN` (only required if you're testing photo/gallery uploads — get one from the Vercel dashboard or `vercel env pull .env.local`).
3. **Install dependencies:** `npm install`
4. **Create an admin account:** set `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in `.env.local`, then run `npm run seed:admin`. This is safe to re-run — it upserts by email, so re-running it with a new password rotates the password.
5. **Run the dev server:** `npm run dev`, then visit `http://localhost:3000`. Admin login is at `/admin/login`.
6. **Before committing:** run `npx tsc --noEmit`, `npm run lint`, and `npm run build` — the project has no automated test suite, so these three commands are the actual quality gate.

> ⚠️ **This project's own `AGENTS.md` file is a standing instruction, not boilerplate — read it.** It warns that this specific Next.js version (16) has breaking changes from what you might expect (for example, the route-protection file is `src/proxy.ts`, not the traditional `middleware.ts`). When in doubt about a Next.js API, check `node_modules/next/dist/docs/` before assuming how something works.

## 3. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | Server Components by default; see [§5](#5-how-data-flows-through-the-app) |
| Language | **TypeScript**, **React 19** | strict mode on |
| Database | **MongoDB** via **Mongoose** | one connection helper, no ORM-level caching of query results |
| Auth | **NextAuth v5 (beta)**, JWT sessions, credentials login | + `bcryptjs` for password hashing |
| Forms/validation | **react-hook-form** + **Zod** (`@hookform/resolvers`) | |
| Styling | **Tailwind CSS v4**, CSS-first config (no `tailwind.config.js`) | dark theme, see [§8](#8-design-system--styling) |
| Icons | **lucide-react** | |
| File storage | **Vercel Blob** (`@vercel/blob`) | photos/videos — MongoDB only ever stores the URL, never the bytes |
| Image processing | **sharp** | server-side compression of uploaded photos |
| PDF generation | **@react-pdf/renderer** | Squad Poster PDF + Statistics Report PDF |
| Dates | **date-fns** | |

Run `cat package.json` for exact versions — don't assume a specific version's API without checking, especially for Next.js itself (see the warning in [§2](#2-quick-start-running-it-locally)).

## 4. Project structure

```
src/
├── app/                    # Next.js App Router — pages, layouts, API routes
│   ├── (public)/           # Public site: home, squad, players, statistics, sessions, gallery
│   ├── admin/               # Admin login + admin/(dashboard) — the protected admin area
│   └── api/                 # Route handlers: auth, gallery upload, report/poster PDFs
├── actions/                 # Server actions ("use server") — the app's write/mutation layer
├── components/
│   ├── ui/                  # Design-system primitives (Button, Card, Modal, ...)
│   ├── players/              # Player card/avatar/squad-grid/poster components
│   ├── statistics/           # Leaderboard + season switcher
│   ├── admin/                 # Admin-only forms, lists, and widgets
│   ├── gallery/                # Gallery grid/card/lightbox/uploader
│   └── layout/                 # Header, footer, nav, page hero, shared background
├── lib/                     # Business logic, data access, formatting, constants
│   ├── validation/           # Zod schemas for forms
│   └── pdf/                   # @react-pdf/renderer document definitions
├── models/                  # Mongoose schemas
├── hooks/                   # Shared React hooks (e.g. player filtering)
├── auth.ts                  # NextAuth configuration
└── proxy.ts                 # Route protection (Next 16's replacement for middleware.ts)
scripts/                    # One-off/admin CLI scripts (seed-admin, migrate-seasons)
public/                     # Static assets — images, fonts (used by the PDF pipeline)
```

**The path alias `@/*` always means `src/*`.** Every internal import looks like `@/lib/stats`, `@/components/ui/Button`, `@/models/Player`, etc. — check `tsconfig.json` if you're ever unsure.

## 5. How data flows through the app

This app is **server-first**: most pages are React Server Components that fetch data directly (calling functions from `src/lib/*.ts`, which query MongoDB) and render HTML on the server. A component only becomes a Client Component (`"use client"` at the top of the file) when it genuinely needs interactivity — a form, a toggle, a filter bar, anything using `useState`/`onClick`/etc.

There are two ways data gets **written**:

1. **Server Actions** (`src/actions/*.ts`, files starting with `"use server"`) — functions called directly from client components (e.g. a form's `onSubmit`), without you writing a `fetch()` or an API route. This is how almost every admin mutation works (`savePlayer`, `saveSession`, `deleteGalleryItem`, etc.).
2. **API Route Handlers** (`src/app/api/**/route.ts`) — used only where a server action wouldn't work: file downloads that need to be a real browser navigation (CSV/PDF exports), the NextAuth catch-all route, and the Vercel Blob upload-authorization endpoint (needed because large file uploads go directly from the browser to Blob storage, not through a server action).

Every server action returns the same shape, defined in `src/lib/action-result.ts`:

```ts
export type ActionResult<TData = undefined> =
  | { success: true; data: TData }
  | { success: false; message: string; fieldErrors?: Record<string, string> };
```

A calling form checks `result.success`; on failure it shows `result.message` as a toast and, if `fieldErrors` is present, attaches per-field error messages to the relevant inputs. **Follow this pattern for any new mutation** — don't throw raw errors across the server/client boundary.

Every mutating action also calls `revalidatePath(...)` on every route that shows the data it just changed, so Next.js knows to refetch fresh data on next navigation rather than serving a stale cached page.

## 6. The data layer (MongoDB / Mongoose)

### Connecting to the database

`src/lib/db.ts` exports `connectToDatabase()`, which every data-fetching function calls first. It's more than a simple `mongoose.connect()` wrapper — read the comments in the file itself if you're touching it, but the short version:

- The connection (and the in-flight connection *promise*) is cached on `global.__mongooseCache` so it survives Next.js dev-mode hot reloads and is reused across warm serverless invocations in production.
- It deliberately opens a pool of 10 connections up front and pings all of them before returning, because firing several DB queries concurrently (`Promise.all`) right after a *fresh* connection can otherwise silently return empty results instead of an error — see [§15](#15-gotchas--things-that-will-bite-you).

### Models

All models live in `src/models/` and follow the same three-line pattern at the bottom of the file:

```ts
export type Player = InferSchemaType<typeof playerSchema>;
export const PlayerModel = models.Player ?? model("Player", playerSchema);
```

The `models.Player ?? model(...)` guard prevents Mongoose from throwing a "model already registered" error when a file gets hot-reloaded in dev — but it also means **the schema is only compiled once per running process**. If you add/change a field or enum value, the already-running `next dev` process is still using the old compiled schema until you restart it. See [§15](#15-gotchas--things-that-will-bite-you) — this has caused a real, silent bug in this project before.

| Model | Represents | Notable fields / design notes |
|---|---|---|
| `Admin` | Someone who can log into `/admin` | `email` (unique), `passwordHash` (bcrypt), `role` |
| `Player` | A squad member (or coach) | `position`/`positionGroup` (the latter is auto-derived from the former via a `pre("validate")` hook — never set it manually), `status` (`active`/`inactive`), `isCaptain` (only one player should ever have this `true` — enforced in the `savePlayer` action, not the schema), `phoneNumber`/`homeAddress` (admin-only, never shown publicly) |
| `Session` | One training session or match | `season` is auto-derived from `date` via a `pre("validate")` hook (just the calendar year, as a string); `outcome` (win/draw/loss) is separate from the free-text `result` field and is optional even for matches; `isLegacy: true` marks synthetic placeholder sessions used to anchor historical data (see below) |
| `PlayerSessionPerformance` | One player's attendance + goals/assists for one session | The fact table everything is calculated from — has a unique compound index on `(playerId, sessionId)` so writes are safe to upsert |
| `LegacySeasonSummary` | Manually-entered whole-team totals for a season before the app existed | One doc per season; added on top of computed stats at read time |
| `SquadPoster` | A frozen snapshot of the roster for one season, used by the printable/PDF Squad Poster | Player fields are **copied**, not referenced — deliberately, so a past season's poster never changes even if a player's photo/name/number is edited later. See [§10](#10-feature-tour). |
| `GalleryItem` | Metadata for one uploaded photo/video | The actual file lives in Vercel Blob; this row just points at it (`pathname`, `url`, `downloadUrl`) |

Shared enums/lookup tables live in `src/lib/constants.ts` (positions, position groups, statuses, session types, match outcomes) — this is the single place to add a new position or status value. See the [cookbook](#14-how-do-i-cookbook).

### Statistics — computed live, nothing is cached

`src/lib/stats.ts` is the biggest file in the codebase and worth understanding early: **every statistic (appearances, goals, assists, win/loss/draw records, leaderboards) is computed on the fly from `PlayerSessionPerformance` via MongoDB aggregation pipelines.** Nothing is pre-computed or cached in the database. This is a deliberate choice (documented in the file) so numbers can never drift out of sync with the underlying attendance/performance log — if you're tempted to add a "cached total" field to `Player`, don't; add or extend a query in `stats.ts` instead.

`src/lib/reports.ts` builds the shared "statistics as of a date/session" dataset used by both the CSV and PDF exports, so the two formats can never disagree with each other.

### The "legacy data" pattern

Before Spartan Hub existed, there was no per-session history to import. Rather than special-casing "old" stats everywhere, the app creates synthetic `Session` documents with `isLegacy: true` and attaches real `PlayerSessionPerformance` rows to them — so a legacy player's career totals flow through the exact same aggregation pipelines as real data. These synthetic sessions are explicitly filtered out (`isLegacy: { $ne: true }`) anywhere a literal list of sessions is shown. Team-wide legacy totals (trainings/matches/W-D-L) that don't belong to any one player live separately in `LegacySeasonSummary` and are added on top at read time. The admin UI for entering this is `/admin/legacy-stats`.

## 7. Authentication & authorization

- **Login**: NextAuth's Credentials provider (`src/auth.ts`) checks the submitted email/password against the `Admin` collection, using `bcryptjs` to compare the password hash. Sessions are JWTs (no session table in the DB). `src/actions/auth.ts` wraps `signIn`/`signOut` as server actions used by the login form and the "Sign Out" button.
- **Provisioning admins**: there's no signup form. Run `npm run seed:admin` (reads `ADMIN_NAME`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env.local`) to create or update an admin account — see [§2](#2-quick-start-running-it-locally).
- **Route protection is two layers, deliberately redundant:**
  1. **`src/proxy.ts`** (Next 16's replacement for `middleware.ts`) intercepts every request under `/admin/*` and redirects to `/admin/login` if there's no session — this is what keeps the admin pages from ever rendering for a logged-out visitor.
  2. **Every mutating server action and admin-only API route checks the session itself too**, independently of the proxy — server actions call `auth()` directly and return an `ActionResult` failure; API routes use `requireAdmin()` (`src/lib/require-admin.ts`), which returns a 401 response. The reasoning, straight from that file's own comment: *"the API must never trust that the UI hid the button."* **When you add a new mutation, copy this pattern — don't rely on the page-level redirect alone.**

## 8. Design system & styling

The whole app (except intentionally photo-backed sections like the login page) uses one consistent dark visual language, originally designed for the Squad Poster screen and then extended everywhere.

- **Tailwind v4, CSS-first**: there's no `tailwind.config.js`. Color tokens are declared as CSS custom properties in `src/app/globals.css`, then re-exposed inside a `@theme inline { ... }` block, which is what makes `bg-brand`, `text-accent-dark`, `bg-ink/60`, etc. available as Tailwind utility classes. If you need a new color token, add it there, not in a config file.
- **Color tokens**: `brand` (deep indigo `#2905a3`, the primary/CTA color), `accent` (red `#db261d`, used for alerts/destructive actions), `ink` (`#0b0714`, the base near-black background) — each with `-dark`/`-light` variants.
- **Text-opacity ladder**: instead of a separate gray-scale, text hierarchy is done with opacity steps on white — solid `text-white` for headings, then `/70`, `/50`, `/40`, `/30`, `/20` for decreasing emphasis. Reuse this ladder rather than inventing a new opacity value.
- **"Frosted glass" cards**: the `Card` component (`src/components/ui/Card.tsx`) is `rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02]` — a translucent panel over the dark background. Almost every panel in the app is built from `Card`/`CardBody`, so changing that one component's default classes has app-wide reach.
- **The shared background**: `src/components/layout/AppBackground.tsx` is mounted once in the root layout — a fixed, full-screen layer with the dark base fill, a very subtle dot-grid texture, and two large blurred color blobs. It's shared so every page gets the same ambient background without re-implementing it.
- **Fonts**: Inter for body text (`font-sans`), Oswald for headings (`font-display`) — both loaded via `next/font/google` in the root layout.

## 9. Shared UI components

Everything in `src/components/ui/` is the reusable design-system layer — reach for these before writing new markup:

| Component | Use it for |
|---|---|
| `Button` | Every button or button-styled link. Supports `href` (renders as a `next/link`) or `href` + `native` (renders as a plain `<a>` — required for real file downloads, since client-side navigation would swallow them). Variants: `primary`, `accent`, `outline`, `ghost`, `danger`, `inverse` (for use on photo backgrounds). |
| `Card` / `CardBody` | Any panel/container. |
| `Badge` | Small status/label pills. |
| `StatTile` | Big-number stat displays. |
| `Field` (`Input`, `Select`, `Textarea`) | Labeled form controls with built-in error/hint display. |
| `NumberField` | A labeled numeric input with ± stepper buttons (used for counts like goals/assists). |
| `Stepper` | A bare ± counter without label chrome (used inline in tables). |
| `AttendanceToggle` | Present/Absent pill toggle. |
| `Modal` | Dialog/bottom-sheet, Escape + backdrop-click to close. |
| `Toast` / `useToast()` | Success/error toast notifications — call `showToast(message, "error")` from any client component. |
| `EmptyState` | The "nothing here yet" placeholder used across every empty list. |
| `Skeleton` / `CardSkeleton` | Loading placeholders, used in `loading.tsx` route files. |
| `BackButton` | A "Back" link that uses real browser history when available, falling back to a fixed URL otherwise (handles someone arriving via a direct/shared link). |

## 10. Feature tour

- **Players & Squad** (`/squad`, `/players/[slug]`, `/admin/players`) — `Player` model, `PlayerForm.tsx` (create/edit), `savePlayer`/`setPlayerStatus` actions. Career totals are computed by `getPlayerRoster()`/`getPlayerTotals()` in `lib/stats.ts`, not stored on the player.
- **Sessions** (`/sessions`, `/admin/sessions`) — recording a match or training session and each player's attendance/goals/assists. `SessionForm.tsx` + `PlayerPerformanceRow.tsx`, saved via the `saveSession` action, which writes to both `Session` and `PlayerSessionPerformance`.
- **Statistics** (`/statistics`) — leaderboards (top scorers, assists, appearances, wins) and per-player totals, all computed live by `lib/stats.ts`.
- **Squad Poster** (`/squad/poster`, downloadable PDF) — a shareable, presentation-style roster snapshot. `lib/squad-poster.ts` regenerates the *current* season's poster from the live active roster on every view, but **freezes a past season's poster forever** once it's first generated (see the `SquadPoster` model notes in [§6](#6-the-data-layer-mongodb--mongoose)). `SquadPosterView.tsx` is the web rendering; `lib/pdf/SquadPosterDocument.tsx` is a pixel-matched PDF port of the same design — see [§12](#12-pdf-generation). **This screen's visual design is treated as the app's reference aesthetic — be conservative about changing it.**
- **Gallery** (`/gallery`, `/admin/gallery`) — team photos/videos. Uploads go directly from the browser to Vercel Blob (not through a server action — see [§11](#11-file-uploads--storage-vercel-blob)); `GalleryItem` documents only ever store metadata/URLs.
- **Legacy Stats** (`/admin/legacy-stats`) — entering historical per-player and team-wide totals from before the app existed. See [§6](#6-the-data-layer-mongodb--mongoose)'s "legacy data pattern."
- **Reports** (`/admin/reports`) — CSV and PDF exports of statistics "as of" a given date or session, built from the shared `getStatisticsAsOf()` in `lib/reports.ts`.
- **Admin Dashboard** (`/admin`) — quick KPIs and shortcuts, backed by `getTeamSnapshot()` in `lib/stats.ts`.

## 11. File uploads & storage (Vercel Blob)

MongoDB never stores raw file bytes — only URLs. Actual photo/video bytes live in **Vercel Blob**, a cloud object store. There are two upload paths, and the difference matters:

- **Player photos** (`src/lib/upload-photo.ts`) go through a **server action** — the file is small (capped at 3MB) and gets cropped client-side first (`PhotoCropModal.tsx` + `react-easy-crop`), so routing it through `savePlayer`'s `FormData` is fine.
- **Gallery photos/videos** are much larger (up to 15MB for photos, 200MB for video) — too big for a server action, since Vercel's platform caps a server-side `put()` at 4.5MB regardless of Next.js's own body-size config. So gallery uploads go **directly from the browser to Blob storage** using `@vercel/blob/client`'s `upload()` helper, authorized by a short-lived token issued by `src/app/api/gallery/upload/route.ts` (admin-only, checked via `requireAdmin()`). Once the upload finishes client-side, the browser calls the `createGalleryItem` server action with just the resulting metadata (URL, size, type) to write the DB row.
- Uploaded **photos ≥1MB get compressed** server-side with `sharp` (`src/lib/compress-photo.ts`, resized to max 1920px wide, quality 82) before the final metadata is saved — this happens *after* the original lands in Blob (fetched back into a server action, re-encoded, re-uploaded, original overwritten). **Videos are never compressed** — video transcoding on serverless infrastructure is fragile/slow, so this was a deliberate scope decision.

If you're adding a new kind of upload, decide up front whether it'll ever exceed a few MB — if so, follow the gallery's client-direct-upload pattern, not the player-photo server-action pattern.

## 12. PDF generation

Two PDFs exist, both built with **`@react-pdf/renderer`** (describes a PDF as a React component tree, rendered server-side to a binary buffer — no headless browser): `lib/pdf/SquadPosterDocument.tsx` and `lib/pdf/StatisticsReportDocument.tsx`.

The Squad Poster PDF is a deliberate, literal port of the web `SquadPosterView.tsx` layout, not an independent redesign. The key mechanism to understand: a `PX()` helper (`px * 0.75`) converts CSS pixels (96/inch) to PDF points (72/inch), so every layout constant in the PDF file is commented with exactly which Tailwind class it mirrors on the web (e.g. `size-28` on the web → `PHOTO_SIZE = PX(112)` in the PDF). **If you change something visually on the Squad Poster web view, check whether the equivalent constant needs updating in `SquadPosterDocument.tsx` too** — they don't share code, only an intentional, hand-maintained correspondence.

Because a PDF page can't auto-grow like a webpage, the poster document estimates its own required page height up front (`estimatePageHeight()`, using a rough word-wrap simulator) so the whole poster renders as one continuous page rather than splitting awkwardly across multiple pages.

The PDF route handlers (`src/app/api/squad-poster/pdf/route.tsx`, `src/app/api/reports/export/pdf/route.tsx`) also load a `.ttf` font file from `public/fonts/` and register it with `Font.register()`, since react-pdf can't use the web's `next/font` setup — this is how the PDF's headings end up in the same Oswald font as the website.

## 13. Conventions you should follow

- **Server Components by default.** Only add `"use client"` when a component genuinely needs state, effects, or event handlers. Data fetching belongs in a server component or a `lib/` function, not a `useEffect`.
- **Every mutation returns `ActionResult`** (see [§5](#5-how-data-flows-through-the-app)) and calls `revalidatePath()` on every route that displays the data it changed.
- **Every mutation checks auth itself**, even though `proxy.ts` already blocks unauthenticated page loads — see [§7](#7-authentication--authorization).
- **Shared enums live in `src/lib/constants.ts`.** Don't hardcode a list of positions/statuses/etc. in a component — import from there.
- **Formatting helpers live in `src/lib/format.ts`.** In particular, always use `displayName(player)` to show a player's name (nickname if set, otherwise full name) — never read `player.firstName`/`nickname` directly in a component, so the fallback logic stays in one place.
- **Position-to-color mapping lives in `src/lib/position-colors.ts`.** Don't invent new position colors ad hoc in a component.
- **Don't add a "cached total" field to a model** to avoid a query — extend `lib/stats.ts` instead (see [§6](#6-the-data-layer-mongodb--mongoose)).
- **Fields that are optional in a form must be truly optional everywhere in the chain**: the Zod schema (`.optional()`), the React Hook Form registration (actually `register()`-ed, or otherwise excluded from the validated schema entirely), and the Mongoose schema. See the `isCaptain` gotcha below for what goes wrong if a field is added to the validated schema without being wired into the form properly.

## 14. How do I...? (cookbook)

### ...add a new field to Player (e.g. a new optional text field)

Follow the exact pattern used for `phoneNumber`/`homeAddress`:

1. **`src/models/Player.ts`** — add the field to `playerSchema`, e.g. `emergencyContact: { type: String, trim: true, maxlength: 100 }`.
2. **`src/lib/validation/player.ts`** — add it to `playerFormSchema`, e.g. `emergencyContact: z.string().trim().max(100, "...").optional()`.
3. **`src/components/admin/PlayerForm.tsx`** — add an `<Input>` with `{...register("emergencyContact")}` inside the form's field grid, and include it in the manual `FormData` construction in `onSubmit` (`if (values.emergencyContact) formData.set("emergencyContact", values.emergencyContact)`).
4. **`src/actions/players.ts`** — add `emergencyContact: formData.get("emergencyContact") || undefined,` to the `raw` object in `savePlayer` (it'll then flow through `parsed.data` automatically into both the create and update paths).
5. **`src/app/admin/(dashboard)/players/[id]/edit/page.tsx`** — add `emergencyContact: player.emergencyContact ?? undefined,` to the `existingPlayer` prop passed into `PlayerForm`, so the edit form pre-fills it.
6. **Restart the dev server** — a schema change won't take effect on an already-running `next dev` process (see [§15](#15-gotchas--things-that-will-bite-you)).
7. Decide deliberately whether the new field should ever be shown publicly — most personal fields (phone, address) are admin-only by design; don't wire them into `PlayerCard`/the profile page without a specific reason to.

**If the field is a boolean managed as a toggle rather than a typed input** (like `isCaptain`), keep it as local `useState` in `PlayerForm` rather than an RHF-registered field, and **do not** add it to the Zod schema that `zodResolver` validates against — instead read it directly from `FormData` in the server action, outside the `parsed.data` object. See [§15](#15-gotchas--things-that-will-bite-you) for exactly what breaks if you get this wrong.

### ...add a new position

Edit `src/lib/constants.ts` only:
1. Add the new value to the `POSITIONS` array.
2. Add a corresponding entry to `POSITION_TO_GROUP` mapping it to one of `"Goalkeeper" | "Defender" | "Midfielder" | "Forward"` (or `STAFF_GROUP`).
3. Restart the dev server — this changes a Mongoose schema enum.

Nothing else needs to change; the position dropdown, validation, and squad-grouping logic all read from these constants.

### ...add a new page to the public site

1. Create `src/app/(public)/your-page/page.tsx` as an `async` Server Component. Fetch data by calling a function from `src/lib/*.ts` (add one if it doesn't exist yet — don't fetch from inside the component with `useEffect`).
2. Use `<PageHero>` for the page's title/icon banner, matching other pages.
3. Add a `loading.tsx` alongside it using `<Skeleton>`/`<CardSkeleton>` for the loading state.
4. If it should appear in navigation, add it to `PUBLIC_NAV_ITEMS` in `src/components/layout/nav-items.ts` — both the desktop header and the mobile bottom nav read from this one array.

### ...add a new admin-only mutation

1. Add the function to the relevant file in `src/actions/` (or create a new one), starting with `"use server"` at the top of the file.
2. Start the function with the auth check: `const session = await auth(); if (!session?.user) return { success: false, message: "You must be signed in as an admin to do that." };`
3. Validate input with a Zod schema.
4. Return `ActionResult<TData>`.
5. Call `revalidatePath()` on every route your change affects.

### ...change a color or the overall look

Start with `src/app/globals.css`'s `:root` tokens if it's a brand-wide color change, or `src/components/ui/Card.tsx` if it's about the base panel style — both have wide reach. Read [§8](#8-design-system--styling) first. **Do not** touch `SquadPosterView.tsx`'s color choices casually — it's the design reference the rest of the app was built to match.

### ...debug "my change isn't showing up"

1. Did you change a Mongoose schema or `src/lib/constants.ts` enum? **Restart `next dev`** — see [§15](#15-gotchas--things-that-will-bite-you).
2. Did you change data shown on a page and it's still showing old data after a save? Check the relevant server action calls `revalidatePath()` on that route.
3. Run `npx tsc --noEmit` — a surprising number of "nothing happened" bugs are actually a silent client-side validation failure (see the `isCaptain` gotcha below) that TypeScript would have caught if the field were wired correctly.

## 15. Gotchas — things that will bite you

- **Schema/constant changes need a dev-server restart.** Because models are cached via `models.Player ?? model(...)` to survive hot-reload, a running `next dev` process keeps using the schema it compiled at startup. If you add a field or enum value and don't restart, saves will silently drop the new field with no error — it looks like the feature does nothing. Always restart after touching `src/models/*.ts` or `src/lib/constants.ts`.

- **A form field added to the Zod schema without being wired into React Hook Form fails silently.** This has happened for real in this codebase: `isCaptain` was briefly added to `playerFormSchema` (the schema `zodResolver` validates against) while being managed as plain `useState` rather than `register()`-ed. Since no input was bound to show the resulting validation error, the "Add Player" button just... did nothing, with zero feedback, whenever the (always-missing) `isCaptain` field failed validation. **The fix and the rule going forward**: any field that isn't a real registered form input (a boolean toggle, a file, anything managed as local component state) must be excluded from the RHF-validated Zod schema entirely and read directly from `FormData` in the server action instead.

- **Don't fire multiple DB queries concurrently immediately after connecting.** `connectToDatabase()`'s warm-up pool exists specifically because concurrent queries (`Promise.all`) right after a *fresh* connection can silently return empty results instead of erroring. `getTeamSnapshot()` in `lib/stats.ts` deliberately awaits its queries sequentially with a comment explaining why — follow that precedent in new code that fires several queries in a row right after `connectToDatabase()`.

- **The Squad Poster's past-season snapshots are frozen on purpose.** If you edit a player's name/photo/number, don't expect old Squad Posters to reflect it — that's intentional (see [§6](#6-the-data-layer-mongodb--mongoose)/[§10](#10-feature-tour)), not a bug.

- **`isLegacy: true` sessions are placeholders, not real events.** Any new code that lists or counts sessions needs to explicitly exclude them (`isLegacy: { $ne: true }`) unless it's specifically meant to include legacy data — check how existing queries in `lib/stats.ts`/`lib/reports.ts` do this before writing a new one.

- **Vercel Blob server-side uploads are capped at 4.5MB**, regardless of what you configure in Next.js — this is a platform limit, not something you can raise. Anything that might exceed that needs the client-direct-upload pattern (see [§11](#11-file-uploads--storage-vercel-blob)), not a server action.

- **The public Squad Poster PDF route has no auth check, on purpose** — it mirrors the public `/squad/poster` page. Don't "fix" this by adding `requireAdmin()` without checking whether that's actually the intent (it is, currently).

## 16. Environment variables reference

All defined in `.env.example` (copy to `.env.local` and fill in):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for SEO/Open Graph metadata |
| `MONGODB_URI` | MongoDB connection string — local `mongodb://localhost:27017/spartan-hub` for dev, Atlas URL in production |
| `AUTH_SECRET` | NextAuth's JWT signing secret — generate with `npx auth secret` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token, needed for any photo/gallery upload testing |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Only read by `npm run seed:admin` to create/update the first admin account |

**Never point `MONGODB_URI` at the shared production/Atlas database for local development or testing — always use a local MongoDB instance.**
