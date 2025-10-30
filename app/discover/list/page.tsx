"use client";

/**
 * Matches List Page
 * 
 * Displays a grid of all active matches with options to open chat, unmatch,
 * or block each user. Features real-time updates via Supabase subscriptions
 * to automatically reflect new matches and removed matches.
 * 
 * Key Features:
 * - Grid display of all matched users
 * - Real-time match updates via Supabase realtime subscriptions
 * - Profile pictures with hover effects
 * - User info cards (name, age, occupation, bio)
 * - Action buttons per match (Chat, Unmatch, Block)
 * - Confirmation dialogs for destructive actions
 * - Empty state when no matches exist
 * - Loading and error states
 * - Responsive grid layout (1-3 columns based on screen size)
 * - Success/error feedback messages
 * 
 * User Actions:
 * - Open Chat: Navigate to individual chat page
 * - Unmatch: Remove match relationship (with confirmation)
 * - Block: Block user and remove match (with confirmation and optional reason)
 * 
 * Real-time Features:
 * - Automatically adds new matches to the list
 * - Removes matches when unmatched or blocked
 * - Updates match status on changes
 * - Subscribes to matches table for current user
 * 
 * Block Confirmation:
 * - Custom modal with reason input
 * - Optional reason for blocking (free text)
 * - "Block" and "Cancel" actions
 * - Removes match and prevents future matching
 * 
 * Data Displayed per Match:
 * - Profile picture (with fallback)
 * - Full name and age
 * - Occupation (if available)
 * - Bio snippet (truncated)
 * - Online status indicator
 * 
 * Visual Design:
 * - Cosmic theme with gradient background
 * - Glass-morphism cards for matches
 * - Golden accents for names and buttons
 * - Hover effects with scale and shadow
 * - Icon-based action buttons
 * - Responsive grid layout
 * 
 * Empty State:
 * - Displays when no matches exist
 * - Encourages user to start swiping
 * - Link to discover page
 * 
 * @page
 * @route /discover/list
 */

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

/**
 * Match row data structure from Supabase realtime events
 */
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
            <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "hsl(45 90% 55%)" }} />
                    <p className="mt-4" style={{ color: "hsl(220 10% 65%)" }}>
                        Loading your matches...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))" }}>
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: "hsl(45 90% 55%)" }}>
                        Oops! Something went wrong
                    </h2>
                    <p className="mb-6" style={{ color: "hsl(220 10% 65%)" }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="font-semibold py-3 px-6 rounded-full transition-all duration-200"
                        style={{
                            background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
                            color: "hsl(220 30% 8%)",
                            boxShadow: "0 0 40px hsl(45 90% 55% / 0.3)"
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                    </div>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(45 90% 55%)" }}>
                            Your Matches
                        </h1>
                        <p style={{ color: "hsl(220 10% 65%)" }}>
                            {matches.length} match{matches.length !== 1 ? "es" : ""}
                        </p>
                    </div>
                </header>

                {feedback && (
                    <div className="max-w-2xl mx-auto mb-6 rounded-xl border px-4 py-3 text-sm font-medium" style={{ borderColor: "rgba(16, 185, 129, 0.3)", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "hsl(160 70% 70%)" }}>
                        {feedback}
                    </div>
                )}

                {actionError && (
                    <div className="max-w-2xl mx-auto mb-6 rounded-xl border px-4 py-3 text-sm font-medium" style={{ borderColor: "rgba(230, 57, 70, 0.3)", backgroundColor: "rgba(230, 57, 70, 0.1)", color: "hsl(0 70% 70%)" }}>
                        {actionError}
                    </div>
                )}

                {matches.length === 0 ? (
                    <div className="text-center max-w-md mx-auto p-8 rounded-2xl shadow-lg backdrop-blur-md" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))" }}>
                            <span className="text-4xl">💕</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: "hsl(45 90% 55%)" }}>
                            No matches yet
                        </h2>
                        <p className="mb-6" style={{ color: "hsl(220 10% 65%)" }}>
                            Start swiping to find your perfect match!
                        </p>
                        <Link
                            href="/discover"
                            className="inline-block font-semibold py-3 px-6 rounded-full transition-all duration-200"
                            style={{
                                background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
                                color: "hsl(220 30% 8%)",
                                boxShadow: "0 0 40px hsl(45 90% 55% / 0.3)"
                            }}
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
                                        className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none hover:scale-[1.02] backdrop-blur-md"
                                        style={{ 
                                            backgroundColor: "rgba(255, 255, 255, 0.05)", 
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            boxShadow: "0 0 20px hsl(45 90% 55% / 0.1)"
                                        }}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)" }}>
                                                <Image
                                                    src={avatarSrc}
                                                    alt={match.full_name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold truncate" style={{ color: "hsl(45 90% 55%)" }}>
                                                    {match.full_name}, {calculateAge(match.birthdate)}
                                                </h3>
                                                {match.occupation && (
                                                    <p className="text-sm mb-1" style={{ color: "hsl(220 10% 65%)" }}>
                                                        {match.occupation}
                                                    </p>
                                                )}
                                                <p className="text-sm line-clamp-2" style={{ color: "hsl(220 10% 70%)" }}>
                                                    {match.bio || "No bio available"}
                                                </p>
                                            </div>

                                            <div className="flex-shrink-0 flex items-center space-x-3">
                                                {match.is_online ? (
                                                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: "hsl(160 70% 50%)" }} title="Online now" />
                                                ) : (
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }} title="Offline" />
                                                )}
                                                <button
                                                    onClick={handleUnmatch}
                                                    disabled={isPending}
                                                    className="p-2 rounded-full border transition-colors hover:bg-white/10 disabled:opacity-60"
                                                    style={{ borderColor: "rgba(255, 255, 255, 0.2)", color: "hsl(220 10% 70%)" }}
                                                    title="Unmatch"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={handleBlock}
                                                    disabled={isPending}
                                                    className="p-2 rounded-full border transition-colors hover:bg-white/10 disabled:opacity-60"
                                                    style={{ borderColor: "rgba(230, 57, 70, 0.5)", color: "hsl(0 70% 60%)" }}
                                                    title="Block user"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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