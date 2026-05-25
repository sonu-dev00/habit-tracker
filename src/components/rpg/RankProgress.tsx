"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { RANKS } from "@/lib/rpg";
import { useRPGProfileStore, useXPStore } from "@/store";
import { Progress } from "@/components/ui/progress";

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

export function RankProgress() {
  const { level, totalXp } = useXPStore();
  const rank = useRPGProfileStore((s) => s.rank);

  const currentRankIndex = useMemo(
    () => RANKS.findIndex((r) => r.rank === rank),
    [rank]
  );
  const currentRankDef = RANKS[currentRankIndex];
  const nextRankDef = RANKS[currentRankIndex + 1] ?? null;

  const levelProgress = nextRankDef
    ? Math.min(100, Math.round((level / nextRankDef.minLevel) * 100))
    : 100;

  const xpProgressToNext = nextRankDef
    ? Math.min(100, Math.round((totalXp / nextRankDef.minXp) * 100))
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rpg-panel p-5"
    >
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
        Rank Progress
      </h3>

      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full border-2 text-2xl font-black shadow-lg",
              rankBadgeClass[rank] ?? "rank-badge-e"
            )}
            style={{
              boxShadow: currentRankDef?.glowColor
                ? `0 0 25px ${currentRankDef.glowColor}`
                : undefined,
            }}
          >
            {rank}
          </div>
          <span className="text-xs font-medium text-gray-400">
            {currentRankDef?.title ?? "E-Rank Hunter"}
          </span>
        </div>

        {nextRankDef && (
          <>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ArrowRight className="h-6 w-6 text-gray-500" />
            </motion.div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-white/10 text-2xl font-black text-gray-600">
                {nextRankDef.rank}
              </div>
              <span className="text-xs font-medium text-gray-600">
                {nextRankDef.title}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3 text-blue-400" />
              Level {level} / {nextRankDef?.minLevel ?? "—"}
            </span>
            <span>{levelProgress}%</span>
          </div>
          <Progress value={levelProgress} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-purple-400" />
              XP {totalXp.toLocaleString()} / {nextRankDef?.minXp.toLocaleString() ?? "—"}
            </span>
            <span>{xpProgressToNext}%</span>
          </div>
          <Progress value={xpProgressToNext} />
        </div>
      </div>

      {!nextRankDef && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 py-3"
        >
          <CheckCircle className="h-5 w-5 text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">
            Maximum Rank Achieved
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
