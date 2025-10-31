'use client';

/**
 * Authentication Page
 * 
 * Unified sign in/sign up page with toggle between modes.
 * Features cosmic-themed design matching the landing page aesthetic.
 * Automatically redirects authenticated users to the discover page.
 * 
 * Key Features:
 * - Toggle between sign in and sign up modes
 * - Email and password authentication via Supabase
 * - Client-side form validation
 * - Loading states during authentication
 * - Error message display with cosmic styling
 * - Email verification handling for new signups
 * - Animated starfield background
 * - "Back to Home" navigation link
 * - Auto-redirect for authenticated users
 * 
 * Authentication Flow:
 * - Sign Up: Creates new user account and sends verification email
 * - Sign In: Validates credentials and creates session
 * - Redirects to /discover on successful authentication
 * 
 * Visual Design:
 * - Cosmic gradient background with animated stars
 * - Glass-morphism card for form container
 * - Golden accent colors for branding
 * - Responsive layout (mobile to desktop)
 * - Animated logo with glow effect
 * 
 * @page
 * @route /auth
 */

import { useAuth } from "@/contexts/auth-contexts";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Individual star configuration for animated background
 */
interface Star {
  left: number;
  top: number;
  delay: number;
  opacity: number;
}

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [fullName, setFullName] = useState<string>("");
    const [birthdate, setBirthdate] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [stars, setStars] = useState<Star[]>([]);
    const supabase = createClient();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const maxBirthdate = useMemo(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 18);
        return date.toISOString().split("T")[0];
    }, []);
    
    useEffect(() => {
        // Generate stars only on client side to avoid hydration mismatch
        const generatedStars = [...Array(50)].map(() => ({
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 3,
            opacity: Math.random() * 0.7 + 0.3,
        }));
        setStars(generatedStars);
    }, []);

    useEffect(() => {
        if (user && !authLoading) {
            router.push("/discover");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!isSignUp) {
            setFullName("");
            setBirthdate("");
            setBio("");
            setProfilePicture(null);
        }
    }, [isSignUp]);

    function validateBirthdate(value: string) {
        if (!value) {
            setError("Birthdate is required.");
            return false;
        }

        const parsedDate = new Date(value);

        if (Number.isNaN(parsedDate.getTime())) {
            setError("Please provide a valid birthdate.");
            return false;
        }

        const today = new Date();
        const eighteenYearsAgo = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
        );

        if (parsedDate > eighteenYearsAgo) {
            setError("You must be at least 18 years old to sign up.");
            return false;
        }

        return true;
    }

    function handleProfilePictureChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            setProfilePicture(null);
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Profile picture must be an image file.");
            event.target.value = "";
            setProfilePicture(null);
            return;
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE) {
            setError("Profile picture must be smaller than 5MB.");
            event.target.value = "";
            setProfilePicture(null);
            return;
        }

        setError("");
        setProfilePicture(file);
    }

    // FUNCTION TO HANDLE AUTHENTICATION
    async function handleAuth(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isSignUp) {
                const sanitizedFullName = fullName.trim();

                if (!sanitizedFullName) {
                    setError("Full name is required.");
                    return;
                }

                const sanitizedBio = bio.trim();

                if (!sanitizedBio) {
                    setError("Bio is required.");
                    return;
                }

                if (!validateBirthdate(birthdate)) {
                    return;
                }

                const redirectBase =
                    typeof window !== "undefined"
                        ? process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
                        : process.env.NEXT_PUBLIC_APP_URL;

                const emailRedirectTo = redirectBase
                    ? `${redirectBase.replace(/\/$/, "")}/auth`
                    : undefined;

                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo,
                        data: {
                            full_name: sanitizedFullName,
                            birthdate,
                            bio: sanitizedBio,
                        },
                    },
                }); 
                if (signUpError) throw signUpError;

                if (!data.user) {
                    throw new Error("Unable to complete sign up. Please try again.");
                }

                const formData = new FormData();
                formData.append("userId", data.user.id);
                formData.append("fullName", sanitizedFullName);
                formData.append("birthdate", birthdate);
                formData.append("bio", sanitizedBio);

                if (profilePicture) {
                    formData.append("profilePicture", profilePicture);
                }

                const response = await fetch("/api/auth/complete-signup", {
                    method: "POST",
                    body: formData,
                });

                const completionResult = await response.json().catch(() => null);

                if (!response.ok || !completionResult?.success) {
                    const message = completionResult?.error ?? "Failed to save profile information.";
                    throw new Error(message);
                }

                // user has not confirmed email
                if (data.user && !data.session) {
                    setError("Please check your email to confirm your account.");
                    return;
                }
            } else {
                const {error} = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error:any){
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background" style={{ background: "var(--gradient-cosmic)" }}>
            {/* Animated stars background */}
            <div className="absolute inset-0">
                {stars.map((star, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full animate-pulse bg-foreground"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            animationDelay: `${star.delay}s`,
                            opacity: star.opacity,
                        }}
                    />
                ))}
            </div>

            {/* Back to Home Link */}
            <Link
                href="/"
                className="absolute top-8 left-8 z-20 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group bg-card/50 backdrop-blur-md border border-border"
            >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium text-primary">Back to Home</span>
            </Link>

            {/* Main auth content */}
            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="inline-block animate-bounce mb-4">
                        <Image
                            src="/marahuyo.png"
                            alt="Marahuyo"
                            width={120}
                            height={120}
                            className="mx-auto"
                            style={{
                                filter: "drop-shadow(0 0 40px hsl(45 90% 55% / 0.3))",
                            }}
                        />
                    </div>
                    <h1 className="text-4xl font-bold mb-2 text-primary">
                        {isSignUp ? "Join Marahuyo" : "Welcome Back"}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {isSignUp ? "Begin your cosmic journey" : "Continue your journey"}
                    </p>
                </div>

                {/* Auth Form Card */}
                <div 
                    className="rounded-2xl shadow-2xl p-8 backdrop-blur-md bg-card/50 border border-border"
                    style={{
                        boxShadow: "var(--shadow-glow-warm)",
                    }}
                >
                    <form className="space-y-6" onSubmit={handleAuth}>
                        {isSignUp && (
                            <div className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="fullName"
                                        className="block text-sm font-medium mb-2 text-primary"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                        disabled={loading}
                                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-input border border-border text-foreground backdrop-blur-md"
                                        placeholder="Jane Doe"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="birthdate"
                                        className="block text-sm font-medium mb-2 text-primary"
                                    >
                                        Birthdate
                                    </label>
                                    <input
                                        id="birthdate"
                                        type="date"
                                        required
                                        max={maxBirthdate}
                                        value={birthdate}
                                        onChange={(event) => setBirthdate(event.target.value)}
                                        disabled={loading}
                                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-input border border-border text-foreground backdrop-blur-md"
                                    />
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        You must be at least 18 years old to join Marahuyo.
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="bio"
                                        className="block text-sm font-medium mb-2 text-primary"
                                    >
                                        Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        required
                                        value={bio}
                                        onChange={(event) => setBio(event.target.value)}
                                        disabled={loading}
                                        rows={4}
                                        maxLength={500}
                                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-input border border-border text-foreground backdrop-blur-md"
                                        placeholder="Share a little about yourself..."
                                    />
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Up to 500 characters.
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="profilePicture"
                                        className="block text-sm font-medium mb-2 text-primary"
                                    >
                                        Profile Picture
                                    </label>
                                    <input
                                        id="profilePicture"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePictureChange}
                                        disabled={loading}
                                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-input border border-border text-foreground backdrop-blur-md"
                                    />
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Optional. Images only, up to 5MB.
                                    </p>
                                    {profilePicture && (
                                        <p className="mt-2 text-xs text-secondary">
                                            Selected file: {profilePicture.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-2 text-primary"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-input border border-border text-foreground backdrop-blur-md"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium mb-2 text-primary"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-input border border-border text-foreground backdrop-blur-md"
                                placeholder="Enter your password"
                            />
                        </div>

                        {error && (
                            <div 
                                className="text-sm p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive"
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 rounded-full font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg text-primary-foreground"
                            style={{
                                background: "var(--gradient-warm)",
                                boxShadow: "var(--shadow-glow-warm)",
                            }}
                        >
                            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
                        </button>
                    </form>

                    <div className="text-center mt-6 pt-6 border-t border-border">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError("");
                            }}
                            className="text-sm hover:opacity-80 transition-opacity text-secondary"
                        >
                            {isSignUp
                                ? "Already have an account? Sign in"
                                : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-gradient-to-t from-background to-transparent" />
        </section>
    );
}