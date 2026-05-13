import { Flame } from "lucide-react";
import type { StreakInfo } from "@/types";

interface StreakCardProps {
  streak: StreakInfo;
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/15 text-warning">
          <Flame className="h-6 w-6" />
        </div>
        <div>
          <p className="font-heading text-xl font-bold text-text-primary">🔥 {streak.current} Day Streak!</p>
          <p className="text-sm text-text-muted">{streak.milestone ?? "Log once a day to grow your streak"}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-bg-elevated p-3">
          <p className="text-xs font-bold uppercase text-text-muted">Longest</p>
          <p className="mt-1 font-heading text-2xl font-bold text-text-primary">{streak.longest}</p>
        </div>
        <div className="rounded-lg bg-bg-elevated p-3">
          <p className="text-xs font-bold uppercase text-text-muted">Last Active</p>
          <p className="mt-1 text-sm font-semibold text-text-primary">{streak.lastActiveDate || "No logs yet"}</p>
        </div>
      </div>
    </div>
  );
}
