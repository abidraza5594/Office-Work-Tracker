import { NavLink } from "react-router-dom";
import { BarChart3, BriefcaseBusiness, CalendarDays, History, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/today", label: "Today", icon: CalendarDays },
  { to: "/history", label: "History", icon: History },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/search", label: "Search", icon: Search },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border-subtle bg-bg-surface px-4 py-5 md:flex md:flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-blue text-white shadow-glow">
          <BriefcaseBusiness className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-lg font-bold text-text-primary">Office Work</p>
          <p className="text-xs font-semibold text-text-muted">Tracker</p>
        </div>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-text-muted transition hover:bg-bg-elevated hover:text-text-primary",
                  isActive && "bg-accent-blue/15 text-accent-blue"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto rounded-lg border border-border-subtle bg-bg-elevated p-3 text-xs text-text-muted">
        Manual sync keeps your worklog calm and predictable.
      </div>
    </aside>
  );
}
