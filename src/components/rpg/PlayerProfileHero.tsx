"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Coins,
  Crown,
  Zap,
  Star,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRPGProfileStore, useXPStore, useRPGStatsStore } from "@/store";
import { getXpProgress, RANKS, STAT_LABELS } from "@/lib/rpg";
import { Badge } from "@/components/ui/badge";
import type { StatName } from "@/types";

const rankGlowMap: Record<string, string> = {
  E: "glow-gray",
  D: "glow-green",
  C: "glow-blue",
  B: "glow-purple",
  A: "glow-red",
  S: "glow-red",
  NATIONAL: "glow-green",
  MONARCH: "glow-purple",
};

const rankBadgeClass: Record<string, string> = {
  E: "rank-badge-e",
  D: "rank-badge-d",
  C: "rank-badge-c",
  B: "rank-badge-b",
  A: "rank-badge-a",
  S: "rank-badge-s",
  NATIONAL: "rank-badge-national",
  MONARCH: "rank-badge-monarch",
};

const topStatKeys: StatName[] = [
  "strength",
  "intelligence",
  "discipline",
  "focus",
  "endurance",
  "charisma",
  "wisdom",
];

export interface PlayerProfileHeroProps {
  streak?: number;
}

export function PlayerProfileHero({ streak = 0 }: PlayerProfileHeroProps) {
  const { rank, title, coins, prestigeLevel } =
    useRPGProfileStore();
  const { totalXp, level } = useXPStore();
  const { strength, intelligence, discipline, focus, endurance, charisma, wisdom } = useRPGStatsStore();

  const progress = useMemo(() => getXpProgress(totalXp), [totalXp]);
  const rankDef = useMemo(
    () => RANKS.find((r) => r.rank === rank) ?? RANKS[0],
    [rank]
  );

  const sortedStats = useMemo(() => {
    const values: Record<string, number> = { strength, intelligence, discipline, focus, endurance, charisma, wisdom };
    return topStatKeys
      .map((k) => ({ key: k, value: values[k] ?? 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [strength, intelligence, discipline, focus, endurance, charisma, wisdom]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "rpg-panel-glow relative overflow-hidden p-6",
        rankGlowMap[rank] ?? "glow-blue"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative shrink-0">
          <div
            className="mx-auto h-24 w-24 rounded-full border-2 sm:mx-0"
            style={{
              borderColor: rankDef?.color ?? "#9ca3af",
              boxShadow: `0 0 30px ${rankDef?.glowColor ?? "rgba(156,163,175,0.3)"}`,
            }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-3xl font-bold text-white">
              {rank}
            </div>
          </div>
          {prestigeLevel > 0 && (
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg">
              <Star className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge
              variant="brand"
              className={cn("px-3 py-1 text-sm font-bold tracking-wider", rankBadgeClass[rank])}
            >
              {rank} - {rankDef?.title ?? "E-Rank Hunter"}
            </Badge>
            {prestigeLevel > 0 && (
              <Badge variant="warning" size="sm">
                <Crown className="mr-1 h-3 w-3" />
                Prestige {prestigeLevel}
              </Badge>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-100">{title}</h2>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start sm:gap-4">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-gray-100">
                Lv. {level}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-300">{coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">
                {progress.currentLevelXp.toLocaleString()} /{" "}
                {progress.nextLevelXp.toLocaleString()} XP
              </span>
            </div>
          </div>

          <div className="mt-1 w-full max-w-md">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
              <span>Level Progress</span>
              <span>{progress.progress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25"
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2 sm:items-end">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-gray-300">{streak}-day streak</span>
          </div>
          <Calendar className="h-4 w-4 text-gray-500" />
        </div>
      </div>

      <div className="relative mt-4 flex justify-center gap-3 sm:justify-start">
        {sortedStats.map(({ key, value }) => {
          const labelDef = STAT_LABELS[key];
          return (
            <div
              key={key}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5"
            >
              <span
                className="text-lg"
                style={{ color: labelDef?.color ?? "#fff" }}
              >
                {value}
              </span>
              <span className="text-xs capitalize text-gray-400">
                {labelDef?.label ?? key}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
