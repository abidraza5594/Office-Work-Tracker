import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EntryFilters } from "@/components/entries/EntryFilters";
import { EntryForm } from "@/components/entries/EntryForm";
import { EntryList } from "@/components/entries/EntryList";
import { Button } from "@/components/ui/button";
import { useEntries } from "@/hooks/useEntries";
import { useStreak } from "@/hooks/useStreak";
import { todayKey } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { Entry } from "@/types";

const filters = [
  { value: "all", label: "All" },
  { value: "task", label: "Tasks" },
  { value: "meeting", label: "Meetings" },
  { value: "time_log", label: "Time Logs" },
  { value: "done", label: "Done" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "high", label: "High Priority" }
];

function filterEntries(entries: Entry[], filter: string) {
  if (filter === "all") return entries;
  if (["task", "meeting", "time_log"].includes(filter)) return entries.filter((entry) => entry.type === filter);
  if (["done", "in_progress", "pending"].includes(filter)) return entries.filter((entry) => entry.status === filter);
  if (filter === "high") return entries.filter((entry) => entry.priority === "high");
  return entries;
}

export function TodayPage() {
  const user = useAppStore((state) => state.user);
  const todayEntries = useAppStore((state) => state.todayEntries);
  const allEntries = useAppStore((state) => state.allEntries);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const entriesApi = useEntries();
  const today = todayKey();
  const streak = useStreak(allEntries.length ? allEntries : todayEntries);

  const refresh = async () => {
    try {
      await entriesApi.loadToday(today);
      await entriesApi.loadAll();
    } catch {
      // Error state and toast are handled in useEntries.
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    void refresh();
  }, [user?.uid]);

  const filtered = useMemo(() => filterEntries(todayEntries, filter), [todayEntries, filter]);
  const doneCount = todayEntries.filter((entry) => entry.status === "done").length;
  const minutes = todayEntries.reduce((total, entry) => total + (entry.duration ?? 0), 0);

  const openEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const openNew = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mx-auto max-w-4xl space-y-5">
      <Header user={user} onRefresh={refresh} isRefreshing={isLoading} />

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <span>Data load nahi hua. Retry karein ↻</span>
          <Button type="button" size="sm" variant="outline" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : null}

      <section className="rounded-lg border border-border-subtle bg-bg-surface p-4">
        <p className="font-heading text-xl font-bold text-text-primary">🔥 {streak.current} Day Streak!</p>
        <p className="mt-1 text-sm text-text-muted">{streak.milestone ?? "Aaj ek entry add karke streak active rakhein."}</p>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <div className="rounded-full bg-success/15 px-3 py-2 text-center text-sm font-bold text-success">✅ {doneCount} Done</div>
        <div className="rounded-full bg-accent-blue/15 px-3 py-2 text-center text-sm font-bold text-accent-blue">📋 {todayEntries.length} Total</div>
        <div className="rounded-full bg-warning/15 px-3 py-2 text-center text-sm font-bold text-warning">⏱ {minutes} min</div>
      </section>

      <EntryFilters options={filters} active={filter} onChange={setFilter} />

      <EntryList entries={filtered} loading={isLoading && todayEntries.length === 0} onEdit={openEdit} onAdd={openNew} />

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        <Button
          type="button"
          size="icon"
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-30 h-14 w-14 rounded-full md:bottom-8 md:right-8"
          onClick={openNew}
          aria-label="Add entry"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>

      <EntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingEntry}
        onSaved={() => {
          setEditingEntry(null);
          void refresh();
        }}
      />
    </motion.div>
  );
}
