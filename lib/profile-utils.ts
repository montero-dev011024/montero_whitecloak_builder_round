/**
 * Profile Data Mapping Utilities
 * 
 * Utility functions and types for transforming raw database query results
 * into properly typed UserProfile objects. Handles data normalization,
 * type validation, and default value assignment.
 * 
 * Key Features:
 * - Type-safe database query select strings
 * - Data normalization (booleans, decimals, nested objects)
 * - Default preference handling
 * - Gender and relationship goal validation
 * - Profile details extraction from joins
 * 
 * Usage:
 * - Use `userWithProfileSelect` in Supabase queries for consistent data fetching
 * - Call `mapUserRowToProfile()` to convert raw query results to UserProfile
 * - Ensures all required fields have valid values
 * 
 * @module lib/profile-utils
 * @example
 * ```typescript
 * import { userWithProfileSelect, mapUserRowToProfile } from "@/lib/profile-utils";
 * 
 * const { data } = await supabase
 *   .from("users")
 *   .select(userWithProfileSelect)
 *   .eq("id", userId)
 *   .single();
 * 
 * const profile = mapUserRowToProfile(data);
 * ```
 */

import type { UserPreferences, UserProfile } from "@/app/profile/page";

/**
 * Raw user row data structure from database query
 */
type UserRow = {
    id: string;
    full_name: string;
    email: string;
    gender: string | null;
    birthdate: string;
    bio?: string | null;
    preferences?: UserPreferences | null;
    location_lat?: number | string | null;
    location_lng?: number | string | null;
    is_online?: boolean | null;
    last_active_at?: string | null;
    verified_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    profiles?: unknown;
};

type ProfileDetails = {
    profile_picture_url?: string | null;
    profile_picture_uploaded_at?: string | null;
    height_cm?: number | null;
    education?: string | null;
    occupation?: string | null;
    relationship_goal?: string | null;
    smoking?: boolean | string | null;
    drinking?: boolean | string | null;
    children?: string | null;
} | null;

const DEFAULT_PREFERENCES: UserPreferences = {
    age_range: { min: 18, max: 50 },
    distance_miles: 25,
    gender_preferences: [],
    relationship_goal: "not_sure",
};

const normalizeProfiles = (raw: unknown): ProfileDetails => {
    if (!raw) {
        return null;
    }

    if (Array.isArray(raw)) {
        return (raw[0] ?? null) as ProfileDetails;
    }

    return raw as ProfileDetails;
};

const parseDecimal = (value: unknown): number | null => {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
};

export const userWithProfileSelect = `
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

const isKnownGender = (
    gender: string | null
): gender is UserProfile["gender"] =>
    gender === "male" ||
    gender === "female" ||
    gender === "non-binary" ||
    gender === "prefer_not_to_say";

const isKnownRelationshipGoal = (
    goal: string | null | undefined
): goal is NonNullable<UserProfile["relationship_goal"]> =>
    goal === "something_casual" ||
    goal === "something_serious" ||
    goal === "not_sure" ||
    goal === "just_exploring";

const normalizeBoolean = (value: unknown): boolean | null => {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "yes" || normalized === "true" || normalized === "1") {
            return true;
        }
        if (normalized === "no" || normalized === "false" || normalized === "0") {
            return false;
        }
    }

    return null;
};

export const mapUserRowToProfile = (userRow: UserRow): UserProfile => {
    const profileDetails = normalizeProfiles(userRow?.profiles);
    const gender = isKnownGender(userRow.gender)
        ? userRow.gender
        : "prefer_not_to_say";
    const relationshipGoal = isKnownRelationshipGoal(profileDetails?.relationship_goal)
        ? profileDetails?.relationship_goal
        : undefined;

    return {
        id: userRow.id,
        full_name: userRow.full_name,
        email: userRow.email,
        gender,
        birthdate: userRow.birthdate,
        bio: userRow.bio ?? "",
        profile_picture_url: profileDetails?.profile_picture_url ?? null,
        profile_picture_uploaded_at: profileDetails?.profile_picture_uploaded_at ?? null,
        preferences: (userRow.preferences ?? DEFAULT_PREFERENCES) as UserPreferences,
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
        relationship_goal: relationshipGoal,
        smoking: normalizeBoolean(profileDetails?.smoking ?? null),
        drinking: normalizeBoolean(profileDetails?.drinking ?? null),
        children: profileDetails?.children ?? null,
    };
};
