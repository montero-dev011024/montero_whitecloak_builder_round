/**
 * Supabase Browser Client
 * 
 * Creates a Supabase client for use in browser/client-side code.
 * Uses the anon (anonymous) key which respects Row Level Security policies.
 * Safe to use in client components and browser contexts.
 * 
 * Features:
 * - Automatic authentication state management
 * - Cookie-based session handling via @supabase/ssr
 * - RLS policy enforcement for data security
 * - Real-time subscription support
 * 
 * Usage:
 * - Client Components: Direct import and use
 * - Event Handlers: Safe for browser event handlers
 * - Real-time: Can subscribe to database changes
 * 
 * @module lib/supabase/client
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a browser-compatible Supabase client
 * Uses anon key which enforces RLS policies for security
 * 
 * @returns Supabase client for browser use
 * 
 * @example
 * ```typescript
 * "use client"
 * 
 * import { createClient } from "@/lib/supabase/client";
 * 
 * const supabase = createClient();
 * const { data: profile } = await supabase
 *   .from("users")
 *   .select("*")
 *   .eq("id", userId)
 *   .single();
 * ```
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}