"use client";

/**
 * User Profile View Page
 * 
 * Displays the current user's complete profile including personal information,
 * profile details, and discovery preferences. Provides navigation to edit profile
 * and manage blocked users. Read-only view of all profile data.
 * 
 * Key Features:
 * - Display complete user profile information
 * - Profile picture with fallback to default avatar
 * - Basic info (name, age, email, bio)
 * - Additional details (occupation, education, height, lifestyle)
 * - Discovery preferences display
 * - Quick action links (Edit Profile, Blocked Users, Settings)
 * - Loading and error states
 * - Responsive card-based layout
 * - Icons for visual clarity
 * 
 * Data Displayed:
 * - Profile picture with camera icon for upload
 * - Full name and age calculated from birthdate
 * - Email address
 * - Bio/description
 * - Occupation and education
 * - Height in centimeters
 * - Relationship goal
 * - Lifestyle choices (smoking, drinking, children)
 * - Discovery preferences (age range, distance, genders)
 * 
 * Quick Actions:
 * - Edit Profile: Navigate to /profile/edit
 * - Blocked Users: Navigate to /block
 * - Settings: Placeholder for future feature
 * 
 * Visual Design:
 * - Cosmic theme with gradient background
 * - Glass-morphism cards for content sections
 * - Golden accents for headings and icons
 * - Responsive grid layout
 * - Icon-based visual indicators
 * 
 * Type Definitions:
 * - Exports UserProfile interface for app-wide use
 * - Exports UserPreferences interface
 * - Exports UserProfileDetails interface
 * 
 * @page
 * @route /profile
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { calculateAge } from "@/lib/helpers/calculate-age";

/**
 * Complete user profile data structure
 * Used throughout the app for type safety
 */
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  gender: "male" | "female" | "non-binary" | "prefer_not_to_say";
  birthdate: string;
  bio: string;
  profile_picture_url: string | null;
  profile_picture_uploaded_at?: string | null;
  preferences: UserPreferences;
  location_lat: number | null;
  location_lng: number | null;
  is_online: boolean;
  last_active_at: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  // Profile details from profiles table
  height_cm?: number | null;
  education?: string | null;
  occupation?: string | null;
  relationship_goal?: "something_casual" | "something_serious" | "not_sure" | "just_exploring";
  smoking?: boolean | null;
  drinking?: boolean | null;
  children?: string | null;
}

export interface UserPreferences {
  age_range: {
    min: number;
    max: number;
  };
  distance_miles: number;
  gender_preferences: string[];
  relationship_goal: "something_casual" | "something_serious" | "not_sure" | "just_exploring";
}

