"use server";

/**
 * Profile Management Actions
 * 
 * Server-side functions for managing user profiles and preferences.
 * Handles profile data retrieval, updates, photo uploads, and user preferences
 * including discovery preferences (age range, distance, gender, relationship goals).
 * 
 * Key Features:
 * - Profile data fetching and updating
 * - Photo upload to Supabase Storage
 * - User preferences management (discovery settings)
 * - Gender preference add/remove operations
 * - Profile details management (height, education, occupation, etc.)
 * - User interests management
 * - Preference normalization and validation
 * 
 * Database Tables:
 * - users: Core user data (name, bio, birthdate, preferences)
 * - profiles: Extended profile data (photo, physical attributes, lifestyle)
 * - user_interests: User's selected interests
 * 
 * @module lib/actions/profile
 */

import type { UserPreferences, UserProfile } from "@/app/profile/page";
import { createClient } from "../supabase/server";

/**
 * Default user preferences applied to new users or when preferences are missing
 */
const DEFAULT_USER_PREFERENCES: UserPreferences = {
    age_range: {
        min: 18,
        max: 50,
    },
    distance_miles: 25,
    gender_preferences: [],
    relationship_goal: "not_sure",
};

/**
 * Normalizes and validates raw preference data from the database
 * Ensures all fields have valid values and proper types
 * 
 * @param raw - Raw preference data from database (possibly malformed)
 * @returns Validated and normalized UserPreferences object
 * @private
 */
const normalizePreferences = (raw: unknown): UserPreferences => {
    if (!raw || typeof raw !== "object") {
        return structuredClone(DEFAULT_USER_PREFERENCES);
    }

    const candidate = raw as Partial<UserPreferences>;
    const toNumber = (value: unknown, fallback: number) => {
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === "string" && value.trim()) {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : fallback;
        }

        return fallback;
    };

    const allowedGoals: UserPreferences["relationship_goal"][] = [
        "something_casual",
        "something_serious",
        "not_sure",
        "just_exploring",
    ];

    const relationshipGoalCandidate = candidate.relationship_goal ?? "not_sure";

    const genderPreferencesArray = Array.isArray(candidate.gender_preferences)
        ? candidate.gender_preferences.filter(
                (value): value is string => typeof value === "string" && value.length > 0,
            )
        : [];

    return {
        age_range: {
            min: toNumber(candidate.age_range?.min, DEFAULT_USER_PREFERENCES.age_range.min),
            max: toNumber(candidate.age_range?.max, DEFAULT_USER_PREFERENCES.age_range.max),
        },
        distance_miles: toNumber(
            candidate.distance_miles,
            DEFAULT_USER_PREFERENCES.distance_miles,
        ),
        gender_preferences: Array.from(new Set(genderPreferencesArray)),
        relationship_goal: allowedGoals.includes(relationshipGoalCandidate)
            ? relationshipGoalCandidate
            : DEFAULT_USER_PREFERENCES.relationship_goal,
    };
};

/**
 * Merges partial preference updates with current preferences
 * Ensures age range min/max are correctly ordered
 * Deduplicates gender preferences array
 * 
 * @param current - Current user preferences
 * @param updates - Partial updates to apply
 * @returns Merged preferences object
 * @private
 */
const mergePreferences = (
    current: UserPreferences,
    updates: Partial<UserPreferences>,
): UserPreferences => {
    const merged: UserPreferences = {
        age_range: {
            min: updates.age_range?.min ?? current.age_range.min,
            max: updates.age_range?.max ?? current.age_range.max,
        },
        distance_miles: updates.distance_miles ?? current.distance_miles,
        gender_preferences: updates.gender_preferences
            ? Array.from(new Set(updates.gender_preferences))
            : [...current.gender_preferences],
        relationship_goal: updates.relationship_goal ?? current.relationship_goal,
    };

    if (merged.age_range.min > merged.age_range.max) {
        const min = Math.min(merged.age_range.min, merged.age_range.max);
        const max = Math.max(merged.age_range.min, merged.age_range.max);
        merged.age_range = { min, max };
    }

    return merged;
};

/**
 * Gets the authenticated user's ID from Supabase session
 * 
 * @returns Object with Supabase client and user ID (or null if not authenticated)
 * @private
 */
async function getAuthenticatedUserId() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { supabase, userId: null } as const;
    }

    return { supabase, userId: user.id } as const;
}

/**
 * Fetches the complete profile of the currently authenticated user
 * Combines data from users table and profiles table
 * 
 * Data Retrieved:
 * - Basic info: name, email, gender, birthdate, bio
 * - Preferences: age range, distance, gender preferences, relationship goal
 * - Profile details: photo, height, education, occupation, lifestyle choices
 * - Metadata: online status, verification status, timestamps
 * 
 * @returns Complete user profile or null if not authenticated
 * @throws Error if database query fails
 * 
 * @example
 * ```typescript
 * const profile = await getCurrentUserProfile();
 * if (profile) {
 *   console.log(`${profile.full_name}, ${calculateAge(profile.birthdate)}`);
 * }
 * ```
 */
