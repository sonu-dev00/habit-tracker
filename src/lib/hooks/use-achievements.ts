"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

async function fetchAchievements(): Promise<Achievement[]> {
  const res = await fetch("/api/achievements");
  if (!res.ok) throw new Error("Failed to fetch achievements");
  const json = await res.json();
  return json.data;
}

async function checkNewAchievements() {
  const res = await fetch("/api/achievements", { method: "POST" });
  if (!res.ok) throw new Error("Failed to check achievements");
  return res.json();
}

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
  });
}

export function useCheckAchievements() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkNewAchievements,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["achievements"] });
      qc.invalidateQueries({ queryKey: ["xp"] });
    },
  });
}
