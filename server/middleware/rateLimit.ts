import { TRPCError } from "@trpc/server";

// Simple in-memory rate limiter
// In production, use Redis or similar for distributed rate limiting
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
  message?: string; // Custom error message
}

/**
 * Rate limiting middleware for tRPC procedures
 * @param userId - User ID to track rate limits per user
 * @param options - Rate limit configuration
 */
export function checkRateLimit(
  userId: number | undefined,
  options: RateLimitOptions
): void {
  // Skip rate limiting for unauthenticated users (handled by auth middleware)
  if (!userId) {
    return;
  }

  const key = `user:${userId}`;
  const now = Date.now();
  const record = rateLimitStore[key];

  if (!record || record.resetTime < now) {
    // Create new record or reset expired one
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    return;
  }

  // Increment count
  record.count++;

  // Check if limit exceeded
  if (record.count > options.maxRequests) {
    const resetIn = Math.ceil((record.resetTime - now) / 1000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message:
        options.message ||
        `Too many requests. Please try again in ${resetIn} seconds.`,
    });
  }
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  // Exam creation: 10 exams per hour
  CREATE_EXAM: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: "You can only create 10 exams per hour. Please try again later.",
  },

  // Report submission: 5 reports per hour
  SUBMIT_REPORT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: "You can only submit 5 reports per hour. Please try again later.",
  },

  // Text validation: 20 validations per hour
  VALIDATE_TEXT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message:
      "You can only validate 20 texts per hour. Please try again later.",
  },

  // Forum post creation: 20 posts per hour
  CREATE_POST: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message: "You can only create 20 posts per hour. Please try again later.",
  },

  // Rating submission: 30 ratings per hour
  SUBMIT_RATING: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 30,
    message: "You can only submit 30 ratings per hour. Please try again later.",
  },
};
