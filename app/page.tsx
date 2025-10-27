'use client';

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ backgroundColor: '#F7F4F3' }} className="min-h-screen dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: '#F7F4F3' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#583C5C' }}>
              <span className="text-white text-sm font-bold">♥</span>
            </div>
            <span className="text-xl font-bold" style={{ color: '#583C5C' }}>
              Hearts
            </span>
          </div>
          <Link
            href="/auth"
            className="px-6 py-2 text-white rounded-full hover:opacity-90 transition-opacity font-medium"
            style={{ backgroundColor: '#583C5C' }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={{ color: '#3D3538' }}>
              Find Your <span style={{ color: '#E8B960' }}>Perfect</span> Match
            </h1>
            <p className="text-xl" style={{ color: '#3D3538' }}>
              Connect with amazing people in your area. Swipe, chat, and find
              meaningful relationships.
            </p>
            <div className="flex gap-4">
              <Link
                href="/auth"
                className="px-8 py-3 text-white rounded-full hover:opacity-90 transition-opacity font-semibold text-lg"
                style={{ backgroundColor: '#583C5C' }}
              >
                Get Started
              </Link>
              <button className="px-8 py-3 border-2 rounded-full font-semibold text-lg transition-colors"
                style={{ borderColor: '#583C5C', color: '#583C5C' }}>
                Learn More
              </button>
            </div>
          </div>

          {/* Featured Profiles Preview */}
          <div className="relative">
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-96 flex items-center justify-center" style={{ background: `linear-gradient(135deg, #583C5C 0%, #B4A6C2 100%)` }}>
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
                <button className="flex-1 py-3 text-white rounded-full hover:opacity-90 transition-colors font-semibold" style={{ backgroundColor: '#B4A6C2' }}>
                  ✕ Pass
                </button>
                <button className="flex-1 py-3 text-white rounded-full hover:opacity-90 transition-colors font-semibold" style={{ backgroundColor: '#E8B960' }}>
                  ♥ Like
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ color: '#583C5C' }}>
            Why Choose Hearts?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl border hover:shadow-lg transition-shadow" style={{ borderColor: '#B4A6C2' }}>
              <div className="text-4xl mb-4">💝</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#583C5C' }}>
                Smart Matching
              </h3>
              <p style={{ color: '#3D3538' }}>
                Our algorithm finds compatible matches based on your interests,
                location, and preferences.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl border hover:shadow-lg transition-shadow" style={{ borderColor: '#B4A6C2' }}>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#583C5C' }}>
                Quick Connect
              </h3>
              <p style={{ color: '#3D3538' }}>
                Start chatting instantly with matches who like you back. Real
                conversations with real people.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl border hover:shadow-lg transition-shadow" style={{ borderColor: '#B4A6C2' }}>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#583C5C' }}>
                Safe & Secure
              </h3>
              <p style={{ color: '#3D3538' }}>
                Verified profiles and privacy controls ensure you stay safe while
                meeting new people.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ background: `linear-gradient(135deg, #583C5C 0%, #B4A6C2 100%)` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Find Love?
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Join thousands of people looking for meaningful connections.
          </p>
          <Link
            href="/auth"
            className="inline-block px-8 py-3 rounded-full hover:opacity-90 transition-colors font-semibold text-lg"
            style={{ backgroundColor: '#E8B960', color: '#3D3538' }}
          >
            Create Your Profile
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12" style={{ backgroundColor: '#F7F4F3', borderColor: '#B4A6C2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ color: '#3D3538' }}>
          <p>&copy; 2025 Hearts Dating App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
