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
npm run lint         # Run ESLint (ESLint 9 with Next.js config)
```

### Environment Setup

1. Create `.env.local` (not tracked in git) with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Install deps: `npm install` (Supabase SSR already included)

### Adding Supabase Features

- Always use `createBrowserClient()` for client-side initialization (in `lib/supabase/client.ts`)
- For server-side operations (future): Create `lib/supabase/server.ts` with `createServerClient()`
- Supabase auth methods: Prefer built-in `.signUp()`, `.signInWithPassword()`, `.signOut()`

---

## 🎨 Code Conventions & Patterns

### Styling

- **Tailwind v4 first**: Primary styling approach. All custom colors use brand palette inline or via constants
- **Brand colors as inline styles**: Common pattern - `style={{ backgroundColor: '#583C5C' }}` for brand colors
- **Responsive classes**: Use Tailwind's `md:`, `sm:` prefixes (e.g., `text-5xl md:text-6xl`)

### Component Patterns

- **Client components**: Use `'use client'` directive at top of file
- **Hooks**: Prefer `useAuth()` for global auth state, avoid prop drilling
- **State management**: Local `useState` for component-level state; React Context for global auth only

### TypeScript

- **Strict mode enabled**: `"strict": true` in `tsconfig.json`
- **Type imports**: Use `User` type from `@supabase/supabase-js` for auth objects
- **Interface naming**: Use `*Type` suffix (e.g., `AuthContextType`) for context/provider types

### Error Handling

- Auth errors caught in try-catch blocks and displayed to users
- Supabase operations return `{data, error}` tuples - always check error before using data

---

## 📂 Project Structure Reference

```
app/                    # Next.js App Router pages
├── layout.tsx         # Root layout with AuthProvider wrapper
├── page.tsx           # Landing page (public)
├── auth/
│   └── page.tsx       # Authentication page (sign-in/sign-up)
├── globals.css        # Global Tailwind styles
contexts/
├── auth-contexts.tsx  # AuthProvider and useAuth hook
lib/
├── supabase/
│   ├── client.ts      # Browser Supabase client factory
│   └── server.ts      # (Future) Server-side Supabase client
public/               # Static assets
```

---

## 🔄 Common Development Tasks

### Adding a New Authenticated Page

1. Create page in `app/[feature]/page.tsx` with `'use client'` directive
2. Use `useAuth()` to check `user` state and redirect if needed
3. Example redirect pattern (from `app/auth/page.tsx`):
   ```tsx
   const {user, loading} = useAuth();
   const router = useRouter();
   useEffect(() => {
     if (user && !loading) router.push("/");
   }, [user, loading, router]);
   ```

### Extending Authentication

- Add new auth context properties: Update `AuthContextType` interface and provider in `contexts/auth-contexts.tsx`
- Supabase methods available: `.signUp()`, `.signInWithPassword()`, `.signOut()`, `.getSession()`, `.onAuthStateChange()`

### Styling New Components

- Use Tailwind classes for responsive design
- Reference brand colors in `app/page.tsx` for consistent hex values
- Dark mode support included but currently minimal (prepare for future: `dark:` classes exist)

---

## ⚠️ Important Caveats

- **Email confirmation**: Supabase email confirmation may be enabled in project settings - handle cases where user exists but session is null
- **Environment variables**: All Supabase keys are `NEXT_PUBLIC_*` (safe to expose to browser as they're read-only anon keys)
- **No server-side auth yet**: Current setup uses browser client only; adding server-side routes will require `lib/supabase/server.ts` implementation

---

## 🎯 Next Development Priorities (from README)

The roadmap includes: user profiles, matching algorithm, messaging system, and swiping interface. Plan for these features to live in new routes (e.g., `/dashboard`, `/messages`) wrapped with auth guards using the `useAuth()` hook.
