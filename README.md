# Hearts Dating App 💜

A modern, full-stack dating application built with **Next.js 16**, **React 19**, **Supabase**, and **Tailwind CSS v4**. Currently in **active development** with core authentication infrastructure in place.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Current Progress](#current-progress)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Known Issues](#known-issues)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## 🎯 Project Overview

**Marahuyo** is a dating application designed to help users find meaningful connections. The current iteration focuses on establishing a solid authentication foundation and user onboarding flow, with dating features (matching, profiles, messaging) coming in subsequent phases.


Suggestions

- 

### Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 + PostCSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel (recommended) or self-hosted Node.js

### Brand Colors

- **Primary**: `#583C5C` (Deep Purple)
- **Accent**: `#E8B960` (Gold)
- **Background**: `#F7F4F3` (Cream)

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│         Next.js 16 App Router (React 19)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  app/layout.tsx → <AuthProvider>                  │  │
│  │  Wraps entire application                         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │
    ┌────┴──────┬──────────────┐
    │            │              │
  page.tsx   auth/page.tsx  [Future Pages]
  (Landing)  (Auth Flow)    (Profile, Messages, etc.)
    │            │              │
    └────────┬───┴──────────────┘
             │
       ┌─────▼────────────────┐
       │ AuthContext (Client) │
       │ useAuth() hook       │
       └─────┬────────────────┘
             │
    ┌────────┴─────────────┐
    │                      │
Browser Client        Subscription
(Anon Key)       (onAuthStateChange)
    │                      │
    └─────────┬────────────┘
              │
      ┌───────▼──────────┐
      │  Supabase Cloud  │
      │  (PostgreSQL +   │
      │   Auth)          │
      └──────────────────┘
```

### Authentication Flow

#### On App Load

```
1. AuthProvider initializes in app/layout.tsx
2. useEffect calls supabase.auth.getSession()
3. If session exists, user state is populated
4. Subscribe to onAuthStateChange() for real-time updates
5. Any auth event (sign-in, sign-out, token refresh) triggers subscription
6. User state updates → components re-render automatically
```

#### Sign-Up Flow

```
User → /auth page → Enter email/password → Click "Sign Up"
  → supabase.auth.signUp({ email, password })
  → User created in Supabase
  → Confirmation email sent (if enabled)
  → onAuthStateChange fires
  → User state updates
  → Redirect to / (homepage)
```

#### Sign-Out Flow

```
User clicks "Sign Out" → signOut() from useAuth()
  → supabase.auth.signOut()
  → Session invalidated
  → onAuthStateChange fires with session=null
  → User state = null
  → Protected pages redirect to /auth
```

### Supabase Client Architecture

The application uses **two distinct Supabase clients** for security:

#### Browser Client (`lib/supabase/client.ts`)

- **Environment**: Client-side React components
- **Uses**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
- **Used in**: Auth pages, auth-contexts.tsx
- **Permissions**: Limited by Row-Level Security (RLS) policies
- **Cannot**: Bypass security policies or access sensitive operations

#### Server Client (`lib/supabase/server.ts`)

- **Environment**: Server Components, API routes
- **Uses**: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (with cookie middleware)
- **Used in**: Future API routes, server-side operations
- **Permissions**: Can be configured with elevated credentials if needed
- **Benefits**: Secure session handling via cookies (not accessible to JavaScript)

### State Management

Using **React Context API** for simplicity and built-in React 19 support:

```typescript
interface AuthContextType {
  user: User | null;              // Supabase User object
  loading: boolean;               // Auth state loading indicator
  signOut: () => Promise<void>;   // Sign-out function
}
```

---

## 📊 Current Progress

### ✅ Completed

- [X] **Project Setup**

  - Next.js 16 with App Router
  - React 19 integration
  - TypeScript strict mode enabled
  - ESLint configuration
- [X] **Authentication System**

  - Supabase integration (browser + server clients)
  - Auth Context with useAuth() hook
  - Real-time session subscription (onAuthStateChange)
  - User state management and persistence
- [X] **Pages**

  - Landing page (`app/page.tsx`) with hero section
  - Authentication page (`app/auth/page.tsx`) with sign-up/sign-in toggle
  - Root layout with AuthProvider wrapper
- [X] **Styling**

  - Tailwind CSS v4 with PostCSS
  - Brand color system implemented
  - Responsive design patterns
  - Dark mode support (framework ready)
- [X] **Developer Experience**

  - Path aliases (`@/*` resolves to workspace root)
  - Environment configuration (.env.local setup)
  - AI agent coding guidelines (`.github/copilot-instructions.md`)
  - Development workflow documentation

### 🚧 In Progress / Known Issues

- [ ] **Auth State Bug**: `loading` state initialized to `false` but never set to `true`
  - Impact: No loading skeleton shown during initial auth check
  - Fix: Set `loading = true` at start of useEffect in `contexts/auth-contexts.tsx`

### ⏳ Planned (Next Phases)

- [ ] **User Profiles**

  - Profile schema (photos, bio, preferences)
  - Profile creation on sign-up
  - Profile editing interface
  - Photo upload functionality
- [ ] **Matching System**

  - User discovery algorithm
  - Swipe/like/pass interaction
  - Match notification system
- [ ] **Messaging**

  - Real-time chat using Supabase Realtime
  - Message history
  - Notifications
- [ ] **Safety & Moderation**

  - Report user functionality
  - Block/unblock users
  - Account deletion flow
- [ ] **Testing**

  - Jest unit tests
  - Integration tests
  - E2E tests with Cypress/Playwright
- [ ] **CI/CD**

  - GitHub Actions workflows
  - Automated linting and tests
  - Deployment pipeline

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Git
- Supabase account (free tier works for development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/montero-dev011024/montero-wc-dating-app.git
   cd montero-wc-dating-app
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Configure environment variables**
   Create `.env.local` in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
   ```

   Get these values from your Supabase project settings.
4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Development Guide

### Available Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint (check code quality)
npm run lint
```

### Key Files & Their Roles

| File                                | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| `app/layout.tsx`                  | Root layout, wraps app with AuthProvider |
| `app/page.tsx`                    | Landing page (homepage)                  |
| `app/auth/page.tsx`               | Authentication page (sign-up/sign-in)    |
| `contexts/auth-contexts.tsx`      | Auth state management, useAuth() hook    |
| `lib/supabase/client.ts`          | Browser Supabase client                  |
| `lib/supabase/server.ts`          | Server Supabase client                   |
| `tsconfig.json`                   | TypeScript configuration, path aliases   |
| `.github/copilot-instructions.md` | AI coding agent guidelines               |

### Common Development Patterns

#### Using Authentication in a Page

```typescript
'use client';  // Required for hooks
import { useAuth } from '@/contexts/auth-contexts';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
    </div>
  );
}
```

#### Creating a New Authenticated Page

1. Create `app/your-page/page.tsx`
2. Mark as `'use client'` if using hooks
3. Import `useAuth()` and redirect logic
4. Use the pattern above

#### Calling Supabase from a Server Component

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function ServerComponent() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(10);

  return <div>{/* render data */}</div>;
}
```

### Styling Best Practices

- Use **Tailwind CSS classes** for responsive layouts
- Use **inline styles** for brand colors:
  ```tsx
  style={{ backgroundColor: '#583C5C' }}  // Primary
  style={{ backgroundColor: '#E8B960' }}  // Accent
  style={{ backgroundColor: '#F7F4F3' }}  // Background
  ```
- Maintain **consistency** with existing components
- Test dark mode compatibility

---

## 📁 Project Structure

```
montero-wc-dating-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with AuthProvider
│   ├── page.tsx                 # Landing page
│   ├── auth/
│   │   └── page.tsx             # Auth page (sign-up/sign-in)
│   └── globals.css              # Global styles
│
├── contexts/
│   └── auth-contexts.tsx        # Auth state management
│
├── lib/
│   └── supabase/
│       ├── client.ts            # Browser client (anon key)
│       └── server.ts            # Server client (cookies)
│
├── public/                       # Static assets
│
├── .github/
│   └── copilot-instructions.md  # AI agent guidelines
│
├── .env.local                    # Environment variables (local)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
├── postcss.config.mjs            # PostCSS config (Tailwind)
├── eslint.config.mjs             # ESLint config
└── README.md                      # This file
```

---

## ✨ Key Features

### Authentication

- ✅ Email/password sign-up
- ✅ Email/password sign-in
- ✅ Real-time session sync across tabs/windows
- ✅ Automatic redirect for unauthenticated users
- ✅ Secure session handling via browser storage

### User Experience

- ✅ Responsive design (mobile-first)
- ✅ Brand-consistent styling
- ✅ Error messaging and validation
- ✅ Loading states (framework ready)
- ✅ Dark mode support (framework ready)

### Developer Experience

- ✅ TypeScript strict mode (type safety)
- ✅ ESLint configuration (code quality)
- ✅ Path aliases for clean imports (`@/...`)
- ✅ Comprehensive AI agent guidelines
- ✅ Clear architecture documentation

---

## ⚠️ Known Issues

### 1. Auth Loading State Bug

**Severity**: Medium
**File**: `contexts/auth-contexts.tsx`
**Issue**: The `loading` state is initialized to `false` and never set to `true` during the initial auth check.
**Impact**: Users don't see a loading skeleton when the app first loads and checks if they're logged in.
**Fix**:

```typescript
useEffect(() => {
  setLoading(true);  // ← Add this line
  async function checkUser() {
    // ... existing code ...
  } finally {
    setLoading(false);
  }
}, []);
```

### 2. Missing Race Condition Protection

**Severity**: Low
**File**: `app/auth/page.tsx` (when created for protected pages)
**Issue**: Protected pages should check both `user` and `loading` state to prevent redirect race conditions.
**Recommended**: Always use both conditions in useEffect redirects:

```typescript
useEffect(() => {
  if (!loading && !user) {
    router.push('/auth');
  }
}, [user, loading, router]);
```

---

## 🗺️ Roadmap

### Phase 1: Core (Current) ✅

- Authentication infrastructure
- Landing page
- Sign-up/sign-in flow
- User session management

### Phase 2: Profiles (Next)

- User profile schema
- Profile creation on sign-up
- Photo upload and gallery
- Profile editing interface

### Phase 3: Discovery & Matching

- User discovery algorithm
- Swipe/like/pass interactions
- Match notifications
- Match history

### Phase 4: Messaging

- Real-time chat
- Message history
- Notifications (push + in-app)
- Read receipts

### Phase 5: Safety & Polish

- Reporting system
- Block/unblock functionality
- Account deletion
- Advanced moderation

### Phase 6: Scale & Optimize

- Performance optimization
- Analytics integration
- A/B testing framework
- Subscription monetization (if applicable)

---

## 🤝 Contributing

### Code Style

- Follow TypeScript strict mode conventions
- Use React 19 patterns (hooks, functional components)
- Follow Tailwind CSS best practices
- Include comments for complex logic

### Commit Messages

Use conventional commits:

```
feat: add password reset flow
fix: correct auth loading state bug
docs: update README with roadmap
test: add auth context tests
chore: update dependencies
```

### Creating Pull Requests

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally: `npm run dev` and `npm run lint`
4. Commit with descriptive messages
5. Push to your branch: `git push origin feature/your-feature`
6. Open a pull request with a clear description

### Testing Before Commit

```bash
# Check for linting errors
npm run lint

