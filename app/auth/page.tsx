'use client';

import { useAuth } from "@/contexts/auth-contexts";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

    export default function AuthPage() {

    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const supabase = createClient();
    const {} = useAuth();
    const {user, loading: authLoading} = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        if (user && !authLoading) {
            router.push("/");
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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F4F3' }}>
        <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-3xl font-bold" style={{ color: '#583C5C' }}>
                Marahuyo
            </h1>
            </div>
            <p style={{ color: '#3D3538' }}>
            {isSignUp ? "Create Your Account" : "Sign in to your account"}
            </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8" style={{ borderTop: `4px solid #583C5C` }}>
        <form className="space-y-6" onSubmit={handleAuth}>
            <div>
            <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: '#583C5C' }}
            >
                Email
            </label>
            <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none"
                style={{ 
                    borderColor: '#B4A6C2',
                    color: '#3D3538',
                    '--tw-ring-color': '#583C5C'
                } as any}
                placeholder="Enter your email"
            />
            </div>

            <div>
            <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: '#583C5C' }}
            >
                Password
            </label>
            <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none"
                style={{ borderColor: '#B4A6C2', color: '#3D3538' }}
                placeholder="Enter your password"
            />
            </div>

            {error && (
            <div className="text-sm p-3 rounded" style={{ backgroundColor: '#F7F4F3', color: '#583C5C', borderLeft: `3px solid #E8B960` }}>
                {error}
            </div>
            )}

            <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
            style={{ backgroundColor: '#583C5C' }}
            >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>
        </form>

        <div className="text-center mt-6 pt-6" style={{ borderTop: `1px solid #B4A6C2` }}>
            <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: '#583C5C' }}
            >
            {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
        </div>
        </div>
        </div>
    </div>
    );
    }