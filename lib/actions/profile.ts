    "use server";

    import { UserProfile } from "@/app/profile/page";
    import { createClient } from "../supabase/server";

    export async function getCurrentUserProfile() {
    const supabase = await createClient();

    const {
    data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
    return null;
    }

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
        profile_picture_url,
        preferences,
        location_lat,
        location_lng,
        is_online,
        last_active_at,
        verified_at,
        created_at,
        updated_at
    `
    )
    .eq("id", user.id)
    .single();

    if (error) {
    console.error("Error fetching profile:", error);
    return null;
    }

    return profile as UserProfile;
    }

    export async function updateUserProfile(
    profileData: Partial<UserProfile>
    ) {
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
    if (profileData.profile_picture_url)
    updatePayload.profile_picture_url = profileData.profile_picture_url;
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

    export async function uploadProfilePhoto(file: File) {
    const supabase = await createClient();

    const {
    data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
    return { success: false, error: "User not authenticated" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
    .from("profile-photos")
    .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
    });

    if (error) {
    return { success: false, error: error.message };
    }

    const {
    data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

    // Update user profile with new photo URL
    const { error: updateError } = await supabase
    .from("users")
    .update({
        profile_picture_url: publicUrl,
        updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

    if (updateError) {
    return { success: false, error: updateError.message };
    }

    return { success: true, url: publicUrl };
    }

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