"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Update state to display fallback UI on error
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Log error information for monitoring
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  /**
   * Reset error state to retry rendering
   */
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided by parent
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI with cosmic theme
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))",
          }}
        >
          <div className="text-center max-w-md mx-auto p-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background:
                  "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
              }}
            >
              <span className="text-4xl">⚠️</span>
            </div>
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: "hsl(45 90% 55%)" }}
            >
              Oops! Something went wrong
            </h2>
            <p className="mb-2" style={{ color: "hsl(220 10% 65%)" }}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            {this.state.error && (
              <details className="mt-4 mb-6 text-left">
                <summary
                  className="cursor-pointer text-sm mb-2"
                  style={{ color: "hsl(220 10% 60%)" }}
                >
                  Technical Details
                </summary>
                <pre
                  className="text-xs p-4 rounded-lg overflow-auto max-h-32"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "hsl(0 70% 70%)",
                  }}
                >
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="font-semibold py-3 px-6 rounded-full transition-all duration-200"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
                  color: "hsl(220 30% 8%)",
                  boxShadow: "0 0 40px hsl(45 90% 55% / 0.3)",
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="font-semibold py-3 px-6 rounded-full transition-all duration-200 hover:bg-white/10"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "hsl(220 10% 75%)",
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

