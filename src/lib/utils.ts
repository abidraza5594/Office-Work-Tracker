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

function escapeHtml(value: unknown) {
  const text = value === undefined || value === null ? "" : String(value);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function entryCreatedAt(entry: Entry) {
  return entry.createdAt?.toMillis?.() ?? 0;
}

export function filterEntriesByDateRange(entries: Entry[], from?: string, to?: string) {
  return entries.filter((entry) => {
    if (from && entry.date < from) return false;
    if (to && entry.date > to) return false;
    return true;
  });
}

export function entriesToExcel(entries: Entry[], rangeLabel: string) {
  const sorted = [...entries].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    const timeCompare = a.time.localeCompare(b.time);
    if (timeCompare !== 0) return timeCompare;
    return entryCreatedAt(a) - entryCreatedAt(b);
  });
  const totalMinutes = sorted.reduce((sum, entry) => sum + (entry.duration ?? 0), 0);
  const doneCount = sorted.filter((entry) => entry.status === "done").length;
  const progressCount = sorted.filter((entry) => entry.status === "in_progress").length;
  const pendingCount = sorted.filter((entry) => entry.status === "pending").length;

  let currentYear = "";
  let currentMonth = "";
  let currentDay = "";

  const bodyRows = sorted.flatMap((entry, index) => {
    const date = parseISO(entry.date);
    const year = format(date, "yyyy");
    const month = format(date, "MMMM yyyy");
    const day = format(date, "EEEE, d MMMM yyyy");
    const rows: string[] = [];

    if (year !== currentYear) {
      currentYear = year;
      currentMonth = "";
      currentDay = "";
      rows.push(`<tr class="year-row"><td colspan="13">Year: ${escapeHtml(year)}</td></tr>`);
    }

    if (month !== currentMonth) {
      currentMonth = month;
      currentDay = "";
      rows.push(`<tr class="month-row"><td colspan="13">Month: ${escapeHtml(month)}</td></tr>`);
    }

    if (day !== currentDay) {
      currentDay = day;
      rows.push(`<tr class="day-row"><td colspan="13">Day: ${escapeHtml(day)}</td></tr>`);
    }

    rows.push(`
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(year)}</td>
        <td>${escapeHtml(format(date, "MMMM"))}</td>
        <td>${escapeHtml(format(date, "EEEE"))}</td>
        <td class="date">${escapeHtml(entry.date)}</td>
        <td>${escapeHtml(entry.time)}</td>
        <td>${escapeHtml(typeLabel(entry.type))}</td>
        <td>${escapeHtml(statusLabel(entry.status))}</td>
        <td>${escapeHtml(priorityLabel(entry.priority))}</td>
        <td class="number">${entry.duration ?? ""}</td>
        <td>${escapeHtml(entry.tag ?? "")}</td>
        <td>${escapeHtml(entry.text)}</td>
        <td>${escapeHtml(entry.notes ?? "")}</td>
      </tr>
    `);

    return rows;
  });

  return `\uFEFF<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Calibri, Arial, sans-serif; color: #111827; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
    th { background: #1f2937; color: #ffffff; font-weight: 700; }
    .title td { background: #111827; color: #ffffff; font-size: 20px; font-weight: 700; }
    .summary-label { background: #e2e8f0; font-weight: 700; width: 180px; }
    .summary-value { background: #f8fafc; }
    .year-row td { background: #2563eb; color: #ffffff; font-size: 16px; font-weight: 700; }
    .month-row td { background: #dbeafe; color: #1e3a8a; font-weight: 700; }
    .day-row td { background: #fef3c7; color: #78350f; font-weight: 700; }
    .date { mso-number-format: "yyyy-mm-dd"; }
    .number { text-align: right; }
  </style>
</head>
<body>
  <table>
    <tr class="title"><td colspan="13">Office Work Tracker Export</td></tr>
    <tr><td class="summary-label">Export Range</td><td class="summary-value" colspan="12">${escapeHtml(rangeLabel)}</td></tr>
    <tr><td class="summary-label">Generated At</td><td class="summary-value" colspan="12">${escapeHtml(format(new Date(), "yyyy-MM-dd HH:mm"))}</td></tr>
    <tr><td class="summary-label">Total Entries</td><td class="summary-value" colspan="12">${sorted.length}</td></tr>
    <tr><td class="summary-label">Done</td><td class="summary-value" colspan="12">${doneCount}</td></tr>
    <tr><td class="summary-label">In Progress</td><td class="summary-value" colspan="12">${progressCount}</td></tr>
    <tr><td class="summary-label">Pending</td><td class="summary-value" colspan="12">${pendingCount}</td></tr>
    <tr><td class="summary-label">Total Minutes</td><td class="summary-value" colspan="12">${totalMinutes}</td></tr>
    <tr></tr>
    <tr>
      <th>#</th>
      <th>Year</th>
      <th>Month</th>
      <th>Day</th>
      <th>Date</th>
      <th>Time</th>
      <th>Type</th>
      <th>Status</th>
      <th>Priority</th>
      <th>Duration Min</th>
      <th>Tag</th>
      <th>Work</th>
      <th>Notes</th>
    </tr>
    ${bodyRows.join("")}
  </table>
</body>
</html>`;
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
