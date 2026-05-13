import { useState } from "react";
import { CalendarDays, Clock, Edit3, RefreshCw, StickyNote, Tag, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useEntries } from "@/hooks/useEntries";
import { cn, nextStatus, prettyDate, priorityLabel, statusLabel, typeLabel } from "@/lib/utils";
import type { Entry, EntryPriority, EntryStatus, EntryType } from "@/types";

interface EntryCardProps {
  entry: Entry;
  showDate?: boolean;
  onEdit: (entry: Entry) => void;
  highlightQuery?: string;
}

const typeClasses: Record<EntryType, string> = {
  task: "border-l-success",
  meeting: "border-l-accent-purple",
  time_log: "border-l-warning"
};

const typeBadge: Record<EntryType, "success" | "purple" | "warning"> = {
  task: "success",
  meeting: "purple",
  time_log: "warning"
};

const statusBadge: Record<EntryStatus, "success" | "warning" | "danger"> = {
  done: "success",
  in_progress: "warning",
  pending: "danger"
};

const priorityDot: Record<EntryPriority, string> = {
  high: "bg-danger",
  medium: "bg-warning",
  low: "bg-success"
};

function HighlightedText({ text, query }: { text: string; query?: string }) {
  const clean = query?.trim();
  if (!clean) return <>{text}</>;
  const lowerText = text.toLowerCase();
  const lowerQuery = clean.toLowerCase();
  const parts: Array<string | JSX.Element> = [];
  let cursor = 0;
  let index = lowerText.indexOf(lowerQuery);

  while (index !== -1) {
    if (index > cursor) parts.push(text.slice(cursor, index));
    parts.push(
      <mark key={`${index}-${cursor}`} className="rounded bg-warning/25 px-0.5 text-text-primary">
        {text.slice(index, index + clean.length)}
      </mark>
    );
    cursor = index + clean.length;
    index = lowerText.indexOf(lowerQuery, cursor);
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export function EntryCard({ entry, showDate = false, onEdit, highlightQuery }: EntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const { removeEntry, cycleEntryStatus } = useEntries();
  const upcomingStatus = nextStatus(entry.status);

  const handleDelete = async () => {
    setIsBusy(true);
    try {
      await removeEntry(entry.id);
    } finally {
      setIsBusy(false);
    }
  };

  const handleStatus = async () => {
    setIsBusy(true);
    try {
      await cycleEntryStatus(entry);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "w-full rounded-lg border border-border-subtle border-l-4 bg-bg-surface p-4 shadow-sm",
        typeClasses[entry.type]
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={typeBadge[entry.type]}>{typeLabel(entry.type)}</Badge>
        <span className="flex items-center gap-1 rounded-full bg-bg-elevated px-2.5 py-1 text-xs font-semibold text-text-muted">
          <span className={cn("h-2 w-2 rounded-full", priorityDot[entry.priority])} />
          {priorityLabel(entry.priority)}
        </span>
        <Badge variant={statusBadge[entry.status]}>{statusLabel(entry.status)}</Badge>
      </div>

      <p className="mt-3 whitespace-pre-wrap break-words text-base font-semibold leading-6 text-text-primary">
        <HighlightedText text={entry.text} query={highlightQuery} />
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-muted">
        {showDate ? (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {prettyDate(entry.date)}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {entry.time}
        </span>
        {entry.duration ? <span>{entry.duration} min</span> : null}
        {entry.tag ? (
          <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-bg-elevated px-2 py-1 text-xs font-semibold text-text-muted">
            <Tag className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{entry.tag}</span>
          </span>
        ) : null}
        {entry.mood ? <span className="capitalize">{entry.mood}</span> : null}
      </div>

      {entry.notes ? (
        <button
          type="button"
          className="mt-3 flex w-full items-start gap-2 rounded-lg bg-bg-elevated px-3 py-2 text-left text-sm text-text-muted transition hover:text-text-primary"
          onClick={() => setExpanded((value) => !value)}
        >
          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue" />
          <span className={cn("min-w-0 break-words", !expanded && "line-clamp-1")}>
            <HighlightedText text={entry.notes} query={highlightQuery} />
          </span>
        </button>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onEdit(entry)} disabled={isBusy}>
          <Edit3 className="h-4 w-4" />
          Edit
        </Button>
        <ConfirmDialog
          title="Status update karein?"
          description={`Status ${statusLabel(entry.status)} se ${statusLabel(upcomingStatus)} ho jayega.`}
          confirmLabel="Update"
          onConfirm={handleStatus}
        >
          <Button type="button" variant="outline" size="sm" disabled={isBusy}>
            <RefreshCw className="h-4 w-4" />
            Status
          </Button>
        </ConfirmDialog>
        <ConfirmDialog
          title="Yeh entry delete karein?"
          description="Delete karne ke baad yeh work log wapas nahi aayega."
          confirmLabel="Delete"
          destructive
          onConfirm={handleDelete}
        >
          <Button type="button" variant="outline" size="sm" disabled={isBusy} className="text-danger hover:text-danger">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </ConfirmDialog>
      </div>
    </motion.article>
  );
}
