    "use client";

import { UserProfile } from "@/app/profile/page";
import { calculateAge } from "@/lib/helpers/calculate-age";
import Image from "next/image";
import SwipeableCard from "./SwipeableCard";
import { useState } from "react";

const DEFAULT_AVATAR = "/default-avatar.svg";

interface MatchCardProps {
    user: UserProfile;
    onLike?: () => void;
    onPass?: () => void;
}

export default function MatchCard({ user, onLike, onPass }: MatchCardProps) {
    const imageSrc = user.profile_picture_url || DEFAULT_AVATAR;
    const displayName = user.full_name;
    const showHandle = false;
    const [isFlipped, setIsFlipped] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setStartPos({ x: e.clientX, y: e.clientY });
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (startPos) {
            const deltaX = Math.abs(e.clientX - startPos.x);
            const deltaY = Math.abs(e.clientY - startPos.y);
            if (deltaX > 5 || deltaY > 5) {
                setIsDragging(true);
            }
        }
    };

    const handleMouseUp = () => {
        if (!isDragging && startPos) {
            setIsFlipped(!isFlipped);
        }
        setStartPos(null);
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setStartPos({ x: touch.clientX, y: touch.clientY });
        setIsDragging(false);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startPos) {
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - startPos.x);
            const deltaY = Math.abs(touch.clientY - startPos.y);
            if (deltaX > 5 || deltaY > 5) {
                setIsDragging(true);
            }
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging && startPos) {
            setIsFlipped(!isFlipped);
        }
        setStartPos(null);
        setIsDragging(false);
    };

    return (
        <div className="relative w-full max-w-sm mx-auto perspective-1000">
            <div
                className="relative w-full transition-transform duration-700 transform-style-3d aspect-[3/4]"
                style={{
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Front of card */}
                <div
                    className="absolute w-full h-full backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <SwipeableCard
                        onSwipeRight={onLike}
                        onSwipeLeft={onPass}
                        className="card-swipe aspect-[3/4] overflow-hidden swipeable-card"
                    >
                        <Image
                            src={imageSrc}
                            alt={displayName}
                            fill
                            className="object-cover transition-opacity duration-300"
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 400px"
                            priority={imageSrc !== DEFAULT_AVATAR}
                            draggable={false}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">
                                        {displayName}, {calculateAge(user.birthdate)}
                                    </h2>
                                    {showHandle ? (
                                        <p className="text-sm opacity-90 mb-2">@{displayName}</p>
                                    ) : null}
                                    <p className="text-sm leading-relaxed">{user.bio}</p>
                                </div>
                            </div>
                        </div>

                        {/* Info icon to indicate tap for more info */}
                        <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-sm rounded-full p-2">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </SwipeableCard>
                </div>

                {/* Back of card */}
                <div
                    className="absolute w-full h-full backface-hidden"
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="card-swipe aspect-[3/4] bg-gradient-to-br from-pink-100 to-red-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl overflow-hidden cursor-pointer">
                        <div className="relative w-full h-full p-6 overflow-y-auto">
                            {/* Flip back hint */}
                            <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-sm rounded-full p-2 pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-700 dark:text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        About {displayName}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {calculateAge(user.birthdate)} years old
                                    </p>
                                </div>

                                {/* Profile Details */}
                                <div className="space-y-4">
                                    {user.occupation && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-lg">💼</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Occupation</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.occupation}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {user.education && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-lg">🎓</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Education</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.education}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {user.height_cm && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-lg">📏</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Height</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.height_cm} cm ({Math.round(user.height_cm / 2.54)} inches)
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {user.relationship_goal && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-lg">💕</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Looking for</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                                    {user.relationship_goal.replace(/_/g, " ")}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {(user.smoking !== null || user.drinking !== null) && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-lg">🍷</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Lifestyle</p>
                                                <div className="space-y-1">
                                                    {user.smoking !== null && (
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            Smoking: {user.smoking ? "Yes" : "No"}
                                                        </p>
                                                    )}
                                                    {user.drinking !== null && (
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            Drinking: {user.drinking ? "Yes" : "No"}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {user.children && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-lg">👶</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Children</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                                    {user.children}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                        Tap anywhere to return
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}