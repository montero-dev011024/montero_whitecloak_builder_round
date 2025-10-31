    "use client";

/**
 * Discover/Swipe Page
 * 
 * Main discovery interface for finding potential matches through card swiping.
 * Features Tinder-style swipeable cards, real-time preference editing, and
 * match notifications. Filters potential matches based on user preferences.
 * 
 * Key Features:
 * - Swipeable card interface (left to pass, right to like)
 * - Real-time preference adjustment sidebar
 * - Match notification with immediate chat option
 * - Filter potential matches by age, distance, and gender preferences
 * - Automatic match checking on mutual likes
 * - Empty state when no matches available
 * - Loading states during data fetch
 * - Card stack with current match indicator
 * - Preference persistence to database
 * 
 * Swiping Actions:
 * - Swipe Right / Like: Creates like in database, checks for mutual match
 * - Swipe Left / Pass: Skips to next profile without action
 * - Match Detection: Shows notification if both users have liked each other
 * 
 * Discovery Preferences (Editable):
 * - Age Range: Min and max age filters (18-100)
 * - Distance: Maximum distance in miles (1-100)
 * - Gender Preferences: Male, Female, Non-binary (multi-select)
 * - Relationship Goal: What user is looking for
 * 
 * Preference Controls:
 * - Collapsible sidebar for preference editing
 * - Real-time validation and feedback
 * - Save preferences button
 * - Reset to defaults option
 * - Icon-based visual indicators
 * 
 * Match Notification:
 * - Displays when mutual match occurs
 * - Shows matched user's profile picture
 * - "Start Chat" button for immediate messaging
 * - "Later" button to dismiss
 * - Auto-dismisses after 5 seconds
 * 
 * Empty States:
 * - No profiles available message
 * - Suggestions to adjust preferences
 * - Link to edit profile
 * 
 * Visual Design:
 * - Cosmic theme with gradient background
 * - Card-based swipeable interface
 * - Glass-morphism sidebar
 * - Golden accents throughout
 * - Responsive layout (mobile and desktop)
 * - Smooth animations and transitions
 * 
 * Data Flow:
 * 1. Load user's current preferences
 * 2. Fetch potential matches based on preferences
 * 3. Display matches as swipeable cards
 * 4. Handle like/pass actions
 * 5. Check for mutual matches
 * 6. Update preferences in real-time
 * 
 * @page
 * @route /discover
 */

    import { useCallback, useEffect, useState } from "react";
    import { useRouter } from "next/navigation";
    import type { UserPreferences, UserProfile } from "../profile/page";
    import { getPotentialMatches, likeUser } from "@/lib/actions/matches";
    import {
        getCurrentUserProfile,
        updateUserPreferences,
    } from "@/lib/actions/profile";
    import MatchCard from "@/components/MatchCard";
    import MatchNotification from "@/components/MatchNotification";

    /**
     * Default discovery preferences applied when user has none set
     */
    const defaultPreferences: UserPreferences = {
        age_range: { min: 18, max: 50 },
        distance_miles: 25,
        gender_preferences: [],
        relationship_goal: "not_sure",
    };

    const genderPreferenceOptions: Array<UserPreferences["gender_preferences"][number]> = [
        "male",
        "female",
        "non-binary",
    ];

    export default function MatchesPage() {
        const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
        const [loading, setLoading] = useState(true);
        const [currentIndex, setCurrentIndex] = useState(0);

        const [showMatchNotification, setShowMatchNotification] = useState(false);
        const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

        const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
        const [preferencesDirty, setPreferencesDirty] = useState(false);
        const [preferencesSaving, setPreferencesSaving] = useState(false);
            const [preferencesError, setPreferencesError] = useState<string>("");
    const [preferencesExpanded, setPreferencesExpanded] = useState<boolean>(true);
    const genderPreferenceOptions = ["male", "female", "non_binary", "other"] as const;

        const router = useRouter();

        const loadMatches = useCallback(async () => {
            setLoading(true);
            try {
                const matches = await getPotentialMatches();
                setPotentialMatches(matches);
                setCurrentIndex(0);
            } catch (error) {
                console.error("Failed to load potential matches", error);
            } finally {
                setLoading(false);
            }
        }, []);

        useEffect(() => {
            async function loadPreferences() {
                try {
                    const profile = await getCurrentUserProfile();

                    if (profile?.preferences) {
                        setPreferences({
                            age_range: {
                                min:
                                    profile.preferences.age_range?.min ?? defaultPreferences.age_range.min,
                                max:
                                    profile.preferences.age_range?.max ?? defaultPreferences.age_range.max,
                            },
                            distance_miles:
                                profile.preferences.distance_miles ?? defaultPreferences.distance_miles,
                            gender_preferences: Array.isArray(profile.preferences.gender_preferences)
                                ? Array.from(new Set(profile.preferences.gender_preferences))
                                : [],
                            relationship_goal:
                                profile.preferences.relationship_goal ?? defaultPreferences.relationship_goal,
                        });
                    }
                } catch (error) {
                    console.error("Failed to load discovery preferences", error);
                }
            }

            loadPreferences();
        }, []);

        useEffect(() => {
            loadMatches();
        }, [loadMatches]);

        const hasMatches =
            potentialMatches.length > 0 && currentIndex < potentialMatches.length;
        const currentPotentialMatch = hasMatches
            ? potentialMatches[currentIndex]
            : null;

        const handlePreferencesChange = (
            event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        ) => {
            const { name, value } = event.target;

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
                    case "relationship_goal":
                        return {
                            ...prev,
                            relationship_goal: value as UserPreferences["relationship_goal"],
                        };
                    default:
                        return prev;
                }
            });

            setPreferencesDirty(true);
            setPreferencesError("");
        };

        const toggleGenderPreference = (
            gender: UserPreferences["gender_preferences"][number],
        ) => {
            setPreferences((prev) => {
                const next = new Set(prev.gender_preferences);

                if (next.has(gender)) {
                    next.delete(gender);
                } else {
                    next.add(gender);
                }

                return {
                    ...prev,
                    gender_preferences: Array.from(next),
                };
            });

            setPreferencesDirty(true);
            setPreferencesError("");
        };

        const handleSavePreferences = async () => {
            setPreferencesSaving(true);
            setPreferencesError("");

            try {
                const result = await updateUserPreferences({
                    age_range: {
                        min: preferences.age_range.min,
                        max: preferences.age_range.max,
                    },
                    distance_miles: preferences.distance_miles,
                    gender_preferences: preferences.gender_preferences,
                    relationship_goal: preferences.relationship_goal,
                });

                if (!result.success) {
                    setPreferencesError(result.error || "Failed to update preferences.");
                    return;
                }

                setPreferencesDirty(false);
                await loadMatches();
            } catch (error) {
                console.error("Failed to update discovery preferences", error);
                setPreferencesError("Failed to update preferences. Please try again.");
            } finally {
                setPreferencesSaving(false);
            }
        };

        async function handleLike() {
            if (!hasMatches || !currentPotentialMatch) {
                return;
            }

            try {
                const result = await likeUser(currentPotentialMatch.id);

                if (result.isMatch) {
                    setMatchedUser(result.matchedUser!);
                    setShowMatchNotification(true);
                }

                if (currentIndex < potentialMatches.length - 1) {
                    setCurrentIndex((prev) => prev + 1);
                } else {
                    setCurrentIndex(potentialMatches.length);
                }
            } catch (error) {
                console.error("Failed to like user", error);
            }
        }

        function handlePass() {
            if (!hasMatches) {
                return;
            }

            if (currentIndex < potentialMatches.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                setCurrentIndex(potentialMatches.length);
            }
        }

        function handleCloseMatchNotification() {
            setShowMatchNotification(false);
            setMatchedUser(null);
        }

        function handleStartChat() {
            if (matchedUser?.id) {
                router.push(`/chat/${matchedUser.id}`);
            }
            handleCloseMatchNotification();
        }

        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background" style={{ background: "var(--gradient-cosmic)" }}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                        <p className="mt-4 text-muted-foreground">
                            Finding your matches...
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-background" style={{ background: "var(--gradient-cosmic)" }}>
                <div className="container mx-auto px-4 py-8 pb-20">
                    <header className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                        </div>

                        <div className="text-center">
                            <h1 className="text-3xl font-bold mb-2 text-primary">
                                Discover Matches
                            </h1>
                            <p className="text-muted-foreground">
                                {Math.min(currentIndex + 1, potentialMatches.length)} of {potentialMatches.length} profiles
                            </p>
                        </div>
                    </header>

                    <section className="max-w-2xl mx-auto mb-10">
                        <div className="rounded-2xl shadow-lg overflow-hidden backdrop-blur-md bg-card/50 border border-border">
                            <button
                                type="button"
                                onClick={() => setPreferencesExpanded(!preferencesExpanded)}
                                className="w-full flex items-center justify-between p-6 hover:bg-white/10 transition-colors duration-200"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-warm)" }}>
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
                                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                            />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-xl font-semibold text-primary">
                                            Discovery Preferences
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {preferencesExpanded ? "Click to collapse" : "Click to expand and customize"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {preferencesDirty && (
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary">
                                            Unsaved
                                        </span>
                                    )}
                                    <svg
                                        className={`w-6 h-6 transition-transform duration-200 text-muted-foreground ${
                                            preferencesExpanded ? "rotate-180" : ""
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                            </button>

                            {preferencesExpanded && (
                                <div className="px-6 pb-6 space-y-6 animate-in fade-in duration-200">
                                    <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-primary">
                                                🎂 Preferred Age Range
                                            </label>
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="number"
                                                        name="age_range_min"
                                                        min="18"
                                                        max={preferences.age_range.max}
                                                        value={preferences.age_range.min}
                                                        onChange={handlePreferencesChange}
                                                        className="flex-1 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-input border border-border text-foreground"
                                                        placeholder="Min"
                                                    />
                                                    <span className="text-muted-foreground">to</span>
                                                    <input
                                                        type="number"
                                                        name="age_range_max"
                                                        min={preferences.age_range.min}
                                                        max="100"
                                                        value={preferences.age_range.max}
                                                        onChange={handlePreferencesChange}
                                                        className="flex-1 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-input border border-border text-foreground"
                                                        placeholder="Max"
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Min: 18</span>
                                                    <span className="font-medium text-primary">
                                                        {preferences.age_range.min} - {preferences.age_range.max} years
                                                    </span>
                                                    <span>Max: 100</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="distance_miles"
                                                className="block text-sm font-medium mb-2 text-primary"
                                            >
                                                📍 Maximum Distance
                                            </label>
                                            <div className="space-y-3">
                                                <input
                                                    type="number"
                                                    id="distance_miles"
                                                    name="distance_miles"
                                                    min="1"
                                                    max="500"
                                                    value={preferences.distance_miles}
                                                    onChange={handlePreferencesChange}
                                                    className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-input border border-border text-foreground"
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>1 mile</span>
                                                    <span className="font-medium text-primary">
                                                        Within {preferences.distance_miles} miles
                                                    </span>
                                                    <span>500 miles</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-3 text-primary">
                                                👥 Gender Preferences
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {genderPreferenceOptions.map((option) => {
                                                    const checked = preferences.gender_preferences.includes(option);

                                                    return (
                                                        <button
                                                            key={option}
                                                            type="button"
                                                            onClick={() => toggleGenderPreference(option)}
                                                            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                                                                checked
                                                                    ? "shadow-sm border-primary bg-primary/10"
                                                                    : "hover:bg-white/5 border-border"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                                                    checked ? "border-primary text-primary-foreground" : "border-border"
                                                                }`}
                                                                style={{
                                                                    background: checked ? "var(--gradient-warm)" : "transparent"
                                                                }}
                                                            >
                                                                {checked && (
                                                                    <svg
                                                                        className="w-3.5 h-3.5"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={3}
                                                                            d="M5 13l4 4L19 7"
                                                                        />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span
                                                                className={`text-sm font-medium capitalize ${
                                                                    checked ? "text-primary" : "text-muted-foreground"
                                                                }`}
                                                            >
                                                                {option.replace(/_/g, " ")}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="relationship_goal"
                                                className="block text-sm font-medium mb-3 text-primary"
                                            >
                                                💕 Relationship Goal
                                            </label>
                                            <select
                                                id="relationship_goal"
                                                name="relationship_goal"
                                                value={preferences.relationship_goal}
                                                onChange={handlePreferencesChange}
                                                className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-no-repeat bg-right pr-10 transition-all bg-input border border-border text-foreground"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23E8B960'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                    backgroundSize: "1.5rem",
                                                    backgroundPosition: "right 0.75rem center",
                                                }}
                                            >
                                                <option value="not_sure">Not sure yet</option>
                                                <option value="something_casual">Something casual</option>
                                                <option value="something_serious">Something serious</option>
                                                <option value="just_exploring">Just exploring</option>
                                            </select>
                                        </div>
                                    </div>

                                    {preferencesError && (
                                        <div className="flex items-start space-x-2 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                                            <svg
                                                className="w-5 h-5 flex-shrink-0 mt-0.5 text-destructive"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <p className="text-sm text-destructive">{preferencesError}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <p className="text-xs text-muted-foreground">
                                            {preferencesDirty
                                                ? "You have unsaved changes"
                                                : "All changes saved"}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleSavePreferences}
                                            disabled={!preferencesDirty || preferencesSaving}
                                            className="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground"
                                            style={{
                                                background: "var(--gradient-warm)",
                                                boxShadow: "var(--shadow-glow-warm)"
                                            }}
                                        >
                                            {preferencesSaving ? (
                                                <span className="flex items-center space-x-2">
                                                    <svg
                                                        className="animate-spin h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        />
                                                    </svg>
                                                    <span>Saving...</span>
                                                </span>
                                            ) : (
                                                "Save Preferences"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="max-w-md mx-auto h-auto overflow-hidden">
                        {hasMatches && currentPotentialMatch ? (
                            <>
                                <MatchCard 
                                    user={currentPotentialMatch} 
                                    onLike={handleLike}
                                    onPass={handlePass}
                                />
                            </>
                        ) : (
                            <div className="text-center max-w-md mx-auto p-8 rounded-2xl shadow-lg backdrop-blur-md bg-card/50 border border-border">
                                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "var(--gradient-warm)" }}>
                                    <span className="text-4xl">💕</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-4 text-primary">
                                    No more profiles to show
                                </h2>
                                <p className="mb-6 text-muted-foreground">
                                    Adjust your discovery preferences above or check back later for new matches.
                                </p>
                                <button
                                    onClick={loadMatches}
                                    className="font-semibold py-3 px-6 rounded-full transition-all duration-200 text-primary-foreground"
                                    style={{
                                        background: "var(--gradient-warm)",
                                        boxShadow: "var(--shadow-glow-warm)"
                                    }}
                                >
                                    Refresh
                                </button>
                            </div>
                        )}
                    </div>

                    {showMatchNotification && matchedUser && (
                        <MatchNotification
                            match={matchedUser}
                            onClose={handleCloseMatchNotification}
                            onStartChat={handleStartChat}
                        />
                    )}
                </div>
            </div>
        );
    }