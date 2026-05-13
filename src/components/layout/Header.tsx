import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fullDateLabel, getGreeting } from "@/lib/utils";
import type { FirebaseUser } from "@/types";

interface HeaderProps {
  user: FirebaseUser | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ user, onRefresh, isRefreshing = false }: HeaderProps) {
  const name = user?.isAnonymous ? "Guest" : user?.displayName?.split(" ")[0] || "there";

  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-muted">{fullDateLabel()}</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-text-primary sm:text-3xl">
          {getGreeting()}, {name}!
        </h1>
      </div>
      {onRefresh ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh entries"
        >
          <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        </Button>
      ) : null}
    </header>
  );
}
