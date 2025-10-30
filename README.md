# Marahuyo Dating App 💫

A modern, full-stack dating application built with **Next.js 16**, **React 19**, **Supabase**, **Stream Chat & Video**, and **Tailwind CSS v4**. Features a cosmic-themed UI, real-time messaging, video calls, and intelligent matching system.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Known Issues](#known-issues)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## 🎯 Project Overview

**Marahuyo** (Filipino: "to be enchanted") is a feature-complete dating application designed to help users find meaningful connections through an intuitive, cosmic-themed interface. The app includes real-time messaging, video calling, intelligent matching algorithms, and comprehensive user profiles.

### Core Philosophy

- **User Safety First**: Block/unblock functionality, match validation, and secure communication
- **Real-time Experience**: Live messaging, typing indicators, and instant match notifications
- **Privacy Focused**: Row-level security, secure file uploads, and controlled data access
- **Beautiful UX**: Cosmic theme with glass-morphism, golden accents, and smooth animations

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│         Next.js 16 App Router (React 19)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  app/layout.tsx → <AuthProvider>                  │  │
│  │  + <MessageNotificationListener>                  │  │
│  │  Wraps entire application                         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │
    ┌────┴──────┬──────────────┬──────────────┐
    │            │              │              │
  Landing    Auth Page    Discover Page   Profile Page
  (Home)     (Sign In/Up)  (Swipe Cards)  (View/Edit)
    │            │              │              │
    └────────┬───┴──────────────┴──────────────┘
             │
       ┌─────▼────────────────┐
       │ AuthContext (Client) │
       │ useAuth() hook       │
       │ + Activity Tracking  │
       └─────┬────────────────┘
             │
    ┌────────┴─────────────┐
    │                      │
Supabase Client      Stream Chat/Video
(Auth + Database)    (Messaging + Calls)
    │                      │
    └─────────┬────────────┘
              │
      ┌───────▼──────────┐
      │  Backend Stack   │
      │  - Supabase DB   │
      │  - Supabase Auth │
      │  - Stream API    │
      └──────────────────┘
```

### Key Components

#### Authentication System
- **AuthProvider**: Global auth state management with React Context
- **Online Status**: Real-time presence tracking with 60-second heartbeat
- **Session Management**: Automatic refresh and cross-tab synchronization
- **Protected Routes**: Conditional rendering based on auth state

#### Database Architecture
- **users**: Core user data (name, bio, birthdate, preferences)
- **profiles**: Extended details (photos, physical attributes, lifestyle)
- **matches**: Mutual likes and match relationships
- **likes**: User like/pass actions for discovery
- **blocks**: Blocked user relationships
- **user_interests**: User's selected interests

#### Real-time Features
- **Stream Chat**: Powered by Stream Chat SDK
  - One-on-one messaging
  - Typing indicators
  - Message history
  - Read receipts
  - Channel management
- **Stream Video**: Powered by Stream Video SDK
  - WebRTC video calls
  - Audio/video controls
  - Screen sharing capability
  - Call quality optimization
- **Supabase Realtime**: Database change subscriptions
  - New match notifications
  - Profile updates
  - Match list synchronization

---

## ✨ Features

### Completed Features

#### 🔐 Authentication & Security
- ✅ Email/password authentication
- ✅ Email verification
- ✅ Session persistence across tabs
- ✅ Automatic token refresh
- ✅ Protected route guards
- ✅ Online/offline status tracking
- ✅ Activity heartbeat (60-second updates)

#### 👤 User Profiles
- ✅ Complete profile creation and editing
- ✅ Profile picture upload to Supabase Storage
- ✅ Rich profile details (height, education, occupation, lifestyle)
- ✅ Bio and personal information
- ✅ Birthdate with automatic age calculation
- ✅ Relationship goals and preferences
- ✅ Profile picture with live preview

#### 💖 Discovery & Matching
- ✅ Tinder-style swipeable cards
- ✅ Swipe left (pass) / right (like) interactions
- ✅ Mutual match detection
- ✅ Match notification with instant chat option
- ✅ Discovery preferences (age, distance, gender)
- ✅ Real-time preference editing
- ✅ Filter matches based on preferences
- ✅ Prevent showing matched/blocked users

#### 💬 Messaging
- ✅ Real-time one-on-one chat via Stream Chat
- ✅ Message history with pagination
- ✅ Typing indicators
- ✅ Message timestamps (Philippine timezone)
- ✅ Auto-scroll to latest messages
- ✅ Manual scroll-to-bottom button
- ✅ Toast notifications for new messages
- ✅ Message notification listener (global)

#### 📹 Video Calling
- ✅ WebRTC-powered video calls via Stream Video
- ✅ Call initiation from chat header
- ✅ Incoming call notifications
- ✅ Accept/decline call options
- ✅ Built-in call controls (camera, mic, end call)
- ✅ Speaker layout for participants
- ✅ Full-screen call interface

#### 🎯 Matches Management
- ✅ Grid view of all active matches
- ✅ Real-time match updates (Supabase subscriptions)
- ✅ Unmatch functionality with confirmation
- ✅ Block user with optional reason
- ✅ Navigate to chat from matches
- ✅ View blocked users list
- ✅ Unblock users

#### 🎨 User Interface
- ✅ Cosmic theme with gradient backgrounds
- ✅ Animated starfield on landing/auth pages
- ✅ Glass-morphism design elements
- ✅ Golden accent colors throughout
- ✅ Responsive design (mobile to desktop)
- ✅ Loading states and skeletons
- ✅ Error boundaries for crash prevention
- ✅ Toast notifications with auto-dismiss
- ✅ Smooth animations and transitions
- ✅ Icon-based visual indicators

#### 🛡️ Safety Features
- ✅ Block/unblock users
- ✅ Blocked users management page
- ✅ Block reason tracking
- ✅ Prevent discovery of blocked users
- ✅ Remove matches on block
- ✅ Row-level security policies

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 + PostCSS
- **State Management**: React Context API
- **Image Handling**: Next.js Image component

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (profile photos)
- **Realtime**: Supabase Realtime (subscriptions)
- **Messaging**: Stream Chat SDK
- **Video Calls**: Stream Video SDK

### Development Tools
- **Package Manager**: npm
- **Linter**: ESLint
- **TypeScript Config**: Path aliases (`@/*`)
- **Environment**: `.env.local` for secrets

### Design System
- **Primary**: `hsl(45 90% 55%)` (Golden)
- **Accent**: `hsl(25 85% 55%)` (Warm Orange)
- **Background**: `linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))` (Cosmic)
- **Text**: `hsl(220 10% 65%)` to `hsl(220 10% 95%)` (Gray scale)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Git
- Supabase account (free tier works)
- Stream account (free tier works)

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
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Stream Configuration
   NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key_here
   STREAM_API_SECRET=your_stream_api_secret_here
   ```

   **Getting Supabase Keys:**
   - Go to your Supabase project dashboard
   - Settings → API → Project URL and API Keys
   - Copy `URL`, `anon/public key`, and `service_role key`

   **Getting Stream Keys:**
   - Go to your Stream dashboard
   - Create a new app or select existing
   - Copy `App ID` (API Key) and `Secret`

4. **Set up Supabase Database**

   Run the SQL schema from `docs/DATABASE_ARCHITECTURE_DIAGRAM.md` in your Supabase SQL editor to create all necessary tables and policies.

5. **Start the development server**

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

### Project Structure

```
montero-wc-dating-app/
├── app/                              # Next.js App Router
│   ├── layout.tsx                   # Root layout with AuthProvider
│   ├── page.tsx                     # Landing page (home)
│   ├── auth/
│   │   └── page.tsx                 # Authentication (sign in/up)
│   ├── discover/
│   │   ├── page.tsx                 # Swipe/discovery page
│   │   └── list/
│   │       └── page.tsx             # Matches list
│   ├── chat/
│   │   ├── page.tsx                 # Chat list/inbox
│   │   └── [userId]/
│   │       └── page.tsx             # Individual chat
│   ├── profile/
│   │   ├── page.tsx                 # Profile view
│   │   └── edit/
│   │       └── page.tsx             # Profile editor
│   ├── block/
│   │   └── page.tsx                 # Blocked users management
│   └── globals.css                  # Global styles
│
├── components/                       # Reusable React components
│   ├── ChatHeader.tsx               # Chat conversation header
│   ├── ErrorBoundary.tsx            # Error boundary wrapper
│   ├── MatchCard.tsx                # Swipeable match card
│   ├── MatchNotification.tsx        # Match notification toast
│   ├── MessageNotification.tsx      # Message notification toast
│   ├── MessageNotificationListener.tsx  # Global message listener
│   ├── Navbar.tsx                   # Global navigation bar
│   ├── PhotoUpload.tsx              # Profile photo upload
│   ├── StreamChatInterface.tsx      # Chat interface
│   ├── SwipeableCard.tsx            # Swipeable card wrapper
│   └── VideoCall.tsx                # Video call interface
│
├── contexts/
│   └── auth-contexts.tsx            # Auth state management
│
├── lib/
│   ├── actions/                     # Server actions
│   │   ├── blocks.ts                # Block/unblock actions
│   │   ├── matches.ts               # Match actions
│   │   ├── profile.ts               # Profile actions
│   │   └── stream.ts                # Stream Chat/Video actions
│   ├── helpers/
│   │   └── calculate-age.ts         # Age calculation utilities
│   ├── supabase/
│   │   ├── admin.ts                 # Admin client (service role)
│   │   ├── client.ts                # Browser client (anon key)
│   │   └── server.ts                # Server client (cookies)
│   ├── utils/
│   │   └── error-handler.ts         # Error handling utilities
│   └── profile-utils.ts             # Profile mapping utilities
│
├── public/                          # Static assets
│   ├── marahuyo.png                # App logo
│   └── default-avatar.svg          # Default profile picture
│
├── docs/                            # Documentation
│   └── DATABASE_ARCHITECTURE_DIAGRAM.md  # Database schema
│
├── .env.local                       # Environment variables (local)
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── next.config.ts                   # Next.js config
├── postcss.config.mjs               # PostCSS config (Tailwind)
├── eslint.config.mjs                # ESLint config
└── README.md                        # This file
```

### Common Development Patterns

#### Using Authentication in a Page

```typescript
'use client';
import { useAuth } from '@/contexts/auth-contexts';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Welcome, {user.email}</div>;
}
```

#### Creating a Server Action

```typescript
'use server';
import { createClient } from '@/lib/supabase/server';

export async function myServerAction() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Your logic here
  
  return { success: true };
}
```

#### Calling Stream Chat

```typescript
import { getStreamUserToken, createOrGetChannel } from '@/lib/actions/stream';
import { StreamChat } from 'stream-chat';

// Get token and connect
const { token, userId, userName } = await getStreamUserToken();
const client = StreamChat.getInstance(API_KEY);
await client.connectUser({ id: userId, name: userName }, token);

// Create/get channel
const { channelId } = await createOrGetChannel(otherUserId);
const channel = client.channel('messaging', channelId);
await channel.watch();
```

---

## 📖 Documentation

### Code Documentation

All major files include comprehensive JSDoc comments explaining:
- **Purpose and overview**
- **Key features**
- **Parameters and return types**
- **Usage examples**
- **Integration notes**

Documented files include:
- All components (`components/*.tsx`)
- All pages (`app/**/*.tsx`)
- All server actions (`lib/actions/*.ts`)
- All utility functions (`lib/**/*.ts`)
- Context providers (`contexts/*.tsx`)

### Architecture Documentation

- **Database Schema**: See `docs/DATABASE_ARCHITECTURE_DIAGRAM.md`
- **API Documentation**: Inline JSDoc comments in action files
- **Component Props**: TypeScript interfaces with inline documentation

---

## ⚠️ Known Issues

### Current Limitations

1. **Location-based Discovery**
   - Distance filtering is implemented but requires user location input
   - No automatic geolocation integration yet

2. **Profile Photos**
   - Single photo upload only
   - No photo gallery support yet

3. **Notifications**
   - In-app notifications only
   - No push notification support yet

4. **Search & Filters**
   - Basic preference filtering only
   - No advanced search or filter options

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅ (Complete)
- ✅ Authentication system
- ✅ User profiles with editing
- ✅ Discovery/swiping interface
- ✅ Matching system
- ✅ Real-time messaging
- ✅ Video calling
- ✅ Block/unblock functionality

### Phase 2: Enhanced Features (Current)
- [ ] Photo gallery (multiple photos per user)
- [ ] Advanced filters and search
- [ ] User interests and tags
- [ ] Profile verification badges
- [ ] Report user functionality

### Phase 3: Mobile & Performance
- [ ] Progressive Web App (PWA) support
- [ ] Push notifications
- [ ] Offline message queuing
- [ ] Image optimization
- [ ] Performance monitoring

### Phase 4: Social Features
- [ ] User reviews/ratings
- [ ] Icebreaker prompts
- [ ] Voice messages
- [ ] Photo reactions
- [ ] Story feature

### Phase 5: Business & Analytics
- [ ] Subscription tiers
- [ ] Analytics dashboard
- [ ] A/B testing framework
- [ ] Admin panel
- [ ] Content moderation tools

---

## 🤝 Contributing

### Code Style

- Follow TypeScript strict mode conventions
- Use React 19 patterns (hooks, functional components)
- Follow Tailwind CSS best practices
- Include JSDoc comments for functions and components
- Write self-documenting code with clear variable names

### Commit Messages

Use conventional commits:

```
feat: add photo gallery feature
fix: correct match notification timing
docs: update README with new features
style: apply cosmic theme to settings page
refactor: optimize discovery algorithm
test: add match creation tests
chore: update dependencies
```

### Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes with clear commits
3. Test locally: `npm run dev` and `npm run lint`
4. Update documentation if needed
5. Push to your branch: `git push origin feature/your-feature`
6. Open a pull request with:
   - Clear description of changes
   - Screenshots for UI changes
   - Testing steps
   - Related issue numbers

### Testing Checklist

- [ ] Code runs without errors
- [ ] ESLint passes (`npm run lint`)
- [ ] Manual testing completed
- [ ] No console errors in browser
- [ ] Responsive design verified
- [ ] Dark mode compatible (if applicable)

---

## 🎉 Getting Help

### Debugging Tips

1. **Authentication issues?**
   - Check browser DevTools → Application → Cookies
   - Verify `.env.local` has correct Supabase credentials
   - Check Supabase dashboard for auth logs

2. **Chat not working?**
   - Verify Stream API credentials in `.env.local`
   - Check browser console for Stream connection errors
   - Ensure users are matched before accessing chat

3. **Styles not applying?**
   - Clear `.next` folder: `rm -rf .next`
   - Restart dev server
   - Check Tailwind config

4. **TypeScript errors?**
   - Run `npm run lint` to see all errors
   - Check `tsconfig.json` for strict mode settings
   - Ensure all dependencies are installed

### Common Error Messages

| Error | Solution |
|-------|----------|
| "User not authenticated" | Sign in again, check session |
| "Match not found" | Users must mutually like each other |
| "Failed to upload photo" | Check file size (max 5MB) and format |
| "Stream connection failed" | Verify Stream API credentials |

---

**Last Updated**: October 30, 2025  
**Version**: 1.0.0 (Production Ready)  
**Status**: Feature Complete - Ready for Testing
