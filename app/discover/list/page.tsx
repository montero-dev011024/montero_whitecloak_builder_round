"use client";

import { UserProfile } from "@/app/profile/page";
import { getUserMatches } from "@/lib/actions/matches";
import { useEffect, useState } from "react";
import Link from "next/link";
import { calculateAge } from "@/lib/helpers/calculate-age";
import Image from "next/image";
import { useRouter } from "next/navigation";

const DEFAULT_AVATAR = "/default-avatar.svg";

export default function MatchesListPage() {
    const router = useRouter();
    const [matches, setMatches] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadMatches() {
            try {
                const userMatches = await getUserMatches();
                setMatches(userMatches);
            } catch (err) {
                console.error("Failed to load matches:", err);
                setError("Failed to load matches.");
            } finally {
                setLoading(false);
            }
        }

        loadMatches();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading your matches...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Oops! Something went wrong
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
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
                            Your Matches
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {matches.length} match{matches.length !== 1 ? "es" : ""}
                        </p>
                    </div>
                </header>

                {matches.length === 0 ? (
                    <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                        <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">💕</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            No matches yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start swiping to find your perfect match!
                        </p>
                        <Link
                            href="/discover"
                            className="inline-block bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
                        >
                            Start Swiping
                        </Link>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <div className="grid gap-4">
                            {matches.map((match) => {
                                const avatarSrc = match.profile_picture_url || DEFAULT_AVATAR;

                                return (
                                    <Link
                                        key={match.id}
                                        href={`/chat/${match.id}`}
                                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                                                <Image
                                                    src={avatarSrc}
                                                    alt={match.full_name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                    {match.full_name}, {calculateAge(match.birthdate)}
                                                </h3>
                                                {match.occupation && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                        {match.occupation}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {match.bio || "No bio available"}
                                                </p>
                                            </div>

                                            <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                                                {match.is_online ? (
                                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Online now" />
                                                ) : (
                                                    <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" title="Offline" />
                                                )}
                                                <svg
                                                    className="w-5 h-5 text-gray-400"
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
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}