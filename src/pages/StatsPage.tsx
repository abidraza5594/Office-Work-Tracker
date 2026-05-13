import { useEffect } from "react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clipboard, Download } from "lucide-react";
import { DonutChart } from "@/components/stats/DonutChart";
import { StatsGrid } from "@/components/stats/StatsGrid";
import { StreakCard } from "@/components/stats/StreakCard";
import { WeekBarChart } from "@/components/stats/WeekBarChart";
import { Button } from "@/components/ui/button";
import { useEntries } from "@/hooks/useEntries";
import { useStats } from "@/hooks/useStats";
import { downloadFile, todayKey, typeLabel } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { Entry } from "@/types";

function serializableEntry(entry: Entry) {
  return {
    ...entry,
    createdAt: entry.createdAt?.toDate?.().toISOString?.() ?? null,
    updatedAt: entry.updatedAt?.toDate?.().toISOString?.() ?? null
  };
}

function dailySummary(entries: Entry[]) {
  const today = todayKey();
  const todayEntries = entries.filter((entry) => entry.date === today);
  const title = `Work Log — ${format(parseISO(today), "d MMMM yyyy")}`;
  const lines = todayEntries.map((entry) => {
    const icon = entry.status === "pending" ? "⏳" : entry.type === "meeting" ? "📅" : entry.type === "time_log" ? "⏱" : "✅";
    const label = entry.status === "pending" ? "Pending" : typeLabel(entry.type);
    const duration = entry.duration ? ` (${entry.duration} min)` : "";
    return `${icon} ${label}: ${entry.text}${duration}`;
  });
  return [title, ...lines].join("\n");
}

export function StatsPage() {
  const user = useAppStore((state) => state.user);
  const entries = useAppStore((state) => state.allEntries);
  const isLoading = useAppStore((state) => state.isLoading);
  const addToast = useAppStore((state) => state.addToast);
  const entriesApi = useEntries();
  const stats = useStats(entries);

  useEffect(() => {
    if (!user?.uid) return;
    void entriesApi.loadAll().catch(() => undefined);
  }, [user?.uid]);

  const exportCsv = () => {
    downloadFile("worklog.csv", stats.csv, "text/csv;charset=utf-8");
  };

  const exportJson = () => {
    downloadFile(
      "worklog.json",
      JSON.stringify(entries.map(serializableEntry), null, 2),
      "application/json;charset=utf-8"
    );
  };

  const copyToday = async () => {
    await navigator.clipboard.writeText(dailySummary(entries));
    addToast({ type: "success", message: "📋 Copied to clipboard" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary">Stats</h1>
        <p className="mt-1 text-sm text-text-muted">Patterns, streaks, exports, and weekly insight.</p>
      </div>

      <StatsGrid cards={stats.statCards} />

      <div className="grid gap-5 lg:grid-cols-2">
        <WeekBarChart data={stats.weekDays} />
        <DonutChart data={stats.typeStats} />
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-heading text-lg font-bold text-text-primary">Top Tags by Time</h2>
            <p className="text-sm text-text-muted">Total minutes by project label</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stats.topTags} margin={{ left: 16, right: 24 }}>
                <CartesianGrid stroke="rgba(155, 163, 184, 0.16)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "rgb(var(--color-text-muted))", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="tag" type="category" width={110} tick={{ fill: "rgb(var(--color-text-muted))", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--color-bg-surface))",
                    border: "1px solid rgb(var(--color-border-subtle))",
                    borderRadius: 8,
                    color: "rgb(var(--color-text-primary))"
                  }}
                />
                <Bar dataKey="minutes" fill="#6c8fff" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <StreakCard streak={stats.streak} />

      <section className="rounded-lg border border-border-subtle bg-bg-surface p-4">
        <h2 className="font-heading text-lg font-bold text-text-primary">Weekly Insight</h2>
        <p className="mt-2 text-sm font-semibold text-text-muted">{stats.weeklyInsight}</p>
      </section>

      <section className="rounded-lg border border-border-subtle bg-bg-surface p-4">
        <h2 className="font-heading text-lg font-bold text-text-primary">Export</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Button type="button" variant="outline" onClick={exportCsv} disabled={isLoading}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button type="button" variant="outline" onClick={exportJson} disabled={isLoading}>
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button type="button" onClick={copyToday} disabled={isLoading}>
            <Clipboard className="h-4 w-4" />
            Copy Today's Summary
          </Button>
        </div>
      </section>
    </motion.div>
  );
}
