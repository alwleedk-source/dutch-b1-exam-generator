import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Generate a consistent color based on a string
 * Uses a simple hash function to generate HSL color
 */
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate hue (0-360)
  const hue = Math.abs(hash % 360);
  
  // Use fixed saturation and lightness for consistent appearance
  // Higher saturation for vibrant colors, moderate lightness for readability
  return `hsl(${hue}, 65%, 50%)`;
}

/**
 * Get the first character of a name
 * Handles multi-word names and returns uppercase
 */
function getInitial(name: string | null | undefined): string {
  if (!name || name.trim() === "") return "?";
  
  // Get first character of first word
  const firstChar = name.trim()[0];
  return firstChar.toUpperCase();
}

export function UserAvatar({ name, size = "md", className }: UserAvatarProps) {
  const initial = getInitial(name);
  const backgroundColor = stringToColor(name || "Unknown");
  
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };
  
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor }}
      title={name || "Unknown"}
    >
      {initial}
    </div>
  );
}
