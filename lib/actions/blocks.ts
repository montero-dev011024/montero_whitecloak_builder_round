"use server";

/**
 * User Blocking System Actions
 * 
 * Server-side functions for managing user blocks and unmatching:
 * - Block/unblock users
 * - Fetch blocked users list
 * - Unmatch users without blocking
 * - Clean up related data (likes, matches, chat channels)
 * 
 * @module lib/actions/blocks
 */

import type { UserProfile } from "@/app/profile/page";
import { mapUserRowToProfile, userWithProfileSelect } from "@/lib/profile-utils";
import { StreamChat } from "stream-chat";
import { createClient } from "../supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Extended user profile that includes blocking metadata
 */
export type BlockedUserProfile = UserProfile & {
    /** Timestamp when the user was blocked */
    blocked_at: string;
    /** Optional reason provided for blocking */
    reason: string | null;
};

/**
 * Database record structure for blocks table
 * @private
 */
interface BlockRecord {
    blocker_id: string;
    blocked_id: string;
    reason: string | null;
    created_at: string;
}

/**
 * Gets the current authenticated user's context
 * 
 * @returns Object containing Supabase client and user ID
 * @throws Error if user is not authenticated
 * @private
 */
const getAuthenticatedContext = async () => {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated.");
    }

    return { supabase, userId: user.id } as const;
};

/**
 * Removes all connection data between two users (matches and likes)
 * Used when blocking or unmatching users
 * 
 * @param currentUserId - ID of the initiating user
 * @param otherUserId - ID of the target user
 * @param timestamp - Timestamp for the disconnection
 * @throws Error if database operations fail
 * @private
 */
const clearMutualConnections = async (
    currentUserId: string,
    otherUserId: string,
    timestamp: string
) => {
    const adminSupabase = createAdminClient();

    const { error: matchDeleteError } = await adminSupabase
        .from("matches")
        .delete()
        .or(
            `and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`
        );

    if (matchDeleteError) {
        throw new Error("Failed to remove match entry");
    }

    const { error: likeDeleteError } = await adminSupabase
        .from("likes")
        .delete()
        .or(
            `and(from_user_id.eq.${currentUserId},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${currentUserId})`
        );

    if (likeDeleteError) {
        throw new Error("Failed to clear likes for both users");
    }
};

/**
 * Creates a historical record of disconnection in the likes table
 * Marks the like as inactive for future reference
 * 
 * @param currentUserId - ID of the initiating user
 * @param otherUserId - ID of the target user
 * @param timestamp - Timestamp when the disconnection occurred
 * @private
 */
const createDisconnectHistory = async (
    currentUserId: string,
    otherUserId: string,
    timestamp: string
) => {
    const adminSupabase = createAdminClient();

    await adminSupabase
        .from("likes")
        .upsert(
            {
                from_user_id: currentUserId,
                to_user_id: otherUserId,
                is_active: false,
                unliked_at: timestamp,
            },
            { onConflict: "from_user_id,to_user_id" }
        );
};

/**
 * Generates a consistent channel ID for Stream Chat based on two user IDs
 * Uses a deterministic hash to ensure the same channel ID regardless of parameter order
 * 
 * @param firstUserId - First user ID
 * @param secondUserId - Second user ID
 * @returns Consistent channel ID for the user pair
 * @private
 */
const computeChannelId = (firstUserId: string, secondUserId: string) => {
    const sortedIds = [firstUserId, secondUserId].sort();
    const combinedIds = sortedIds.join("_");

    let hash = 0;
    for (let index = 0; index < combinedIds.length; index += 1) {
        const charCode = combinedIds.charCodeAt(index);
        hash = (hash << 5) - hash + charCode;
        hash |= 0;
    }

    return `match_${Math.abs(hash).toString(36)}`;
};

/**
 * Deletes the Stream Chat channel between two users
 * Gracefully handles cases where the channel doesn't exist
 * 
 * @param currentUserId - ID of the first user
 * @param otherUserId - ID of the second user
 * @private
 */
const disableChatChannel = async (currentUserId: string, otherUserId: string) => {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
        return;
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    const channelId = computeChannelId(currentUserId, otherUserId);
    const channel = serverClient.channel("messaging", channelId);

    try {
        await channel.delete();
    } catch (error) {
        if (error instanceof Error && error.message.includes("does not exist")) {
            return;
        }

        console.error("Failed to remove Stream channel", error);
    }
};

