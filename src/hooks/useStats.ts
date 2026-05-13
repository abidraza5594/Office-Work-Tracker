import { eachDayOfInterval, endOfDay, format, isWithinInterval, parseISO, startOfDay, subDays } from "date-fns";
import { entriesToCsv, todayKey, typeLabel } from "@/lib/utils";
import { calculateStreak } from "@/hooks/useStreak";
import type { Entry, EntryType, TagTimeStat, TypeStat, WeekDayStat } from "@/types";

export function useStats(entries: Entry[]) {
  const today = todayKey();
  const now = new Date();
  const weekStart = startOfDay(subDays(now, 6));
  const weekEnd = endOfDay(now);
  const thisWeekEntries = entries.filter((entry) => {
    const parsed = parseISO(entry.date);
    return isWithinInterval(parsed, { start: weekStart, end: weekEnd });
  });
  const todayEntries = entries.filter((entry) => entry.date === today);
  const streak = calculateStreak(entries);

  const weekDays: WeekDayStat[] = eachDayOfInterval({ start: weekStart, end: weekEnd }).map((date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return {
      date: dateKey,
      label: format(date, "EEE"),
      count: entries.filter((entry) => entry.date === dateKey).length
    };
  });

  const typeOrder: EntryType[] = ["task", "meeting", "time_log"];
  const typeColors: Record<EntryType, string> = {
    task: "#34d399",
    meeting: "#a78bfa",
    time_log: "#fbbf24"
  };
  const typeStats: TypeStat[] = typeOrder.map((type) => ({
    name: typeLabel(type),
    value: entries.filter((entry) => entry.type === type).length,
    color: typeColors[type]
  }));

  const tagTotals = new Map<string, number>();
  entries.forEach((entry) => {
    if (!entry.tag) return;
    tagTotals.set(entry.tag, (tagTotals.get(entry.tag) ?? 0) + (entry.duration ?? 0));
  });
  const topTags: TagTimeStat[] = Array.from(tagTotals, ([tag, minutes]) => ({ tag, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  const weeklyTasks = thisWeekEntries.filter((entry) => entry.type === "task" && entry.status === "done").length;
  const weeklyMeetings = thisWeekEntries.filter((entry) => entry.type === "meeting").length;
  const weeklyMinutes = thisWeekEntries.reduce((total, entry) => total + (entry.duration ?? 0), 0);

  const statCards = [
    {
      label: "Total Entries",
      value: String(entries.length),
      detail: "All time work logs",
      icon: "🔢"
    },
    {
      label: "Done Today",
      value: String(todayEntries.filter((entry) => entry.status === "done").length),
      detail: `${todayEntries.length} total today`,
      icon: "✅"
    },
    {
      label: "Hours This Week",
      value: (weeklyMinutes / 60).toFixed(1),
      detail: `${weeklyMinutes} minutes logged`,
      icon: "⏱"
    },
    {
      label: "Current Streak",
      value: String(streak.current),
      detail: streak.milestone ?? "Keep it going",
      icon: "🔥"
    }
  ];

  return {
    statCards,
    weekDays,
    typeStats,
    topTags,
    streak,
    todayEntries,
    weeklyInsight: `This week you completed ${weeklyTasks} tasks, attended ${weeklyMeetings} meetings, and logged ${(weeklyMinutes / 60).toFixed(1)} hours.`,
    csv: entriesToCsv(entries)
  };
}
