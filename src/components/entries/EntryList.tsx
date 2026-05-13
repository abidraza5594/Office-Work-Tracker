import { AnimatePresence, motion } from "framer-motion";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCards } from "@/components/common/LoadingSpinner";
import { EntryCard } from "@/components/entries/EntryCard";
import type { Entry } from "@/types";

interface EntryListProps {
  entries: Entry[];
  loading?: boolean;
  showDate?: boolean;
  onEdit: (entry: Entry) => void;
  onAdd?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function EntryList({
  entries,
  loading = false,
  showDate = false,
  onEdit,
  onAdd,
  emptyTitle = "Aaj ka pehla kaam add karo!",
  emptyDescription = "Tasks, meetings, ya time logs ko ek jagah likhna shuru karein."
}: EntryListProps) {
  if (loading) return <SkeletonCards />;

  if (entries.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} actionLabel={onAdd ? "Add Entry" : undefined} onAction={onAdd} />;
  }

  return (
    <motion.div initial="hidden" animate="show" className="space-y-3">
      <AnimatePresence mode="popLayout">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { delay: index * 0.05 } }
            }}
          >
            <EntryCard entry={entry} showDate={showDate} onEdit={onEdit} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
