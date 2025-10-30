"use client";

/**
 * Navbar Component
 * 
 * Global navigation bar for the Marahuyo dating app.
 * Provides main navigation links, user profile dropdown, and authentication actions.
 * Automatically hidden on landing page and authentication page.
 * 
 * Key Features:
 * - Conditional rendering (hidden on auth and home pages)
 * - User profile picture and full name display
 * - Desktop and mobile responsive layouts
 * - Dropdown menu with profile options
 * - Navigation links: Discover, Matches, Messages
 * - User actions: View Profile, Blocked Users, Sign Out
 * - Real-time profile data loading from Supabase
 * - Sticky positioning at top of viewport
 * - Cosmic theme with glass-morphism backdrop
 * - Smooth hover animations and transitions
 * 
 * Navigation Structure:
 * - Desktop: Horizontal nav links with dropdown
 * - Mobile: Hamburger menu with full navigation
 * - Authenticated: Full navigation with profile
 * - Unauthenticated: Sign In button only
 * 
 * @component
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <AuthProvider>
 *   <Navbar />
 *   {children}
 * </AuthProvider>
 * ```
 */

import { useAuth } from "@/contexts/auth-contexts";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
    const { signOut, user } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const pathname = usePathname();
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);

    useEffect(() => {
        async function loadProfileData() {
            if (!user?.id) return;
            
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("users")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;
                setFullName(data?.full_name ?? null);

                // Also fetch profile picture from profiles table
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("profile_picture_url")
                    .eq("user_id", user.id)
                    .single();

                if (profileData?.profile_picture_url) {
                    setProfilePictureUrl(profileData.profile_picture_url);
                }
            } catch (error) {
                console.error("Error loading profile data:", error);
            }
        }

        loadProfileData();
    }, [user?.id]);

    const handleSignOut = async () => {
        await signOut();
        setIsDropdownOpen(false);
    };

    // Hide navbar on auth page and home page
    if (pathname === "/auth" || pathname === "/") {
        return null;
    }

    return (
        <nav
            className="border-b sticky top-0 z-50 backdrop-blur-md"
            style={{ 
                backgroundColor: "rgba(20, 18, 30, 0.8)",
                borderColor: "rgba(232, 185, 96, 0.2)",
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                            style={{ 
                                background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
                                boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)",
                            }}
                        >
                            <span className="text-sm font-bold" style={{ color: "hsl(220 30% 8%)" }}>♥</span>
                        </div>
                        <span className="text-xl font-bold hidden sm:inline" style={{ color: "hsl(45 90% 55%)" }}>
                            Marahuyo
                        </span>
                    </Link>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden md:flex items-center gap-8">
                        {user && (
                            <>
                                <Link
                                    href="/discover"
                                    className="font-medium hover:opacity-80 transition-all duration-200 relative group"
                                    style={{ color: "hsl(220 10% 75%)" }}
                                >
                                    <span className="group-hover:text-[hsl(45_90%_55%)] transition-colors">Discover</span>
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-200" style={{ backgroundColor: "hsl(45 90% 55%)" }}></span>
                                </Link>
                                <Link
                                    href="/discover/list"
                                    className="font-medium hover:opacity-80 transition-all duration-200 relative group"
                                    style={{ color: "hsl(220 10% 75%)" }}
                                >
                                    <span className="group-hover:text-[hsl(45_90%_55%)] transition-colors">Matches</span>
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-200" style={{ backgroundColor: "hsl(45 90% 55%)" }}></span>
                                </Link>
                                <Link
                                    href="/chat"
                                    className="font-medium hover:opacity-80 transition-all duration-200 relative group"
                                    style={{ color: "hsl(220 10% 75%)" }}
                                >
                                    <span className="group-hover:text-[hsl(45_90%_55%)] transition-colors">Messages</span>
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-200" style={{ backgroundColor: "hsl(45 90% 55%)" }}></span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* User Actions - Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 transition-all duration-200 hover:ring-2 group"
                                    style={{ 
                                        borderRadius: "50%",
                                        boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)",
                                    }}
                                >
                                    <img
                                        src={profilePictureUrl || "/default-avatar.svg"}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            style={{ color: "hsl(45 90% 55%)" }}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                            />
                                        </svg>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div
                                        className="absolute right-0 mt-3 w-56 rounded-xl shadow-2xl border z-50 animate-in fade-in-50 slide-in-from-top-2 backdrop-blur-md"
                                        style={{ 
                                            backgroundColor: "rgba(30, 27, 45, 0.95)",
                                            borderColor: "rgba(232, 185, 96, 0.3)",
                                            boxShadow: "0 0 40px hsl(45 90% 55% / 0.2)",
                                        }}
                                    >
                                        <div className="p-4 border-b" style={{ borderColor: "rgba(232, 185, 96, 0.2)" }}>
                                            {fullName && (
                                                <p className="text-sm font-semibold" style={{ color: "hsl(45 90% 55%)" }}>
                                                    {fullName}
                                                </p>
                                            )}
                                            <p className="text-xs mt-1 truncate" style={{ color: "hsl(220 10% 60%)" }}>{user.email}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                                                style={{ color: "hsl(220 10% 75%)" }}
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                View Profile
                                            </Link>
                                            <Link
                                                href="/block"
                                                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                                                style={{ color: "hsl(220 10% 75%)" }}
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                Blocked Users
                                            </Link>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm border-t transition-colors hover:bg-white/10"
                                            style={{ 
                                                color: "hsl(0 70% 60%)",
                                                borderColor: "rgba(232, 185, 96, 0.2)",
                                            }}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/auth"
                                className="px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-all duration-200"
                                style={{ 
                                    background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
                                    color: "hsl(220 30% 8%)",
                                    boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)",
                                }}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        {user ? (
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 transition-all group"
                                style={{ 
                                    boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)",
                                }}
                            >
                                <img
                                    src={profilePictureUrl || "/default-avatar.svg"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        style={{ color: "hsl(45 90% 55%)" }}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                        />
                                    </svg>
                                </div>
                            </button>
                        ) : (
                            <Link
                                href="/auth"
                                className="px-4 py-2 rounded-full font-semibold text-sm"
                                style={{ 
                                    background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
                                    color: "hsl(220 30% 8%)",
                                    boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)",
                                }}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {isDropdownOpen && user && (
                    <div className="md:hidden pb-4 space-y-1 animate-in fade-in-50 slide-in-from-top-2">
                        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(232, 185, 96, 0.2)" }}>
                            {fullName && (
                                <p className="text-sm font-semibold" style={{ color: "hsl(45 90% 55%)" }}>
                                    {fullName}
                                </p>
                            )}
                            <p className="text-xs mt-1 truncate" style={{ color: "hsl(220 10% 60%)" }}>{user.email}</p>
                        </div>
                        <Link
                            href="/discover"
                            className="flex items-center gap-3 px-4 py-2 text-sm rounded hover:bg-white/10 transition-colors"
                            style={{ color: "hsl(220 10% 75%)" }}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Discover
                        </Link>
                        <Link
                            href="/discover/list"
                            className="flex items-center gap-3 px-4 py-2 text-sm rounded hover:bg-white/10 transition-colors"
                            style={{ color: "hsl(220 10% 75%)" }}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Matches
                        </Link>
                        <Link
                            href="/chat"
                            className="flex items-center gap-3 px-4 py-2 text-sm rounded hover:bg-white/10 transition-colors"
                            style={{ color: "hsl(220 10% 75%)" }}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Messages
                        </Link>
                        <div className="my-2 border-t" style={{ borderColor: "rgba(232, 185, 96, 0.2)" }} />
                        <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm rounded hover:bg-white/10 transition-colors"
                            style={{ color: "hsl(220 10% 75%)" }}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            View Profile
                        </Link>
                        <Link
                            href="/block"
                            className="flex items-center gap-3 px-4 py-2 text-sm rounded hover:bg-white/10 transition-colors"
                            style={{ color: "hsl(220 10% 75%)" }}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Blocked Users
                        </Link>
                        
                        <button
                            onClick={handleSignOut}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm rounded hover:bg-white/10 transition-colors"
                            style={{ color: "hsl(0 70% 60%)" }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out 
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}