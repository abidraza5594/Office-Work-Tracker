import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface EntryFiltersProps {
  options: FilterOption[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export function EntryFilters({ options, active, onChange, className }: EntryFiltersProps) {
  return (
    <div className={cn("no-scrollbar touch-scroll -mx-4 flex gap-2 overflow-x-auto px-4 py-1", className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={active === option.value ? "default" : "outline"}
          size="sm"
          className="shrink-0 rounded-full"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
