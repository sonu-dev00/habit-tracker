"use client";

import { useQuery } from "@tanstack/react-query";

type DashboardData = {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalHabits: number;
    totalCompletions: number;
    monthlyRevenue: number;
    subscriptions: number;
  };
  recentUsers: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
  }[];
  userGrowth: { date: string; count: number }[];
};

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/admin/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  const json = await res.json();
  return json.data;
}

type AnalyticsData = {
  revenue: { month: string; amount: number }[];
  userAcquisition: { month: string; users: number }[];
  planDistribution: { plan: string; count: number }[];
  featureUsage: { feature: string; usage: number }[];
};

async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch("/api/admin/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics");
  const json = await res.json();
  return json.data;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboard,
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: fetchAnalytics,
  });
}
