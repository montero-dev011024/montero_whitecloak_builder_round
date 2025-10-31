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
      <div className="min-h-screen flex items-center justify-center bg-background" style={{ background: "var(--gradient-cosmic)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" style={{ background: "var(--gradient-cosmic)" }}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "var(--gradient-warm)" }}>
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-primary">
            Profile not found
          </h2>
          <p className="mb-6 text-muted-foreground">
            {error || "Unable to load your profile. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="font-semibold py-3 px-6 rounded-full transition-all duration-200 text-primary-foreground"
            style={{
              background: "var(--gradient-warm)",
              boxShadow: "var(--shadow-glow-warm)"
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ background: "var(--gradient-cosmic)" }}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your profile and preferences
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="rounded-2xl shadow-lg p-8 backdrop-blur-md bg-card/50 border border-border">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden" style={{ boxShadow: "var(--shadow-glow-warm)" }}>
                      <img
                        src={profile.profile_picture_url || "/default-avatar.svg"}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1 text-primary">
                      {profile.full_name}, {calculateAge(profile.birthdate)}
                    </h2>
                    <p className="mb-2 text-muted-foreground">
                      {profile.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Member since{" "}
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary">
                      About Me
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {profile.bio || "No bio added yet."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">
                          Gender
                        </label>
                        <p className="capitalize text-foreground">
                          {profile.gender.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">
                          Birthday
                        </label>
                        <p className="text-foreground">
                          {new Date(profile.birthdate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details Section */}
                  {(profile.height_cm || profile.education || profile.occupation || 
                    profile.smoking !== null || profile.drinking !== null || profile.children) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary">
                        Additional Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {profile.height_cm && (
                          <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">
                              📏 Height
                            </label>
                            <p className="text-foreground">
                              {profile.height_cm} cm
                            </p>
                          </div>
                        )}
                        {profile.relationship_goal && (
                          <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">
                              💕 Looking for
                            </label>
                            <p className="capitalize text-foreground">
                              {profile.relationship_goal.replace(/_/g, " ")}
                            </p>
                          </div>
                        )}
                        {profile.education && (
                          <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">
                              🎓 Education
                            </label>
                            <p className="text-foreground">
                              {profile.education}
                            </p>
                          </div>
                        )}
                        {profile.occupation && (
                          <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">
                              💼 Occupation
                            </label>
                            <p className="text-foreground">
                              {profile.occupation}
                            </p>
                          </div>
                        )}
                        {profile.smoking !== null && (
                          <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">
                              🚬 Smoking
                            </label>
                            <p className="text-foreground">
                              {profile.smoking ? "Yes" : "No"}
                            </p>
                          </div>
                        )}
                        {profile.drinking !== null && (
                          <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">
                              🍷 Drinking
                            </label>
                            <p className="text-foreground">
                              {profile.drinking ? "Yes" : "No"}
                            </p>
                          </div>
                        )}
                        {profile.children && (
                          <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">
                              👶 Children
                            </label>
                            <p className="capitalize text-foreground">
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
              <div className="rounded-2xl shadow-lg p-6 backdrop-blur-md bg-card/50 border border-border">
                <h3 className="text-lg font-semibold mb-4 text-primary">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/profile/edit"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-warm)" }}>
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <span className="text-foreground">
                        Edit Profile
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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

              <div className="rounded-2xl shadow-lg p-6 backdrop-blur-md bg-card/50 border border-border">
                <h3 className="text-lg font-semibold mb-4 text-primary">
                  Account
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col p-3 rounded-lg bg-card/50">
                    <span className="text-sm font-medium mb-2 text-muted-foreground">
                      Email
                    </span>
                    <span className="break-all text-sm text-foreground">
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