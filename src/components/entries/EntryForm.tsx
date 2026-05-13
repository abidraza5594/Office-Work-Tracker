import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, ListChecks, Save, Send, StickyNote } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useEntries } from "@/hooks/useEntries";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn, formatTimeInput, todayKey } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { Entry, EntryCreateInput, EntryPriority, EntryStatus, EntryType } from "@/types";

const draftKey = "office-work-tracker-entry-draft";

const schema = z.object({
  type: z.enum(["task", "meeting", "time_log"]),
  text: z.string().min(2, "Kam se kam 2 characters likhein").max(500, "500 characters tak rakhein"),
  date: z.string().min(1, "Date required hai"),
  time: z.string().min(1, "Time required hai"),
  duration: z.preprocess(
    (value) => {
      if (value === "" || value === undefined || value === null) return undefined;
      const numberValue = Number(value);
      return Number.isNaN(numberValue) ? value : numberValue;
    },
    z.number().positive("Duration positive minutes mein honi chahiye").max(1440, "Duration 1440 minutes se kam rakhein").optional()
  ),
  status: z.enum(["done", "in_progress", "pending"]),
  priority: z.enum(["high", "medium", "low"]),
  tag: z.string().max(80, "Tag 80 characters se kam rakhein").optional(),
  mood: z.enum(["great", "okay", "tough"]).optional(),
  notes: z.string().max(1200, "Notes 1200 characters se kam rakhein").optional()
});

type FormValues = z.infer<typeof schema>;

interface EntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: Entry | null;
  onSaved?: () => void;
}

const typeOptions: Array<{ value: EntryType; label: string; icon: string }> = [
  { value: "task", label: "Task", icon: "✅" },
  { value: "meeting", label: "Meeting", icon: "📅" },
  { value: "time_log", label: "Time Log", icon: "⏱" }
];

const statusOptions: Array<{ value: EntryStatus; label: string; icon: string }> = [
  { value: "done", label: "Done", icon: "✅" },
  { value: "in_progress", label: "In Progress", icon: "🔄" },
  { value: "pending", label: "Pending", icon: "⏳" }
];

const priorityOptions: Array<{ value: EntryPriority; label: string; icon: string }> = [
  { value: "high", label: "High", icon: "🔴" },
  { value: "medium", label: "Medium", icon: "🟡" },
  { value: "low", label: "Low", icon: "🟢" }
];

const moodOptions: Array<{ value: "great" | "okay" | "tough"; label: string; icon: string }> = [
  { value: "great", label: "Great", icon: "😊" },
  { value: "okay", label: "Okay", icon: "😐" },
  { value: "tough", label: "Tough", icon: "😓" }
];

function preference<T extends string>(key: string, fallback: T): T {
  return (localStorage.getItem(key) as T | null) ?? fallback;
}

function defaultValues(): FormValues {
  return {
    type: preference<EntryType>("office-work-tracker-default-type", "task"),
    text: "",
    date: todayKey(),
    time: formatTimeInput(),
    duration: undefined,
    status: preference<EntryStatus>("office-work-tracker-default-status", "done"),
    priority: preference<EntryPriority>("office-work-tracker-default-priority", "medium"),
    tag: "",
    mood: undefined,
    notes: ""
  };
}

function valuesFromEntry(entry: Entry): FormValues {
  return {
    type: entry.type,
    text: entry.text,
    date: entry.date,
    time: entry.time,
    duration: entry.duration,
    status: entry.status,
    priority: entry.priority,
    tag: entry.tag ?? "",
    mood: entry.mood,
    notes: entry.notes ?? ""
  };
}

function cleanValues(values: FormValues): EntryCreateInput {
  return {
    type: values.type,
    text: values.text.trim(),
    date: values.date,
    time: values.time,
    duration: values.duration,
    status: values.status,
    priority: values.priority,
    tag: values.tag?.trim() || undefined,
    mood: values.mood,
    notes: values.notes?.trim() || undefined
  };
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-medium text-danger">{message}</p>;
}

