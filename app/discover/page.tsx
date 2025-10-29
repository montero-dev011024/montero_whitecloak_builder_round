    "use client";

    import { useCallback, useEffect, useState } from "react";
    import { useRouter } from "next/navigation";
    import type { UserPreferences, UserProfile } from "../profile/page";
    import { getPotentialMatches, likeUser } from "@/lib/actions/matches";
    import {
        getCurrentUserProfile,
        updateUserPreferences,
    } from "@/lib/actions/profile";
    import MatchCard from "@/components/MatchCard";
    import MatchButtons from "@/components/MatchButtons";
    import MatchNotification from "@/components/MatchNotification";

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
        const [preferencesError, setPreferencesError] = useState<string | null>(null);

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
            setPreferencesError(null);
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
            setPreferencesError(null);
        };

        const handleSavePreferences = async () => {
            setPreferencesSaving(true);
            setPreferencesError(null);

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
                handleCloseMatchNotification();
            }

        if (loading) {
            return (
                <div className="h-full bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            Finding your matches...
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full overflow-y-auto bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <header className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors duration-200"
                                title="Go back"
                            >
                                <svg
                                    className="w-6 h-6 text-gray-700 dark:text-gray-300"
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
                            <div className="flex-1" />
                        </div>

                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Discover Matches
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {Math.min(currentIndex + 1, potentialMatches.length)} of {potentialMatches.length} profiles
                            </p>
                        </div>
                    </header>

                    <section className="max-w-2xl mx-auto mb-10">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Discovery Preferences
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleSavePreferences}
                                    disabled={!preferencesDirty || preferencesSaving}
                                    className="px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {preferencesSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Adjust your preferences to personalize the profiles shown below.
                            </p>

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            {preferencesError && (
                                <p className="mt-4 text-sm text-red-600 dark:text-red-400">{preferencesError}</p>
                            )}
                        </div>
                    </section>

                    <div className="max-w-md mx-auto">
                        {hasMatches && currentPotentialMatch ? (
                            <>
                                <MatchCard user={currentPotentialMatch} />
                                <div className="mt-8">
                                    <MatchButtons onLike={handleLike} onPass={handlePass} />
                                </div>
                            </>
                        ) : (
                            <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                                <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-4xl">💕</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    No more profiles to show
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Adjust your discovery preferences above or check back later for new matches.
                                </p>
                                <button
                                    onClick={loadMatches}
                                    className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
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