"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Edit3,
  Trash2,
  ListFilter,
  AlertTriangle,
  RotateCcw,
  Archive,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select, type SelectOption } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useXPStore } from "@/store";
import { useToast } from "@/components/ui/toast";
import { ShareButton } from "@/components/ui/share-button";
import {
  CATEGORIES,
  PRIORITIES,
  FREQUENCIES,
} from "@/lib/constants";
import { cn, randomId } from "@/lib/utils";
import { useHabits, useCreateHabit, useDeleteHabit, useToggleComplete, useArchiveHabits, useDeleteHabits } from "@/lib/hooks/use-habits";
import type {
  HabitCategory,
  HabitPriority,
  HabitFrequency,
  HabitWithCompletions,
} from "@/types";

type FilterKey = "ALL" | "TODAY" | "COMPLETED" | "ARCHIVED";
type SortKey = "NEWEST" | "STREAK" | "NAME" | "PRIORITY";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "TODAY", label: "Today" },
  { key: "COMPLETED", label: "Completed" },
  { key: "ARCHIVED", label: "Archived" },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: "NEWEST", label: "Newest" },
  { value: "STREAK", label: "Streak" },
  { value: "NAME", label: "Name" },
  { value: "PRIORITY", label: "Priority" },
];

const categoryColors: Record<HabitCategory, string> = {
  HEALTH: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  FITNESS: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  MIND: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  WORK: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  LEARNING: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  SOCIAL: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  FINANCE: "bg-green-500/15 text-green-400 border-green-500/20",
  CREATIVE: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  SPIRITUAL: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  OTHER: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

function getPriorityColor(priority: HabitPriority): string {
  const p = PRIORITIES.find((pr) => pr.value === priority);
  return p?.color ?? "text-gray-400";
}

function getCategoryLabel(category: HabitCategory): string {
  return CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

function getCategoryEmoji(category: HabitCategory): string {
  return CATEGORIES.find((c) => c.value === category)?.emoji ?? "📌";
}

function HabitItem({
  habit,
  selected,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
  onReset,
}: {
  habit: HabitWithCompletions;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (habit: HabitWithCompletions) => void;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = habit.completions.some(
    (c) => c.date.toString().slice(0, 10) === todayStr
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 transition-all duration-200",
        "hover:border-white/20 hover:bg-white/[0.07]",
        completedToday && "border-emerald-500/20 bg-emerald-500/5",
        selected && "border-blue-500/40 bg-blue-500/10"
      )}
    >
      {onSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(habit.id)}
          className="shrink-0 h-4 w-4 rounded border-gray-600 bg-white/10 text-blue-500 focus:ring-blue-500"
        />
      )}
      <button
        onClick={() => onToggle(habit.id)}
        className="shrink-0 focus:outline-none"
      >
        {completedToday ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        ) : (
          <Circle className="h-6 w-6 text-gray-500 group-hover:text-gray-300 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium truncate",
              completedToday
                ? "text-gray-400 line-through"
                : "text-gray-100"
            )}
          >
            {habit.name}
          </span>
          {habit.isPinned && (
            <Badge variant="brand" size="sm">
              Pinned
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium",
              categoryColors[habit.category]
            )}
          >
            {getCategoryEmoji(habit.category)} {getCategoryLabel(habit.category)}
          </span>
          {habit.userHabitData && (
            <span className="inline-flex items-center gap-1 text-xs text-orange-400">
              <Flame className="h-3 w-3" />
              {habit.userHabitData.streak}
            </span>
          )}
          <span
            className={cn(
              "text-xs font-medium",
              getPriorityColor(habit.priority)
            )}
          >
            {habit.priority}
          </span>
          <span className="text-xs text-gray-500">+{habit.xpReward} XP</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <ShareButton habitId={habit.id} />
        <button
          onClick={() => onEdit(habit)}
          className="rounded-lg p-1.5 text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onReset(habit.id)}
          className="rounded-lg p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="rounded-lg p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function AddHabitModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    category: HabitCategory;
    priority: HabitPriority;
    frequency: HabitFrequency;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<HabitCategory>("HEALTH");
  const [priority, setPriority] = useState<HabitPriority>("NORMAL");
  const [frequency, setFrequency] = useState<HabitFrequency>("DAILY");
  const [error, setError] = useState("");

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      setError("Please enter a habit name");
      return;
    }
    onSave({ name: name.trim(), category, priority, frequency });
    setName("");
    setCategory("HEALTH");
    setPriority("NORMAL");
    setFrequency("DAILY");
    setError("");
    onClose();
  }, [name, category, priority, frequency, onSave, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Habit"
      description="Create a new habit to track"
      size="lg"
    >
      <div className="space-y-5">
        <Input
          label="Habit Name"
          placeholder="e.g. Morning Meditation"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          error={error}
          icon={Plus}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Category
          </label>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-3 transition-all duration-200",
                  category === cat.value
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200"
                )}
              >
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-[10px] font-medium leading-tight text-center">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Priority
            </label>
            <div className="space-y-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all duration-200",
                    priority === p.value
                      ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                  )}
                >
                  <span className={cn("font-medium", p.color)}>{p.label}</span>
                  <span className="text-gray-500">x{p.xpMultiplier} XP</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Frequency
            </label>
            <div className="space-y-1.5">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className={cn(
                    "w-full flex items-center justify-center rounded-lg border px-3 py-2 text-xs transition-all duration-200",
                    frequency === f.value
                      ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Create Habit
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ConfirmResetModal({
  open,
  habitName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  habitName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset Habit"
      description="This will clear all progress and start fresh."
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
          <RotateCcw className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm text-amber-300">
              Reset &ldquo;{habitName}&rdquo;?
            </p>
            <p className="text-xs text-amber-400/70 mt-1">
              Streak, completions, and XP for this habit will be cleared. The
              habit itself will be kept.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Reset Progress
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ConfirmDeleteModal({
  open,
  habitName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  habitName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Habit"
      description="This action cannot be undone."
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            Are you sure you want to delete &ldquo;{habitName}&rdquo;? All
            progress and history will be lost.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function HabitsPage() {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [sort, setSort] = useState<SortKey>("NEWEST");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] =
    useState<HabitWithCompletions | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const addXp = useXPStore((s) => s.addXp);
  const { toast } = useToast();

  const { data: habitsData, isLoading } = useHabits();
  const createHabit = useCreateHabit();
  const deleteHabitMut = useDeleteHabit();
  const toggleComplete = useToggleComplete();
  const archiveHabitsMut = useArchiveHabits();
  const deleteHabitsMut = useDeleteHabits();

  const habits = useMemo(() => {
    if (!habitsData) return [];
    return habitsData.map((h) => ({
      id: h.id,
      userId: "",
      name: h.name,
      description: h.description,
      category: h.category as HabitCategory,
      priority: h.priority as HabitPriority,
      frequency: h.frequency as HabitFrequency,
      xpReward: h.xpReward,
      timeToComplete: h.timeToComplete ?? 0,
      reminderTime: h.reminderTime,
      isPinned: h.isPinned,
      isArchived: h.isArchived,
      createdAt: new Date(h.createdAt),
      updatedAt: new Date(h.createdAt),
      completions: h.completions.map((c) => ({
        id: "",
        habitId: h.id,
        userId: "",
        date: new Date(c.date),
        completedAt: new Date(c.completedAt),
        notes: c.notes ?? null,
      })),
      userHabitData: {
        id: "",
        userId: "",
        streak: h.streak,
        bestStreak: h.bestStreak,
        totalCompletions: h.totalCompletions,
        xp: 0,
        lastCompletionDate: null,
      },
    }));
  }, [habitsData]);

  const deleteHabit = habits.find((h) => h.id === deleteId);
  const resetHabit = habits.find((h) => h.id === resetId);

  const filteredAndSorted = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    let filtered = [...habits];

    switch (filter) {
      case "TODAY":
        filtered = filtered.filter(
          (h) =>
            !h.isArchived &&
            !h.completions.some(
              (c) => c.date.toString().slice(0, 10) === todayStr
            )
        );
        break;
      case "COMPLETED":
        filtered = filtered.filter((h) =>
          h.completions.some(
            (c) => c.date.toString().slice(0, 10) === todayStr
          )
        );
        break;
      case "ARCHIVED":
        filtered = filtered.filter((h) => h.isArchived);
        break;
      default:
        filtered = filtered.filter((h) => !h.isArchived);
        break;
    }

    switch (sort) {
      case "STREAK":
        filtered.sort(
          (a, b) =>
            (b.userHabitData?.streak ?? 0) - (a.userHabitData?.streak ?? 0)
        );
        break;
      case "NAME":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "PRIORITY": {
        const order: Record<HabitPriority, number> = {
          ESSENTIAL: 0,
          IMPORTANT: 1,
          NORMAL: 2,
          BONUS: 3,
        };
        filtered.sort(
          (a, b) => (order[a.priority] ?? 99) - (order[b.priority] ?? 99)
        );
        break;
      }
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return filtered;
  }, [habits, filter, sort]);

  const handleToggle = useCallback(
    (id: string) => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;

      const todayStr = new Date().toISOString().slice(0, 10);
      const alreadyCompleted = habit.completions.some(
        (c) => c.date.toString().slice(0, 10) === todayStr
      );

      if (alreadyCompleted) {
        toggleComplete.mutate({ habitId: id, completed: true });
      } else {
        const xpAmount = habit.xpReward + (habit.priority === "ESSENTIAL" ? 10 : habit.priority === "IMPORTANT" ? 5 : 0);
        toggleComplete.mutate({ habitId: id, completed: false });
        addXp(xpAmount);
      }
    },
    [habits, addXp, toggleComplete]
  );

  const handleAdd = useCallback(
    (data: {
      name: string;
      category: HabitCategory;
      priority: HabitPriority;
      frequency: HabitFrequency;
    }) => {
      createHabit.mutate(data);
    },
    [createHabit]
  );

  const handleReset = useCallback(() => {
    if (!resetId) return;
    setResetId(null);
  }, [resetId]);

  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    const deletedHabit = habits.find((h) => h.id === deleteId);
    deleteHabitMut.mutate(deleteId, {
      onSuccess: () => {
        toast({
          title: "Habit deleted",
          description: `"${deletedHabit?.name ?? "Unknown"}" has been removed`,
          type: "success",
          duration: 8000,
          action: {
            label: "Undo",
            onClick: () => createHabit.mutate({ name: deletedHabit?.name ?? "" }),
          },
        });
      },
    });
    setDeleteId(null);
  }, [deleteId, deleteHabitMut, habits, toast, createHabit]);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredAndSorted.map((h) => h.id)));
  }, [filteredAndSorted]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBatchArchive = useCallback(() => {
    const ids = Array.from(selectedIds);
    archiveHabitsMut.mutate(ids, {
      onSuccess: () => {
        toast({ title: `${ids.length} habits archived`, type: "success" });
        clearSelection();
      },
    });
  }, [selectedIds, archiveHabitsMut, toast]);

  const handleBatchDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    deleteHabitsMut.mutate(ids, {
      onSuccess: () => {
        toast({ title: `${ids.length} habits deleted`, type: "success" });
        clearSelection();
      },
    });
  }, [selectedIds, deleteHabitsMut, toast]);

  const activeCount = habits.filter((h) => !h.isArchived).length;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setAddModalOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Habits</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {activeCount} active habit{activeCount !== 1 && "s"}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setAddModalOpen(true)}>
          New Habit
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                filter === f.key
                  ? "bg-white/10 text-gray-100 shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="w-36">
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredAndSorted.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={ListFilter}
                title="No habits found"
                description={
                  filter === "ARCHIVED"
                    ? "No archived habits yet."
                    : "Create your first habit to start tracking!"
                }
              />
            </motion.div>
          ) : (
            <>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm">
                  <span className="text-gray-300">{selectedIds.size} selected</span>
                  <button onClick={selectAll} className="text-xs text-blue-400 hover:text-blue-300 ml-2">
                    Select all
                  </button>
                  <button onClick={clearSelection} className="text-xs text-gray-400 hover:text-gray-300">
                    Clear
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={handleBatchArchive}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
                  >
                    <Archive className="h-3 w-3" /> Archive
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
              <div className="space-y-2">
                {filteredAndSorted.map((habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    selected={selectedIds.has(habit.id)}
                    onSelect={toggleSelected}
                    onToggle={handleToggle}
                    onEdit={(h) => setEditingHabit(h)}
                    onDelete={(id) => setDeleteId(id)}
                    onReset={(id) => setResetId(id)}
                  />
                ))}
              </div>
            </>
          )}
        </AnimatePresence>
      )}

      {addModalOpen && (
        <AddHabitModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleAdd}
        />
      )}

      <ConfirmResetModal
        open={!!resetId}
        habitName={resetHabit?.name ?? ""}
        onClose={() => setResetId(null)}
        onConfirm={handleReset}
      />

      <ConfirmDeleteModal
        open={!!deleteId}
        habitName={deleteHabit?.name ?? ""}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
