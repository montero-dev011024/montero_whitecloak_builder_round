"use client";

/**
 * Blocked Users Management Page
 * 
 * Displays a list of all users blocked by the current user and provides
 * functionality to unblock them. Shows detailed information about each
 * blocked user including when and optionally why they were blocked.
 * 
 * Key Features:
 * - List of all blocked users with profile information
 * - Unblock functionality with confirmation dialog
 * - Display block date and reason (if provided)
 * - User profile pictures and basic details
 * - Empty state when no users are blocked
 * - Loading states during data fetch
 * - Success/error feedback messages
 * - Back navigation button
 * - Responsive card layout
 * 
 * User Actions:
 * - View all blocked users
 * - Unblock users (with confirmation)
 * - Navigate back to previous page
 * 
 * Data Displayed:
 * - Profile picture
 * - Full name and age
 * - Occupation (if available)
 * - Block date (formatted)
 * - Block reason (if provided)
 * 
 * Visual Design:
 * - Cosmic theme with gradient background
 * - Glass-morphism cards for each blocked user
 * - Golden accent colors
 * - Icon-based visual indicators
 * - Responsive grid layout
 * 
 * @page
 * @route /block
 */

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { BlockedUserProfile } from "@/lib/actions/blocks";
import { getBlockedUsers, unblockUser } from "@/lib/actions/blocks";
import { calculateAge } from "@/lib/helpers/calculate-age";

const DEFAULT_AVATAR = "/default-avatar.svg";

export default function BlockedUsersPage() {
	const router = useRouter();
	const [blockedUsers, setBlockedUsers] = useState<BlockedUserProfile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		async function loadBlockedUsers() {
			try {
				const users = await getBlockedUsers();
				setBlockedUsers(users);
			} catch (err) {
				console.error("Failed to load blocked users", err);
				setError("Unable to load blocked users right now. Please try again later.");
			} finally {
				setLoading(false);
			}
		}

		loadBlockedUsers();
	}, []);

	const handleUnblock = (userId: string, userName: string) => {
		const confirmed = window.confirm(`Unblock ${userName}? They will be able to find and match with you again.`);

		if (!confirmed) {
			return;
		}

		setFeedback(null);
		setError(null);

		startTransition(async () => {
			try {
				await unblockUser(userId);
				setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
				setFeedback(`${userName} has been unblocked.`);
			} catch (err) {
				console.error("Failed to unblock user", err);
				setError("Unable to unblock this user right now. Please try again later.");
			}
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "hsl(45 90% 55%)" }} />
					<p className="mt-4" style={{ color: "hsl(220 10% 65%)" }}>Loading blocked users...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
			<div className="container mx-auto px-4 py-8">
				<header className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<div className="flex-1" />
					</div>
					<div className="text-center">
						<h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(45 90% 55%)" }}>🚫 Blocked Users</h1>
						<p style={{ color: "hsl(220 10% 65%)" }}>
							Manage who cannot interact with you on Marahuyo
						</p>
					</div>
				</header>

				{feedback && (
					<div className="max-w-2xl mx-auto mb-6 rounded-xl border px-4 py-3 text-sm font-medium" style={{ borderColor: "rgba(16, 185, 129, 0.3)", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "hsl(160 70% 70%)" }}>
						{feedback}
					</div>
				)}

				{error && (
					<div className="max-w-2xl mx-auto mb-6 rounded-xl border px-4 py-3 text-sm font-medium" style={{ borderColor: "rgba(230, 57, 70, 0.3)", backgroundColor: "rgba(230, 57, 70, 0.1)", color: "hsl(0 70% 70%)" }}>
						{error}
					</div>
				)}

				{blockedUsers.length === 0 ? (
					<div className="max-w-xl mx-auto rounded-2xl shadow-lg p-8 text-center backdrop-blur-md" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
						<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed" style={{ borderColor: "rgba(232, 185, 96, 0.3)" }}>
							<svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "hsl(45 90% 55%)" }}>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
							</svg>
						</div>
						<h2 className="text-2xl font-semibold mb-2" style={{ color: "hsl(45 90% 55%)" }}>No blocked users</h2>
						<p style={{ color: "hsl(220 10% 65%)" }}>
							Users you block will appear here. You can unblock them anytime if you change your mind.
						</p>
					</div>
				) : (
					<div className="max-w-3xl mx-auto space-y-4">
						{blockedUsers.map((blockedUser) => {
							const avatarSrc = blockedUser.profile_picture_url || DEFAULT_AVATAR;
							const blockedDate = new Date(blockedUser.blocked_at);

							return (
								<div
									key={blockedUser.id}
									className="rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 backdrop-blur-md"
									style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
								>
									<div className="flex items-start sm:items-center gap-4">
										<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full" style={{ boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)" }}>
											<Image
												src={avatarSrc}
												alt={blockedUser.full_name}
												fill
												className="object-cover"
												sizes="64px"
											/>
										</div>

										<div className="space-y-1">
											<h3 className="text-lg font-semibold" style={{ color: "hsl(45 90% 55%)" }}>
												{blockedUser.full_name}, {calculateAge(blockedUser.birthdate)}
											</h3>
											{blockedUser.occupation && (
												<p className="text-sm" style={{ color: "hsl(220 10% 65%)" }}>💼 {blockedUser.occupation}</p>
											)}
											<p className="text-sm" style={{ color: "hsl(220 10% 60%)" }}>
												📅 Blocked on {blockedDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
											</p>
											{blockedUser.reason && (
												<p className="text-sm" style={{ color: "hsl(220 10% 70%)" }}>
													💬 Reason: {blockedUser.reason}
												</p>
											)}
										</div>
									</div>

									<button
										onClick={() => handleUnblock(blockedUser.id, blockedUser.full_name)}
										disabled={isPending}
										className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:bg-white/10 disabled:opacity-60"
										style={{ borderColor: "rgba(16, 185, 129, 0.5)", color: "hsl(160 70% 60%)" }}
										title={`Unblock ${blockedUser.full_name}`}
									>
										<svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
										</svg>
										Unblock
									</button>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
