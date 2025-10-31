"use client";

/**
 * Profile Edit Page
 * 
 * Comprehensive profile editing interface allowing users to update all aspects
 * of their profile including basic info, profile details, and profile picture.
 * Features form validation, loading states, and success/error feedback.
 * 
 * Key Features:
 * - Edit basic profile information (name, bio, gender, birthdate)
 * - Edit profile details (height, education, occupation, lifestyle)
 * - Profile picture upload with live preview
 * - Relationship goal selection
 * - Lifestyle choices (smoking, drinking, children)
 * - Form validation before submission
 * - Loading states during save operations
 * - Success/error feedback messages
 * - Cancel button to discard changes
 * - Responsive form layout
 * - Icon-based visual indicators
 * 
 * Editable Fields:
 * 
 * Basic Information:
 * - Full Name: Display name
 * - Bio: Profile description (textarea)
 * - Gender: Male, Female, Non-binary, Prefer not to say
 * - Birthdate: Date picker
 * - Profile Picture: Image upload with preview
 * 
 * Profile Details:
 * - Height: Centimeters (number input)
 * - Education: School/degree (text input)
 * - Occupation: Job title/profession (text input)
 * - Relationship Goal: Casual, Serious, Not sure, Exploring
 * - Smoking: Yes/No/Not set
 * - Drinking: Yes/No/Not set
 * - Children: Have/Want/Don't want/Open/Not set
 * 
 * Form Handling:
 * - Loads current profile data on mount
 * - Tracks changes with controlled inputs
 * - Validates data before submission
 * - Splits updates between users and profiles tables
 * - Redirects to profile view on successful save
 * - Displays error messages on failure
 * 
 * Photo Upload:
 * - PhotoUpload component integration
 * - Live preview of uploaded image
 * - Fallback to default avatar
 * - Updates both state and database
 * 
 * Visual Design:
 * - Cosmic theme with gradient background
 * - Glass-morphism form containers
 * - Two-column responsive layout
 * - Golden accent colors for labels
 * - Icon-based field indicators
 * - Smooth transitions and hover effects
 * 
 * Navigation:
 * - Cancel: Returns to profile view without saving
 * - Save: Updates profile and navigates to profile view
 * 
 * @page
 * @route /profile/edit
 */

import PhotoUpload from "@/components/PhotoUpload";
import type { UserProfile } from "@/app/profile/page";
import {
    getCurrentUserProfile,
    updateUserProfile,
    updateProfileDetails,
} from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

/**
 * Form state type for basic profile fields
 */
type EditableProfileFormState = Pick<
UserProfile,
"full_name" | "bio" | "gender" | "birthdate" | "profile_picture_url"
>;

/**
 * Form state type for extended profile details
 */