export function EntryForm({ open, onOpenChange, entry, onSaved }: EntryFormProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [showNotes, setShowNotes] = useState(Boolean(entry?.notes));
  const { createEntry, editEntry, loadTags } = useEntries();
  const userTags = useAppStore((state) => state.userTags);
  const isLoading = useAppStore((state) => state.isLoading);
  const editing = Boolean(entry);

  const restoredDefaults = useMemo(() => {
    if (entry) return valuesFromEntry(entry);
    const savedDraft = localStorage.getItem(draftKey);
    if (!savedDraft) return defaultValues();
    try {
      return {
        ...defaultValues(),
        ...JSON.parse(savedDraft),
        date: todayKey(),
        time: formatTimeInput()
      } as FormValues;
    } catch {
      return defaultValues();
    }
  }, [entry, open]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: restoredDefaults
  });

  const currentType = watch("type");
  const currentStatus = watch("status");
  const currentPriority = watch("priority");
  const currentMood = watch("mood");
  const textLength = watch("text")?.length ?? 0;

  useEffect(() => {
    if (!open) return;
    reset(restoredDefaults);
    setShowNotes(Boolean(restoredDefaults.notes));
    void loadTags();
  }, [open, reset, restoredDefaults]);

  useEffect(() => {
    if (!open || editing) return;
    const subscription = watch((value) => {
      localStorage.setItem(draftKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, open, editing]);

  const submit = async (values: FormValues, addAnother: boolean) => {
    const cleaned = cleanValues(values);
    if (entry) {
      await editEntry(entry.id, cleaned);
      onSaved?.();
      onOpenChange(false);
      return;
    }

    await createEntry(cleaned);
    localStorage.removeItem(draftKey);
    onSaved?.();

    if (addAnother) {
      reset({ ...defaultValues(), date: todayKey(), time: formatTimeInput(), type: values.type });
      setShowNotes(false);
    } else {
      onOpenChange(false);
    }
  };

  const form = (
    <form className="space-y-5" onSubmit={handleSubmit((values) => submit(values, false))}>
      <div>
        <label className="mb-2 block text-sm font-semibold text-text-muted">Type</label>
        <div className="grid grid-cols-3 gap-2">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "min-h-16 rounded-lg border border-border-subtle bg-bg-elevated px-2 py-3 text-sm font-bold text-text-muted transition",
                currentType === option.value && "border-accent-blue bg-accent-blue/15 text-accent-blue"
              )}
              onClick={() => setValue("type", option.value, { shouldValidate: true, shouldDirty: true })}
            >
              <span className="block text-xl">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
        <FormError message={errors.type?.message} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-text-muted">Work details</label>
        <div className="relative">
          <Textarea
            {...register("text")}
            rows={5}
            maxLength={500}
            placeholder={"Kya kiya aaj? Apni bhasha mein likhein...\ne.g. Client report banaya, meeting attend ki"}
            className="pb-8"
          />
          <span className="absolute bottom-2 right-3 text-xs font-semibold text-text-hint">{textLength}/500</span>
        </div>
        <FormError message={errors.text?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-sm font-semibold text-text-muted">Date</label>
          <Input type="date" {...register("date")} />
          <FormError message={errors.date?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-text-muted">Time</label>
          <Input type="time" {...register("time")} />
          <FormError message={errors.time?.message} />
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-muted">
          <Clock className="h-4 w-4" />
          Duration
        </label>
        <Input type="number" min="1" max="1440" inputMode="numeric" placeholder="e.g. 30" {...register("duration")} />
        <FormError message={errors.duration?.message} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-text-muted">Status</label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "shrink-0 rounded-full border border-border-subtle bg-bg-elevated px-3 py-2 text-sm font-bold text-text-muted transition",
                currentStatus === option.value && "border-success bg-success/15 text-success"
              )}
              onClick={() => setValue("status", option.value, { shouldValidate: true, shouldDirty: true })}
            >
              {option.icon} {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-text-muted">Priority</label>
        <div className="grid grid-cols-3 gap-2">
          {priorityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "rounded-full border border-border-subtle bg-bg-elevated px-2 py-2 text-sm font-bold text-text-muted transition",
                currentPriority === option.value && "border-warning bg-warning/15 text-warning"
              )}
              onClick={() => setValue("priority", option.value, { shouldValidate: true, shouldDirty: true })}
            >
              {option.icon} {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-muted">
          <ListChecks className="h-4 w-4" />
          Project tag
        </label>
        <Input list="entry-tags" placeholder="Project, client, ya label" {...register("tag")} />
        <datalist id="entry-tags">
          {userTags.map((tag) => (
            <option value={tag} key={tag} />
          ))}
        </datalist>
        <FormError message={errors.tag?.message} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-text-muted">Mood</label>
        <div className="grid grid-cols-3 gap-2">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "rounded-lg border border-border-subtle bg-bg-elevated px-2 py-3 text-sm font-bold text-text-muted transition",
                currentMood === option.value && "border-accent-purple bg-accent-purple/15 text-accent-purple"
              )}
              onClick={() =>
                setValue("mood", currentMood === option.value ? undefined : option.value, {
                  shouldValidate: true,
                  shouldDirty: true
                })
              }
            >
              <span className="block text-xl">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Button type="button" variant="ghost" className="w-full justify-between" onClick={() => setShowNotes((value) => !value)}>
          <span className="inline-flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Add Notes
          </span>
          <span>{showNotes ? "▴" : "▾"}</span>
        </Button>
        {showNotes ? (
          <div className="mt-2">
            <Textarea rows={4} placeholder="Extra details, blockers, links, ya handoff notes" {...register("notes")} />
            <FormError message={errors.notes?.message} />
          </div>
        ) : null}
      </div>

      <div className="space-y-2 pt-1">
        <Button type="submit" className="w-full" disabled={isLoading}>
          <Save className="h-4 w-4" />
          {editing ? "Update Entry" : "Save Entry"}
        </Button>
        {!editing ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isLoading}
            onClick={handleSubmit((values) => submit(values, true))}
          >
            <Send className="h-4 w-4" />
            Save & Add Another
          </Button>
        ) : null}
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader className="mb-4 pr-8">
            <SheetTitle>{editing ? "Edit Entry" : "New Work Entry"}</SheetTitle>
            <SheetDescription>Quickly log task, meeting, ya time spent.</SheetDescription>
          </SheetHeader>
          {form}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="pr-8">
          <DialogTitle>{editing ? "Edit Entry" : "New Work Entry"}</DialogTitle>
          <DialogDescription>Quickly log task, meeting, ya time spent.</DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}
