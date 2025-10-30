"use server";

import type { UserPreferences, UserProfile } from "@/app/profile/page";
import { mapUserRowToProfile, userWithProfileSelect } from "@/lib/profile-utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";

const MATCH_LIMIT = 50;

type LikeResponse =
    | { success: true; isMatch: false }
    | { success: true; isMatch: true; matchedUser: UserProfile };

const collectBlockedUserIds = async (
    supabase: SupabaseClient,
    userId: string
): Promise<Set<string>> => {
    const { data: relations, error } = await supabase
        .from("blocks")
        .select("blocker_id, blocked_id")
        .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    if (error) {
        throw new Error("Failed to resolve block relationships");
    }

    const blocked = new Set<string>();

    for (const relation of relations ?? []) {
        if (relation.blocker_id === userId) {
            blocked.add(relation.blocked_id);
        }
        if (relation.blocked_id === userId) {
            blocked.add(relation.blocker_id);
        }
    }

    return blocked;
};

const getCurrentUser = async () => {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated.");
    }

    return { supabase, userId: user.id } as const;
};

export async function getPotentialMatches(): Promise<UserProfile[]> {
    const { supabase, userId } = await getCurrentUser();

    const blockedUserIds = await collectBlockedUserIds(supabase, userId);

    const { data: potentialMatches, error } = await supabase
        .from("users")
        .select(userWithProfileSelect)
        .neq("id", userId)
        .limit(MATCH_LIMIT);

    if (error) {
        throw new Error("Failed to fetch potential matches");
    }

    const { data: userPrefs, error: prefsError } = await supabase
        .from("users")
        .select("preferences")
        .eq("id", userId)
        .single();

    if (prefsError) {
        throw new Error("Failed to get user preferences");
    }

    const currentUserPrefs = (userPrefs.preferences ?? null) as
        | UserPreferences
        | null;
    const genderPreferences = currentUserPrefs?.gender_preferences ?? [];

    return (potentialMatches ?? [])
        .filter((match) => !blockedUserIds.has(match.id))
        .filter((match) => {
            if (!genderPreferences.length) {
                return true;
            }

            return genderPreferences.includes(match.gender);
        })
        .map((match) => mapUserRowToProfile(match));
}

export async function likeUser(toUserId: string): Promise<LikeResponse> {
    const { supabase, userId } = await getCurrentUser();

    if (userId === toUserId) {
        throw new Error("You cannot like yourself.");
    }

    const blocked = await collectBlockedUserIds(supabase, userId);

    if (blocked.has(toUserId)) {
        throw new Error("Cannot like a user you have blocked or who has blocked you.");
    }

    const { error: likeError } = await supabase.from("likes").insert({
        from_user_id: userId,
        to_user_id: toUserId,
    });

    if (likeError) {
        if (likeError.code === "23505") {
            const { error: reactivateError } = await supabase
                .from("likes")
                .update({
                    is_active: true,
                    unliked_at: null,
                })
                .eq("from_user_id", userId)
                .eq("to_user_id", toUserId);

            if (reactivateError) {
                throw new Error("Failed to reactivate like");
            }
        } else {
            throw new Error("Failed to create like");
        }
    }

    const { data: existingLike, error: checkError } = await supabase
        .from("likes")
        .select("*")
        .eq("from_user_id", toUserId)
        .eq("to_user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
        throw new Error("Failed to check for match");
    }

    if (!existingLike) {
        return { success: true, isMatch: false };
    }

    const { data: matchedUser, error: userError } = await supabase
        .from("users")
        .select(userWithProfileSelect)
        .eq("id", toUserId)
        .maybeSingle();

    if (userError || !matchedUser) {
        throw new Error("Failed to fetch matched user");
    }

    return {
        success: true,
        isMatch: true,
        matchedUser: mapUserRowToProfile(matchedUser),
    };
}

export async function getUserMatches(): Promise<UserProfile[]> {
    const { supabase, userId } = await getCurrentUser();

    const blockedUserIds = await collectBlockedUserIds(supabase, userId);

    const { data: matches, error } = await supabase
        .from("matches")
        .select("*")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq("is_active", true);

    if (error) {
        throw new Error("Failed to fetch matches");
    }

    const matchedProfiles: UserProfile[] = [];

    for (const match of matches ?? []) {
        const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;

        if (blockedUserIds.has(otherUserId)) {
            continue;
        }

        const { data: otherUser, error: userError } = await supabase
            .from("users")
            .select(userWithProfileSelect)
            .eq("id", otherUserId)
            .maybeSingle();

        if (userError || !otherUser) {
            continue;
        }

        matchedProfiles.push(mapUserRowToProfile(otherUser));
    }

    return matchedProfiles;
}