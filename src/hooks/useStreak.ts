import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import type { Entry, StreakInfo } from "@/types";

const milestones = [
  { days: 60, label: "💎 Legend" },
  { days: 30, label: "🏆 Champion" },
  { days: 14, label: "⚡ Unstoppable" },
  { days: 7, label: "🔥 On Fire" },
  { days: 3, label: "🌱 Getting Started" }
];

function milestoneFor(days: number) {
  return milestones.find((milestone) => days >= milestone.days)?.label ?? null;
}

export function calculateStreak(entries: Entry[], now = new Date()): StreakInfo {
  const uniqueDates = Array.from(new Set(entries.map((entry) => entry.date))).sort((a, b) =>
    b.localeCompare(a)
  );
  const dateSet = new Set(uniqueDates);
  const today = format(now, "yyyy-MM-dd");
  const yesterday = format(subDays(now, 1), "yyyy-MM-dd");
  const startDate = dateSet.has(today) ? today : yesterday;

  let current = 0;
  let cursor = parseISO(startDate);
  while (dateSet.has(format(cursor, "yyyy-MM-dd"))) {
    current += 1;
    cursor = subDays(cursor, 1);
  }

  const ascending = [...uniqueDates].sort((a, b) => a.localeCompare(b));
  let longest = 0;
  let activeRun = 0;
  let previous: string | null = null;

  for (const date of ascending) {
    if (!previous) {
      activeRun = 1;
    } else {
      const gap = differenceInCalendarDays(parseISO(date), parseISO(previous));
      activeRun = gap === 1 ? activeRun + 1 : 1;
    }
    longest = Math.max(longest, activeRun);
    previous = date;
  }

  return {
    current,
    longest,
    lastActiveDate: uniqueDates[0] ?? "",
    milestone: milestoneFor(current)
  };
}

export function useStreak(entries: Entry[]) {
  return calculateStreak(entries);
}
