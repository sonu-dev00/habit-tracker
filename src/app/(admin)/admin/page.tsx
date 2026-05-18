"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CreditCard,
  DollarSign,
  UserPlus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  stats: {
    totalUsers: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    newUsersToday: number;
    userGrowth: number;
    revenueGrowth: number;
  };
  userGrowth: { date: string; count: number }[];
  recentUsers: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
    subscription?: { plan: string } | null;
  }[];
  revenueSummary: {
    total: number;
    mrr: number;
    arr: number;
    byPlan: { plan: string; amount: number }[];
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/admin/users?limit=5");
      const usersData = await res.json();

      const mockData: DashboardData = {
        stats: {
          totalUsers: usersData?.pagination?.total || 0,
          activeSubscriptions: Math.floor(Math.random() * 500),
          monthlyRevenue: Math.floor(Math.random() * 50000),
          newUsersToday: Math.floor(Math.random() * 20),
          userGrowth: Math.random() * 20 - 5,
          revenueGrowth: Math.random() * 15 - 3,
        },
        userGrowth: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count: Math.floor(Math.random() * 50 + 10),
        })),
        recentUsers: (usersData?.data || []).slice(0, 5),
        revenueSummary: {
          total: 1250000,
          mrr: 45000,
          arr: 540000,
          byPlan: [
            { plan: "FREE", amount: 0 },
            { plan: "PRO", amount: 35000 },
            { plan: "TEAMS", amount: 10000 },
          ],
        },
      };

      setData(mockData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      label: "Total Users",
      value: data.stats.totalUsers.toLocaleString(),
      icon: Users,
      change: `${data.stats.userGrowth >= 0 ? "+" : ""}${data.stats.userGrowth.toFixed(1)}%`,
      trend: data.stats.userGrowth >= 0 ? "up" : "down",
    },
    {
      label: "Active Subs",
      value: data.stats.activeSubscriptions.toLocaleString(),
      icon: CreditCard,
      change: `${Math.floor(Math.random() * 10 + 1)}%`,
      trend: "up",
    },
    {
      label: "Monthly Revenue",
      value: `$${data.stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: `${data.stats.revenueGrowth >= 0 ? "+" : ""}${data.stats.revenueGrowth.toFixed(1)}%`,
      trend: data.stats.revenueGrowth >= 0 ? "up" : "down",
    },
    {
      label: "New Users Today",
      value: data.stats.newUsersToday,
      icon: UserPlus,
      change: "today",
      trend: "neutral",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Overview of your HabitForge platform
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={stat.label} className="p-4" variant="interactive">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
                <Badge
                  variant={
                    stat.trend === "up"
                      ? "success"
                      : stat.trend === "down"
                      ? "error"
                      : "default"
                  }
                  size="sm"
                >
                  {stat.change}
                </Badge>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            User Growth (Last 30 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.userGrowth}>
                <defs>
                  <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(17,24,39,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#userGrowth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Revenue Summary
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Monthly Recurring</p>
              <p className="text-xl font-bold text-white">
                ${data.revenueSummary.mrr.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Annual Run Rate</p>
              <p className="text-xl font-bold text-white">
                ${data.revenueSummary.arr.toLocaleString()}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10">
              {data.revenueSummary.byPlan
                .filter((p) => p.amount > 0)
                .map((plan) => (
                  <div
                    key={plan.plan}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-gray-400">{plan.plan}</span>
                    <span className="text-sm font-medium text-white">
                      ${plan.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
          Recent Registrations
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2 text-gray-500 font-medium">
                  Name
                </th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">
                  Email
                </th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">
                  Plan
                </th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-2 text-gray-200">
                    {user.name || "N/A"}
                  </td>
                  <td className="py-3 px-2 text-gray-400">{user.email}</td>
                  <td className="py-3 px-2">
                    <Badge
                      variant={
                        user.subscription?.plan === "PRO"
                          ? "brand"
                          : user.subscription?.plan === "TEAMS"
                          ? "info"
                          : "default"
                      }
                      size="sm"
                    >
                      {user.subscription?.plan || "FREE"}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
