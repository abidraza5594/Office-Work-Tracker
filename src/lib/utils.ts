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
  downloadBlob(filename, blob);
}

export function downloadBlob(filename: string, blob: Blob) {
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

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeUint32(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function dosTimestamp(date = new Date()) {
  const time =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const day =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();
  return { time, day };
}

function createZip(files: Array<{ name: string; content: string }>) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  const { time, day } = dosTimestamp();
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = encoder.encode(file.content);
    const checksum = crc32(contentBytes);

    const localHeader: number[] = [];
    writeUint32(localHeader, 0x04034b50);
    writeUint16(localHeader, 20);
    writeUint16(localHeader, 0x0800);
    writeUint16(localHeader, 0);
    writeUint16(localHeader, time);
    writeUint16(localHeader, day);
    writeUint32(localHeader, checksum);
    writeUint32(localHeader, contentBytes.length);
    writeUint32(localHeader, contentBytes.length);
    writeUint16(localHeader, nameBytes.length);
    writeUint16(localHeader, 0);

    localParts.push(new Uint8Array(localHeader), nameBytes, contentBytes);

    const centralHeader: number[] = [];
    writeUint32(centralHeader, 0x02014b50);
    writeUint16(centralHeader, 20);
    writeUint16(centralHeader, 20);
    writeUint16(centralHeader, 0x0800);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, time);
    writeUint16(centralHeader, day);
    writeUint32(centralHeader, checksum);
    writeUint32(centralHeader, contentBytes.length);
    writeUint32(centralHeader, contentBytes.length);
    writeUint16(centralHeader, nameBytes.length);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint32(centralHeader, 0);
    writeUint32(centralHeader, offset);

    centralParts.push(new Uint8Array(centralHeader), nameBytes);
    offset += localHeader.length + nameBytes.length + contentBytes.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end: number[] = [];
  writeUint32(end, 0x06054b50);
  writeUint16(end, 0);
  writeUint16(end, 0);
  writeUint16(end, files.length);
  writeUint16(end, files.length);
  writeUint32(end, centralSize);
  writeUint32(end, offset);
  writeUint16(end, 0);

  const allParts = [...localParts, ...centralParts, new Uint8Array(end)];
  const totalLength = allParts.reduce((sum, part) => sum + part.length, 0);
  const zip = new Uint8Array(totalLength);
  let cursor = 0;
  for (const part of allParts) {
    zip.set(part, cursor);
    cursor += part.length;
  }
  return zip;
}

function columnName(index: number) {
  let name = "";
  let value = index;
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function xlsxCell(rowIndex: number, columnIndex: number, value: unknown, style = 0) {
  const reference = `${columnName(columnIndex)}${rowIndex}`;
  const text = escapeHtml(value);
  const styleAttr = style ? ` s="${style}"` : "";
  if (typeof value === "number") {
    return `<c r="${reference}"${styleAttr}><v>${value}</v></c>`;
  }
  return `<c r="${reference}" t="inlineStr"${styleAttr}><is><t>${text}</t></is></c>`;
}

function xlsxRow(rowIndex: number, values: unknown[], style = 0) {
  return `<row r="${rowIndex}">${values
    .map((value, index) => xlsxCell(rowIndex, index + 1, value, style))
    .join("")}</row>`;
}

function xlsxMergedRow(rowIndex: number, text: string, style: number) {
  return {
    row: `<row r="${rowIndex}">${xlsxCell(rowIndex, 1, text, style)}</row>`,
    merge: `<mergeCell ref="A${rowIndex}:M${rowIndex}"/>`
  };
}

export function entriesToXlsxBlob(entries: Entry[], rangeLabel: string) {
  const sorted = [...entries].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  const rows: string[] = [];
  const merges: string[] = [];
  const totalMinutes = sorted.reduce((sum, entry) => sum + (entry.duration ?? 0), 0);
  const headers = [
    "#",
    "Year",
    "Month",
    "Day",
    "Date",
    "Time",
    "Type",
    "Status",
    "Priority",
    "Duration Min",
    "Tag",
    "Work",
    "Notes"
  ];
  let rowIndex = 1;
  const title = xlsxMergedRow(rowIndex, "Office Work Tracker Export", 1);
  rows.push(title.row);
  merges.push(title.merge);
  rowIndex += 1;

  [
    ["Export Range", rangeLabel],
    ["Generated At", format(new Date(), "yyyy-MM-dd HH:mm")],
    ["Total Entries", sorted.length],
    ["Done", sorted.filter((entry) => entry.status === "done").length],
    ["In Progress", sorted.filter((entry) => entry.status === "in_progress").length],
    ["Pending", sorted.filter((entry) => entry.status === "pending").length],
    ["Total Minutes", totalMinutes]
  ].forEach(([label, value]) => {
    rows.push(xlsxRow(rowIndex, [label, value], 2));
    rowIndex += 1;
  });

  rowIndex += 1;
  rows.push(xlsxRow(rowIndex, headers, 3));
  rowIndex += 1;

  let currentYear = "";
  let currentMonth = "";
  let currentDay = "";

  sorted.forEach((entry, index) => {
    const date = parseISO(entry.date);
    const year = format(date, "yyyy");
    const month = format(date, "MMMM yyyy");
    const day = format(date, "EEEE, d MMMM yyyy");

    if (year !== currentYear) {
      currentYear = year;
      currentMonth = "";
      currentDay = "";
      const group = xlsxMergedRow(rowIndex, `Year: ${year}`, 4);
      rows.push(group.row);
      merges.push(group.merge);
      rowIndex += 1;
    }

    if (month !== currentMonth) {
      currentMonth = month;
      currentDay = "";
      const group = xlsxMergedRow(rowIndex, `Month: ${month}`, 5);
      rows.push(group.row);
      merges.push(group.merge);
      rowIndex += 1;
    }

    if (day !== currentDay) {
      currentDay = day;
      const group = xlsxMergedRow(rowIndex, `Day: ${day}`, 6);
      rows.push(group.row);
      merges.push(group.merge);
      rowIndex += 1;
    }

    rows.push(
      xlsxRow(rowIndex, [
        index + 1,
        year,
        format(date, "MMMM"),
        format(date, "EEEE"),
        entry.date,
        entry.time,
        typeLabel(entry.type),
        statusLabel(entry.status),
        priorityLabel(entry.priority),
        entry.duration ?? "",
        entry.tag ?? "",
        entry.text,
        entry.notes ?? ""
      ])
    );
    rowIndex += 1;
  });

  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <cols>
    <col min="1" max="1" width="6" customWidth="1"/>
    <col min="2" max="4" width="16" customWidth="1"/>
    <col min="5" max="10" width="14" customWidth="1"/>
    <col min="11" max="11" width="22" customWidth="1"/>
    <col min="12" max="12" width="60" customWidth="1"/>
    <col min="13" max="13" width="48" customWidth="1"/>
  </cols>
  <sheetData>${rows.join("")}</sheetData>
  <mergeCells count="${merges.length}">${merges.join("")}</mergeCells>
</worksheet>`;

  const files = [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Worklog" sheetId="1" r:id="rId1"/></sheets>
</workbook>`
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
    },
    {
      name: "xl/styles.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
  </fonts>
  <fills count="7">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF111827"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE2E8F0"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1F2937"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF2563EB"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="7">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="3" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`
    },
    {
      name: "xl/worksheets/sheet1.xml",
      content: worksheet
    }
  ];

  return new Blob([createZip(files)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
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
