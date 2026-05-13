import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Entry, EntryCreateInput, EntryUpdateInput } from "@/types";

function requireDb() {
  if (!db) {
    throw new Error("Firebase is not configured. Fill .env.local with your Firebase Web app config.");
  }
  return db;
}

function entriesCollection(userId: string) {
  return collection(requireDb(), "users", userId, "entries");
}

function entryDocument(userId: string, entryId: string) {
  return doc(requireDb(), "users", userId, "entries", entryId);
}

function mapEntry(snapshot: QueryDocumentSnapshot<DocumentData>): Entry {
  const data = snapshot.data() as Omit<Entry, "id">;
  return {
    id: snapshot.id,
    ...data
  };
}

function messageFromError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return `${fallback}: ${error.message}`;
  return fallback;
}

function withoutUndefined<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

function createdAtMillis(entry: Entry) {
  return entry.createdAt?.toMillis?.() ?? 0;
}

function sortByCreatedDesc(entries: Entry[]) {
  return [...entries].sort((a, b) => createdAtMillis(b) - createdAtMillis(a));
}

function sortByDateCreatedDesc(entries: Entry[]) {
  return [...entries].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return createdAtMillis(b) - createdAtMillis(a);
  });
}

export async function fetchEntriesByDate(userId: string, date: string): Promise<Entry[]> {
  try {
    const q = query(entriesCollection(userId), where("date", "==", date));
    const snapshot = await getDocs(q);
    return sortByCreatedDesc(snapshot.docs.map(mapEntry));
  } catch (error) {
    throw new Error(messageFromError(error, `Failed to fetch entries for ${date}`));
  }
}

export async function fetchEntriesByRange(
  userId: string,
  from: string,
  to: string
): Promise<Entry[]> {
  try {
    const q = query(
      entriesCollection(userId),
      where("date", ">=", from),
      where("date", "<=", to),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return sortByDateCreatedDesc(snapshot.docs.map(mapEntry));
  } catch (error) {
    throw new Error(messageFromError(error, `Failed to fetch entries from ${from} to ${to}`));
  }
}

export async function fetchAllEntries(userId: string): Promise<Entry[]> {
  try {
    const q = query(entriesCollection(userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapEntry);
  } catch (error) {
    throw new Error(messageFromError(error, "Failed to fetch all entries"));
  }
}

export async function addEntry(userId: string, data: EntryCreateInput): Promise<string> {
  try {
    const now = Timestamp.now();
    const reference = await addDoc(entriesCollection(userId), {
      ...withoutUndefined(data),
      createdAt: now,
      updatedAt: now
    });
    return reference.id;
  } catch (error) {
    throw new Error(messageFromError(error, "Failed to add entry"));
  }
}

export async function updateEntry(
  userId: string,
  entryId: string,
  data: EntryUpdateInput
): Promise<void> {
  try {
    await updateDoc(entryDocument(userId, entryId), {
      ...withoutUndefined(data),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw new Error(messageFromError(error, `Failed to update entry ${entryId}`));
  }
}

export async function deleteEntry(userId: string, entryId: string): Promise<void> {
  try {
    await deleteDoc(entryDocument(userId, entryId));
  } catch (error) {
    throw new Error(messageFromError(error, `Failed to delete entry ${entryId}`));
  }
}

export async function getUserTags(userId: string): Promise<string[]> {
  try {
    const entries = await fetchAllEntries(userId);
    const tags = entries
      .map((entry) => entry.tag?.trim())
      .filter((tag): tag is string => Boolean(tag));
    return Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    throw new Error(messageFromError(error, "Failed to fetch user tags"));
  }
}
