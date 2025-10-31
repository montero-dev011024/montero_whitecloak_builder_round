"use client";

/**
 * Theme Context Provider
 * 
 * Manages global theme state (Sol/Luna mode) for the Marahuyo dating app.
 * Sol = Light mode, Luna = Dark mode with cosmic theme.
 * 
 * Key Features:
 * - Persists theme preference in localStorage
 * - Provides theme toggle functionality
 * - Applies theme class to document root
 * - Smooth transitions between themes
 * 
 * @module contexts/theme-context
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <ThemeProvider>
 *   <AuthProvider>
 *     {children}
 *   </AuthProvider>
 * </ThemeProvider>
 * 
 * // In any component
 * import { useTheme } from "@/contexts/theme-context";
 * 
 * function MyComponent() {
 *   const { theme, toggleTheme } = useTheme();
 *   return <button onClick={toggleTheme}>{theme === 'luna' ? '☀️' : '🌙'}</button>;
 * }
 * ```
 */

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "sol" | "luna";

interface ThemeContextType {
    /** Current theme: 'sol' (light) or 'luna' (dark) */
    theme: Theme;
    /** Toggle between sol and luna modes */
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("luna"); // Default to dark (luna)
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem("marahuyo-theme") as Theme;
        if (savedTheme === "sol" || savedTheme === "luna") {
            setTheme(savedTheme);
        }
        setMounted(true);
    }, []);

    // Apply theme to document root and save to localStorage
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        
        // Remove both classes first
        root.classList.remove("sol", "luna");
        
        // Add the current theme class
        root.classList.add(theme);
        
        // Save to localStorage
        localStorage.setItem("marahuyo-theme", theme);
        
        console.log(`🎨 Theme switched to: ${theme}`);
        console.log(`HTML classes:`, root.className);
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "luna" ? "sol" : "luna"));
    };

    // Always provide the context, even before mounting
    // This prevents "useTheme must be used within a ThemeProvider" errors
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

