import type { Timestamp } from "firebase/firestore";
import type { User as FirebaseAuthUser } from "firebase/auth";

export type FirebaseUser = FirebaseAuthUser;

export type EntryType = "task" | "meeting" | "time_log";
export type EntryStatus = "done" | "in_progress" | "pending";
export type EntryPriority = "high" | "medium" | "low";
export type EntryMood = "great" | "okay" | "tough";

export interface Entry {
  id: string;
  text: string;
  type: EntryType;
  status: EntryStatus;
  priority: EntryPriority;
  date: string;
  time: string;
  duration?: number;
  tag?: string;
  notes?: string;
  mood?: EntryMood;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type EntryCreateInput = Omit<Entry, "id" | "createdAt" | "updatedAt">;
export type EntryUpdateInput = Partial<EntryCreateInput>;

export interface StreakInfo {
  current: number;
  longest: number;
  lastActiveDate: string;
  milestone: string | null;
}

export interface StatCardData {
  label: string;
  value: string;
  detail: string;
  icon: string;
}

export interface WeekDayStat {
  date: string;
  label: string;
  count: number;
}

export interface TypeStat {
  name: string;
  value: number;
  color: string;
}

export interface TagTimeStat {
  tag: string;
  minutes: number;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
