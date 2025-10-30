# AI Coding Agent Instructions - Hearts Dating App (Marahuyo)

## 🎯 Project Context

**Hearts Dating App (Marahuyo)** is a Next.js 16 + React 19 dating application using Supabase for authentication and PostgreSQL backend. Currently in active development with core authentication infrastructure established. Brand colors: Deep Purple (#583C5C), Gold (#E8B960), Cream (#F7F4F3).

Rule:

- Don't use any emojis
- Don't create MD files whenever I ask you to do a task

---

## 🏗️ Architecture Overview

### Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 + PostCSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Client Lib**: `@supabase/ssr` for browser client initialization

### Core Patterns

#### Authentication Architecture

The app wraps all components in `AuthProvider` (in `app/layout.tsx`) which manages global user state:

- **Entry Point**: `contexts/auth-contexts.tsx` exports `useAuth()` hook and `AuthProvider` component
- **Initialization**: On mount, `AuthProvider` calls `supabase.auth.getSession()` then subscribes to `onAuthStateChange()`
- **State Management**: Simple React Context (not Redux/Zustand) - stores `user`, `loading`, and `signOut` function
- **Client Creation**: `lib/supabase/client.ts` uses `createBrowserClient()` with environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

**Key file locations**:

- Auth provider: `contexts/auth-contexts.tsx`
- Supabase client factory: `lib/supabase/client.ts`
- Layout with AuthProvider: `app/layout.tsx`

#### Authentication Flow

1. **Sign Up**: Form in `app/auth/page.tsx` → `supabase.auth.signUp({email, password})` → user created → confirmation email sent (if enabled) → `onAuthStateChange` fires → redirects to homepage
2. **Sign In**: Form in `app/auth/page.tsx` → `supabase.auth.signInWithPassword({email, password})` → session established → `onAuthStateChange` fires → redirects to homepage
3. **Sign Out**: Calls `signOut()` from context → clears user state → redirects appropriately

#### Component Organization

- **`'use client'` convention**: All interactive components use `'use client'` directive (pages, auth form, etc.)
- **Page routing**: Next.js App Router with `/` (landing) and `/auth` (authentication)
- **Path aliases**: TypeScript configured with `@/*` → `./*` for clean imports

---

## 🔧 Development Workflows

### Local Development

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm start            # Start production server
## AI Coding Agent Instructions — Hearts Dating App (Marahuyo)

Note: do not use emojis in edits and avoid creating new Markdown files unless requested.

Quick orientation (what matters):

- Stack: Next.js 16 (App Router) + React 19 + TypeScript 5. Styling via Tailwind CSS v4.
- Auth: Supabase (browser client only). Env keys live in `.env.local`: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.

Key files to inspect first:

- `app/layout.tsx` — wraps the app with `AuthProvider`.
- `contexts/auth-contexts.tsx` — `AuthProvider` and `useAuth()` hook; look here for session init and `onAuthStateChange` behavior.
- `lib/supabase/client.ts` — creates the browser Supabase client with `createBrowserClient()`.
- `app/auth/page.tsx` — sign-in / sign-up UI and redirect examples (useAuth + useRouter pattern).

Conventions and patterns to follow:

- Client components must include `'use client'` at the top.
- Use the `useAuth()` hook for auth state; avoid prop drilling for user/session.
- TypeScript is strict — prefer explicit types (project uses `*Type` suffix for interfaces).
- Path alias: `@/*` → `./*` (use existing tsconfig imports).
- Styling: Tailwind-first. Brand colors used inline in components when needed (hex example: 583C5C).

Auth flow (practical snippets):

- Sign-in redirect pattern:

   const { user, loading } = useAuth();
   const router = useRouter();
   useEffect(() => { if (user && !loading) router.push('/'); }, [user, loading, router]);

- Use Supabase client in client code only via `lib/supabase/client.ts`. Server-side helpers live in `lib/supabase/server.ts` (future use).

Dev commands (use zsh):

```
npm install
npm run dev      # start dev server (http://localhost:3000)
npm run build
npm start        # production
npm run lint
```

Search-first guidance for tasks:

- For auth work: edit `contexts/auth-contexts.tsx`, `lib/supabase/client.ts`, and `app/auth/page.tsx`.
- For UI pages: inspect `app/*` routes (e.g., `discover`, `messages`, `profile`).
- For shared components: check `components/` (e.g., `MatchCard.tsx`, `SwipeableCard.tsx`).

Quick pitfalls to watch for:

- Many flows assume the anonymous public Supabase key (NEXT_PUBLIC_*). Missing env vars will break dev auth.
- Client-only Supabase usage — avoid moving client calls to server code without adding server client helpers.
- Respect `'use client'` vs server components in the App Router; mixing them causes runtime errors.

If something in these instructions is incomplete or you'd like more examples (tests, CI, or a checklist for adding a new route), tell me which area to expand and I will iterate.
