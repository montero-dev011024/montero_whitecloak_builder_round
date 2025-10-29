"use client";

import { useAuth } from "@/contexts/auth-contexts";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { signOut, user } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const pathname = usePathname();

    const handleSignOut = async () => {
        await signOut();
        setIsDropdownOpen(false);
    };

    // Hide navbar on auth page
    if (pathname === "/auth") {
        return null;
    }

    return (
        <nav
            className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-md bg-opacity-95"
            style={{ backgroundColor: "rgba(247, 244, 243, 0.95)" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: "#583C5C" }}
                        >
                            <span className="text-white text-sm font-bold">♥</span>
                        </div>
                        <span className="text-xl font-bold hidden sm:inline" style={{ color: "#583C5C" }}>
                            Marahuyo
                        </span>
                    </Link>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/"
                            className="text-gray-700 hover:font-semibold transition-colors duration-200"
                            style={{ color: "#3D3538" }}
                        >
                            Home
                        </Link>
                        {user && (
                            <>
                                <Link
                                    href="/discover"
                                    className="text-gray-700 hover:font-semibold transition-colors duration-200"
                                    style={{ color: "#3D3538" }}
                                >
                                    Discover
                                </Link>
                                <Link
                                    href="/discover/list"
                                    className="text-gray-700 hover:font-semibold transition-colors duration-200"
                                    style={{ color: "#3D3538" }}
                                >
                                    Matches
                                </Link>
                                <Link
                                    href="/messages"
                                    className="text-gray-700 hover:font-semibold transition-colors duration-200"
                                    style={{ color: "#3D3538" }}
                                >
                                    Messages
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
                                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:shadow-md"
                                    style={{
                                        backgroundColor: "#F7F4F3",
                                        border: "2px solid #583C5C",
                                        color: "#583C5C",
                                    }}
                                >
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br" style={{ background: "linear-gradient(135deg, #583C5C 0%, #E8B960 100%)" }}>
                                        <span className="text-white text-xs font-bold">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium hidden lg:inline">{user.email?.split("@")[0]}</span>
                                    <svg
                                        className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in-50 slide-in-from-top-2"
                                        style={{ backgroundColor: "#F7F4F3" }}
                                    >
                                        <div className="p-3 border-b border-gray-200">
                                            <p className="text-xs text-gray-500">Signed in as</p>
                                            <p className="text-sm font-semibold" style={{ color: "#583C5C" }}>
                                                {user.email}
                                            </p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                                            style={{ color: "#3D3538" }}
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            👤 Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                                            style={{ color: "#3D3538" }}
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            ⚙️ Settings
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-2 text-sm border-t border-gray-200 transition-colors"
                                            style={{ color: "#E63946" }}
                                        >
                                            🚪 Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/auth"
                                className="px-6 py-2 text-white rounded-full font-semibold hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                                style={{ backgroundColor: "#583C5C" }}
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
                                className="p-2 rounded-full transition-all hover:bg-gray-100"
                                style={{ color: "#583C5C" }}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        ) : (
                            <Link
                                href="/auth"
                                className="px-4 py-2 text-white rounded-full font-semibold text-sm"
                                style={{ backgroundColor: "#583C5C" }}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {isDropdownOpen && user && (
                    <div className="md:hidden pb-4 space-y-2 animate-in fade-in-50 slide-in-from-top-2">
                        <Link
                            href="/"
                            className="block px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                            style={{ color: "#3D3538" }}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/discover"
                            className="block px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                            style={{ color: "#3D3538" }}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            Discover
                        </Link>
                        <Link
                            href="/discover/list"
                            className="block px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                            style={{ color: "#3D3538" }}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            Matches
                        </Link>
                        <Link
                            href="/messages"
                            className="block px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                            style={{ color: "#3D3538" }}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            Messages
                        </Link>
                        <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                            style={{ color: "#3D3538" }}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            Profile
                        </Link>
                        <Link
                            href="/settings"
                            className="block px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                            style={{ color: "#3D3538" }}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            Settings
                        </Link>
                        
                        <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm rounded transition-colors"
                            style={{ color: "#E63946" }}
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}