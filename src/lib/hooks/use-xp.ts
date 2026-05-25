"use client";

import { useQuery } from "@tanstack/react-query";
import { calculateLevel, getXpProgress } from "@/lib/rpg";

type XPData = {
  xp: number;
  level: number;
  totalXp: number;
  streak: number;
  bestStreak: number;
  totalCompletions: number;
};

export function useXP() {
  return useQuery({
    queryKey: ["xp"],
    queryFn: async (): Promise<XPData> => {
      const [profileRes, habitsRes] = await Promise.all([
        fetch("/api/rpg/profile"),
        fetch("/api/habits?limit=1"),
      ]);
      if (!profileRes.ok) throw new Error("Failed to fetch XP data");
      const profileJson = await profileRes.json();
      const profile = profileJson.data.profile;

      let userHabitData = { streak: 0, bestStreak: 0, totalCompletions: 0 };
      try {
        if (habitsRes.ok) {
          const habitsJson = await habitsRes.json();
          if (habitsJson.data?.[0]?.streak !== undefined) {
            userHabitData = {
              streak: habitsJson.data[0].streak,
              bestStreak: habitsJson.data.reduce((max: number, h: { bestStreak?: number }) => Math.max(max, h.bestStreak || 0), 0),
              totalCompletions: habitsJson.data.reduce((sum: number, h: { totalCompletions?: number }) => sum + (h.totalCompletions || 0), 0),
            };
          }
        }
      } catch {}

      const totalXp = profile.totalXp || 0;
      const level = calculateLevel(totalXp);
      const xpProgress = getXpProgress(totalXp);
      return {
        xp: totalXp - xpProgress.currentLevelXp,
        level,
        totalXp,
        streak: userHabitData.streak,
        bestStreak: userHabitData.bestStreak,
        totalCompletions: userHabitData.totalCompletions,
      };
    },
    staleTime: 30 * 1000,
  });
}
