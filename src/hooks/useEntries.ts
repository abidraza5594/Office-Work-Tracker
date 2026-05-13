import { Timestamp } from "firebase/firestore";
import {
  addEntry,
  deleteEntry,
  fetchAllEntries,
  fetchEntriesByDate,
  fetchEntriesByRange,
  getUserTags,
  updateEntry
} from "@/lib/firestore";
import { nextStatus, todayKey } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { Entry, EntryCreateInput, EntryUpdateInput } from "@/types";

export function useEntries() {
  const user = useAppStore((state) => state.user);
  const setTodayEntries = useAppStore((state) => state.setTodayEntries);
  const setHistoryEntries = useAppStore((state) => state.setHistoryEntries);
  const setAllEntries = useAppStore((state) => state.setAllEntries);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const setUserTags = useAppStore((state) => state.setUserTags);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const addEntryToStore = useAppStore((state) => state.addEntryToStore);
  const updateEntryInStore = useAppStore((state) => state.updateEntryInStore);
  const removeEntryFromStore = useAppStore((state) => state.removeEntryFromStore);
  const addToast = useAppStore((state) => state.addToast);

  const ensureUserId = () => {
    if (!user?.uid) throw new Error("Please sign in first");
    return user.uid;
  };

  const run = async <T,>(operation: () => Promise<T>, failureMessage: string) => {
    setLoading(true);
    setError(null);
    try {
      return await operation();
    } catch (error) {
      const message = error instanceof Error ? error.message : failureMessage;
      setError(message);
      addToast({ type: "error", message: `❌ ${failureMessage}` });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadToday = async (date = todayKey()) => {
    const userId = ensureUserId();
    setSelectedDate(date);
    return run(async () => {
      const entries = await fetchEntriesByDate(userId, date);
      setTodayEntries(entries);
      return entries;
    }, "Data load nahi hua. Retry karein");
  };

  const loadHistory = async (from: string, to: string) => {
    const userId = ensureUserId();
    return run(async () => {
      const entries = await fetchEntriesByRange(userId, from, to);
      setHistoryEntries(entries);
      return entries;
    }, "History load nahi hui");
  };

  const loadAll = async () => {
    const userId = ensureUserId();
    return run(async () => {
      const entries = await fetchAllEntries(userId);
      setAllEntries(entries);
      return entries;
    }, "Entries load nahi hui");
  };

  const loadTags = async () => {
    const userId = ensureUserId();
    try {
      const tags = await getUserTags(userId);
      setUserTags(tags);
      return tags;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tags load nahi hue";
      setError(message);
      return [];
    }
  };

  const createEntry = async (data: EntryCreateInput) => {
    const userId = ensureUserId();
    return run(async () => {
      const now = Timestamp.now();
      const id = await addEntry(userId, data);
      const entry: Entry = {
        id,
        ...data,
        createdAt: now,
        updatedAt: now
      };
      addEntryToStore(entry);
      if (entry.tag) {
        const tags = await getUserTags(userId);
        setUserTags(tags);
      }
      addToast({ type: "success", message: "✅ Entry saved successfully" });
      return id;
    }, "Failed to save — please retry");
  };

  const editEntry = async (entryId: string, data: EntryUpdateInput) => {
    const userId = ensureUserId();
    return run(async () => {
      const updatedAt = Timestamp.now();
      await updateEntry(userId, entryId, data);
      updateEntryInStore(entryId, { ...data, updatedAt });
      if (data.tag) {
        const tags = await getUserTags(userId);
        setUserTags(tags);
      }
      addToast({ type: "success", message: "✅ Entry updated" });
    }, "Failed to update entry");
  };

  const removeEntry = async (entryId: string) => {
    const userId = ensureUserId();
    return run(async () => {
      await deleteEntry(userId, entryId);
      removeEntryFromStore(entryId);
      addToast({ type: "success", message: "🗑 Entry deleted" });
    }, "Failed to delete entry");
  };

  const cycleEntryStatus = async (entry: Entry) => {
    await editEntry(entry.id, { status: nextStatus(entry.status) });
  };

  const importEntries = async (entries: EntryCreateInput[]) => {
    const userId = ensureUserId();
    return run(async () => {
      const existing = await fetchAllEntries(userId);
      const existingKeys = new Set(existing.map((entry) => `${entry.date}|${entry.text.trim().toLowerCase()}`));
      const pending = entries.filter((entry) => !existingKeys.has(`${entry.date}|${entry.text.trim().toLowerCase()}`));

      if (pending.length === 0) {
        setAllEntries(existing);
        addToast({ type: "info", message: "Notebook tasks already imported" });
        return 0;
      }

      for (const entry of pending) {
        await addEntry(userId, entry);
      }

      const refreshedAll = await fetchAllEntries(userId);
      const refreshedToday = await fetchEntriesByDate(userId, selectedDate || todayKey());
      const tags = await getUserTags(userId);
      setAllEntries(refreshedAll);
      setTodayEntries(refreshedToday);
      setUserTags(tags);
      addToast({ type: "success", message: `${pending.length} notebook tasks imported` });
      return pending.length;
    }, "Failed to import notebook tasks");
  };

  return {
    loadToday,
    loadHistory,
    loadAll,
    loadTags,
    createEntry,
    editEntry,
    removeEntry,
    cycleEntryStatus,
    importEntries
  };
}
