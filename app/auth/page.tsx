'use client';

import { useAuth } from "@/contexts/auth-contexts";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [stars, setStars] = useState<Star[]>([]);
    const supabase = createClient();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    
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

    // FUNCTION TO HANDLE AUTHENTICATION
    async function handleAuth(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isSignUp) {
                const {data, error} = await supabase.auth.signUp({
                    email,
                    password,
                }); 
                if (error) throw error;
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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
            {/* Animated stars background */}
            <div className="absolute inset-0">
                {stars.map((star, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full animate-pulse"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            animationDelay: `${star.delay}s`,
                            opacity: star.opacity,
                            backgroundColor: "hsl(45 100% 95%)",
                        }}
                    />
                ))}
            </div>

            {/* Back to Home Link */}
            <Link
                href="/"
                className="absolute top-8 left-8 z-20 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
            >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "hsl(45 90% 55%)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span style={{ color: "hsl(45 90% 55%)" }} className="font-medium">Back to Home</span>
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
                    <h1 className="text-4xl font-bold mb-2" style={{ color: "hsl(45 90% 55%)" }}>
                        {isSignUp ? "Join Marahuyo" : "Welcome Back"}
                    </h1>
                    <p className="text-lg" style={{ color: "hsl(220 10% 65%)" }}>
                        {isSignUp ? "Begin your cosmic journey" : "Continue your journey"}
                    </p>
                </div>

                {/* Auth Form Card */}
                <div 
                    className="rounded-2xl shadow-2xl p-8 backdrop-blur-md"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 0 60px hsl(45 90% 55% / 0.1)",
                    }}
                >
                    <form className="space-y-6" onSubmit={handleAuth}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-2"
                                style={{ color: "hsl(45 90% 55%)" }}
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ 
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    color: "hsl(220 10% 95%)",
                                    backdropFilter: "blur(10px)",
                                }}
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium mb-2"
                                style={{ color: "hsl(45 90% 55%)" }}
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ 
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    color: "hsl(220 10% 95%)",
                                    backdropFilter: "blur(10px)",
                                }}
                                placeholder="Enter your password"
                            />
                        </div>

                        {error && (
                            <div 
                                className="text-sm p-4 rounded-lg"
                                style={{ 
                                    backgroundColor: "rgba(230, 57, 70, 0.1)",
                                    border: "1px solid rgba(230, 57, 70, 0.3)",
                                    color: "hsl(0 70% 70%)",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 rounded-full font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                            style={{
                                background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
                                color: "hsl(220 30% 8%)",
                                boxShadow: "0 0 40px hsl(45 90% 55% / 0.3)",
                            }}
                        >
                            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
                        </button>
                    </form>

                    <div className="text-center mt-6 pt-6" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError("");
                            }}
                            className="text-sm hover:opacity-80 transition-opacity"
                            style={{ color: "hsl(200 60% 50%)" }}
                        >
                            {isSignUp
                                ? "Already have an account? Sign in"
                                : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to top, hsl(220 30% 8%), transparent)" }} />
        </section>
    );
}