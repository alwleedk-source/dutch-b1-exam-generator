import { TRPCError } from "@trpc/server";
import validator from "validator";

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, "");
  
  return sanitized;
}

/**
 * Validate and sanitize text input
 */
export function validateText(text: string, options: {
  minLength?: number;
  maxLength?: number;
  fieldName?: string;
}): string {
  const { minLength = 0, maxLength = 100000, fieldName = "Text" } = options;

  // Check if text exists
  if (!text || typeof text !== "string") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} is required`,
    });
  }

  // Trim whitespace
  const trimmed = text.trim();

  // Check minimum length
  if (trimmed.length < minLength) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must be at least ${minLength} characters long`,
    });
  }

  // Check maximum length
  if (trimmed.length > maxLength) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must not exceed ${maxLength} characters`,
    });
  }

  // Sanitize HTML
  return sanitizeHtml(trimmed);
}

/**
 * Validate email address
 */
export function validateEmail(email: string): string {
  if (!email || typeof email !== "string") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Email is required",
    });
  }

  const trimmed = email.trim().toLowerCase();

  if (!validator.isEmail(trimmed)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid email address",
    });
  }

  return trimmed;
}

/**
 * Validate URL
 */
export function validateUrl(url: string, fieldName = "URL"): string {
  if (!url || typeof url !== "string") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} is required`,
    });
  }

  const trimmed = url.trim();

  if (!validator.isURL(trimmed, { require_protocol: true })) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid ${fieldName}`,
    });
  }

  return trimmed;
}

/**
 * Validate integer within range
 */
export function validateInteger(
  value: any,
  options: {
    min?: number;
    max?: number;
    fieldName?: string;
  }
): number {
  const { min, max, fieldName = "Value" } = options;

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must be an integer`,
    });
  }

  if (min !== undefined && value < min) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must be at least ${min}`,
    });
  }

  if (max !== undefined && value > max) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must not exceed ${max}`,
    });
  }

  return value;
}

/**
 * Validate rating (1-5)
 */
export function validateRating(rating: number): number {
  return validateInteger(rating, {
    min: 1,
    max: 5,
    fieldName: "Rating",
  });
}

/**
 * Validate Dutch text content
 * Checks for minimum word count and reasonable length
 */
export function validateDutchText(text: string): string {
  const sanitized = validateText(text, {
    minLength: 100,
    maxLength: 50000,
    fieldName: "Dutch text",
  });

  // Count words (simple word count)
  const wordCount = sanitized.split(/\s+/).filter(word => word.length > 0).length;

  if (wordCount < 50) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Text must contain at least 50 words",
    });
  }

  return sanitized;
}

/**
 * Validate exam title
 */
export function validateExamTitle(title: string): string {
  return validateText(title, {
    minLength: 3,
    maxLength: 200,
    fieldName: "Title",
  });
}

/**
 * Validate comment/review text
 */
export function validateComment(comment: string): string {
  return validateText(comment, {
    minLength: 1,
    maxLength: 1000,
    fieldName: "Comment",
  });
}

/**
 * Validate forum post content
 */
export function validateForumContent(content: string): string {
  return validateText(content, {
    minLength: 10,
    maxLength: 10000,
    fieldName: "Post content",
  });
}
