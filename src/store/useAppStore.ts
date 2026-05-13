import { create } from "zustand";
import { sortEntriesNewest } from "@/lib/utils";
import type { Entry, FirebaseUser, ToastMessage } from "@/types";

interface AppState {
  user: FirebaseUser | null;
  todayEntries: Entry[];
  allEntries: Entry[];
  historyEntries: Entry[];
  isLoading: boolean;
  error: string | null;
  selectedDate: string;
  userTags: string[];
  toasts: ToastMessage[];
  setUser: (user: FirebaseUser | null) => void;
  setTodayEntries: (entries: Entry[]) => void;
  setAllEntries: (entries: Entry[]) => void;
  setHistoryEntries: (entries: Entry[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedDate: (selectedDate: string) => void;
  setUserTags: (userTags: string[]) => void;
  addEntryToStore: (entry: Entry) => void;
  updateEntryInStore: (entryId: string, data: Partial<Entry>) => void;
  removeEntryFromStore: (entryId: string) => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

function updateList(entries: Entry[], entryId: string, data: Partial<Entry>) {
  return sortEntriesNewest(entries.map((entry) => (entry.id === entryId ? { ...entry, ...data } : entry)));
}

function removeFromList(entries: Entry[], entryId: string) {
  return entries.filter((entry) => entry.id !== entryId);
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  todayEntries: [],
  allEntries: [],
  historyEntries: [],
  isLoading: false,
  error: null,
  selectedDate: "",
  userTags: [],
  toasts: [],
  setUser: (user) => set({ user }),
  setTodayEntries: (todayEntries) => set({ todayEntries }),
  setAllEntries: (allEntries) => set({ allEntries }),
  setHistoryEntries: (historyEntries) => set({ historyEntries }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setUserTags: (userTags) => set({ userTags }),
  addEntryToStore: (entry) =>
    set((state) => {
      const appendUnique = (entries: Entry[]) =>
        entries.some((item) => item.id === entry.id) ? entries : sortEntriesNewest([entry, ...entries]);
      return {
        todayEntries: entry.date === state.selectedDate ? appendUnique(state.todayEntries) : state.todayEntries,
        allEntries: appendUnique(state.allEntries),
        historyEntries: appendUnique(state.historyEntries)
      };
    }),
  updateEntryInStore: (entryId, data) =>
    set((state) => ({
      todayEntries: updateList(state.todayEntries, entryId, data),
      allEntries: updateList(state.allEntries, entryId, data),
      historyEntries: updateList(state.historyEntries, entryId, data)
    })),
  removeEntryFromStore: (entryId) =>
    set((state) => ({
      todayEntries: removeFromList(state.todayEntries, entryId),
      allEntries: removeFromList(state.allEntries, entryId),
      historyEntries: removeFromList(state.historyEntries, entryId)
    })),
  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    window.setTimeout(() => {
      useAppStore.getState().removeToast(id);
    }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
