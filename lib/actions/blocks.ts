"use server";

import type { UserProfile } from "@/app/profile/page";
import { mapUserRowToProfile, userWithProfileSelect } from "@/lib/profile-utils";
import { StreamChat } from "stream-chat";
import { createClient } from "../supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type BlockedUserProfile = UserProfile & {
    blocked_at: string;
    reason: string | null;
};

interface BlockRecord {
    blocker_id: string;
    blocked_id: string;
    reason: string | null;
    created_at: string;
}

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

export async function unmatchUser(otherUserId: string) {
    const { supabase, userId } = await getAuthenticatedContext();

    const timestamp = new Date().toISOString();

    await clearMutualConnections(userId, otherUserId, timestamp);
    await createDisconnectHistory(userId, otherUserId, timestamp);
    await disableChatChannel(userId, otherUserId);

    return { success: true } as const;
}
