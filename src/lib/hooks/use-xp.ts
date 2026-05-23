"use client";

import { useQuery } from "@tanstack/react-query";

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
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch XP data");
      const json = await res.json();
      const s = json.data.summary;
      const xp = s.xp || 0;
      const level = xp >= 10000 ? 10 : xp >= 7500 ? 9 : xp >= 5000 ? 8 : xp >= 3500 ? 7 : xp >= 2000 ? 6 : xp >= 1000 ? 5 : xp >= 500 ? 4 : xp >= 250 ? 3 : xp >= 100 ? 2 : 1;
      return {
        xp,
        level,
        totalXp: xp,
        streak: s.streak,
        bestStreak: s.bestStreak,
        totalCompletions: s.totalCompletions,
      };
    },
    staleTime: 60 * 1000,
  });
}