# Run dev server and test manually
npm run dev
```

---

## 📞 Support & Questions

For questions about the codebase architecture, refer to:

- **AI Agent Guidelines**: `.github/copilot-instructions.md`
- **Code Comments**: Inline documentation in key files
- **This README**: For architecture overview

---

## 📄 License

This project is proprietary software developed for Whitecloak/Montero. All rights reserved.

---

## 👥 Team

- **Project**: Hearts Dating App
- **Organization**: Montero (Whitecloak)
- **Repository**: montero_whitecloak_builder_round
- **Owner**: montero-dev011024

---

## 🎉 Getting Help

### Debugging Tips

1. **Auth not persisting after page refresh?**

   - Check browser DevTools → Application → Cookies
   - Verify `.env.local` has correct Supabase URL and keys
2. **User stuck on auth page?**

   - Check browser console for errors
   - Verify Supabase project is running
   - Check Network tab for failed requests
3. **Styles not applying?**

   - Clear `.next` folder: `rm -r .next`
   - Restart dev server
   - Verify Tailwind config in `tailwind.config.ts`
4. **TypeScript errors?**

   - Ensure you have TypeScript 5+ installed
   - Run `npm run lint` to see all errors
   - Check `tsconfig.json` for strict mode settings

---

**Last Updated**: October 28, 2025
**Version**: 0.1.0 (Alpha)
**Status**: Active Development