export async function getCurrentUserProfile() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Fetch user data from users table
    const { data: profile, error } = await supabase
        .from("users")
        .select(
            `
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
            updated_at
        `,
        )
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }

    // Fetch profile details from profiles table
    const { data: profileDetails, error: detailsError } = await supabase
        .from("profiles")
        .select(
            `
            profile_picture_url,
            profile_picture_uploaded_at,
            height_cm,
            education,
            occupation,
            relationship_goal,
            smoking,
            drinking,
            children
        `,
        )
        .eq("user_id", user.id)
        .single();

    if (detailsError) {
        console.error("Error fetching profile details:", detailsError);
        // Continue without profile details if they don't exist yet
    }

    const combinedProfile = {
        ...profile,
        ...(profileDetails ?? {}),
        profile_picture_url: profileDetails?.profile_picture_url ?? null,
    };

    return combinedProfile as UserProfile;
}

/**
 * Updates the user's basic profile information in the users table
 * 
 * Updatable Fields:
 * - full_name: Display name
 * - bio: Profile description
 * - gender: User's gender identity
 * - birthdate: Date of birth
 * - location_lat/lng: Geographic coordinates
 * - preferences: Discovery preferences object
 * 
 * @param profileData - Partial profile data to update
 * @returns Success status or error message
 * 
 * @example
 * ```typescript
 * const result = await updateUserProfile({
 *   full_name: "Jane Doe",
 *   bio: "Coffee enthusiast and adventure seeker"
 * });
 * if (result.success) {
 *   console.log("Profile updated!");
 * }
 * ```
 */
