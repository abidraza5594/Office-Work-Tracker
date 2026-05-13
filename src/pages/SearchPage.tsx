import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { EntryCard } from "@/components/entries/EntryCard";
import { EntryForm } from "@/components/entries/EntryForm";
import { EmptyState } from "@/components/common/EmptyState";
import { EntryFilters } from "@/components/entries/EntryFilters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEntries } from "@/hooks/useEntries";
import { entryMatchesSearch } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { Entry } from "@/types";

const recentKey = "office-work-tracker-recent-searches";

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

const priorityFilters = [
  { value: "all", label: "All Priority" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];

export function SearchPage() {
  const user = useAppStore((state) => state.user);
  const entries = useAppStore((state) => state.allEntries);
  const entriesApi = useEntries();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(recentKey) ?? "[]") as string[];
    } catch {
      return [];
    }
  });
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    void entriesApi.loadAll().catch(() => undefined);
  }, [user?.uid]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const saveRecent = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    const next = [clean, ...recent.filter((item) => item !== clean)].slice(0, 6);
    setRecent(next);
    localStorage.setItem(recentKey, JSON.stringify(next));
  };

  const results = useMemo(() => {
    return entries
      .filter((entry) => entryMatchesSearch(entry, debouncedQuery))
      .filter((entry) => typeFilter === "all" || entry.type === typeFilter)
      .filter((entry) => statusFilter === "all" || entry.status === statusFilter)
      .filter((entry) => priorityFilter === "all" || entry.priority === priorityFilter);
  }, [entries, debouncedQuery, typeFilter, statusFilter, priorityFilter]);

  const openEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary">Search</h1>
        <p className="mt-1 text-sm text-text-muted">Find text, notes, tags, status, and priorities.</p>
      </div>

      <form
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          saveRecent(query);
        }}
      >
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-hint" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => saveRecent(query)}
          placeholder="Search across work entries"
          className="h-12 pl-10"
        />
      </form>

      {!query && recent.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {recent.map((item) => (
            <Button key={item} type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setQuery(item)}>
              {item}
            </Button>
          ))}
        </div>
      ) : null}

      <EntryFilters options={typeFilters} active={typeFilter} onChange={setTypeFilter} />
      <EntryFilters options={statusFilters} active={statusFilter} onChange={setStatusFilter} />
      <EntryFilters options={priorityFilters} active={priorityFilter} onChange={setPriorityFilter} />

      <p className="text-sm font-semibold text-text-muted">
        {results.length} results{debouncedQuery ? ` for '${debouncedQuery}'` : ""}
      </p>

      {results.length === 0 ? (
        <EmptyState title={debouncedQuery ? `Koi entry nahi mili '${debouncedQuery}'` : "Search shuru karein"} description="Text, notes, ya tag ka part likhein." />
      ) : (
        <div className="space-y-3">
          {results.map((entry) => (
            <EntryCard key={entry.id} entry={entry} showDate onEdit={openEdit} highlightQuery={debouncedQuery} />
          ))}
        </div>
      )}

      <EntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingEntry}
        onSaved={() => {
          setEditingEntry(null);
          void entriesApi.loadAll().catch(() => undefined);
        }}
      />
    </motion.div>
  );
}
