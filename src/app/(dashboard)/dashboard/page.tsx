"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Flame,
  CheckCircle2,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  Dumbbell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore, useXPStore } from "@/store";
import { useDashboardStats } from "@/lib/hooks/use-analytics";
import { useUser } from "@/lib/hooks/use-user";
import { LEVELS, DAILY_CHALLENGES } from "@/lib/constants";
import { getDailyQuote } from "@/lib/ai-client";
import { formatDate, cn } from "@/lib/utils";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  },
};

const heatColors = [
  "bg-white/5",
  "bg-green-500/15",
  "bg-green-500/30",
  "bg-green-500/45",
  "bg-green-500/65",
  "bg-green-500/85",
];

function getHeatIndex(count: number): number {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 2) return 2;
  if (count <= 3) return 3;
  if (count <= 4) return 4;
  return 5;
}

function StatsCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtitle?: string;
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
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
          )}
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

function WeeklyChart({
  data,
}: {
  data: { day: string; completions: number }[];
}) {
  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">
        Weekly Completions
      </h3>
      <div className="h-48 min-w-0">
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
              itemStyle={{ color: "#60a5fa" }}
            />
            <Bar
              dataKey="completions"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

function HeatmapGrid({ data: _data }: { data?: { date: string; count: number }[] }) {
  const today = new Date();
  const cells = useMemo(() => {
    if (!_data) return [];
    const dateMap = new Map(_data.map((d) => [d.date, d.count]));
    const result: { date: Date; completions: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      result.push({ date: d, completions: dateMap.get(dStr) ?? 0 });
    }
    return result;
  }, [_data]);

  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">
        30-Day Activity
      </h3>
      <div className="grid grid-cols-10 gap-1.5">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={cn(
              "h-5 w-5 rounded-md transition-colors",
              heatColors[getHeatIndex(cell.completions)]
            )}
            title={`${cell.date.getDate()}/${cell.date.getMonth() + 1}/${cell.date.getFullYear()}: ${cell.completions}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-gray-500">Less</span>
        {heatColors.map((c, i) => (
          <div key={i} className={cn("h-3 w-3 rounded-sm", c)} />
        ))}
        <span className="text-xs text-gray-500">More</span>
      </div>
    </GlassCard>
  );
}

function DailyChallengeCard() {
  const challenge = useMemo(() => {
    const idx = new Date().getDate() % DAILY_CHALLENGES.length;
    return DAILY_CHALLENGES[idx];
  }, []);

  return (
    <GlassCard className="p-5" glow>
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20">
          <Dumbbell className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-100">
              Daily Challenge
            </h3>
            <Badge variant="warning" size="sm">
              +{challenge.xpReward} XP
            </Badge>
          </div>
          <p className="text-sm font-medium text-gray-200">
            {challenge.title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {challenge.description}
          </p>
        </div>
        <Button variant="secondary" size="xs">
          Start
        </Button>
      </div>
    </GlassCard>
  );
}

export default function DashboardPage() {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const name = useUserStore((s) => s.name);
  const { user, isLoading: userLoading } = useUser();
  const { level, totalXp } = useXPStore();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardStats();

  const displayName = name ?? user?.name ?? "Forger";

  const today = new Date();
  const formattedDate = formatDate(today, "EEEE, MMMM d");

  const currentLevelData = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const nextLevelData = LEVELS.find((l) => l.level === level + 1);
  const prevLevelXp = currentLevelData.xpRequired;
  const nextLevelXp = nextLevelData?.xpRequired ?? prevLevelXp + 1000;
  const xpInLevel = totalXp - prevLevelXp;
  const xpNeeded = nextLevelXp - prevLevelXp;
  const xpProgress = Math.min(
    100,
    Math.round((xpInLevel / xpNeeded) * 100)
  );

  const weeklyData = useMemo(() => {
    if (!dashboard) return [];
    const dayOfWeek = today.getDay();
    return dashboard.weeklyCompletions.map((item, i) => {
      const dayIndex = (dayOfWeek - 6 + i + 7) % 7;
      return { day: DAYS[dayIndex], completions: item.count };
    });
  }, [dashboard]);

  const stats = useMemo(
    () => ({
      bestStreak: dashboard?.bestStreak ?? 0,
      todayProgress: dashboard?.weeklyCompletions?.length
        ? Math.min(100, Math.round((dashboard.weeklyCompletions[today.getDay()]?.count ?? 0) * 20))
        : 0,
      productivityScore: dashboard?.productivityScore ?? 0,
      totalCompletions: dashboard?.totalCompletions ?? 0,
    }),
    [dashboard]
  );

  const quote = getDailyQuote();

  const isLoading = userLoading || dashboardLoading;

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={stagger.item}>
        <h1 className="text-2xl font-bold text-gray-100">
          Welcome back, {displayName}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{formattedDate}</p>
      </motion.div>

      <motion.div variants={stagger.item}>
        <GlassCard className="p-4 flex items-start gap-4" glow>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20">
            <Brain className="h-4 w-4 text-violet-400" />
          </div>
          <p className="text-sm text-gray-300 leading-relaxed italic">
            &ldquo;{quote}&rdquo;
          </p>
        </GlassCard>
      </motion.div>

      <motion.div
        variants={stagger.item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          icon={Flame}
          label="Best Streak"
          value={`${stats.bestStreak} days`}
          color="bg-orange-500/15 text-orange-400"
        />
        <StatsCard
          icon={CheckCircle2}
          label="Today's Progress"
          value={`${stats.todayProgress}%`}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatsCard
          icon={TrendingUp}
          label="Productivity Score"
          value={stats.productivityScore}
          subtitle="Top 15% this week"
          color="bg-blue-500/15 text-blue-400"
        />
        <StatsCard
          icon={Zap}
          label="Total Completions"
          value={stats.totalCompletions}
          color="bg-purple-500/15 text-purple-400"
        />
      </motion.div>

      <motion.div variants={stagger.item}>
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-sm font-semibold text-gray-200">
                Level {level}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {currentLevelData.title}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {totalXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
          {nextLevelData && (
            <p className="text-xs text-gray-500 mt-2">
              {nextLevelXp - totalXp} XP to Level {level + 1} &mdash;{" "}
              {nextLevelData.title}
            </p>
          )}
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={stagger.item}>
          <WeeklyChart data={weeklyData} />
        </motion.div>
        <motion.div variants={stagger.item}>
          <HeatmapGrid data={dashboard?.heatmap} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={stagger.item}
          className="flex items-center justify-center"
        >
          <ProgressRing
            progress={stats.todayProgress}
            size={140}
            strokeWidth={8}
            color="#39ff14"
            label="Today"
          />
        </motion.div>
        <motion.div variants={stagger.item} className="lg:col-span-2">
          <DailyChallengeCard />
        </motion.div>
      </div>

      <motion.div variants={stagger.item} className="flex flex-wrap gap-3">
        <Link href="/habits">
          <Button variant="secondary" icon={Target}>
            Manage Habits
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
        <Link href="/analytics">
          <Button variant="secondary" icon={TrendingUp}>
            View Analytics
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
