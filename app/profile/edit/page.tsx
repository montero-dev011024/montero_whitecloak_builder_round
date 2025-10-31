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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

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
    const [photoUploadSuccess, setPhotoUploadSuccess] = useState<string | null>(null);
    const maxBirthdate = useMemo(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 18);
        return date.toISOString().split("T")[0];
    }, []);
    const hasLocation = location.lat !== null && location.lng !== null;

    const cardStyles: CSSProperties = {
        background: "linear-gradient(140deg, rgba(19, 17, 35, 0.85), rgba(16, 24, 39, 0.9))",
        border: "1px solid rgba(232, 185, 96, 0.25)",
        boxShadow: "0 25px 50px -15px hsla(230, 60%, 5%, 0.9)",
    };

    const labelStyles: CSSProperties = {
        color: "hsl(45 90% 72%)",
        letterSpacing: "0.02em",
        fontWeight: 600,
    };

    const helperTextStyles: CSSProperties = {
        color: "hsl(220 15% 70%)",
    };

    const sectionTitleStyles: CSSProperties = {
        ...labelStyles,
        fontSize: "1.25rem",
        fontWeight: 700,
    };

    const inputStyles: CSSProperties = {
        background: "linear-gradient(135deg, rgba(28, 22, 44, 0.85), rgba(13, 19, 33, 0.9))",
        border: "1px solid rgba(232, 185, 96, 0.25)",
        color: "hsl(45 90% 90%)",
        boxShadow: "0 0 25px hsla(220, 40%, 10%, 0.35)",
    };

    const textareaStyles: CSSProperties = {
        ...inputStyles,
        minHeight: "120px",
    };

    const selectStyles: CSSProperties = {
        ...inputStyles,
    };

    const optionStyles: CSSProperties = {
        backgroundColor: "hsl(230 35% 14%)",
        color: "hsl(45 90% 85%)",
    };

    const primaryButtonStyles: CSSProperties = {
        background: "linear-gradient(135deg, hsl(45 90% 60%), hsl(25 90% 55%))",
        color: "hsl(222 50% 10%)",
        boxShadow: "0 0 35px hsla(45, 90%, 60%, 0.35)",
    };

    const ghostButtonStyles: CSSProperties = {
        background: "rgba(13, 19, 33, 0.6)",
        border: "1px solid rgba(232, 185, 96, 0.25)",
        color: "hsl(220 15% 75%)",
    };

    const successAccentStyles: CSSProperties = {
        color: "hsl(150 60% 65%)",
    };

    const dividerColor = "rgba(232, 185, 96, 0.25)";
 
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

    function validateBirthdate(value: string) {
        if (!value) {
            setError("Birthdate is required.");
            return false;
        }

        const parsedDate = new Date(value);

        if (Number.isNaN(parsedDate.getTime())) {
            setError("Please enter a valid birthdate.");
            return false;
        }

        const today = new Date();
        const eighteenYearsAgo = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
        );

        if (parsedDate > eighteenYearsAgo) {
            setError("You must be at least 18 years old.");
            return false;
        }

        return true;
    }

    async function handleFormSubmit(e: React.FormEvent) {
e.preventDefault();

setSaving(true);
setError(null);
setPhotoUploadSuccess(null);

try {
    const trimmedName = formData.full_name.trim();
    const trimmedBio = formData.bio.trim();

    if (!trimmedName) {
    setError("Full name is required.");
    setSaving(false);
    return;
    }

    if (!trimmedBio) {
    setError("Bio is required.");
    setSaving(false);
    return;
    }

    if (!validateBirthdate(formData.birthdate)) {
    setSaving(false);
    return;
    }

    setFormData((prev) => ({
    ...prev,
    full_name: trimmedName,
    bio: trimmedBio,
    }));

    const { profile_picture_url: _profilePictureUrl, ...profileDataToUpdate } = formData;
    const payload: Partial<UserProfile> = {
        ...profileDataToUpdate,
        full_name: trimmedName,
        bio: trimmedBio,
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

    function handlePhotoUploaded(url: string) {
        setFormData((prev) => ({
            ...prev,
            profile_picture_url: url,
        }));
        setPhotoUploadSuccess("Profile photo updated successfully.");
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
        style={cardStyles}
        onSubmit={handleFormSubmit}
        >
        <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2" style={{ borderColor: "hsl(45 90% 55%)", boxShadow: "0 0 30px hsl(45 90% 55% / 0.2)" }}>
                <Image
                src={formData.profile_picture_url || "/default-avatar.svg"}
                alt={formData.full_name ? `${formData.full_name}'s profile picture` : "Profile picture"}
                width={128}
                height={128}
                className="w-full h-full object-cover"
                />
            </div>
            <PhotoUpload onPhotoUploaded={handlePhotoUploaded} />
            </div>

            <div className="flex-1 w-full space-y-4">
            <div>
                <label
                htmlFor="full_name"
                className="block text-sm font-medium mb-2"
                style={labelStyles}
                >
                Full Name *
                </label>
                <input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                maxLength={150}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={inputStyles}
                placeholder="Your full name"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label
                    htmlFor="birthdate"
                    className="block text-sm font-medium mb-2"
                    style={labelStyles}
                >
                    Birthdate *
                </label>
                <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formData.birthdate ?? ""}
                    onChange={handleInputChange}
                    required
                    max={maxBirthdate}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={inputStyles}
                />
                <p className="text-xs mt-1" style={helperTextStyles}>
                    You must be at least 18 years old.
                </p>
                </div>

                <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                    style={labelStyles}
                >
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2 rounded-lg cursor-not-allowed"
                    style={{
                    ...inputStyles,
                    opacity: 0.6,
                    color: "hsl(220 15% 70%)",
                    }}
                />
                </div>
            </div>

            {photoUploadSuccess && (
                <p className="text-xs" style={successAccentStyles}>
                {photoUploadSuccess}
                </p>
            )}
            </div>
        </div>

        <div className="mb-8">
            <label className="block text-sm font-medium mb-3" style={labelStyles}>
            📍 Location for Discovery
            </label>
            <p className="text-xs" style={helperTextStyles}>
            We use your saved coordinates to surface matches within your preferred distance.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                ...primaryButtonStyles,
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
                style={ghostButtonStyles}
                >
                Clear Location
                </button>
            )}
            </div>
            <div className="mt-3 text-sm" style={helperTextStyles}>
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
            style={labelStyles}
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
            style={textareaStyles}
            placeholder="Tell others about yourself..."
            />
            <p className="text-xs mt-1" style={helperTextStyles}>
            {formData.bio.length}/500 characters
            </p>
        </div>

        {/* Profile Details Section */}
        <div className="mb-6 pt-6 border-t" style={{ borderColor: dividerColor }}>
            <h2 className="text-xl font-semibold mb-4" style={sectionTitleStyles}>
            Additional Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label
                htmlFor="height_cm"
                className="block text-sm font-medium mb-2"
                style={labelStyles}
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
                style={inputStyles}
                placeholder="e.g., 170"
                />
            </div>

            <div>
                <label
                htmlFor="relationship_goal"
                className="block text-sm font-medium mb-2"
                style={labelStyles}
                >
                💕 Relationship Goal
                </label>
                <select
                id="relationship_goal"
                name="relationship_goal"
                value={profileDetails.relationship_goal}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={selectStyles}
                >
                <option value="not_sure" style={optionStyles}>Not sure</option>
                <option value="something_casual" style={optionStyles}>Something casual</option>
                <option value="something_serious" style={optionStyles}>Something serious</option>
                <option value="just_exploring" style={optionStyles}>Just exploring</option>
                </select>
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label
                htmlFor="education"
                className="block text-sm font-medium mb-2"
                style={labelStyles}
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
                style={inputStyles}
                placeholder="e.g., Bachelor's Degree"
                />
            </div>

            <div>
                <label
                htmlFor="occupation"
                className="block text-sm font-medium mb-2"
                style={labelStyles}
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
                style={inputStyles}
                placeholder="e.g., Software Engineer"
                />
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
                <label
                htmlFor="smoking"
                className="block text-sm font-medium mb-2"
                style={labelStyles}
                >
                🚬 Smoking
                </label>
                <select
                id="smoking"
                name="smoking"
                value={profileDetails.smoking === null ? "" : profileDetails.smoking.toString()}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={selectStyles}
                >
                <option value="" style={optionStyles}>Prefer not to say</option>
                <option value="true" style={optionStyles}>Yes</option>
                <option value="false" style={optionStyles}>No</option>
                </select>
            </div>

            <div>
                <label
                htmlFor="drinking"
                className="block text-sm font-medium mb-2"
                style={labelStyles}
                >
                🍷 Drinking
                </label>
                <select
                id="drinking"
                name="drinking"
                value={profileDetails.drinking === null ? "" : profileDetails.drinking.toString()}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={selectStyles}
                >
                <option value="" style={optionStyles}>Prefer not to say</option>
                <option value="true" style={optionStyles}>Yes</option>
                <option value="false" style={optionStyles}>No</option>
                </select>
            </div>

            <div>
                <label
                htmlFor="children"
                className="block text-sm font-medium mb-2"
                style={labelStyles}
                >
                👶 Children
                </label>
                <select
                id="children"
                name="children"
                value={profileDetails.children}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={selectStyles}
                >
                <option value="" style={optionStyles}>Prefer not to say</option>
                <option value="none" style={optionStyles}>None</option>
                <option value="want_someday" style={optionStyles}>Want someday</option>
                <option value="have_kids" style={optionStyles}>Have kids</option>
                <option value="dont_want" style={optionStyles}>Don't want</option>
                </select>
            </div>
            </div>
        </div>

        {error && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "rgba(230, 57, 70, 0.1)", border: "1px solid rgba(230, 57, 70, 0.3)", color: "hsl(0 70% 70%)" }}>
            {error}
            </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: dividerColor }}>
            <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            style={ghostButtonStyles}
            >
            Cancel
            </button>
            <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 font-semibold rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={primaryButtonStyles}
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