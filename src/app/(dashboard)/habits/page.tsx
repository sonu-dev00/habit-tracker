"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Edit3,
  Trash2,
  ListFilter,
  ArrowUpDown,
  AlertTriangle,
  GripVertical,
  Search,
} from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select, type SelectOption } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { useXPStore } from "@/store";
import {
  CATEGORIES,
  PRIORITIES,
  FREQUENCIES,
} from "@/lib/constants";
import { cn, randomId } from "@/lib/utils";
import type {
  Habit,
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

const priorityXP: Record<HabitPriority, [number, number]> = {
  ESSENTIAL: [10, 15],
  IMPORTANT: [8, 12],
  NORMAL: [5, 8],
  BONUS: [3, 5],
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

function generateMockHabits(): HabitWithCompletions[] {
  const names = [
    "Morning Meditation",
    "Read 30 Minutes",
    "Exercise",
    "Drink 8 Glasses of Water",
    "Write in Journal",
    "Practice Piano",
    "Study Spanish",
    "Code for 1 Hour",
    "Stretch",
    "Plan Tomorrow",
  ];
  const categories: HabitCategory[] = [
    "MIND",
    "LEARNING",
    "FITNESS",
    "HEALTH",
    "CREATIVE",
    "CREATIVE",
    "LEARNING",
    "WORK",
    "FITNESS",
    "WORK",
  ];
  const priorities: HabitPriority[] = [
    "ESSENTIAL",
    "IMPORTANT",
    "ESSENTIAL",
    "NORMAL",
    "NORMAL",
    "BONUS",
    "IMPORTANT",
    "IMPORTANT",
    "NORMAL",
    "NORMAL",
  ];
  return names.map((name, i) => {
    const priority = priorities[i];
    const [min, max] = priorityXP[priority];
    const xpReward = Math.floor(Math.random() * (max - min + 1)) + min;
    const now = new Date();
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
    const streak = Math.floor(Math.random() * 14);
    return {
      id: randomId(),
      userId: "user-1",
      name,
      description: null,
      category: categories[i],
      priority,
      frequency: "DAILY" as HabitFrequency,
      xpReward,
      timeToComplete: Math.floor(Math.random() * 30) + 5,
      reminderTime: null,
      isPinned: i < 2,
      isArchived: false,
      createdAt,
      updatedAt: now,
      completions: [],
      userHabitData: {
        id: randomId(),
        userId: "user-1",
        streak,
        bestStreak: streak + Math.floor(Math.random() * 5),
        totalCompletions: streak * 3 + Math.floor(Math.random() * 10),
        xp: streak * xpReward,
        lastCompletionDate: streak > 0 ? now : null,
      },
    };
  });
}

const todayStr = new Date().toISOString().slice(0, 10);

function HabitItem({
  habit,
  onToggle,
  onEdit,
  onDelete,
}: {
  habit: HabitWithCompletions;
  onToggle: (id: string) => void;
  onEdit: (habit: HabitWithCompletions) => void;
  onDelete: (id: string) => void;
}) {
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
        completedToday && "border-emerald-500/20 bg-emerald-500/5"
      )}
    >
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
        <button
          onClick={() => onEdit(habit)}
          className="rounded-lg p-1.5 text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
        >
          <Edit3 className="h-4 w-4" />
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
          icon={Search}
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
  const [habits, setHabits] = useState<HabitWithCompletions[]>(
    generateMockHabits
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] =
    useState<HabitWithCompletions | null>(null);
  const addXp = useXPStore((s) => s.addXp);

  const deleteHabit = habits.find((h) => h.id === deleteId);

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
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== id) return h;
          const todayStr = new Date().toISOString().slice(0, 10);
          const alreadyCompleted = h.completions.some(
            (c) => c.date.toString().slice(0, 10) === todayStr
          );
          if (alreadyCompleted) return h;

          const xpAmount =
            Math.floor(Math.random() * 11) + 5 +
            (h.priority === "ESSENTIAL"
              ? 10
              : h.priority === "IMPORTANT"
                ? 5
                : 0);

          addXp(xpAmount);

          return {
            ...h,
            completions: [
              ...h.completions,
              {
                id: randomId(),
                habitId: h.id,
                userId: h.userId,
                date: new Date(),
                completedAt: new Date(),
                notes: null,
              },
            ],
            userHabitData: h.userHabitData
              ? {
                  ...h.userHabitData,
                  streak: (h.userHabitData.streak ?? 0) + 1,
                  totalCompletions: (h.userHabitData.totalCompletions ?? 0) + 1,
                  xp: (h.userHabitData.xp ?? 0) + xpAmount,
                }
              : undefined,
          };
        })
      );
    },
    [addXp]
  );

  const handleAdd = useCallback(
    (data: {
      name: string;
      category: HabitCategory;
      priority: HabitPriority;
      frequency: HabitFrequency;
    }) => {
      const [min, max] = priorityXP[data.priority];
      const xpReward = Math.floor((min + max) / 2);
      const newHabit: HabitWithCompletions = {
        id: randomId(),
        userId: "user-1",
        name: data.name,
        description: null,
        category: data.category,
        priority: data.priority,
        frequency: data.frequency,
        xpReward,
        timeToComplete: 15,
        reminderTime: null,
        isPinned: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        completions: [],
      };
      setHabits((prev) => [newHabit, ...prev]);
    },
    []
  );

  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    setHabits((prev) => prev.filter((h) => h.id !== deleteId));
    setDeleteId(null);
  }, [deleteId]);

  const activeCount = habits.filter((h) => !h.isArchived).length;

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
          <div className="space-y-2">
            {filteredAndSorted.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onToggle={handleToggle}
                onEdit={(h) => setEditingHabit(h)}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {addModalOpen && (
        <AddHabitModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleAdd}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteId}
        habitName={deleteHabit?.name ?? ""}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
