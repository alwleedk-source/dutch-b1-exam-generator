import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate a string to a maximum length and add ellipsis
 * @param str - The string to truncate
 * @param maxLength - Maximum length (default: 15)
 * @returns Truncated string with ellipsis if needed
 */
export function truncateName(str: string | null | undefined, maxLength: number = 15): string {
  if (!str) return "Unknown";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}
