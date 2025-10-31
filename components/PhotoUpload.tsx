"use client";

/**
 * PhotoUpload Component
 *
 * Profile picture upload button with validation and loading states.
 * Styled as a floating camera button typically positioned over a profile picture.
 * Handles file selection, validation, upload, and error display.
 *
 * Key Features:
 * - File type validation (images only)
 * - File size validation (max 5MB)
 * - Loading spinner during upload
 * - Error state display
 * - Success callback with uploaded image URL
 * - Cosmic theme golden button styling
 * - Hidden file input with programmatic trigger
 * - Disabled state during upload
 *
 * Validation Rules:
 * - Only image files accepted (image/*)
 * - Maximum file size: 5MB
 * - Server-side upload via API route
 *
 * @component
 * @example
 * ```tsx
 * <div className="relative">
 *   <img src={profilePicture} alt="Profile" />
 *   <PhotoUpload
 *     onPhotoUploaded={(url) => {
 *       setProfilePicture(url);
 *       showSuccessMessage("Photo updated!");
 *     }}
 *   />
 * </div>
 * ```
 */

import { useRef, useState } from "react";

export default function PhotoUpload({
    onPhotoUploaded,
}: {
    /** Callback with the uploaded photo URL on successful upload */
    onPhotoUploaded: (url: string) => void;
}) {
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            event.target.value = "";
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("profilePicture", file);

            const response = await fetch("/api/profile/photo", {
                method: "POST",
                body: formData,
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                const message = result?.error ?? "Failed to upload photo.";
                setError(message);
                return;
            }

            onPhotoUploaded(result.profilePictureUrl as string);
            setError(null);
        } catch (err) {
            setError("Failed to change photo");
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    }

    function handleClick() {
        fileInputRef.current?.click();
    }

    return (
        <div className="absolute bottom-0 right-0">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />
            <button
                type="button"
                onClick={handleClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 rounded-full hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
                    color: "hsl(220 30% 8%)",
                    boxShadow: "0 0 20px hsl(45 90% 55% / 0.5)",
                }}
                title="Change photo"
            >
                {uploading ? (
                    <div
                        className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: "hsl(220 30% 8%)" }}
                    ></div>
                ) : (
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                )}
            </button>
            {error && (
                <p className="absolute -bottom-6 right-0 text-xs" style={{ color: "hsl(0 70% 70%)" }}>
                    {error}
                </p>
            )}
        </div>
    );
}