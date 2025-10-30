/**
 * Supabase Admin Client
 * 
 * Creates a Supabase client with admin/service role privileges.
 * This client bypasses Row Level Security (RLS) policies and should only
 * be used in server-side code for administrative operations.
 * 
 * Use Cases:
 * - Deleting data across user boundaries (e.g., clearing matches when blocking)
 * - Reading data without RLS restrictions
 * - Bulk operations that need elevated permissions
 * 
 * Security Note:
 * - NEVER expose this client to the browser
 * - Only use in server actions (files marked with "use server")
 * - Validate all user inputs before using with admin client
 * 
 * @module lib/supabase/admin
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with service role (admin) privileges
 * Uses service role key which bypasses all RLS policies
 * 
 * @returns Supabase client with admin access
 * @throws Error if environment variables are missing
 * 
 * @example
 * ```typescript
 * const adminSupabase = createAdminClient();
 * // Can delete across user boundaries
 * await adminSupabase.from("matches").delete().eq("user1_id", userId);
 * ```
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error("Missing Supabase service role configuration.");
    }

    return createClient(url, serviceKey);
}