/**
 * Fetches the list of users blocked by the current user
 * Includes full profile information and blocking metadata
 * 
 * @returns Array of blocked user profiles with blocking details
 * @throws Error if user not authenticated or database query fails
 * 
 * @example
 * ```typescript
 * const blockedUsers = await getBlockedUsers();
 * blockedUsers.forEach(user => {
 *   console.log(`Blocked ${user.full_name} on ${user.blocked_at}`);
 *   if (user.reason) {
 *     console.log(`Reason: ${user.reason}`);
 *   }
 * });
 * ```
 */
export async function getBlockedUsers(): Promise<BlockedUserProfile[]> {
    const { supabase, userId } = await getAuthenticatedContext();

    const { data: blockRows, error } = await supabase
        .from("blocks")
        .select("blocked_id, created_at, reason")
        .eq("blocker_id", userId);

    if (error) {
        throw new Error("Failed to load blocked users");
    }

    if (!blockRows?.length) {
        return [];
    }

    const blockedIds = blockRows.map((row) => row.blocked_id);

    const { data: userRows, error: usersError } = await supabase
        .from("users")
        .select(userWithProfileSelect)
        .in("id", blockedIds);

    if (usersError) {
        throw new Error("Failed to load blocked user profiles");
    }

    const userMap = new Map<string, any>();
    for (const row of userRows ?? []) {
        userMap.set(row.id, row);
    }

    const results: BlockedUserProfile[] = [];

    for (const block of blockRows as BlockRecord[]) {
        const userRow = userMap.get(block.blocked_id);
        if (!userRow) {
            continue;
        }

        results.push({
            ...mapUserRowToProfile(userRow),
            blocked_at: block.created_at,
            reason: block.reason,
        });
    }

    return results;
}

/**
 * Blocks a user, preventing all future interactions
 * Also removes any existing matches, likes, and chat channels
 * 
 * @param blockedUserId - ID of the user to block
 * @param options - Optional parameters including block reason
 * @returns Success status object
 * @throws Error if user tries to block themselves or on database failure
 * 
 * @example
 * ```typescript
 * await blockUser("user-789", { reason: "Inappropriate behavior" });
 * console.log("User blocked successfully");
 * ```
 */
export async function blockUser(blockedUserId: string, options?: { reason?: string | null }) {
    const { supabase, userId } = await getAuthenticatedContext();

    if (blockedUserId === userId) {
        throw new Error("You cannot block yourself.");
    }

    const timestamp = new Date().toISOString();

    const { error } = await supabase
        .from("blocks")
        .upsert(
            {
                blocker_id: userId,
                blocked_id: blockedUserId,
                reason: options?.reason ?? null,
                created_at: timestamp,
            },
            { onConflict: "blocker_id,blocked_id" }
        );

    if (error) {
        throw new Error("Failed to block user");
    }

    await clearMutualConnections(userId, blockedUserId, timestamp);
    await disableChatChannel(userId, blockedUserId);

    return { success: true } as const;
}

/**
 * Unblocks a previously blocked user
 * Allows them to appear in matches again and re-enables interactions
 * Does NOT restore previous matches or messages
 * 
 * @param blockedUserId - ID of the user to unblock
 * @returns Success status object
 * @throws Error if database operation fails
 * 
 * @example
 * ```typescript
 * await unblockUser("user-789");
 * console.log("User unblocked - they can now match with you again");
 * ```
 */
export async function unblockUser(blockedUserId: string) {
    const { supabase, userId } = await getAuthenticatedContext();

    const { error } = await supabase
        .from("blocks")
        .delete()
        .eq("blocker_id", userId)
        .eq("blocked_id", blockedUserId);

    if (error) {
        throw new Error("Failed to unblock user");
    }

    return { success: true } as const;
}

/**
 * Removes a match with another user without blocking them
 * Clears all connection data and disables the chat channel
 * The other user may still like you in the future
 * 
 * @param otherUserId - ID of the matched user to unmatch
 * @returns Success status object
 * @throws Error if user not authenticated or operation fails
 * 
 * @example
 * ```typescript
 * await unmatchUser("user-321");
 * console.log("Match removed - chat channel closed");
 * ```
 */
export async function unmatchUser(otherUserId: string) {
    const { supabase, userId } = await getAuthenticatedContext();

    const timestamp = new Date().toISOString();

    await clearMutualConnections(userId, otherUserId, timestamp);
    await createDisconnectHistory(userId, otherUserId, timestamp);
    await disableChatChannel(userId, otherUserId);

    return { success: true } as const;
}
