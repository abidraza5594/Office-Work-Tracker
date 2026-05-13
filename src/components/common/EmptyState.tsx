import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-border-subtle bg-bg-surface px-5 py-10 text-center">
      <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-bg-elevated">
        <ClipboardList className="h-11 w-11 text-accent-blue" />
        <span className="absolute right-2 top-3 h-4 w-4 rounded-full bg-success" />
        <span className="absolute bottom-4 left-4 h-3 w-10 rounded-full bg-warning/70" />
      </div>
      <h2 className="font-heading text-xl font-bold text-text-primary">{title}</h2>
      {description ? <p className="mt-2 max-w-sm text-sm text-text-muted">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