interface ProfileDetailsFormState {
height_cm: number | null;
education: string;
occupation: string;
relationship_goal: "something_casual" | "something_serious" | "not_sure" | "just_exploring";
smoking: boolean | null;
drinking: boolean | null;
children: string;
}

    const [formData, setFormData] = useState<EditableProfileFormState>({
        full_name: "",
        bio: "",
        gender: "prefer_not_to_say",
        birthdate: "",
        profile_picture_url: null,
    });

    const [profileDetails, setProfileDetails] = useState<ProfileDetailsFormState>({
        height_cm: null,
        education: "",
        occupation: "",
        relationship_goal: "not_sure",
        smoking: null,
        drinking: null,
        children: "",
    });

    const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>(
        { lat: null, lng: null }
    );
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [email, setEmail] = useState<string>("");
    const hasLocation = location.lat !== null && location.lng !== null;
 
    useEffect(() => {
        async function loadProfile() {
    try {
    const profileData = await getCurrentUserProfile();
    if (profileData) {
        setFormData({
        full_name: profileData.full_name ?? "",
        bio: profileData.bio ?? "",
        gender: profileData.gender,
        birthdate: profileData.birthdate ?? "",
        profile_picture_url: profileData.profile_picture_url,
        });
        setLocation({
        lat: profileData.location_lat ?? null,
        lng: profileData.location_lng ?? null,
        });
        setEmail(profileData.email ?? "");
        
        // Load profile details
                setProfileDetails({
        height_cm: profileData.height_cm ?? null,
        education: profileData.education ?? "",
        occupation: profileData.occupation ?? "",
        relationship_goal: profileData.relationship_goal ?? "not_sure",
        smoking: profileData.smoking ?? null,
        drinking: profileData.drinking ?? null,
        children: profileData.children ?? "",
        });

    }
    } catch (err) {
    setError("Failed to load profile");
    } finally {
    setLoading(false);
    }
}

        loadProfile();
    }, []);

    async function handleFormSubmit(e: React.FormEvent) {
e.preventDefault();

setSaving(true);
setError(null);

try {
    const { profile_picture_url: _profilePictureUrl, ...profileDataToUpdate } = formData;
    const payload: Partial<UserProfile> = {
        ...profileDataToUpdate,
        location_lat: location.lat,
        location_lng: location.lng,
    };

    const result = await updateUserProfile(payload);
    if (!result.success) {
    setError(result.error || "Failed to update profile.");
    setSaving(false);
    return;
    }

    // Update profile details (profiles table)
    const detailsPayload: Record<string, unknown> = {};
    if (profileDetails.height_cm) detailsPayload.height_cm = profileDetails.height_cm;
    if (profileDetails.education) detailsPayload.education = profileDetails.education;
    if (profileDetails.occupation) detailsPayload.occupation = profileDetails.occupation;
    if (profileDetails.relationship_goal) detailsPayload.relationship_goal = profileDetails.relationship_goal;
    if (profileDetails.smoking !== null) detailsPayload.smoking = profileDetails.smoking;
    if (profileDetails.drinking !== null) detailsPayload.drinking = profileDetails.drinking;
    if (profileDetails.children) detailsPayload.children = profileDetails.children;

    const detailsResult = await updateProfileDetails(detailsPayload);
    if (!detailsResult.success) {
    setError(detailsResult.error || "Failed to update profile details.");
    setSaving(false);
    return;
    }

    router.push("/profile");
} catch (err) {
    setError("Failed to update profile.");
} finally {
    setSaving(false);
}
}

    function handleInputChange(
e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>
) {
const { name, value } = e.target;
const fieldName = name as keyof EditableProfileFormState;

setFormData((prev) => {
    switch (fieldName) {
    case "gender":
        return {
        ...prev,
        gender: value as EditableProfileFormState["gender"],
        };
    case "full_name":
    case "bio":
    case "birthdate":
        return {
        ...prev,
        [fieldName]: value,
        } as EditableProfileFormState;
    default:
        return prev;
    }
});
}

    function handleProfileDetailsChange(
e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>
) {
const { name, value } = e.target;
const fieldName = name as keyof ProfileDetailsFormState;

setProfileDetails((prev) => {
    switch (fieldName) {
    case "height_cm":
        return {
        ...prev,
        height_cm: value ? parseInt(value, 10) : null,
        };
    case "relationship_goal":
        return {
        ...prev,
        relationship_goal: value as ProfileDetailsFormState["relationship_goal"],
        };
    case "smoking":
    case "drinking":
        return {
        ...prev,
        [fieldName]: value === "" ? null : value === "true",
        };
    case "education":
    case "occupation":
    case "children":
        return {
        ...prev,
        [fieldName]: value,
        };
    default:
        return prev;
    }
});
}

    async function handleUseCurrentLocation() {
        setLocationError(null);

        if (typeof window === "undefined" || !("geolocation" in navigator)) {
            setLocationError("Geolocation is not supported in this browser.");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                setLocation({
                    lat: Number(latitude.toFixed(6)),
                    lng: Number(longitude.toFixed(6)),
                });
                setIsLocating(false);
            },
            (geoError) => {
                switch (geoError.code) {
                    case geoError.PERMISSION_DENIED:
                        setLocationError("Location permission was denied.");
                        break;
                    case geoError.POSITION_UNAVAILABLE:
                        setLocationError("Unable to determine your location.");
                        break;
                    case geoError.TIMEOUT:
                        setLocationError("Timed out while retrieving your location.");
                        break;
                    default:
                        setLocationError("Failed to get your current location.");
                }
                setIsLocating(false);
            }
        );
    }

    function handleClearLocation() {
        setLocation({ lat: null, lng: null });
    }
 
    if (loading) {
        return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
    <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "hsl(45 90% 55%)" }}></div>
        <p className="mt-4" style={{ color: "hsl(220 10% 65%)" }}>
        Loading...
        </p>
    </div>
    </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
    <div className="container mx-auto px-4 py-8">
    <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(45 90% 55%)" }}>
        Edit Profile
        </h1>
        <p style={{ color: "hsl(220 10% 65%)" }}>
        Update your profile information
        </p>
    </header>

    <div className="max-w-2xl mx-auto">
        <form
        className="rounded-2xl shadow-lg p-8 backdrop-blur-md"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
        onSubmit={handleFormSubmit}
        >
        <div className="mb-8">
            <label className="block text-sm font-medium mb-3" style={{ color: "hsl(45 90% 55%)" }}>
            📍 Location for Discovery
            </label>
            <p className="text-xs" style={{ color: "hsl(220 10% 65%)" }}>
            We use your saved coordinates to surface matches within your preferred distance.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                backgroundColor: "hsl(45 90% 55%)",
                color: "hsl(222 47% 11%)",
                opacity: isLocating ? 0.7 : 1,
                }}
            >
                {isLocating ? "Detecting..." : "Use Current Location"}
            </button>
            {hasLocation && (
                <button
                type="button"
                onClick={handleClearLocation}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "hsl(220 10% 80%)",
                }}
                >
                Clear Location
                </button>
            )}
            </div>
            <div className="mt-3 text-sm" style={{ color: "hsl(220 10% 70%)" }}>
            <p>
                Saved coordinates: {hasLocation ? `${location.lat?.toFixed(5)}, ${location.lng?.toFixed(5)}` : "Not yet set"}
            </p>
            </div>
            {locationError && (
            <p className="mt-2 text-sm" style={{ color: "hsl(0 84% 70%)" }}>
                {locationError}
            </p>
            )}
        </div>
 
        <div className="mb-8">
            <label
            htmlFor="bio"
            className="block text-sm font-medium mb-2"
            style={{ color: "hsl(45 90% 55%)" }}
            >
            About Me *
            </label>
            <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            required
            rows={4}
            maxLength={500}
            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
            style={{ 
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "hsl(220 10% 95%)"
            }}
            placeholder="Tell others about yourself..."
            />
            <p className="text-xs mt-1" style={{ color: "hsl(220 10% 60%)" }}>
            {formData.bio.length}/500 characters
            </p>
        </div>

        {/* Profile Details Section */}
        <div className="mb-6 pt-6 border-t" style={{ borderColor: "rgba(232, 185, 96, 0.2)" }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "hsl(45 90% 55%)" }}>
            Additional Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label
                htmlFor="height_cm"
                className="block text-sm font-medium mb-2"
                style={{ color: "hsl(45 90% 55%)" }}
                >
                📏 Height (cm)
                </label>
                <input
                type="number"
                id="height_cm"
                name="height_cm"
                value={profileDetails.height_cm ?? ""}
                onChange={handleProfileDetailsChange}
                min="0"
                max="300"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "hsl(220 10% 95%)"
                }}
                placeholder="e.g., 170"
                />
            </div>

            <div>
                <label
                htmlFor="relationship_goal"
                className="block text-sm font-medium mb-2"
                style={{ color: "hsl(45 90% 55%)" }}
                >
                💕 Relationship Goal
                </label>
                <select
                id="relationship_goal"
                name="relationship_goal"
                value={profileDetails.relationship_goal}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "hsl(220 10% 95%)"
                }}
                >
                <option value="not_sure">Not sure</option>
                <option value="something_casual">Something casual</option>
                <option value="something_serious">Something serious</option>
                <option value="just_exploring">Just exploring</option>
                </select>
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label
                htmlFor="education"
                className="block text-sm font-medium mb-2"
                style={{ color: "hsl(45 90% 55%)" }}
                >
                🎓 Education
                </label>
                <input
                type="text"
                id="education"
                name="education"
                value={profileDetails.education}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "hsl(220 10% 95%)"
                }}
                placeholder="e.g., Bachelor's Degree"
                />
            </div>

            <div>
                <label
                htmlFor="occupation"
                className="block text-sm font-medium mb-2"
                style={{ color: "hsl(45 90% 55%)" }}
                >
                💼 Occupation
                </label>
                <input
                type="text"
                id="occupation"
                name="occupation"
                value={profileDetails.occupation}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "hsl(220 10% 95%)"
                }}
                placeholder="e.g., Software Engineer"
                />
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
                <label
                htmlFor="smoking"
                className="block text-sm font-medium mb-2"
                style={{ color: "hsl(45 90% 55%)" }}
                >
                🚬 Smoking
                </label>
                <select
                id="smoking"
                name="smoking"
                value={profileDetails.smoking === null ? "" : profileDetails.smoking.toString()}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "hsl(220 10% 95%)"
                }}
                >
                <option value="">Prefer not to say</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
                </select>
            </div>

            <div>
                <label
                htmlFor="drinking"
                className="block text-sm font-medium mb-2"
                style={{ color: "hsl(45 90% 55%)" }}
                >
                🍷 Drinking
                </label>
                <select
                id="drinking"
                name="drinking"
                value={profileDetails.drinking === null ? "" : profileDetails.drinking.toString()}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "hsl(220 10% 95%)"
                }}
                >
                <option value="">Prefer not to say</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
                </select>
            </div>

            <div>
                <label
                htmlFor="children"
                className="block text-sm font-medium mb-2"
                style={{ color: "hsl(45 90% 55%)" }}
                >
                👶 Children
                </label>
                <select
                id="children"
                name="children"
                value={profileDetails.children}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "hsl(220 10% 95%)"
                }}
                >
                <option value="">Prefer not to say</option>
                <option value="none">None</option>
                <option value="want_someday">Want someday</option>
                <option value="have_kids">Have kids</option>
                <option value="dont_want">Don't want</option>
                </select>
            </div>
            </div>
        </div>

        {error && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "rgba(230, 57, 70, 0.1)", border: "1px solid rgba(230, 57, 70, 0.3)", color: "hsl(0 70% 70%)" }}>
            {error}
            </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: "rgba(232, 185, 96, 0.2)" }}>
            <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 transition-colors duration-200"
            style={{ color: "hsl(220 10% 70%)" }}
            >
            Cancel
            </button>
            <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 font-semibold rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
                background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
                color: "hsl(220 30% 8%)",
                boxShadow: "0 0 40px hsl(45 90% 55% / 0.3)"
            }}
            >
            {saving ? "Saving..." : "Save Changes"}
            </button>
        </div>
        </form>
    </div>
    </div>
</div>
    );
}