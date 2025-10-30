/**
 * Error Handling Utilities
 * 
 * Centralized error handling functions for consistent error management
 * across the application.
 */

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Standard success response structure
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * User-friendly error messages for common error types
 */
export const ERROR_MESSAGES = {
  // Authentication
  AUTH_REQUIRED: "Please sign in to continue.",
  AUTH_INVALID: "Invalid email or password.",
  AUTH_SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  
  // Network
  NETWORK_ERROR: "Unable to connect. Please check your internet connection.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  
  // Database
  DB_ERROR: "Unable to process your request. Please try again later.",
  DB_CONFLICT: "This action conflicts with existing data.",
  
  // Validation
  INVALID_INPUT: "Please check your input and try again.",
  MISSING_DATA: "Required information is missing.",
  
  // Permissions
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  
  // Generic
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  SERVER_ERROR: "Server error. Our team has been notified.",
} as const;

/**
 * Map Supabase/PostgreSQL error codes to user-friendly messages
 * 
 * @param code - Error code from database
 * @returns User-friendly error message
 */
export function mapDatabaseError(code: string): string {
  const errorMap: Record<string, string> = {
    "23505": "This record already exists.",
    "23503": "This action cannot be completed due to related data.",
    "23502": "Required information is missing.",
    "42P01": "Database table not found. Please contact support.",
    "42703": "Invalid data field.",
    "PGRST116": "No data found.",
    "PGRST301": "Authentication required.",
  };

  return errorMap[code] || ERROR_MESSAGES.DB_ERROR;
}

/**
 * Log error to console and optionally to monitoring service
 * 
 * @param error - Error object or message
 * @param context - Additional context about where/why the error occurred
 * @param severity - Error severity level
 */
export function logError(
  error: unknown,
  context?: string,
  severity: "error" | "warning" | "info" = "error"
): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  const logMessage = [
    `[${severity.toUpperCase()}] ${timestamp}`,
    context && `Context: ${context}`,
    `Message: ${errorMessage}`,
    error instanceof Error && error.stack && `Stack: ${error.stack}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Log to console
  if (severity === "error") {
    console.error(logMessage);
  } else if (severity === "warning") {
    console.warn(logMessage);
  } else {
    console.info(logMessage);
  }

  // TODO: Send to error monitoring service in production
  // Example: Sentry.captureException(error, { contexts: { custom: { context } } });
}

/**
 * Extract user-friendly error message from various error types
 * 
 * @param error - Error from any source (Error object, string, API response, etc.)
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  // Supabase error format
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  // PostgreSQL error with code
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return mapDatabaseError(error.code);
  }

  // Network/Fetch errors
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    const status = error.status;
    if (status === 401) return ERROR_MESSAGES.AUTH_REQUIRED;
    if (status === 403) return ERROR_MESSAGES.FORBIDDEN;
    if (status === 404) return ERROR_MESSAGES.NOT_FOUND;
    if (status >= 500) return ERROR_MESSAGES.SERVER_ERROR;
  }

  // Default fallback
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Create a standardized error response
 * 
 * @param error - Error object or message
 * @param code - Optional error code for client handling
 * @returns Standardized error response
 */
export function createErrorResponse(
  error: unknown,
  code?: string
): ErrorResponse {
  return {
    success: false,
    error: getErrorMessage(error),
    code,
    details: process.env.NODE_ENV === "development" ? error : undefined,
  };
}

/**
 * Create a standardized success response
 * 
 * @param data - Optional data to include in response
 * @returns Standardized success response
 */
export function createSuccessResponse<T>(data?: T): SuccessResponse<T> {
  return {
    success: true,
    ...(data !== undefined && { data }),
  };
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param delayMs - Initial delay in milliseconds
 * @returns Promise with function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate exponential backoff delay
      const delay = delayMs * Math.pow(2, attempt);
      logError(
        error,
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
        "warning"
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  throw lastError;
}

/**
 * Wrap an async function with error handling
 * 
 * @param fn - Async function to wrap
 * @param context - Context for error logging
 * @returns Wrapped function that handles errors gracefully
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context || fn.name);
      throw error;
    }
  }) as T;
}

