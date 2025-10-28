"use client";

import PhotoUpload from "@/components/PhotoUpload";
import type { UserProfile } from "@/app/profile/page";
import {
getCurrentUserProfile,
updateUserProfile,
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

const [formData, setFormData] = useState<EditableProfileFormState>({
full_name: "",
bio: "",
gender: "prefer_not_to_say",
birthdate: "",
profile_picture_url: null,
});
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
    const result = await updateUserProfile(formData);
    if (result.success) {
    router.push("/profile");
    } else {
    setError(result.error || "Failed to update profile.");
    }
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
                    formData.profile_picture_url || "/default-avatar.png"
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