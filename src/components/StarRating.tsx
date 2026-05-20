import { Star } from "lucide-react";
import { cn } from "../lib/utils";

interface Props {
  rating: number;
  max?: number;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  size?: number;
}

export function StarRating({ rating, max = 5, readOnly = true, onChange, className, size = 16 }: Props) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < Math.floor(rating);
        const isHalf = !isFilled && i < rating;
        
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(i + 1)}
            className={cn(
              "transition-all duration-200",
              !readOnly && "hover:scale-110 focus:outline-none cursor-pointer"
            )}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                isFilled ? "fill-accent-400 text-accent-400" : 
                isHalf ? "fill-accent-400/50 text-accent-400" : 
                "fill-slate-200 text-slate-200"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
