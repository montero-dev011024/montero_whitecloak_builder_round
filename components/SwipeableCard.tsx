"use client";

/**
 * SwipeableCard Component
 * 
 * Reusable wrapper that adds Tinder-style swipe functionality to any child content.
 * Supports both mouse and touch interactions with smooth animations and visual feedback.
 * Shows "LIKE" or "NOPE" overlays based on swipe direction.
 * 
 * Key Features:
 * - Horizontal swipe detection (left/right)
 * - Configurable swipe threshold before triggering action
 * - Rotation animation based on swipe distance
 * - Opacity fade as card is swiped away
 * - Mouse and touch event support
 * - Customizable overlays for left/right swipes
 * - Default "LIKE" (green) and "NOPE" (red) overlays
 * - Smooth spring-back animation if swipe threshold not met
 * - Visual hint label when not swiping
 * 
 * @component
 * @example
 * ```tsx
 * <SwipeableCard
 *   onSwipeRight={() => likeUser(userId)}
 *   onSwipeLeft={() => passUser(userId)}
 *   threshold={120}
 *   rotationFactor={0.15}
 * >
 *   <UserProfileCard user={currentUser} />
 * </SwipeableCard>
 * ```
 */

import { useState, useRef, useEffect, ReactNode } from "react";

interface SwipeableCardProps {
    /** Callback when swiped left (pass/reject) */
    onSwipeLeft?: () => void;
    /** Callback when swiped right (like/accept) */
    onSwipeRight?: () => void;
    /** Content to be wrapped in swipeable container */
    children: ReactNode;
    /** Distance in pixels required to trigger swipe action (default: 100) */
    threshold?: number;
    /** Multiplier for rotation based on swipe distance (default: 0.1) */
    rotationFactor?: number;
    /** Whether to show default LIKE/NOPE overlays (default: true) */
    showOverlays?: boolean;
    /** Custom overlay to show when swiping left */
    leftOverlay?: ReactNode;
    /** Custom overlay to show when swiping right */
    rightOverlay?: ReactNode;
    /** Additional CSS classes for the card container */
    className?: string;
}

export default function SwipeableCard({
    onSwipeLeft,
    onSwipeRight,
    children,
    threshold = 100,
    rotationFactor = 0.1,
    showOverlays = true,
    leftOverlay,
    rightOverlay,
    className = "",
}: SwipeableCardProps) {
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !dragStart) return;

            const deltaX = e.clientX - dragStart.x;

            setDragOffset({ x: deltaX, y: 0 });
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging || !dragStart) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - dragStart.x;

            setDragOffset({ x: deltaX, y: 0 });
        };

        const handleDragEnd = () => {
            if (!isDragging) return;

            const absX = Math.abs(dragOffset.x);

            if (absX > threshold) {
                if (dragOffset.x > 0) {
                    onSwipeRight?.();
                } else {
                    onSwipeLeft?.();
                }
            }

            setIsDragging(false);
            setDragStart(null);
            setDragOffset({ x: 0, y: 0 });
        };

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("touchmove", handleTouchMove);
            window.addEventListener("mouseup", handleDragEnd);
            window.addEventListener("touchend", handleDragEnd);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("mouseup", handleDragEnd);
            window.removeEventListener("touchend", handleDragEnd);
        };
    }, [isDragging, dragStart, dragOffset, threshold, onSwipeLeft, onSwipeRight]);

    const handleDragStart = (clientX: number, clientY: number) => {
        setIsDragging(true);
        setDragStart({ x: clientX, y: clientY });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        handleDragStart(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
    };

    const rotation = dragOffset.x * rotationFactor;
    const opacity = 1 - Math.abs(dragOffset.x) / 500;
    const rightOpacity = Math.max(0, Math.min(1, dragOffset.x / 150));
    const leftOpacity = Math.max(0, Math.min(1, -dragOffset.x / 150));

    const defaultRightOverlay = (
        <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: rightOpacity, backgroundColor: "rgba(16, 185, 129, 0.4)" }}
        >
            <div className="border-4 rounded-2xl px-8 py-4 rotate-[-20deg]" style={{ borderColor: "hsl(160 70% 50%)" }}>
                <span className="text-5xl font-bold" style={{ color: "hsl(160 70% 50%)" }}>LIKE</span>
            </div>
        </div>
    );

    const defaultLeftOverlay = (
        <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: leftOpacity, backgroundColor: "rgba(230, 57, 70, 0.4)" }}
        >
            <div className="border-4 rounded-2xl px-8 py-4 rotate-[20deg]" style={{ borderColor: "hsl(0 70% 50%)" }}>
                <span className="text-5xl font-bold" style={{ color: "hsl(0 70% 50%)" }}>NOPE</span>
            </div>
        </div>
    );

    return (
        <div
            ref={cardRef}
            className={`cursor-grab active:cursor-grabbing touch-none select-none ${className}`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
                transform: `translate(${dragOffset.x}px, 0px) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.3s ease-out",
                opacity: opacity,
            }}
        >
            <div className="relative w-full h-full">
                {children}

                {showOverlays && (
                    <>
                        {rightOverlay !== undefined ? (
                            <div style={{ opacity: rightOpacity }}>{rightOverlay}</div>
                        ) : (
                            defaultRightOverlay
                        )}

                        {leftOverlay !== undefined ? (
                            <div style={{ opacity: leftOpacity }}>{leftOverlay}</div>
                        ) : (
                            defaultLeftOverlay
                        )}
                    </>
                )}

                {!isDragging && dragOffset.x === 0 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 backdrop-blur-sm px-4 py-2 rounded-full pointer-events-none z-10" style={{ backgroundColor: "rgba(232, 185, 96, 0.2)", border: "1px solid rgba(232, 185, 96, 0.4)" }}>
                        <p className="text-xs font-medium" style={{ color: "hsl(45 90% 65%)" }}>Swipe left or right</p>
                    </div>
                )}
            </div>
        </div>
    );
}
