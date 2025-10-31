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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-primary">
            Where Hearts Find Their Cosmic Connection
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-muted-foreground">
            Experience the magic of destiny-driven dating. Let the stars guide you to your perfect match.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300 group bg-primary text-primary-foreground"
              style={{
                background: "var(--gradient-warm)",
                boxShadow: "var(--shadow-glow-warm)",
              }}
            >
              <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Start Your Journey
            </Link>
            
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 border-t border-border">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2 text-primary">
                10K+
              </div>
              <div className="text-sm text-muted-foreground">
                Enchanted Souls
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2 text-secondary">
                5K+
              </div>
              <div className="text-sm text-muted-foreground">
                Cosmic Matches
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "hsl(var(--romantic))" }}>
                98%
              </div>
              <div className="text-sm text-muted-foreground">
                Success Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}