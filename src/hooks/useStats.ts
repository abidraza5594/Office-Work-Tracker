import { eachDayOfInterval, endOfDay, format, isWithinInterval, parseISO, startOfDay, subDays } from "date-fns";
import { entriesToCsv, todayKey, typeLabel } from "@/lib/utils";
import { calculateStreak } from "@/hooks/useStreak";
import type { Entry, EntryType, TagTimeStat, TypeStat, WeekDayStat } from "@/types";

type BranchWorkKey = "features" | "bugFixes" | "changes" | "other";

function sourceBranchFromEntry(entry: Entry) {
  const match = entry.notes?.match(/^Source:\s*(.+)$/im);
  return match?.[1]?.trim().replace(/^refs\/heads\//i, "") ?? "";
}

function branchWorkKey(branch: string): BranchWorkKey {
  const normalized = branch.trim().toLowerCase();
  if (/^features?\/ak(?:\/|-|_)?/.test(normalized)) return "features";
  if (/^fix(?:es)?\/ak(?:\/|-|_)?/.test(normalized)) return "bugFixes";
  if (/^changes?\/ak(?:\/|-|_)?/.test(normalized)) return "changes";
  return "other";
}

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
  const azureEntries = entries.filter((entry) => entry.tag === "Azure PR" || entry.notes?.includes("Azure DevOps PR"));
  const branchWorkCounts: Record<BranchWorkKey, number> = {
    features: 0,
    bugFixes: 0,
    changes: 0,
    other: 0
  };

  azureEntries.forEach((entry) => {
    branchWorkCounts[branchWorkKey(sourceBranchFromEntry(entry))] += 1;
  });

  const branchWorkStats = [
    {
      key: "features",
      label: "Features",
      value: branchWorkCounts.features,
      detail: "features/ak branches",
      color: "#6c8fff"
    },
    {
      key: "bugFixes",
      label: "Bug Fixes",
      value: branchWorkCounts.bugFixes,
      detail: "fixes/ak or fix/ak branches",
      color: "#f87171"
    },
    {
      key: "changes",
      label: "Changes",
      value: branchWorkCounts.changes,
      detail: "changes/ak branches",
      color: "#34d399"
    },
    {
      key: "other",
      label: "Other PRs",
      value: branchWorkCounts.other,
      detail: "Different branch names",
      color: "#5a6278"
    }
  ];

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
    branchWorkStats,
    azurePrCount: azureEntries.length,
    streak,
    todayEntries,
    weeklyInsight: `This week you completed ${weeklyTasks} tasks, attended ${weeklyMeetings} meetings, and logged ${(weeklyMinutes / 60).toFixed(1)} hours.`,
    csv: entriesToCsv(entries)
  };
}