export async function updateUserProfile(profileData: Partial<UserProfile>) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (profileData.full_name) updatePayload.full_name = profileData.full_name;
    if (profileData.bio) updatePayload.bio = profileData.bio;
    if (profileData.gender) updatePayload.gender = profileData.gender;
    if (profileData.birthdate) updatePayload.birthdate = profileData.birthdate;
    if (profileData.location_lat)
        updatePayload.location_lat = profileData.location_lat;
    if (profileData.location_lng)
        updatePayload.location_lng = profileData.location_lng;
    if (profileData.preferences)
        updatePayload.preferences = profileData.preferences;

    const { error } = await supabase
        .from("users")
        .update(updatePayload)
        .eq("id", user.id);

    if (error) {
        console.log(error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Uploads a profile picture to Supabase Storage and updates the database
 * 
 * Process:
 * 1. Validates user authentication
 * 2. Uploads file to 'profile-photos' bucket
 * 3. Gets public URL for the uploaded file
 * 4. Updates profiles table with new URL and timestamp
 * 
 * File Naming:
 * - Format: {userId}/{userId}-{timestamp}.{extension}
 * - Prevents overwriting (upsert: false)
 * - Cache control: 3600 seconds
 * 
 * @param file - Image file to upload (validated on client side)
 * @returns Success status with public URL or error message
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const result = await uploadProfilePhoto(file);
 * if (result.success) {
 *   setProfilePicture(result.url);
 * }
 * ```
 */
export async function uploadProfilePhoto(file: File) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    const fileExtension = file.name.split(".").pop();
    const fileName = `${user.id}/${user.id}-${Date.now()}.${fileExtension}`;

    console.log("Uploading file:", fileName);

    const { error } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("Storage upload error:", error);
        return { success: false, error: error.message };
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

    console.log("Public URL:", publicUrl);

        const profilePicturePayload = {
            user_id: user.id,
            profile_picture_url: publicUrl,
            profile_picture_uploaded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
            .from("profiles")
            .upsert(profilePicturePayload, { onConflict: "user_id" });

    if (updateError) {
        console.error("Database update error:", updateError);
        return { success: false, error: updateError.message };
    }

    console.log("Profile picture URL updated successfully");
    return { success: true, url: publicUrl };
}

/**
 * Updates extended profile details in the profiles table
 * 
 * Updatable Fields:
 * - height_cm: Height in centimeters
 * - education: Education level/institution
 * - occupation: Job title/profession
 * - relationship_goal: What user is looking for
 * - smoking: Whether user smokes
 * - drinking: Whether user drinks
 * - children: Children status/plans
 * 
 * @param profileData - Profile details to update
 * @returns Success status or error message
 * 
 * @example
 * ```typescript
 * const result = await updateProfileDetails({
 *   height_cm: 175,
 *   occupation: "Software Engineer",
 *   smoking: false,
 *   drinking: true
 * });
 * ```
 */
export async function updateProfileDetails(profileData: {
    height_cm?: number;
    education?: string;
    occupation?: string;
    relationship_goal?: string;
    smoking?: boolean;
    drinking?: boolean;
    children?: string;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            ...profileData,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

    if (error) {
        console.log(error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Updates user's discovery preferences (who they want to see in matches)
 * Merges partial updates with existing preferences
 * 
 * Preference Fields:
 * - age_range: { min, max } - Age range for matches
 * - distance_miles: Maximum distance for matches
 * - gender_preferences: Array of preferred genders
 * - relationship_goal: What user is looking for
 * 
 * @param preferencesUpdate - Partial preferences to update
 * @returns Success status with merged preferences or error
 * 
 * @example
 * ```typescript
 * const result = await updateUserPreferences({
 *   age_range: { min: 25, max: 35 },
 *   distance_miles: 50
 * });
 * if (result.success) {
 *   console.log("Preferences updated:", result.preferences);
 * }
 * ```
 */
export async function updateUserPreferences(
    preferencesUpdate: Partial<UserPreferences>,
) {
    const { supabase, userId } = await getAuthenticatedUserId();

    if (!userId) {
        return { success: false, error: "User not authenticated" };
    }

    const { data: existing, error } = await supabase
        .from("users")
        .select("preferences")
        .eq("id", userId)
        .single();

    if (error) {
        console.log(error);
        return { success: false, error: "Failed to load current preferences" };
    }

    const current = normalizePreferences(existing?.preferences);
    const merged = mergePreferences(current, preferencesUpdate);

    const { error: updateError } = await supabase
        .from("users")
        .update({
            preferences: merged,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    if (updateError) {
        console.log(updateError);
        return { success: false, error: "Failed to update preferences" };
    }

    return { success: true, preferences: merged };
}

type GenderPreference = UserPreferences["gender_preferences"][number];

/**
 * Adds a gender to the user's gender preferences
 * Automatically deduplicates if gender already exists
 * 
 * @param gender - Gender to add to preferences
 * @returns Success status with updated preferences or error
 * 
 * @example
 * ```typescript
 * await addGenderPreference("female");
 * ```
 */
export async function addGenderPreference(gender: GenderPreference) {
    if (!gender || typeof gender !== "string") {
        return { success: false, error: "Invalid gender preference" };
    }

    const { supabase, userId } = await getAuthenticatedUserId();

    if (!userId) {
        return { success: false, error: "User not authenticated" };
    }

    const { data: existing, error } = await supabase
        .from("users")
        .select("preferences")
        .eq("id", userId)
        .single();

    if (error) {
        console.log(error);
        return { success: false, error: "Failed to load current preferences" };
    }

    const current = normalizePreferences(existing?.preferences);
    const updated = Array.from(new Set([...current.gender_preferences, gender]));

    return updateUserPreferences({ gender_preferences: updated });
}

/**
 * Removes a gender from the user's gender preferences
 * 
 * @param gender - Gender to remove from preferences
 * @returns Success status with updated preferences or error
 * 
 * @example
 * ```typescript
 * await removeGenderPreference("male");
 * ```
 */
export async function removeGenderPreference(gender: GenderPreference) {
    if (!gender || typeof gender !== "string") {
        return { success: false, error: "Invalid gender preference" };
    }

    const { supabase, userId } = await getAuthenticatedUserId();

    if (!userId) {
        return { success: false, error: "User not authenticated" };
    }

    const { data: existing, error } = await supabase
        .from("users")
        .select("preferences")
        .eq("id", userId)
        .single();

    if (error) {
        console.log(error);
        return { success: false, error: "Failed to load current preferences" };
    }

    const current = normalizePreferences(existing?.preferences);
    const filtered = current.gender_preferences.filter((item) => item !== gender);

    return updateUserPreferences({ gender_preferences: filtered });
}

/**
 * Adds multiple interests to the user's profile
 * Interests are used for matching and profile display
 * 
 * @param interestIds - Array of interest IDs to add
 * @returns Success status or error message
 * 
 * @example
 * ```typescript
 * await addUserInterests([1, 5, 12, 23]);
 * ```
 */
        export async function addUserInterests(interestIds: number[]) {
    const supabase = await createClient();

    const {
    data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
    return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
    .from("user_interests")
    .insert(interestIds.map((id) => ({ user_id: user.id, interest_id: id })));

    if (error) {
    console.log(error);
    return { success: false, error: error.message };
    }

    return { success: true };
    }

/**
 * Removes a specific interest from the user's profile
 * 
 * @param interestId - ID of the interest to remove
 * @returns Success status or error message
 * 
 * @example
 * ```typescript
 * await removeUserInterest(5);
 * ```
 */
    export async function removeUserInterest(interestId: number) {
    const supabase = await createClient();

    const {
    data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
    return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
    .from("user_interests")
    .delete()
    .eq("user_id", user.id)
    .eq("interest_id", interestId);

    if (error) {
    console.log(error);
    return { success: false, error: error.message };
    }

    return { success: true };
    }