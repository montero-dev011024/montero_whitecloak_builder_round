'use client';

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">♥</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Hearts
            </span>
          </div>
          <Link
            href="/auth"
            className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Find Your <span className="text-pink-500">Perfect</span> Match
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Connect with amazing people in your area. Swipe, chat, and find
              meaningful relationships.
            </p>
            <div className="flex gap-4">
              <Link
                href="/auth"
                className="px-8 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors font-semibold text-lg"
              >
                Get Started
              </Link>
              <button className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full hover:border-gray-400 transition-colors font-semibold text-lg">
                Learn More
              </button>
            </div>
          </div>

          {/* Featured Profiles Preview */}
          <div className="relative">
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-96 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-3xl">👩</span>
                    </div>
                    <h3 className="text-2xl font-bold">Sarah, 28</h3>
                    <p className="text-sm opacity-90">San Francisco, CA</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-semibold">
                  ✕ Pass
                </button>
                <button className="flex-1 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors font-semibold">
                  ♥ Like
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Why Choose Hearts?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">💝</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Smart Matching
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our algorithm finds compatible matches based on your interests,
                location, and preferences.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Quick Connect
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start chatting instantly with matches who like you back. Real
                conversations with real people.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Safe & Secure
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Verified profiles and privacy controls ensure you stay safe while
                meeting new people.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Find Love?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join thousands of people looking for meaningful connections.
          </p>
          <Link
            href="/auth"
            className="inline-block px-8 py-3 bg-white text-pink-600 rounded-full hover:bg-pink-50 transition-colors font-semibold text-lg"
          >
            Create Your Profile
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 Hearts Dating App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
