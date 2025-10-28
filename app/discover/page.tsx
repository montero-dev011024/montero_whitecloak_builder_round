"use client";

import { useAuth } from "@/contexts/auth-contexts";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface DiscoverProfile {
    id: string;
    firstName: string;
    age: number;
    location: string;
    bio: string;
    photos: string[];
    interests: string[];
    distance?: number;
}

// Static profiles - will be replaced with dynamic data from database
const STATIC_PROFILES: DiscoverProfile[] = [
    {
        id: "user_001",
        firstName: "Emma",
        age: 26,
        location: "San Francisco, CA",
        bio: "Yoga instructor 🧘‍♀️ | Love traveling to new places",
        photos: [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop",
        ],
        interests: ["Yoga", "Travel", "Cooking", "Art"],
        distance: 2,
    },
    {
        id: "user_002",
        firstName: "Sophia",
        age: 25,
        location: "San Francisco, CA",
        bio: "Artist and dog lover 🎨🐕 | Coffee dates?",
        photos: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop",
        ],
        interests: ["Art", "Dogs", "Photography", "Music"],
        distance: 3,
    },
    {
        id: "user_003",
        firstName: "Olivia",
        age: 27,
        location: "San Francisco, CA",
        bio: "Marketing manager 💼 | Weekend adventurer",
        photos: [
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=600&fit=crop",
        ],
        interests: ["Travel", "Fitness", "Wine", "Hiking"],
        distance: 1,
    },
    {
        id: "user_004",
        firstName: "Isabella",
        age: 24,
        location: "San Francisco, CA",
        bio: "Dancer 💃 | Music lover | Let's have fun!",
        photos: [
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=600&fit=crop",
        ],
        interests: ["Dancing", "Music", "Fitness", "Clubs"],
        distance: 4,
    },
    {
        id: "user_005",
        firstName: "Mia",
        age: 29,
        location: "San Francisco, CA",
        bio: "Software engineer 👩‍💻 | Gaming enthusiast",
        photos: [
            "https://images.unsplash.com/photo-1517520413457-83aea4ef3537?w=500&h=600&fit=crop",
        ],
        interests: ["Gaming", "Tech", "Movies", "Board Games"],
        distance: 2,
    },
];

type SwipeDirection = "left" | "right" | null;

