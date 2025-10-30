"use client";

/**
 * ChatHeader Component
 * 
 * Displays the header section of a chat conversation with a matched user.
 * Shows user information including profile picture, name, age, and online status.
 * Provides navigation back button and video call initiation button.
 * 
 * Key Features:
 * - User profile display with avatar and basic info
 * - Online/offline status indicator
 * - Back navigation button
 * - Video call button with cosmic theme styling
 * - Responsive design for mobile and desktop
 * 
 * @component
 * @example
 * ```tsx
 * <ChatHeader 
 *   user={matchedUserProfile} 
 *   onVideoCall={() => initiateVideoCall()}
 * />
 * ```
 */

import { UserProfile } from "@/app/profile/page";
import { calculateAge } from "@/lib/helpers/calculate-age";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  /** User profile object containing name, age, avatar, and status */
  user: UserProfile;
  /** Optional callback function to initiate a video call */
  onVideoCall?: () => void;
}
export default function ChatHeader({ user, onVideoCall }: ChatHeaderProps) {
  const router = useRouter();
  return (
    <div className="border-b px-6 py-4 backdrop-blur-md" style={{ backgroundColor: "rgba(20, 18, 30, 0.9)", borderColor: "rgba(232, 185, 96, 0.2)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            style={{ color: "hsl(45 90% 55%)" }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden" style={{ boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)" }}>
              <img
                src={user.profile_picture_url || "/default-avatar.png"}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
              {user.is_online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 border-2 rounded-full" style={{ backgroundColor: "hsl(160 70% 50%)", borderColor: "rgba(20, 18, 30, 0.9)" }}></div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold" style={{ color: "hsl(45 90% 55%)" }}>
                {user.full_name}, {calculateAge(user.birthdate)}
              </h2>
              <p className="text-sm" style={{ color: "hsl(220 10% 65%)" }}>
                {user.is_online ? "Active now" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onVideoCall}
            className="p-3 rounded-full transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
              color: "hsl(220 30% 8%)",
              boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)"
            }}
            title="Start Video Call"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}