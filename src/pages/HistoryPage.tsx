import { useEffect, useMemo, useState } from "react";
import { eachDayOfInterval, format, startOfMonth, startOfWeek, subDays } from "date-fns";
import { motion } from "framer-motion";
import { EntryCard } from "@/components/entries/EntryCard";
import { EntryFilters } from "@/components/entries/EntryFilters";
import { EntryForm } from "@/components/entries/EntryForm";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCards } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEntries } from "@/hooks/useEntries";
import { cn, entryMatchesSearch, formatDateKey, prettyDate, sortEntriesNewest, todayKey } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { Entry, EntryPriority } from "@/types";

const typeFilters = [
  { value: "all", label: "All Types" },
  { value: "task", label: "Tasks" },
  { value: "meeting", label: "Meetings" },
  { value: "time_log", label: "Time Logs" }
];

const statusFilters = [
  { value: "all", label: "All Status" },
  { value: "done", label: "Done" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" }
];

const priorityRank: Record<EntryPriority, number> = { high: 0, medium: 1, low: 2 };

export function HistoryPage() {
  const today = todayKey();
  const sevenDaysAgo = formatDateKey(subDays(new Date(), 6));
  const user = useAppStore((state) => state.user);
  const entries = useAppStore((state) => state.historyEntries);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const setHistoryEntries = useAppStore((state) => state.setHistoryEntries);
  const entriesApi = useEntries();
  const [from, setFrom] = useState(sevenDaysAgo);
  const [to, setTo] = useState(today);
  const [activeDay, setActiveDay] = useState("all");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "priority">("newest");
  const [visibleCount, setVisibleCount] = useState(20);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const load = async (start = from, end = to) => {
    try {
      await entriesApi.loadHistory(start, end);
    } catch {
      // Error state and toast are handled in useEntries.
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    void load(sevenDaysAgo, today);
  }, [user?.uid]);

  const stripDays = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const countsByDate = useMemo(() => {
    return entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.date] = (acc[entry.date] ?? 0) + 1;
      return acc;
    }, {});
  }, [entries]);

  const filtered = useMemo(() => {
    const base = entries
      .filter((entry) => activeDay === "all" || entry.date === activeDay)
      .filter((entry) => entryMatchesSearch(entry, query))
      .filter((entry) => typeFilter === "all" || entry.type === typeFilter)
      .filter((entry) => statusFilter === "all" || entry.status === statusFilter);

    if (sort === "oldest") return [...base].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    if (sort === "priority") return [...base].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
    return sortEntriesNewest(base);
  }, [entries, activeDay, query, typeFilter, statusFilter, sort]);

  const visible = filtered.slice(0, visibleCount);
  const grouped = visible.reduce<Record<string, Entry[]>>((acc, entry) => {
    acc[entry.date] = acc[entry.date] ? [...acc[entry.date], entry] : [entry];
    return acc;
  }, {});

  const applyRange = async () => {
    setActiveDay("all");
    setVisibleCount(20);
    await load(from, to);
  };

  const quickRange = async (mode: "week" | "month") => {
    const start = mode === "week" ? startOfWeek(new Date(), { weekStartsOn: 1 }) : startOfMonth(new Date());
    const startKey = formatDateKey(start);
    setFrom(startKey);
    setTo(today);
    setActiveDay("all");
    setVisibleCount(20);
    await load(startKey, today);
  };

  const loadAllTime = async () => {
    setFrom("");
    setTo(today);
    setActiveDay("all");
    setVisibleCount(20);
    const allEntries = await entriesApi.loadAll();
    setHistoryEntries(allEntries);
  };

  const openEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary">History</h1>
        <p className="mt-1 text-sm text-text-muted">Review and filter past work logs.</p>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <span>Data load nahi hua. Retry karein ↻</span>
          <Button type="button" size="sm" variant="outline" onClick={() => load()}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="no-scrollbar touch-scroll -mx-4 flex gap-2 overflow-x-auto px-4">
        <button
          type="button"
          onClick={() => setActiveDay("all")}
          className={cn(
            "shrink-0 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-sm font-bold text-text-muted",
            activeDay === "all" && "border-accent-blue bg-accent-blue/15 text-accent-blue"
          )}
        >
          All
        </button>
        {stripDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const count = countsByDate[key] ?? 0;
          return (
            <button
              type="button"
              key={key}
              onClick={() => setActiveDay(key)}
              className={cn(
                "relative shrink-0 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-center text-sm font-bold text-text-muted",
                activeDay === key && "border-accent-blue bg-accent-blue/15 text-accent-blue"
              )}
            >
              <span className="block text-xs">{format(day, "EEE")}</span>
              <span className="block text-lg">{format(day, "d")}</span>
              {count > 0 ? (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-success px-1.5 text-[10px] text-slate-950">{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <section className="rounded-lg border border-border-subtle bg-bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          <Button type="button" onClick={applyRange} disabled={isLoading}>
            Apply
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => quickRange("week")}>
            This Week
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => quickRange("month")}>
            This Month
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={loadAllTime}>
            All Time
          </Button>
        </div>
      </section>

      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search text, notes, or tag" />
      <EntryFilters options={typeFilters} active={typeFilter} onChange={setTypeFilter} />
      <EntryFilters options={statusFilters} active={statusFilter} onChange={setStatusFilter} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-text-muted">{filtered.length} entries</p>
        <div className="flex rounded-lg border border-border-subtle bg-bg-surface p-1">
          {(["newest", "oldest", "priority"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSort(option)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-bold capitalize text-text-muted transition",
                sort === option && "bg-bg-elevated text-text-primary"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {isLoading && entries.length === 0 ? <SkeletonCards /> : null}
      {!isLoading && filtered.length === 0 ? <EmptyState title="Koi history entry nahi mili" description="Range ya filters adjust karke phir dekhein." /> : null}

      <div className="space-y-5">
        {Object.entries(grouped).map(([date, group]) => (
          <section key={date} className="space-y-3">
            <h2 className="sticky top-0 z-10 -mx-4 bg-bg-primary/95 px-4 py-2 font-heading text-lg font-bold text-text-primary backdrop-blur md:top-0">
              {prettyDate(date)}
            </h2>
            {group.map((entry) => (
              <EntryCard key={entry.id} entry={entry} showDate onEdit={openEdit} />
            ))}
          </section>
        ))}
      </div>

      {visibleCount < filtered.length ? (
        <Button type="button" variant="outline" className="w-full" onClick={() => setVisibleCount((count) => count + 20)}>
          Load More
        </Button>
      ) : null}

      <EntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingEntry}
        onSaved={() => {
          setEditingEntry(null);
          void load();
        }}
      />
    </motion.div>
  );
}
