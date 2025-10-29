    "use server";

    import { UserPreferences, UserProfile } from "@/app/profile/page";
    import { createClient } from "../supabase/server";

    const userWithProfileSelect = `
    id,
    full_name,
    email,
    gender,
    birthdate,
    bio,
    preferences,
    location_lat,
    location_lng,
    is_online,
    last_active_at,
    verified_at,
    created_at,
    updated_at,
    profiles (
        profile_picture_url,
        profile_picture_uploaded_at,
        height_cm,
        education,
        occupation,
        relationship_goal,
        smoking,
        drinking,
        children
    )
    `;

    const mapUserRowToProfile = (userRow: any): UserProfile => {
    const profileDetailsRaw = userRow?.profiles;
    const profileDetails = Array.isArray(profileDetailsRaw)
    ? profileDetailsRaw[0]
    : profileDetailsRaw;

    const parseDecimal = (value: unknown) => {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
    };

    return {
    id: userRow.id,
    full_name: userRow.full_name,
    email: userRow.email,
    gender: userRow.gender,
    birthdate: userRow.birthdate,
    bio: userRow.bio ?? "",
    profile_picture_url: profileDetails?.profile_picture_url ?? null,
    profile_picture_uploaded_at:
        profileDetails?.profile_picture_uploaded_at ?? null,
    preferences: (userRow.preferences ?? {
        age_range: { min: 18, max: 50 },
        distance_miles: 25,
        gender_preferences: [],
        relationship_goal: "not_sure",
    }) as UserPreferences,
    location_lat: parseDecimal(userRow.location_lat),
    location_lng: parseDecimal(userRow.location_lng),
    is_online: Boolean(userRow.is_online),
    last_active_at: userRow.last_active_at ?? null,
    verified_at: userRow.verified_at ?? null,
    created_at: userRow.created_at ?? new Date().toISOString(),
    updated_at: userRow.updated_at ?? new Date().toISOString(),
    height_cm: profileDetails?.height_cm ?? null,
    education: profileDetails?.education ?? null,
    occupation: profileDetails?.occupation ?? null,
    relationship_goal: profileDetails?.relationship_goal ?? null,
    smoking: profileDetails?.smoking ?? null,
    drinking: profileDetails?.drinking ?? null,
    children: profileDetails?.children ?? null,
    };
    };

    export async function getPotentialMatches(): Promise<UserProfile[]> {
    const supabase = await createClient();
    const {
    data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
    throw new Error("Not authenticated.");
    }

    // Does not include the current user
    // Limited to 50 for scalability 
    const { data: potentialMatches, error } = await supabase
    .from("users")
    .select(userWithProfileSelect)
    .neq("id", user.id)
    .limit(50);

    if (error) {
    throw new Error("failed to fetch potential matches");
    }

    const { data: userPrefs, error: prefsError } = await supabase
    .from("users")
    .select("preferences")
    .eq("id", user.id)
    .single();

    if (prefsError) {
    throw new Error("Failed to get user preferences");
    }

    const currentUserPrefs = (userPrefs.preferences ?? null) as
    | UserPreferences
    | null;
    const genderPreferences = currentUserPrefs?.gender_preferences ?? [];

    const filteredMatches = (potentialMatches ?? [])
    .filter((match) => {
        if (!genderPreferences.length) {
        return true;
        }

        return genderPreferences.includes(match.gender);
    })
    .map(mapUserRowToProfile);

    return filteredMatches;
    }

    export async function likeUser(toUserId: string) {
    const supabase = await createClient();
    const {
    data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
    throw new Error("Not authenticated.");
    }

        const { error: likeError } = await supabase
            .from("likes")
            .insert({
                from_user_id: user.id,
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
                    .eq("from_user_id", user.id)
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
    .eq("to_user_id", user.id)
    .single();

    if (checkError && checkError.code !== "PGRST116") {
    throw new Error("Failed to check for match");
    }

    if (existingLike) {
    const { data: matchedUser, error: userError } = await supabase
        .from("users")
        .select(userWithProfileSelect)
        .eq("id", toUserId)
        .single();

    if (userError || !matchedUser) {
        throw new Error("Failed to fetch matched user");
    }

    return {
        success: true,
        isMatch: true,
        matchedUser: mapUserRowToProfile(matchedUser),
    };
    }

    return { success: true, isMatch: false };
    }

    export async function getUserMatches() {
    const supabase = await createClient();
    const {
    data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
    throw new Error("Not authenticated.");
    }

    const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .eq("is_active", true);

    if (error) {
    throw new Error("Failed to fetch matches");
    }

    const matchedUsers: UserProfile[] = [];

    for (const match of matches || []) {
    const otherUserId =
        match.user1_id === user.id ? match.user2_id : match.user1_id;

    const { data: otherUser, error: userError } = await supabase
        .from("users")
        .select(userWithProfileSelect)
        .eq("id", otherUserId)
        .single();

    if (userError || !otherUser) {
        continue;
    }

    matchedUsers.push(mapUserRowToProfile(otherUser));
    }

    return matchedUsers;
    }