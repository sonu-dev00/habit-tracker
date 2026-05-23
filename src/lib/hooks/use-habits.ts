"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Habit = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  priority: string;
  frequency: string;
  xpReward: number;
  timeToComplete: number | null;
  reminderTime: string | null;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  streak: number;
  bestStreak: number;
  totalCompletions: number;
  completions: { date: string; completedAt: string; notes?: string | null }[];
};

async function fetchHabits(): Promise<Habit[]> {
  const res = await fetch("/api/habits?limit=100");
  if (!res.ok) throw new Error("Failed to fetch habits");
  const json = await res.json();
  return json.data;
}

async function createHabit(data: { name: string; description?: string; category?: string; priority?: string; frequency?: string }) {
  const res = await fetch("/api/habits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create habit");
  return res.json();
}

async function updateHabit(habitId: string, data: Partial<Habit>) {
  const res = await fetch(`/api/habits/${habitId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update habit");
  return res.json();
}

async function deleteHabit(habitId: string) {
  const res = await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete habit");
  return res.json();
}

async function batchArchiveHabits(habitIds: string[]) {
  const res = await fetch("/api/habits/batch", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "archive", habitIds }),
  });
  if (!res.ok) throw new Error("Failed to archive habits");
  return res.json();
}

async function batchDeleteHabits(habitIds: string[]) {
  const res = await fetch("/api/habits/batch", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ habitIds }),
  });
  if (!res.ok) throw new Error("Failed to delete habits");
  return res.json();
}

async function completeHabit(habitId: string) {
  const res = await fetch(`/api/habits/${habitId}/complete`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to complete habit");
  return res.json();
}

async function uncompleteHabit(habitId: string) {
  const res = await fetch(`/api/habits/${habitId}/complete`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to uncomplete habit");
  return res.json();
}

export function useHabits() {
  return useQuery({
    queryKey: ["habits"],
    queryFn: fetchHabits,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ habitId, data }: { habitId: string; data: Partial<Habit> }) => updateHabit(habitId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useArchiveHabits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: batchArchiveHabits,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useDeleteHabits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: batchDeleteHabits,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useToggleComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: string; completed: boolean }) => {
      if (completed) {
        return uncompleteHabit(habitId);
      }
      return completeHabit(habitId);
    },
    onMutate: async ({ habitId, completed }) => {
      await qc.cancelQueries({ queryKey: ["habits"] });
      const previous = qc.getQueryData<Habit[]>(["habits"]);
      qc.setQueryData<Habit[]>(["habits"], (old) =>
        old?.map((h) =>
          h.id === habitId
            ? completed
              ? {
                  ...h,
                  totalCompletions: Math.max(0, h.totalCompletions - 1),
                  streak: Math.max(0, h.streak - 1),
                  completions: h.completions.filter(
                    (c) => c.date.slice(0, 10) !== new Date().toISOString().slice(0, 10)
                  ),
                }
              : {
                  ...h,
                  totalCompletions: h.totalCompletions + 1,
                  streak: h.streak + 1,
                  completions: [
                    { date: new Date().toISOString().slice(0, 10), completedAt: new Date().toISOString() },
                    ...h.completions,
                  ],
                }
            : h
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(["habits"], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}
