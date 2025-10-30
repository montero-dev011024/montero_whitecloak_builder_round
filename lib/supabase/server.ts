/**
 * Supabase Server Client
 * 
 * Creates a Supabase client for use in server-side code (Server Components, Server Actions).
 * Handles authentication via cookies and respects Row Level Security policies.
 * 
 * Features:
 * - Server-side cookie management via Next.js cookies()
 * - Automatic session refresh
 * - RLS policy enforcement
 * - Optimized for server-side rendering
 * 
 * Usage:
 * - Server Components: For fetching data during SSR
 * - Server Actions: For mutations and authenticated operations
 * - API Routes: For building backend endpoints
 * 
 * Cookie Handling:
 * - getAll(): Reads all cookies for authentication
 * - setAll(): Updates cookies (ignored in Server Components, handled by middleware)
 * 
 * @module lib/supabase/server
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a server-side Supabase client with cookie-based authentication
 * Async function that accesses Next.js cookies for session management
 * 
 * @returns Promise resolving to Supabase client for server use
 * 
 * @example
 * ```typescript
 * "use server"
 * 
 * import { createClient } from "@/lib/supabase/server";
 * 
 * export async function getProfile() {
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   
 *   if (!user) return null;
 *   
 *   const { data: profile } = await supabase
 *     .from("users")
 *     .select("*")
 *     .eq("id", user.id)
 *     .single();
 *   
 *   return profile;
 * }
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}