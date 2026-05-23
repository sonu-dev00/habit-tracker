"use client";

import {
  Users,
  CreditCard,
  DollarSign,
  UserPlus,
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
import { useAdminDashboard } from "@/lib/hooks/use-admin";

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
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

  if (error || !data) return null;

  const statCards = [
    {
      label: "Total Users",
      value: data.stats.totalUsers.toLocaleString(),
      icon: Users,
      change: `${data.stats.activeUsers}`,
      trend: "neutral" as const,
    },
    {
      label: "Active Subs",
      value: data.stats.subscriptions.toLocaleString(),
      icon: CreditCard,
      change: `${((data.stats.subscriptions / data.stats.totalUsers) * 100).toFixed(1)}%`,
      trend: "up" as const,
    },
    {
      label: "Monthly Revenue",
      value: `$${data.stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: `${data.stats.subscriptions} subs`,
      trend: "neutral" as const,
    },
    {
      label: "Total Habits",
      value: data.stats.totalHabits.toLocaleString(),
      icon: UserPlus,
      change: `${data.stats.totalCompletions.toLocaleString()} completions`,
      trend: "neutral" as const,
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
                  variant={stat.trend === "up" ? "success" : "default"}
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
          <div className="h-64 min-w-0">
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
                ${data.stats.monthlyRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Annual Run Rate</p>
              <p className="text-xl font-bold text-white">
                ${(data.stats.monthlyRevenue * 12).toLocaleString()}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-400">Pro</span>
                <span className="text-sm font-medium text-white">
                  ${(data.stats.subscriptions * 9).toLocaleString()}
                </span>
              </div>
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
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Email</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-2 text-gray-200">{user.name || "N/A"}</td>
                  <td className="py-3 px-2 text-gray-400">{user.email}</td>
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
