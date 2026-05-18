"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  PieChart,
} from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

interface AnalyticsData {
  revenueMonthly: { month: string; revenue: number }[];
  userAcquisition: { month: string; users: number }[];
  planDistribution: { name: string; value: number }[];
  churnRate: number;
  featureUsage: { name: string; usage: number }[];
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  avgRevenuePerUser: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockData: AnalyticsData = {
      revenueMonthly: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2025, i, 1).toLocaleString("en-US", { month: "short" }),
        revenue: Math.floor(Math.random() * 30000 + 10000),
      })),
      userAcquisition: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2025, i, 1).toLocaleString("en-US", { month: "short" }),
        users: Math.floor(Math.random() * 500 + 100),
      })),
      planDistribution: [
        { name: "Free", value: 65 },
        { name: "Pro", value: 25 },
        { name: "Teams", value: 10 },
      ],
      churnRate: 3.2,
      featureUsage: [
        { name: "Habit Tracking", usage: 95 },
        { name: "Streaks", usage: 82 },
        { name: "AI Coach", usage: 45 },
        { name: "Analytics", usage: 38 },
        { name: "Pomodoro", usage: 28 },
        { name: "Challenges", usage: 22 },
      ],
      totalUsers: 12500,
      activeUsers: 8200,
      totalRevenue: 540000,
      avgRevenuePerUser: 43.2,
    };
    setData(mockData);
    setLoading(false);
  }, []);

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
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  const summaryCards = [
    { label: "Total Users", value: data.totalUsers.toLocaleString(), icon: Users, color: "text-blue-400" },
    { label: "Active Users", value: data.activeUsers.toLocaleString(), icon: Activity, color: "text-emerald-400" },
    { label: "Total Revenue", value: `$${data.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-yellow-400" },
    { label: "Churn Rate", value: `${data.churnRate}%`, icon: BarChart3, color: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">
          Platform-wide analytics and metrics
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Revenue (Monthly)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueMonthly}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            User Acquisition
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.userAcquisition}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }} />
                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Plan Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={data.planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.planDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(17,24,39,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                  }}
                />
                <Legend
                  formatter={(value: string) => (
                    <span style={{ color: "#9ca3af", fontSize: "12px" }}>{value}</span>
                  )}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Feature Usage
          </h3>
          <div className="space-y-3">
            {data.featureUsage.map((feature) => (
              <div key={feature.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">{feature.name}</span>
                  <span className="text-sm text-gray-200 font-medium">
                    {feature.usage}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${feature.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
