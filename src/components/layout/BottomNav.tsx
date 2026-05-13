import { NavLink } from "react-router-dom";
import { BarChart3, CalendarDays, History, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/today", label: "Today", icon: CalendarDays },
  { to: "/history", label: "History", icon: History },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/search", label: "Search", icon: Search },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-panel backdrop-blur md:hidden">
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold text-text-muted transition",
                  isActive && "bg-bg-elevated text-accent-blue"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