export default function DiscoverPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [profiles, setProfiles] = useState<DiscoverProfile[]>(STATIC_PROFILES);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipeData, setSwipeData] = useState<{ direction: SwipeDirection; name: string }[]>([]);
    const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
    const [skippedProfiles, setSkippedProfiles] = useState<string[]>([]);

    // Swipe state
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragX, setDragX] = useState(0);
    const [dragRotation, setDragRotation] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);

    // Redirect to auth if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F4F3" }}>
                <div className="text-center">
                    <div
                        className="w-12 h-12 border-4 border-transparent rounded-full animate-spin mx-auto mb-4"
                        style={{
                            borderTopColor: "#583C5C",
                            borderRightColor: "#E8B960",
                        }}
                    ></div>
                    <p style={{ color: "#583C5C" }} className="font-semibold">
                        Loading profiles...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const currentProfile = profiles[currentIndex];
    const hasMoreProfiles = currentIndex < profiles.length - 1;
    const noMoreProfiles = currentIndex >= profiles.length;

    // Handle swipe/drag start
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    // Handle swipe/drag move
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - touchStartX.current;
        const diffY = currentY - touchStartY.current;

        // Only register horizontal swipe if X movement > Y movement
        if (Math.abs(diffX) > Math.abs(diffY)) {
            setDragX(diffX);
            setDragRotation(diffX * 0.1); // Rotate card based on drag distance
            e.preventDefault();
        }
    };

    // Handle swipe/drag end
    const handleTouchEnd = () => {
        setIsDragging(false);

        const threshold = 100; // Minimum swipe distance to trigger action

        if (Math.abs(dragX) > threshold) {
            if (dragX > 0) {
                handleLike();
            } else {
                handleSkip();
            }
        }

        // Reset drag state
        setDragX(0);
        setDragRotation(0);
    };

    // Handle mouse events for desktop testing
    const handleMouseDown = (e: React.MouseEvent) => {
        touchStartX.current = e.clientX;
        touchStartY.current = e.clientY;
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const currentX = e.clientX;
        const currentY = e.clientY;
        const diffX = currentX - touchStartX.current;
        const diffY = currentY - touchStartY.current;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            setDragX(diffX);
            setDragRotation(diffX * 0.1);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);

        const threshold = 100;

        if (Math.abs(dragX) > threshold) {
            if (dragX > 0) {
                handleLike();
            } else {
                handleSkip();
            }
        }

        setDragX(0);
        setDragRotation(0);
    };

    // Like profile
    const handleLike = () => {
        if (currentProfile) {
            setLikedProfiles([...likedProfiles, currentProfile.id]);
            setSwipeData([...swipeData, { direction: "right", name: currentProfile.firstName }]);
            moveToNextProfile();
        }
    };

    // Skip profile
    const handleSkip = () => {
        if (currentProfile) {
            setSkippedProfiles([...skippedProfiles, currentProfile.id]);
            setSwipeData([...swipeData, { direction: "left", name: currentProfile.firstName }]);
            moveToNextProfile();
        }
    };

    // Move to next profile
    const moveToNextProfile = () => {
        setCurrentIndex((prev) => prev + 1);
        setDragX(0);
        setDragRotation(0);
    };

    // Reset and start over
    const handleReset = () => {
        setCurrentIndex(0);
        setSwipeData([]);
        setLikedProfiles([]);
        setSkippedProfiles([]);
        setDragX(0);
        setDragRotation(0);
    };

    return (
        <div style={{ backgroundColor: "#F7F4F3" }} className="min-h-screen pb-12">
            {/* Header */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold" style={{ color: "#583C5C" }}>
                            Discover
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {noMoreProfiles
                                ? "No more profiles!"
                                : `${profiles.length - currentIndex} person${profiles.length - currentIndex === 1 ? "" : "s"} left`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {noMoreProfiles ? (
                    /* No More Profiles Screen */
                    <div className="text-center space-y-8 py-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-4" style={{ color: "#583C5C" }}>
                                🎉 You're All Caught Up!
                            </h2>
                            <p className="text-gray-600 text-lg mb-6">
                                You've reviewed all available profiles. Check back later for more matches!
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                            <div
                                className="bg-white rounded-lg p-6 shadow"
                                style={{ borderTop: "4px solid #583C5C" }}
                            >
                                <p className="text-3xl font-bold" style={{ color: "#583C5C" }}>
                                    {likedProfiles.length}
                                </p>
                                <p className="text-gray-600 text-sm mt-2">❤️ Likes</p>
                            </div>
                            <div
                                className="bg-white rounded-lg p-6 shadow"
                                style={{ borderTop: "4px solid #E8B960" }}
                            >
                                <p className="text-3xl font-bold" style={{ color: "#E8B960" }}>
                                    {skippedProfiles.length}
                                </p>
                                <p className="text-gray-600 text-sm mt-2">👋 Skipped</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-4">
                            <button
                                onClick={handleReset}
                                className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
                                style={{
                                    backgroundColor: "#583C5C",
                                    color: "white",
                                }}
                            >
                                🔄 Start Over
                            </button>
                            <Link
                                href="/messages"
                                className="block w-full py-3 px-4 rounded-lg text-center font-semibold transition-all duration-200 hover:shadow-md border-2"
                                style={{
                                    borderColor: "#583C5C",
                                    color: "#583C5C",
                                }}
                            >
                                💬 View Matches
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Swipeable Card */
                    <div className="space-y-6">
                        {/* Card Container */}
                        <div className="relative" style={{ perspective: "1000px" }}>
                            <div
                                ref={cardRef}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                className="bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-opacity"
                                style={{
                                    transform: `translateX(${dragX}px) rotate(${dragRotation}deg)`,
                                    opacity: 1 - Math.abs(dragX) / 500,
                                    transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                                }}
                            >
                                {/* Image Section */}
                                <div className="relative w-full h-96 sm:h-[500px] md:h-[600px] overflow-hidden">
                                    <img
                                        src={currentProfile.photos[0]}
                                        alt={currentProfile.firstName}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Gradient Overlay */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.2), transparent)",
                                        }}
                                    ></div>

                                    {/* Like Indicator */}
                                    {dragX > 50 && (
                                        <div className="absolute top-8 left-8 animate-bounce">
                                            <span className="text-6xl">❤️</span>
                                        </div>
                                    )}

                                    {/* Skip Indicator */}
                                    {dragX < -50 && (
                                        <div className="absolute top-8 right-8 animate-bounce">
                                            <span className="text-6xl">👋</span>
                                        </div>
                                    )}

                                    {/* Profile Info Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <h2 className="text-3xl font-bold">
                                                    {currentProfile.firstName}, <span className="text-2xl">{currentProfile.age}</span>
                                                </h2>
                                                <p className="text-lg mt-2 flex items-center gap-2">
                                                    📍 {currentProfile.location}
                                                    {currentProfile.distance && (
                                                        <span className="text-sm opacity-80">({currentProfile.distance} mi)</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bio Section */}
                                <div className="p-6">
                                    <p className="text-gray-700 mb-4">{currentProfile.bio}</p>

                                    {/* Interests Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {currentProfile.interests.map((interest, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 rounded-full text-sm font-medium"
                                                style={{
                                                    backgroundColor: "#F7F4F3",
                                                    color: "#583C5C",
                                                    border: "1px solid #E8B960",
                                                }}
                                            >
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Stacked Card Preview */}
                            {hasMoreProfiles && currentIndex + 1 < profiles.length && (
                                <div
                                    className="absolute inset-0 bg-white rounded-3xl shadow-lg -z-10"
                                    style={{
                                        transform: "translateY(12px) scale(0.97)",
                                    }}
                                ></div>
                            )}
                            {hasMoreProfiles && currentIndex + 2 < profiles.length && (
                                <div
                                    className="absolute inset-0 bg-white rounded-3xl shadow -z-20"
                                    style={{
                                        transform: "translateY(24px) scale(0.94)",
                                    }}
                                ></div>
                            )}
                        </div>


                        {/* Swipe Instructions */}
                        <div className="text-center text-sm text-gray-500 mt-4">
                            <p>Drag left to skip or right to like</p>
                        </div>
                    </div>
                )}

                {/* Swipe History (Debug) */}
                {swipeData.length > 0 && (
                    <div className="mt-12 bg-white rounded-lg p-6 shadow">
                        <h3 className="font-semibold mb-4" style={{ color: "#583C5C" }}>
                            Session History
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {[...swipeData].reverse().map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50">
                                    <span>{item.name}</span>
                                    <span className={item.direction === "right" ? "text-red-500" : "text-yellow-500"}>
                                        {item.direction === "right" ? "❤️ Liked" : "👋 Skipped"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}