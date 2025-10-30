# Developer Guide - Marahuyo Dating App

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Key Design Patterns](#key-design-patterns)
5. [Error Handling](#error-handling)
6. [Documentation Standards](#documentation-standards)
7. [Common Patterns](#common-patterns)
8. [Testing Guide](#testing-guide)

## Architecture Overview

Marahuyo is a modern dating application built with Next.js 15, featuring real-time chat, video calls, and a sophisticated matching system.

### Core Features
- **User Authentication**: Supabase Auth with email/password
- **Profile Management**: Complete profile editing with photo upload
- **Matching System**: Tinder-style swipe interface with mutual likes
- **Real-time Chat**: Stream Chat integration for messaging
- **Video Calls**: Stream Video SDK integration
- **Blocking System**: User blocking and unmatching functionality
- **Preferences**: Customizable discovery preferences

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime + Stream Chat
- **Video**: Stream Video SDK

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript strict mode

## Project Structure

```
montero-wc-dating-app/
├── app/                          # Next.js app directory
│   ├── auth/                     # Authentication pages
│   ├── block/                    # User blocking management
│   ├── chat/                     # Chat pages
│   ├── discover/                 # Discovery/matching pages
│   ├── profile/                  # Profile pages
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Landing page
├── components/                   # Reusable React components
│   ├── ErrorBoundary.tsx         # Global error boundary
│   ├── Navbar.tsx                # Navigation component
│   ├── StreamChatInterface.tsx   # Chat interface
│   └── ...
├── contexts/                     # React Context providers
│   └── auth-contexts.tsx         # Authentication context
├── lib/                          # Utility libraries
│   ├── actions/                  # Server actions
│   │   ├── blocks.ts             # Blocking system
│   │   ├── matches.ts            # Matching logic
│   │   ├── profile.ts            # Profile management
│   │   └── stream.ts             # Stream integration
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Client-side
│   │   ├── server.ts             # Server-side
│   │   └── admin.ts              # Admin client
│   ├── utils/                    # Utility functions
│   │   └── error-handler.ts      # Error handling utilities
│   └── helpers/                  # Helper functions
└── public/                       # Static assets
```

## Key Design Patterns

### 1. Server Actions Pattern

All data mutations and fetches happen through Next.js Server Actions:

```typescript
// lib/actions/matches.ts
"use server";

export async function likeUser(toUserId: string): Promise<LikeResponse> {
  const { supabase, userId } = await getCurrentUser();
  // Server-side logic here
}
```

### 2. Context Provider Pattern

Global state managed through React Context:

```typescript
// contexts/auth-contexts.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 3. Error Boundary Pattern

Component tree protected by Error Boundary:

```typescript
// app/layout.tsx
<ErrorBoundary>
  <AuthProvider>
    {children}
  </AuthProvider>
</ErrorBoundary>
```

### 4. Cosmic Theme Pattern

Consistent design language across all pages:

```typescript
// Background gradient
style={{ 
  background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" 
}}

// Golden accents
style={{ color: "hsl(45 90% 55%)" }}

// Glass-morphism
style={{ 
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)"
}}
```

## Error Handling

### Standard Error Response

All server actions return standardized responses:

```typescript
// Success
{ success: true, data?: T }

// Error
{ success: false, error: string, code?: string }
```

### Error Handling Utilities

Use the centralized error handling utilities:

```typescript
import { 
  logError, 
  getErrorMessage, 
  createErrorResponse 
} from "@/lib/utils/error-handler";

try {
  await someOperation();
} catch (error) {
  logError(error, "Context description");
  return createErrorResponse(error);
}
```

### Client-Side Error Handling

Components should handle errors gracefully:

```typescript
const [error, setError] = useState<string | null>(null);

try {
  const result = await someServerAction();
  if (!result.success) {
    setError(result.error);
    return;
  }
  // Handle success
} catch (err) {
  setError(getErrorMessage(err));
}
```

## Documentation Standards

### JSDoc Comments

All public functions must have JSDoc comments:

```typescript
/**
 * Fetches potential matches for the current user based on preferences
 * 
 * Excludes:
 * - Users already liked or passed on
 * - Users in blocking relationships
 * - Users not matching preference filters
 * 
 * @returns Array of UserProfile objects
 * @throws Error if user not authenticated
 * 
 * @example
 * ```typescript
 * const matches = await getPotentialMatches();
 * console.log(`Found ${matches.length} matches`);
 * ```
 */
export async function getPotentialMatches(): Promise<UserProfile[]> {
  // Implementation
}
```

### Component Documentation

Components should include prop documentation:

```typescript
interface ChatHeaderProps {
  /** User profile to display in header */
  user: UserProfile;
  /** Callback when video call is initiated */
  onVideoCall: () => void;
}

/**
 * Chat header component with user info and video call button
 * Displays user avatar, name, age, and actions
 */
export default function ChatHeader({ user, onVideoCall }: ChatHeaderProps) {
  // Implementation
}
```

## Common Patterns

### 1. Loading States

```typescript
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center" 
         style={{ background: "linear-gradient(...)" }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" 
             style={{ borderColor: "hsl(45 90% 55%)" }} />
        <p className="mt-4" style={{ color: "hsl(220 10% 65%)" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
```

### 2. Error States

```typescript
{error && (
  <div className="rounded-xl border px-4 py-3 text-sm font-medium" 
       style={{ 
         borderColor: "rgba(230, 57, 70, 0.3)", 
         backgroundColor: "rgba(230, 57, 70, 0.1)", 
         color: "hsl(0 70% 70%)" 
       }}>
    {error}
  </div>
)}
```

### 3. Form Submission

```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setSaving(true);
  setError(null);

  try {
    const result = await updateProfile(formData);
    if (!result.success) {
      setError(result.error || "Failed to update");
      return;
    }
    router.push("/profile");
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setSaving(false);
  }
}
```

### 4. Authenticated Actions

```typescript
const getCurrentUser = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Not authenticated.");
  }
  
  return { supabase, userId: user.id } as const;
};
```

## Testing Guide

### Running in Docker

The application is configured to run in Docker:

```bash
# Start the application
docker-compose up

# Run with logs
docker-compose up --build

# Stop the application
docker-compose down
```

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with new email
- [ ] Sign in with existing account
- [ ] Invalid credentials show error
- [ ] Email confirmation required

**Profile:**
- [ ] View profile loads correctly
- [ ] Edit profile updates successfully
- [ ] Photo upload works
- [ ] Preferences saved correctly

**Discovery:**
- [ ] Potential matches load
- [ ] Swipe right creates like
- [ ] Mutual like creates match
- [ ] No duplicates shown

**Chat:**
- [ ] Messages send/receive correctly
- [ ] Typing indicators work
- [ ] Video call initiates
- [ ] Real-time updates function

**Blocking:**
- [ ] Block user removes from matches
- [ ] Blocked users don't appear in discovery
- [ ] Unblock re-enables matching
- [ ] Chat channel properly disabled

## Best Practices

### 1. Always Use TypeScript

Define proper types for all data structures:

```typescript
interface UserProfile {
  id: string;
  full_name: string;
  // ... other fields
}
```

### 2. Handle Edge Cases

Consider and handle:
- Empty states
- Loading states
- Error states
- Network failures
- Authentication expiration

### 3. Consistent Styling

Use the cosmic theme throughout:
- Dark gradient backgrounds
- Golden accents (hsl(45 90% 55%))
- Glass-morphism effects
- Smooth transitions

### 4. Responsive Design

Ensure all components work on:
- Mobile devices (< 640px)
- Tablets (640px - 1024px)
- Desktop (> 1024px)

### 5. Security First

- Never expose API keys in client code
- Validate all user inputs
- Use server actions for sensitive operations
- Implement proper authentication checks

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stream Chat Documentation](https://getstream.io/chat/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated**: October 30, 2025
**Maintainer**: Development Team

