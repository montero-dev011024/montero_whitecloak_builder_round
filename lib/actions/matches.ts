"use server";

/**
 * Matching System Actions
 * 
 * Server-side functions for handling user matching logic including:
 * - Finding potential matches based on user preferences
 * - Liking/passing on profiles
 * - Detecting mutual likes (matches)
 * - Managing user's match list
 * 
 * @module lib/actions/matches
 */

import type { UserPreferences, UserProfile } from "@/app/profile/page";
import { mapUserRowToProfile, userWithProfileSelect } from "@/lib/profile-utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";

/** Maximum number of potential matches to return at once */
const MATCH_LIMIT = 50;

/**
 * Response type for the likeUser function
 * Indicates whether the like resulted in a mutual match
 */
type LikeResponse =
    | { success: true; isMatch: false }
    | { success: true; isMatch: true; matchedUser: UserProfile };

/**
 * Collects all user IDs that are in a blocking relationship with the given user
 * Includes both users that this user has blocked and users who have blocked this user
 * 
 * @param supabase - Supabase client instance
 * @param userId - ID of the current user
 * @returns Set of blocked user IDs
 * @throws Error if database query fails
 * @private
 */
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

/**
 * Gets the current authenticated user's context
 * 
 * @returns Object containing Supabase client and user ID
 * @throws Error if user is not authenticated
 * @private
 */
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

/**
 * Fetches potential matches for the current user based on their preferences
 * 
 * Excludes:
 * - The current user themselves
 * - Users the current user has already liked or passed on
 * - Users the current user has already matched with
 * - Users in blocking relationships (both directions)
 * - Users who don't match the gender preference filters
 * 
 * @returns Array of UserProfile objects matching user's preferences
 * @throws Error if user not authenticated or database query fails
 * 
 * @example
 * ```typescript
 * const matches = await getPotentialMatches();
 * console.log(`Found ${matches.length} potential matches`);
 * ```
 */
export async function getPotentialMatches(): Promise<UserProfile[]> {
    const { supabase, userId } = await getCurrentUser();

    const blockedUserIds = await collectBlockedUserIds(supabase, userId);

    // Get users that current user has already interacted with (liked or passed)
    const { data: existingLikes, error: likesError } = await supabase
        .from("likes")
        .select("to_user_id")
        .eq("from_user_id", userId);

    if (likesError) {
        throw new Error("Failed to fetch existing interactions");
    }

    const interactedUserIds = new Set(existingLikes?.map((like) => like.to_user_id) ?? []);

    // Get users that current user has matched with
    const { data: existingMatches, error: matchesError } = await supabase
        .from("matches")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq("is_active", true);

    if (matchesError) {
        throw new Error("Failed to fetch existing matches");
    }

    // Add matched user IDs to the set of users to exclude
    for (const match of existingMatches ?? []) {
        const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
        interactedUserIds.add(otherUserId);
    }

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
        .filter((match) => !interactedUserIds.has(match.id)) // Exclude already liked/passed/matched users
        .filter((match) => {
            if (!genderPreferences.length) {
                return true;
            }

            return genderPreferences.includes(match.gender);
        })
        .map((match) => mapUserRowToProfile(match));
}

/**
 * Records a "like" from the current user to another user
 * Checks if the other user has also liked them back (mutual like = match)
 * 
 * @param toUserId - ID of the user being liked
 * @returns Object indicating success and whether it resulted in a match
 * @throws Error if user tries to like themselves, a blocked user, or on database failure
 * 
 * @example
 * ```typescript
 * const result = await likeUser("user-123");
 * if (result.isMatch) {
 *   console.log("It's a match!", result.matchedUser);
 * }
 * ```
 */
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

/**
 * Fetches all matched users (mutual likes) for the current user
 * Excludes users in blocking relationships
 * 
 * @returns Array of UserProfile objects representing matched users
 * @throws Error if user not authenticated or database query fails
 * 
 * @example
 * ```typescript
 * const matches = await getUserMatches();
 * console.log(`You have ${matches.length} matches!`);
 * matches.forEach(match => {
 *   console.log(`Matched with ${match.full_name}`);
 * });
 * ```
 */
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