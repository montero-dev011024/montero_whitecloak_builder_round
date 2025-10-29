"use client";

import PhotoUpload from "@/components/PhotoUpload";
import type { UserPreferences, UserProfile } from "@/app/profile/page";
import {
    getCurrentUserProfile,
    updateUserProfile,
    updateProfileDetails,
    updateUserPreferences,
} from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

type EditableProfileFormState = Pick<
UserProfile,
"full_name" | "bio" | "gender" | "birthdate" | "profile_picture_url"
>;

interface ProfileDetailsFormState {
height_cm: number | null;
education: string;
occupation: string;
relationship_goal: "something_casual" | "something_serious" | "not_sure" | "just_exploring";
smoking: boolean | null;
drinking: boolean | null;
children: string;
}

    const defaultPreferences: UserPreferences = {
        age_range: {
            min: 18,
            max: 50,
        },
        distance_miles: 25,
        gender_preferences: [],
        relationship_goal: "not_sure",
    };

    const genderPreferenceOptions: Array<UserPreferences["gender_preferences"][number]> = [
        "male",
        "female",
        "non-binary",
    ];

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

    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

    const [email, setEmail] = useState<string>("");

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

                setPreferences({
                    age_range: {
                        min: profileData.preferences?.age_range?.min ?? defaultPreferences.age_range.min,
                        max: profileData.preferences?.age_range?.max ?? defaultPreferences.age_range.max,
                    },
                    distance_miles:
                        profileData.preferences?.distance_miles ?? defaultPreferences.distance_miles,
                    gender_preferences:
                        profileData.preferences?.gender_preferences?.length
                            ? [...profileData.preferences.gender_preferences]
                            : [],
                    relationship_goal:
                        profileData.preferences?.relationship_goal ?? defaultPreferences.relationship_goal,
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
    // Update basic profile info (users table)
    const { profile_picture_url: _profilePictureUrl, ...profileDataToUpdate } = formData;
    const result = await updateUserProfile(profileDataToUpdate);
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

        const preferencesResult = await updateUserPreferences({
            age_range: {
                min: preferences.age_range.min,
                max: preferences.age_range.max,
            },
            distance_miles: preferences.distance_miles,
            gender_preferences: preferences.gender_preferences,
            relationship_goal: preferences.relationship_goal,
        });

        if (!preferencesResult.success) {
            setError(preferencesResult.error || "Failed to update preferences.");
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

    function handlePreferencesChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) {
        const { name, value } = e.target;

        setPreferences((prev) => {
            switch (name) {
                case "age_range_min": {
                    const parsed = value ? parseInt(value, 10) : prev.age_range.min;
                    return {
                        ...prev,
                        age_range: {
                            ...prev.age_range,
                            min: Number.isNaN(parsed) ? prev.age_range.min : parsed,
                        },
                    };
                }
                case "age_range_max": {
                    const parsed = value ? parseInt(value, 10) : prev.age_range.max;
                    return {
                        ...prev,
                        age_range: {
                            ...prev.age_range,
                            max: Number.isNaN(parsed) ? prev.age_range.max : parsed,
                        },
                    };
                }
                case "distance_miles": {
                    const parsed = value ? parseInt(value, 10) : prev.distance_miles;
                    return {
                        ...prev,
                        distance_miles: Number.isNaN(parsed) ? prev.distance_miles : parsed,
                    };
                }
                case "relationship_goal_preference":
                    return {
                        ...prev,
                        relationship_goal: value as UserPreferences["relationship_goal"],
                    };
                default:
                    return prev;
            }
        });
    }

    function toggleGenderPreference(value: UserPreferences["gender_preferences"][number]) {
        setPreferences((prev) => {
            const next = new Set(prev.gender_preferences);

            if (next.has(value)) {
                next.delete(value);
            } else {
                next.add(value);
            }

            return {
                ...prev,
                gender_preferences: Array.from(next),
            };
        });
    }

    if (loading) {
        return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
        Loading profile...
        </p>
    </div>
    </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
    <div className="container mx-auto px-4 py-8">
    <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Edit Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
        Update your profile information
        </p>
    </header>

    <div className="max-w-2xl mx-auto">
        <form
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
        onSubmit={handleFormSubmit}
        >
        <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Profile Picture
            </label>
            <div className="flex items-center space-x-6">
            <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                <img
                    src={
                    formData.profile_picture_url || "/default-avatar.svg"
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
                </div>
                <PhotoUpload
                onPhotoUploaded={(url) => {
                    setFormData((prev) => ({
                    ...prev,
                    profile_picture_url: url,
                    }));
                }}
                />
            </div>

            <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Upload a new profile picture
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                JPG, PNG or GIF. Max 5MB.
                </p>
            </div>
            </div>
        </div>

        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
            <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                Full Name *
            </label>
            <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
            />
            </div>

            <div>
            <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                Email
            </label>
            <input
                type="email"
                id="email"
                value={email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white dark:opacity-80 cursor-not-allowed"
                placeholder="Email address"
            />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
            <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                Gender *
            </label>
            <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            </div>

            <div>
            <label
                htmlFor="birthdate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                Birthday *
            </label>
            <input
                type="date"
                id="birthdate"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            </div>
        </div>

        <div className="mb-8">
            <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Tell others about yourself..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.bio.length}/500 characters
            </p>
        </div>

        {/* Profile Details Section */}
        <div className="mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Additional Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label
                htmlFor="height_cm"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                Height (cm)
                </label>
                <input
                type="number"
                id="height_cm"
                name="height_cm"
                value={profileDetails.height_cm ?? ""}
                onChange={handleProfileDetailsChange}
                min="0"
                max="300"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., 170"
                />
            </div>

            <div>
                <label
                htmlFor="relationship_goal"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                Relationship Goal
                </label>
                <select
                id="relationship_goal"
                name="relationship_goal"
                value={profileDetails.relationship_goal}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                Education
                </label>
                <input
                type="text"
                id="education"
                name="education"
                value={profileDetails.education}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Bachelor's Degree"
                />
            </div>

            <div>
                <label
                htmlFor="occupation"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                Occupation
                </label>
                <input
                type="text"
                id="occupation"
                name="occupation"
                value={profileDetails.occupation}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Software Engineer"
                />
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
                <label
                htmlFor="smoking"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                Smoking
                </label>
                <select
                id="smoking"
                name="smoking"
                value={profileDetails.smoking === null ? "" : profileDetails.smoking.toString()}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                <option value="">Prefer not to say</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
                </select>
            </div>

            <div>
                <label
                htmlFor="drinking"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                Drinking
                </label>
                <select
                id="drinking"
                name="drinking"
                value={profileDetails.drinking === null ? "" : profileDetails.drinking.toString()}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                <option value="">Prefer not to say</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
                </select>
            </div>

            <div>
                <label
                htmlFor="children"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                Children
                </label>
                <select
                id="children"
                name="children"
                value={profileDetails.children}
                onChange={handleProfileDetailsChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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

                <div className="mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Preferences
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label
                                htmlFor="distance_miles"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Maximum Distance (miles)
                            </label>
                            <input
                                type="number"
                                id="distance_miles"
                                name="distance_miles"
                                min="1"
                                max="500"
                                value={preferences.distance_miles}
                                onChange={handlePreferencesChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="e.g., 25"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="relationship_goal_preference"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Relationship Goal Preference
                            </label>
                            <select
                                id="relationship_goal_preference"
                                name="relationship_goal_preference"
                                value={preferences.relationship_goal}
                                onChange={handlePreferencesChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Preferred Age Range
                            </label>
                            <div className="flex space-x-4">
                                <input
                                    type="number"
                                    name="age_range_min"
                                    min="18"
                                    max={preferences.age_range.max}
                                    value={preferences.age_range.min}
                                    onChange={handlePreferencesChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Min"
                                />
                                <input
                                    type="number"
                                    name="age_range_max"
                                    min={preferences.age_range.min}
                                    max="100"
                                    value={preferences.age_range.max}
                                    onChange={handlePreferencesChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Max"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Gender Preferences
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {genderPreferenceOptions.map((option) => {
                                    const checked = preferences.gender_preferences.includes(option);
                                    return (
                                        <label
                                            key={option}
                                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                                                checked
                                                    ? "border-pink-500 bg-pink-50 dark:bg-pink-500/20"
                                                    : "border-gray-300 dark:border-gray-600"
                                            } text-sm text-gray-700 dark:text-gray-200 cursor-pointer`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleGenderPreference(option)}
                                                className="form-checkbox h-4 w-4 text-pink-500 focus:ring-pink-500"
                                            />
                                            <span className="capitalize">{option.replace(/_/g, " ")}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

        {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
            Cancel
            </button>
            <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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