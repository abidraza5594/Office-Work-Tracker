import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
};

export function ToastHost() {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[80] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:bottom-5 md:right-5 md:items-end">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <motion.button
              key={toast.id}
              type="button"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-left text-sm font-semibold text-text-primary shadow-panel",
                toast.type === "error" && "border-danger/30"
              )}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              onClick={() => removeToast(toast.id)}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  toast.type === "success" && "text-success",
                  toast.type === "error" && "text-danger",
                  toast.type === "info" && "text-accent-blue"
                )}
              />
              <span>{toast.message}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
