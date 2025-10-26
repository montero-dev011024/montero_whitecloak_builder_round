    'use client';

    import Link from "next/link";
    import { use, useState } from "react";

    export default function AuthPage() {

    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">♥</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
            Hearts
            </span>
        </Link>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <center><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
            </h1></center>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
            {isSignUp
                ? "Find your perfect match today"
                : "Sign in to your Hearts account"}
            </p>

            <form className="space-y-5">
            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
                </label>
                <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Password */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
                </label>
                <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Sign Up Fields */}
            {isSignUp && (
                <>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                    </label>
                    <input
                    type="number"
                    placeholder="Your age"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                    </label>
                    <input
                    type="text"
                    placeholder="City, State"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Looking For
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white">
                    <option>Select preference</option>
                    <option>Men</option>
                    <option>Women</option>
                    <option>Everyone</option>
                    </select>
                </div>
                </>
            )}

            {/* Remember Me / Forgot Password */}
            {!isSignUp && (
                <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <input type="checkbox" className="rounded" />
                    Remember me
                </label>
                <a href="#" className="text-pink-500 hover:text-pink-600">
                    Forgot password?
                </a>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors mt-6"
            >
                {isSignUp ? "Create Account" : "Sign In"}
            </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">or</span>
            <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
            <button className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300">
                🔵 Continue with Facebook
            </button>
            <button className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300">
                🔴 Continue with Google
            </button>
            </div>

            {/* Toggle Sign Up / Sign In */}
            <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-pink-500 hover:text-pink-600 font-semibold"
            >
                {isSignUp ? "Sign In" : "Sign Up"}
            </button>
            </p>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-8 text-sm text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-pink-500">
            Privacy Policy
            </a>
            <a href="#" className="hover:text-pink-500">
            Terms of Service
            </a>
            <a href="#" className="hover:text-pink-500">
            Contact
            </a>
        </div>
        </div>
    </div>
    );
    }