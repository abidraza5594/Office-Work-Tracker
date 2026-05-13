import { clsx, type ClassValue } from "clsx";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";
import type { Entry, EntryPriority, EntryStatus, EntryType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayKey() {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function formatTimeInput(date = new Date()) {
  return format(date, "HH:mm");
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function prettyDate(dateKey: string) {
  const parsed = parseISO(dateKey);
  if (isToday(parsed)) return "Today";
  if (isYesterday(parsed)) return "Yesterday";
  return format(parsed, "EEE d MMM");
}

export function fullDateLabel(date = new Date()) {
  return format(date, "EEEE, d MMMM");
}

export function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function typeLabel(type: EntryType) {
  const labels: Record<EntryType, string> = {
    task: "Task",
    meeting: "Meeting",
    time_log: "Time Log"
  };
  return labels[type];
}

export function statusLabel(status: EntryStatus) {
  const labels: Record<EntryStatus, string> = {
    done: "Done",
    in_progress: "In Progress",
    pending: "Pending"
  };
  return labels[status];
}

export function priorityLabel(priority: EntryPriority) {
  const labels: Record<EntryPriority, string> = {
    high: "High",
    medium: "Medium",
    low: "Low"
  };
  return labels[priority];
}

export function nextStatus(status: EntryStatus): EntryStatus {
  if (status === "done") return "in_progress";
  if (status === "in_progress") return "pending";
  return "done";
}

export function sortEntriesNewest(entries: Entry[]) {
  return [...entries].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });
}

export function entryMatchesSearch(entry: Entry, query: string) {
  const clean = normalizeText(query);
  if (!clean) return true;
  return [entry.text, entry.notes ?? "", entry.tag ?? ""].some((field) =>
    normalizeText(field).includes(clean)
  );
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function entriesToCsv(entries: Entry[]) {
  const headers = [
    "id",
    "date",
    "time",
    "type",
    "status",
    "priority",
    "duration",
    "tag",
    "mood",
    "text",
    "notes",
    "createdAt",
    "updatedAt"
  ];
  const escape = (value: unknown) => {
    const text = value === undefined || value === null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  const rows = entries.map((entry) =>
    [
      entry.id,
      entry.date,
      entry.time,
      entry.type,
      entry.status,
      entry.priority,
      entry.duration ?? "",
      entry.tag ?? "",
      entry.mood ?? "",
      entry.text,
      entry.notes ?? "",
      entry.createdAt?.toDate?.().toISOString?.() ?? "",
      entry.updatedAt?.toDate?.().toISOString?.() ?? ""
    ]
      .map(escape)
      .join(",")
  );
  return `\uFEFF${headers.join(",")}\n${rows.join("\n")}`;
}

export function initials(name?: string | null, email?: string | null) {
  const source = name || email || "Guest";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function getStoredTheme() {
  return localStorage.getItem("office-work-tracker-theme") ?? "dark";
}

export function applyTheme(theme: "dark" | "light") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("office-work-tracker-theme", theme);
}