export interface UserProfileDetails {
  id: string;
  user_id: string;
  profile_picture_url: string | null;
  profile_picture_uploaded_at: string | null;
  height_cm: number | null;
  education: string | null;
  occupation: string | null;
  relationship_goal: "something_casual" | "something_serious" | "not_sure" | "just_exploring";
  smoking: boolean | null;
  drinking: boolean | null;
  children: string | null;
  visibility: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profileData = await getCurrentUserProfile();
        console.log(profileData);
        if (profileData) {
          setProfile(profileData);
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        console.error("Error loading profile: ", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "hsl(45 90% 55%)" }}></div>
          <p className="mt-4" style={{ color: "hsl(220 10% 65%)" }}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))" }}>
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "hsl(45 90% 55%)" }}>
            Profile not found
          </h2>
          <p className="mb-6" style={{ color: "hsl(220 10% 65%)" }}>
            {error || "Unable to load your profile. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="font-semibold py-3 px-6 rounded-full transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
              color: "hsl(220 30% 8%)",
              boxShadow: "0 0 40px hsl(45 90% 55% / 0.3)"
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(45 90% 55%)" }}>
            My Profile
          </h1>
          <p style={{ color: "hsl(220 10% 65%)" }}>
            Manage your profile and preferences
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="rounded-2xl shadow-lg p-8 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden" style={{ boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)" }}>
                      <img
                        src={profile.profile_picture_url || "/default-avatar.svg"}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1" style={{ color: "hsl(45 90% 55%)" }}>
                      {profile.full_name}, {calculateAge(profile.birthdate)}
                    </h2>
                    <p className="mb-2" style={{ color: "hsl(220 10% 65%)" }}>
                      {profile.email}
                    </p>
                    <p className="text-sm" style={{ color: "hsl(220 10% 60%)" }}>
                      Member since{" "}
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: "hsl(45 90% 55%)" }}>
                      About Me
                    </h3>
                    <p className="leading-relaxed" style={{ color: "hsl(220 10% 70%)" }}>
                      {profile.bio || "No bio added yet."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: "hsl(45 90% 55%)" }}>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: "hsl(220 10% 65%)" }}>
                          Gender
                        </label>
                        <p className="capitalize" style={{ color: "hsl(220 10% 95%)" }}>
                          {profile.gender.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: "hsl(220 10% 65%)" }}>
                          Birthday
                        </label>
                        <p style={{ color: "hsl(220 10% 95%)" }}>
                          {new Date(profile.birthdate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details Section */}
                  {(profile.height_cm || profile.education || profile.occupation || 
                    profile.smoking !== null || profile.drinking !== null || profile.children) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3" style={{ color: "hsl(45 90% 55%)" }}>
                        Additional Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {profile.height_cm && (
                          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: "hsl(220 10% 65%)" }}>
                              📏 Height
                            </label>
                            <p style={{ color: "hsl(220 10% 95%)" }}>
                              {profile.height_cm} cm
                            </p>
                          </div>
                        )}
                        {profile.relationship_goal && (
                          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: "hsl(220 10% 65%)" }}>
                              💕 Looking for
                            </label>
                            <p className="capitalize" style={{ color: "hsl(220 10% 95%)" }}>
                              {profile.relationship_goal.replace(/_/g, " ")}
                            </p>
                          </div>
                        )}
                        {profile.education && (
                          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: "hsl(220 10% 65%)" }}>
                              🎓 Education
                            </label>
                            <p style={{ color: "hsl(220 10% 95%)" }}>
                              {profile.education}
                            </p>
                          </div>
                        )}
                        {profile.occupation && (
                          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: "hsl(220 10% 65%)" }}>
                              💼 Occupation
                            </label>
                            <p style={{ color: "hsl(220 10% 95%)" }}>
                              {profile.occupation}
                            </p>
                          </div>
                        )}
                        {profile.smoking !== null && (
                          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: "hsl(220 10% 65%)" }}>
                              🚬 Smoking
                            </label>
                            <p style={{ color: "hsl(220 10% 95%)" }}>
                              {profile.smoking ? "Yes" : "No"}
                            </p>
                          </div>
                        )}
                        {profile.drinking !== null && (
                          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: "hsl(220 10% 65%)" }}>
                              🍷 Drinking
                            </label>
                            <p style={{ color: "hsl(220 10% 95%)" }}>
                              {profile.drinking ? "Yes" : "No"}
                            </p>
                          </div>
                        )}
                        {profile.children && (
                          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: "hsl(220 10% 65%)" }}>
                              👶 Children
                            </label>
                            <p className="capitalize" style={{ color: "hsl(220 10% 95%)" }}>
                              {profile.children.replace(/_/g, " ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl shadow-lg p-6 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "hsl(45 90% 55%)" }}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/profile/edit"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))" }}>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: "hsl(220 30% 8%)" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <span style={{ color: "hsl(220 10% 95%)" }}>
                        Edit Profile
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: "hsl(220 10% 60%)" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl shadow-lg p-6 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "hsl(45 90% 55%)" }}>
                  Account
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col p-3 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                    <span className="text-sm font-medium mb-2" style={{ color: "hsl(220 10% 65%)" }}>
                      Email
                    </span>
                    <span className="break-all text-sm" style={{ color: "hsl(220 10% 95%)" }}>
                      {profile.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}