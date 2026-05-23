"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import {
  TrendingUp,
  Flame,
  CalendarCheck,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { GlassCard } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HabitCategory } from "@/types";
import { CATEGORIES } from "@/lib/constants";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.06 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  },
};

const categoryColors: Record<string, string> = {
  HEALTH: "bg-emerald-500",
  FITNESS: "bg-orange-500",
  MIND: "bg-violet-500",
  WORK: "bg-blue-500",
  LEARNING: "bg-cyan-500",
  SOCIAL: "bg-pink-500",
  FINANCE: "bg-green-500",
  CREATIVE: "bg-amber-500",
  SPIRITUAL: "bg-purple-500",
  OTHER: "bg-gray-500",
};

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      variants={stagger.item}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-100">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            color
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function WeeklyBarChart({
  data,
}: {
  data: { day: string; completions: number }[];
}) {
  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">
        Weekly Completions
      </h3>
      <div className="h-56 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="day"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(17,24,39,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
              labelStyle={{ color: "#e5e7eb" }}
              itemStyle={{ color: "#a78bfa" }}
            />
            <Bar
              dataKey="completions"
              fill="url(#barGradient2)"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
            <defs>
              <linearGradient
                id="barGradient2"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#a78bfa"
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="#a78bfa"
                  stopOpacity={0.3}
                />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

function MonthlyAreaChart({
  data,
}: {
  data: { month: string; completions: number }[];
}) {
  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">
        Monthly Trend
      </h3>
      <div className="h-56 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="#39ff14"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="#39ff14"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(17,24,39,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
              labelStyle={{ color: "#e5e7eb" }}
              itemStyle={{ color: "#39ff14" }}
            />
            <Area
              type="monotone"
              dataKey="completions"
              stroke="#39ff14"
              strokeWidth={2}
              fill="url(#areaGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

function CategoryBreakdown({
  data,
}: {
  data: { category: string; count: number; color: string; label: string }[];
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">
        Category Distribution
      </h3>
      <div className="space-y-3">
        {data
          .filter((d) => d.count > 0)
          .sort((a, b) => b.count - a.count)
          .map((d) => (
            <div key={d.category}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className={cn("h-2.5 w-2.5 rounded-full", d.color)}
                  />
                  <span className="text-xs text-gray-300">{d.label}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {d.count} ({total > 0 ? Math.round((d.count / total) * 100) : 0}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", d.color)}
                  style={{
                    width: `${total > 0 ? (d.count / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </GlassCard>
  );
}

export default function AnalyticsPage() {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const { data: analytics, isLoading, error } = useAnalytics();

  const weeklyData = useMemo(() => {
    if (!analytics) return [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    return analytics.weeklyCompletions.map((item, i) => {
      const dayIndex = (dayOfWeek - 6 + i + 7) % 7;
      return { day: DAYS[dayIndex], completions: item.count };
    });
  }, [analytics]);

  const monthlyData = useMemo(() => {
    if (!analytics) return [];
    return analytics.monthlyCompletions
      .filter((_, i) => i % 5 === 0 || i === analytics.monthlyCompletions.length - 1)
      .map((item) => ({
        month: new Date(item.date).getDate().toString(),
        completions: item.count,
      }));
  }, [analytics]);

  const categoryData = useMemo(() => {
    if (!analytics) return [];
    return analytics.categoryBreakdown.map((item) => ({
      category: item.category,
      label: CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category,
      count: item.count,
      completions: item.completions,
      color: categoryColors[item.category] ?? "bg-gray-500",
    }));
  }, [analytics]);

  const summaryStats = useMemo(
    () => ({
      productivityScore: analytics?.summary.productivityScore ?? 0,
      bestStreak: analytics?.summary.bestStreak ?? 0,
      weeklyCompletions: weeklyData.reduce((s, d) => s + d.completions, 0),
      avgDaily: analytics?.summary.averagePerDay ?? 0,
    }),
    [analytics, weeklyData]
  );

  const completionRate = analytics?.summary.completionRate ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-white/5 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-72 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-gray-400">Failed to load analytics</p>
        <p className="text-sm text-gray-500 mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={stagger.item}>
        <h1 className="text-2xl font-bold text-gray-100">Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Track your progress and insights
        </p>
      </motion.div>

      <motion.div
        variants={stagger.item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <SummaryCard
          icon={TrendingUp}
          label="Productivity Score"
          value={summaryStats.productivityScore.toString()}
          color="bg-blue-500/15 text-blue-400"
        />
        <SummaryCard
          icon={Flame}
          label="Best Streak"
          value={`${summaryStats.bestStreak} days`}
          color="bg-orange-500/15 text-orange-400"
        />
        <SummaryCard
          icon={CalendarCheck}
          label="Weekly Completions"
          value={summaryStats.weeklyCompletions.toString()}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <SummaryCard
          icon={BarChart3}
          label="Avg Daily"
          value={summaryStats.avgDaily.toString()}
          color="bg-purple-500/15 text-purple-400"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={stagger.item}>
          <WeeklyBarChart data={weeklyData} />
        </motion.div>
        <motion.div variants={stagger.item}>
          <MonthlyAreaChart data={monthlyData} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={stagger.item} className="lg:col-span-2">
          <CategoryBreakdown data={categoryData} />
        </motion.div>
        <motion.div variants={stagger.item} className="space-y-4">
          <GlassCard className="p-5 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-gray-200 mb-4">
              Overall Completion
            </h3>
            <ProgressRing
              progress={completionRate}
              size={140}
              strokeWidth={8}
              color="#60a5fa"
              label="Completion Rate"
            />
          </GlassCard>
          <GlassCard className="p-5 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-gray-200 mb-4">
              Streak Progress
            </h3>
            <ProgressRing
              progress={Math.min(
                100,
                Math.round((summaryStats.bestStreak / 30) * 100)
              )}
              size={140}
              strokeWidth={8}
              color="#f97316"
              label="Days Streak"
            />
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
