"use client";

/**
 * Home/Landing Page
 * 
 * Main landing page for the Marahuyo dating app featuring a cosmic-themed
 * hero section with animated stars, branding, and call-to-action buttons.
 * Hidden when user navigates to other pages (Navbar handles visibility).
 * 
 * Key Features:
 * - Animated starfield background (50 stars with pulse animations)
 * - Client-side star generation to avoid hydration mismatches
 * - Responsive hero layout with logo and headlines
 * - Primary CTA button leading to authentication page
 * - Statistics section showing app metrics
 * - Cosmic theme with gradient backgrounds and golden accents
 * - Fully responsive design (mobile to desktop)
 * 
 * Visual Elements:
 * - Animated Marahuyo logo with glow effect
 * - Hero headline and subheadline
 * - "Start Your Journey" button with heart icon
 * - Stats grid (Users, Matches, Success Rate)
 * - Bottom gradient fade effect
 * 
 * @page
 * @route /
 */

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-contexts";
import { useState, useEffect } from "react";

/**
 * Individual star configuration for animated background
 */
interface Star {
  left: number;
  top: number;
  delay: number;
  opacity: number;
}

export default function Home() {
  const { user } = useAuth();
  const [stars, setStars] = useState<Star[]>([]);

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

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8 animate-bounce">
            <Image
              src="/marahuyo.png"
              alt="Marahuyo - Where Hearts Find Their Cosmic Connection"
              width={256}
              height={256}
              priority
              className="mx-auto"
              style={{
                filter: "drop-shadow(0 0 40px hsl(45 90% 55% / 0.3))",
              }}
            />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: "hsl(45 90% 55%)" }}>
            Where Hearts Find Their Cosmic Connection
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto" style={{ color: "hsl(220 10% 65%)" }}>
            Experience the magic of destiny-driven dating. Let the stars guide you to your perfect match.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300 group"
              style={{
                background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
                color: "hsl(220 30% 8%)",
                boxShadow: "0 0 40px hsl(45 90% 55% / 0.3)",
              }}
            >
              <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Start Your Journey
            </Link>
            
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 border-t" style={{ borderColor: "hsl(220 20% 20%)" }}>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "hsl(45 90% 55%)" }}>
                10K+
              </div>
              <div className="text-sm" style={{ color: "hsl(220 10% 65%)" }}>
                Enchanted Souls
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "hsl(200 60% 50%)" }}>
                5K+
              </div>
              <div className="text-sm" style={{ color: "hsl(220 10% 65%)" }}>
                Cosmic Matches
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "hsl(340 80% 65%)" }}>
                98%
              </div>
              <div className="text-sm" style={{ color: "hsl(220 10% 65%)" }}>
                Success Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to top, hsl(220 30% 8%), transparent)" }} />
    </section>
  );
}