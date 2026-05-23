"use client";

import { useQuery } from "@tanstack/react-query";

export type AnalyticsData = {
  summary: {
    totalHabits: number;
    activeHabits: number;
    totalCompletions: number;
    streak: number;
    bestStreak: number;
    xp: number;
    averagePerDay: number;
    completionRate: number;
    productivityScore: number;
  };
  weeklyStats: {
    completions: number;
    habitsCompleted: number;
    streak: number;
  };
  monthlyStats: {
    completions: number;
    habitsCompleted: number;
    streak: number;
  };
  categoryBreakdown: {
    category: string;
    count: number;
    completions: number;
  }[];
  weeklyCompletions: { date: string; count: number }[];
  monthlyCompletions: { date: string; count: number }[];
  heatmap: { date: string; count: number }[];
};

async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch("/api/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics");
  const json = await res.json();
  return json.data;
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: fetchAnalytics,
    staleTime: 60 * 1000,
    retry: 1,
    select: (data) => ({
      bestStreak: data.summary.bestStreak,
      productivityScore: data.summary.productivityScore,
      totalCompletions: data.summary.totalCompletions,
      streak: data.summary.streak,
      xp: data.summary.xp,
      totalHabits: data.summary.totalHabits,
      weeklyCompletions: data.weeklyCompletions,
      heatmap: data.heatmap,
    }),
  });
}
