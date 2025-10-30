"use client";

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
			<div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto" />
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading blocked users...</p>
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
							<svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<div className="flex-1" />
					</div>

					<div className="text-center">
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Blocked Users</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Manage who cannot interact with you on Marahuyo
						</p>
					</div>
				</header>

				{feedback && (
					<div className="max-w-2xl mx-auto mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
						{feedback}
					</div>
				)}

				{error && (
					<div className="max-w-2xl mx-auto mb-6 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
						{error}
					</div>
				)}

				{blockedUsers.length === 0 ? (
					<div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
						<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700">
							<svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.105 0 2-.672 2-1.5S13.105 8 12 8s-2 .672-2 1.5.895 1.5 2 1.5zm0 0v2m0 4h.01M5.934 9c.37-3.122 2.612-5.5 6.066-5.5 3.455 0 5.696 2.378 6.066 5.5C18.387 9 19 9.896 19 11v2c0 .874-.108 1.735-.32 2.566-.167.667-.744 1.1-1.428 1.1H6.748c-.684 0-1.261-.433-1.428-1.1A10.907 10.907 0 015 13v-2c0-1.104.613-2 1.066-2z" />
							</svg>
						</div>
						<h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No blocked users</h2>
						<p className="text-gray-600 dark:text-gray-400">
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
									className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
								>
									<div className="flex items-start sm:items-center gap-4">
										<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
											<Image
												src={avatarSrc}
												alt={blockedUser.full_name}
												fill
												className="object-cover"
												sizes="64px"
											/>
										</div>

										<div className="space-y-1">
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
												{blockedUser.full_name}, {calculateAge(blockedUser.birthdate)}
											</h3>
											{blockedUser.occupation && (
												<p className="text-sm text-gray-500 dark:text-gray-400">{blockedUser.occupation}</p>
											)}
											<p className="text-sm text-gray-500 dark:text-gray-400">
												Blocked on {blockedDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
											</p>
											{blockedUser.reason && (
												<p className="text-sm text-gray-600 dark:text-gray-300">
													Reason: {blockedUser.reason}
												</p>
											)}
										</div>
									</div>

									<button
										onClick={() => handleUnblock(blockedUser.id, blockedUser.full_name)}
										disabled={isPending}
										className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
										title={`Unblock ${blockedUser.full_name}`}
									>
										<svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12a6 6 0 11-6-6" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l3 3" />
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
