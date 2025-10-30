"use client";

import { UserProfile } from "@/app/profile/page";
import { getUserMatches } from "@/lib/actions/matches";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { MouseEvent } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import Link from "next/link";
import { calculateAge } from "@/lib/helpers/calculate-age";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { blockUser, unmatchUser } from "@/lib/actions/blocks";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-contexts";

const DEFAULT_AVATAR = "/default-avatar.svg";

type MatchRow = {
    id: string;
    user1_id: string;
    user2_id: string;
    is_active: boolean;
};

export default function MatchesListPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [matches, setMatches] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const refreshMatches = useCallback(() => {
        startTransition(() => {
            getUserMatches()
                .then((latest) => {
                    setMatches(latest);
                })
                .catch((err) => {
                    console.error("Failed to refresh matches", err);
                });
        });
    }, [startTransition]);

    useEffect(() => {
        let isMounted = true;

        async function loadMatches() {
            try {
                const userMatches = await getUserMatches();
                if (isMounted) {
                    setMatches(userMatches);
                }
            } catch (err) {
                console.error("Failed to load matches:", err);
                if (isMounted) {
                    setError("Failed to load matches.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadMatches();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!user) {
            return () => {};
        }

        const supabase = createClient();
        const channel = supabase
            .channel(`matches-list-${user.id}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "matches" },
                (payload: RealtimePostgresChangesPayload<MatchRow>) => {
                    const record = (payload.new ?? payload.old) as MatchRow | null;

                    if (!record) {
                        return;
                    }

                    if (record.user1_id !== user.id && record.user2_id !== user.id) {
                        return;
                    }

                    const otherUserId = record.user1_id === user.id ? record.user2_id : record.user1_id;

                    if (payload.eventType === "DELETE") {
                        setMatches((prev) => prev.filter((match) => match.id !== otherUserId));
                        return;
                    }

                    if (payload.eventType === "UPDATE") {
                        if (!payload.new?.is_active) {
                            setMatches((prev) => prev.filter((match) => match.id !== otherUserId));
                            return;
                        }

                        refreshMatches();
                        return;
                    }

                    if (payload.eventType === "INSERT" && payload.new?.is_active) {
                        refreshMatches();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, refreshMatches]);

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

                {feedback && (
                    <div className="max-w-2xl mx-auto mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                        {feedback}
                    </div>
                )}

                {actionError && (
                    <div className="max-w-2xl mx-auto mb-6 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
                        {actionError}
                    </div>
                )}

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

                                const handleOpenChat = () => router.push(`/chat/${match.id}`);

                                const handleUnmatch = (event: MouseEvent<HTMLButtonElement>) => {
                                    event.stopPropagation();

                                    const confirmed = window.confirm(
                                        `Unmatch ${match.full_name}? This will remove your chat history.`
                                    );

                                    if (!confirmed) {
                                        return;
                                    }

                                    setFeedback(null);
                                    setActionError(null);

                                    startTransition(async () => {
                                        try {
                                            await unmatchUser(match.id);
                                            setMatches((previous) => previous.filter((item) => item.id !== match.id));
                                            setFeedback(`${match.full_name} has been unmatched.`);
                                        } catch (err) {
                                            console.error("Failed to unmatch user", err);
                                            setActionError("Unable to unmatch right now. Please try again later.");
                                        }
                                    });
                                };

                                const handleBlock = (event: MouseEvent<HTMLButtonElement>) => {
                                    event.stopPropagation();

                                    const confirmed = window.confirm(
                                        `Block ${match.full_name}? They will not see you in Discover and cannot message you.`
                                    );

                                    if (!confirmed) {
                                        return;
                                    }

                                    setFeedback(null);
                                    setActionError(null);

                                    startTransition(async () => {
                                        try {
                                            await blockUser(match.id);
                                            setMatches((previous) => previous.filter((item) => item.id !== match.id));
                                            setFeedback(`${match.full_name} has been blocked.`);
                                        } catch (err) {
                                            console.error("Failed to block user", err);
                                            setActionError("Unable to block this user right now. Please try again later.");
                                        }
                                    });
                                };

                                return (
                                    <div
                                        key={match.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={handleOpenChat}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                handleOpenChat();
                                            }
                                        }}
                                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400/60 hover:scale-[1.02]"
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

                                            <div className="flex-shrink-0 flex items-center space-x-3">
                                                {match.is_online ? (
                                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Online now" />
                                                ) : (
                                                    <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" title="Offline" />
                                                )}
                                                <button
                                                    onClick={handleUnmatch}
                                                    disabled={isPending}
                                                    className="p-2 rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-pink-300 hover:text-pink-600 disabled:opacity-60 dark:border-gray-600 dark:text-gray-300 dark:hover:border-pink-300"
                                                    title="Unmatch"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={handleBlock}
                                                    disabled={isPending}
                                                    className="p-2 rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-60 dark:border-gray-600 dark:text-gray-300 dark:hover:border-red-300"
                                                    title="Block user"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a2 2 0 012 2v3a2 2 0 01-4 0v-3a2 2 0 012-2zm6 0V9a6 6 0 10-12 0v2H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2h-1zM9 11V9a3 3 0 116 0v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}