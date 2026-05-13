import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Link2, LogOut, Moon, Pencil, ShieldAlert, Sun, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { deleteEntry, fetchAllEntries, fetchEntriesByDate } from "@/lib/firestore";
import { applyTheme, downloadFile, getStoredTheme, initials, todayKey } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import type { Entry, EntryPriority, EntryStatus, EntryType } from "@/types";

function serialize(entries: Entry[]) {
  return JSON.stringify(
    entries.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt?.toDate?.().toISOString?.() ?? null,
      updatedAt: entry.updatedAt?.toDate?.().toISOString?.() ?? null
    })),
    null,
    2
  );
}

export function SettingsPage() {
  const {
    user,
    updateDisplayName,
    signOutUser,
    linkGoogleAccount
  } = useAuth();
  const allEntries = useAppStore((state) => state.allEntries);
  const setAllEntries = useAppStore((state) => state.setAllEntries);
  const setTodayEntries = useAppStore((state) => state.setTodayEntries);
  const setHistoryEntries = useAppStore((state) => state.setHistoryEntries);
  const removeEntryFromStore = useAppStore((state) => state.removeEntryFromStore);
  const addToast = useAppStore((state) => state.addToast);
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "Guest");
  const [theme, setTheme] = useState<"dark" | "light">(() => (getStoredTheme() === "light" ? "light" : "dark"));
  const [defaultType, setDefaultType] = useState<EntryType>(() => (localStorage.getItem("office-work-tracker-default-type") as EntryType | null) ?? "task");
  const [defaultStatus, setDefaultStatus] = useState<EntryStatus>(() => (localStorage.getItem("office-work-tracker-default-status") as EntryStatus | null) ?? "done");
  const [defaultPriority, setDefaultPriority] = useState<EntryPriority>(() => (localStorage.getItem("office-work-tracker-default-priority") as EntryPriority | null) ?? "medium");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? (user?.isAnonymous ? "Guest" : ""));
  }, [user?.displayName, user?.isAnonymous]);

  const savePreference = <T extends string>(key: string, value: T, setter: (value: T) => void) => {
    setter(value);
    localStorage.setItem(key, value);
    addToast({ type: "success", message: "✅ Preferences saved" });
  };

  const setThemeMode = (mode: "dark" | "light") => {
    setTheme(mode);
    applyTheme(mode);
  };

  const saveName = async () => {
    const clean = displayName.trim();
    if (!clean) return;
    await updateDisplayName(clean);
    setEditingName(false);
  };

  const clearToday = async () => {
    if (!user?.uid) return;
    setIsBusy(true);
    try {
      const entries = await fetchEntriesByDate(user.uid, todayKey());
      for (const entry of entries) {
        await deleteEntry(user.uid, entry.id);
        removeEntryFromStore(entry.id);
      }
      addToast({ type: "success", message: "🗑 Today's entries cleared" });
    } finally {
      setIsBusy(false);
    }
  };

  const clearAll = async () => {
    if (!user?.uid || deleteText !== "DELETE") return;
    setIsBusy(true);
    try {
      const entries = await fetchAllEntries(user.uid);
      for (const entry of entries) {
        await deleteEntry(user.uid, entry.id);
      }
      setAllEntries([]);
      setTodayEntries([]);
      setHistoryEntries([]);
      setDeleteText("");
      setDeleteDialogOpen(false);
      addToast({ type: "success", message: "🗑 All data cleared" });
    } finally {
      setIsBusy(false);
    }
  };

  const downloadBackup = async () => {
    if (!user?.uid) return;
    const entries = allEntries.length ? allEntries : await fetchAllEntries(user.uid);
    downloadFile("office-work-tracker-backup.json", serialize(entries), "application/json;charset=utf-8");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Profile, preferences, theme, and data controls.</p>
      </div>

      <section className="rounded-lg border border-border-subtle bg-bg-surface p-4">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent-blue/15 font-heading text-xl font-bold text-accent-blue">
              {initials(user?.displayName, user?.email)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex gap-2">
                <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
                <Button type="button" onClick={saveName}>
                  Save
                </Button>
              </div>
            ) : (
              <>
                <p className="font-heading text-xl font-bold text-text-primary">{user?.displayName || "Guest"}</p>
                <p className="truncate text-sm text-text-muted">{user?.email || "Anonymous guest"}</p>
              </>
            )}
          </div>
          <Button type="button" variant="outline" size="icon" onClick={() => setEditingName((value) => !value)} aria-label="Edit name">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        {user?.isAnonymous ? (
          <p className="mt-4 rounded-lg bg-warning/15 p-3 text-sm font-semibold text-warning">
            Guest mode active. Link Google to keep this account accessible across devices.
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-border-subtle bg-bg-surface p-4">
        <h2 className="font-heading text-lg font-bold text-text-primary">Preferences</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Select value={defaultType} onValueChange={(value) => savePreference("office-work-tracker-default-type", value as EntryType, setDefaultType)}>
            <SelectTrigger>
              <SelectValue placeholder="Default type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="time_log">Time Log</SelectItem>
            </SelectContent>
          </Select>
          <Select value={defaultStatus} onValueChange={(value) => savePreference("office-work-tracker-default-status", value as EntryStatus, setDefaultStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Default status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={defaultPriority} onValueChange={(value) => savePreference("office-work-tracker-default-priority", value as EntryPriority, setDefaultPriority)}>
            <SelectTrigger>
              <SelectValue placeholder="Default priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="rounded-lg border border-border-subtle bg-bg-surface p-4">
        <h2 className="font-heading text-lg font-bold text-text-primary">Theme</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button type="button" variant={theme === "dark" ? "default" : "outline"} onClick={() => setThemeMode("dark")}>
            <Moon className="h-4 w-4" />
            Dark
          </Button>
          <Button type="button" variant={theme === "light" ? "default" : "outline"} onClick={() => setThemeMode("light")}>
            <Sun className="h-4 w-4" />
            Light
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border-subtle bg-bg-surface p-4">
        <h2 className="font-heading text-lg font-bold text-text-primary">Data Management</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <ConfirmDialog
            title="Aaj ki saari entries delete ho jaengi. Confirm karein?"
            description="Only today's work logs will be removed from Firestore."
            confirmLabel="Clear Today"
            destructive
            onConfirm={clearToday}
          >
            <Button type="button" variant="outline" disabled={isBusy}>
              <Trash2 className="h-4 w-4" />
              Clear Today
            </Button>
          </ConfirmDialog>
          <ConfirmDialog
            title="Clear all work data?"
            description="This starts a second confirmation step before deleting every entry."
            confirmLabel="Continue"
            destructive
            onConfirm={() => setDeleteDialogOpen(true)}
          >
            <Button type="button" variant="destructive" disabled={isBusy}>
              <ShieldAlert className="h-4 w-4" />
              Clear All Data
            </Button>
          </ConfirmDialog>
          <Button type="button" variant="outline" onClick={downloadBackup} disabled={isBusy}>
            <Download className="h-4 w-4" />
            Download Backup
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border-subtle bg-bg-surface p-4">
        <h2 className="font-heading text-lg font-bold text-text-primary">Account</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {user?.isAnonymous ? (
            <Button type="button" onClick={linkGoogleAccount}>
              <Link2 className="h-4 w-4" />
              Link Google Account
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={signOutUser}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        <div className="mt-4 rounded-lg bg-bg-elevated p-3 text-xs font-semibold text-text-muted">
          <p>App version: 1.0.0</p>
          <p>Firebase project: office-work-tracker-1f186</p>
        </div>
      </section>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader className="pr-8">
            <DialogTitle>Type DELETE to confirm</DialogTitle>
            <DialogDescription>Every entry under your account will be deleted one by one.</DialogDescription>
          </DialogHeader>
          <Input value={deleteText} onChange={(event) => setDeleteText(event.target.value)} placeholder="DELETE" />
          <Button type="button" variant="destructive" disabled={deleteText !== "DELETE" || isBusy} onClick={clearAll}>
            Delete Everything
          </Button>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
