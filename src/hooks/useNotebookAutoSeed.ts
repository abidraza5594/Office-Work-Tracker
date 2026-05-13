import { useEffect, useRef } from "react";
import { useEntries } from "@/hooks/useEntries";
import { notebookEntries } from "@/lib/notebookSeed";
import { useAppStore } from "@/store/useAppStore";

const targetUserId = "XF1OC6xYOEYO6FSnmUc7AfuDRlr2";
const storageKey = `office-work-tracker-notebook-seeded-${targetUserId}`;

export function useNotebookAutoSeed() {
  const user = useAppStore((state) => state.user);
  const hasRun = useRef(false);
  const { importEntries } = useEntries();

  useEffect(() => {
    if (hasRun.current || user?.uid !== targetUserId || localStorage.getItem(storageKey) === "true") {
      return;
    }

    hasRun.current = true;
    void importEntries(notebookEntries)
      .then(() => {
        localStorage.setItem(storageKey, "true");
      })
      .catch(() => {
        hasRun.current = false;
      });
  }, [importEntries, user?.uid]);
}
