"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface SwipeableCardProps {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    children: ReactNode;
    threshold?: number;
    rotationFactor?: number;
    showOverlays?: boolean;
    leftOverlay?: ReactNode;
    rightOverlay?: ReactNode;
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
            className="absolute inset-0 bg-green-500/40 flex items-center justify-center pointer-events-none"
            style={{ opacity: rightOpacity }}
        >
            <div className="border-4 border-green-500 rounded-2xl px-8 py-4 rotate-[-20deg]">
                <span className="text-green-500 text-5xl font-bold">LIKE</span>
            </div>
        </div>
    );

    const defaultLeftOverlay = (
        <div
            className="absolute inset-0 bg-red-500/40 flex items-center justify-center pointer-events-none"
            style={{ opacity: leftOpacity }}
        >
            <div className="border-4 border-red-500 rounded-2xl px-8 py-4 rotate-[20deg]">
                <span className="text-red-500 text-5xl font-bold">NOPE</span>
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
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full pointer-events-none z-10">
                        <p className="text-white text-xs font-medium">Swipe left or right</p>
                    </div>
                )}
            </div>
        </div>
    );
}
