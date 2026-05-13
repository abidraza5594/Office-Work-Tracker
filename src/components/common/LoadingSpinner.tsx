import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({ label = "Loading", className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-sm text-text-muted", className)}>
      <Loader2 className="h-5 w-5 animate-spin text-accent-blue" />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-border-subtle bg-bg-surface p-4">
          <div className="shimmer h-4 w-28 rounded" />
          <div className="shimmer mt-4 h-5 w-11/12 rounded" />
          <div className="shimmer mt-3 h-4 w-2/3 rounded" />
          <div className="mt-4 flex gap-2">
            <div className="shimmer h-9 w-20 rounded-lg" />
            <div className="shimmer h-9 w-24 rounded-lg" />
            <div className="shimmer h-9 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
