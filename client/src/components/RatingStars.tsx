import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  totalRatings?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function RatingStars({ 
  rating, 
  totalRatings, 
  size = "md", 
  showCount = true,
  interactive = false,
  onRate 
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const filled = star <= Math.round(rating);
          const partial = star === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <button
              key={star}
              onClick={() => interactive && onRate?.(star)}
              disabled={!interactive}
              className={cn(
                "relative",
                interactive && "cursor-pointer hover:scale-110 transition-transform"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                )}
              />
              {partial && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    "absolute top-0 left-0 fill-yellow-400 text-yellow-400"
                  )}
                  style={{
                    clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      {showCount && (
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          {rating.toFixed(1)}
          {totalRatings !== undefined && ` (${totalRatings})`}
        </span>
      )}
    </div>
  );
}
