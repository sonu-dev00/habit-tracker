"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Swords,
  Skull,
  Filter,
  Shield,
} from "lucide-react";
import { DungeonCard } from "@/components/rpg/DungeonCard";
import { DungeonActiveOverlay } from "@/components/rpg/DungeonActiveOverlay";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDungeons, useStartDungeon } from "@/lib/hooks/use-rpg";
import { useDungeonStore, useRPGProfileStore } from "@/store";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { DungeonDifficulty } from "@/types";

const DIFFICULTIES: { label: string; value: DungeonDifficulty | "ALL"; color: string }[] = [
  { label: "All", value: "ALL", color: "" },
  { label: "Normal", value: "NORMAL", color: "text-green-400" },
  { label: "Hard", value: "HARD", color: "text-amber-400" },
  { label: "Extreme", value: "EXTREME", color: "text-red-400" },
  { label: "Hell", value: "HELL", color: "text-purple-400" },
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.05 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  },
};

export default function DungeonsPage() {
  const [difficultyFilter, setDifficultyFilter] = useState<DungeonDifficulty | "ALL">("ALL");
  const { data: dungeonData, isLoading, error } = useDungeons();
  const startDungeon = useStartDungeon();
  const { toast } = useToast();
  const isRunning = useDungeonStore((s) => s.isRunning);
  const startDungeonStore = useDungeonStore((s) => s.startDungeon);
  const playerLevel = useRPGProfileStore((s) => {
    const rankScores: Record<string, number> = { E: 1, D: 5, C: 10, B: 20, A: 35, S: 50, NATIONAL: 75, MONARCH: 90 };
    return rankScores[s.rank] ?? 1;
  });
  const dungeons = dungeonData?.dungeons ?? [];

  const filteredDungeons = useMemo(() => {
    if (!dungeons) return [];
    return difficultyFilter === "ALL"
      ? dungeons
      : dungeons.filter((d) => d.difficulty === difficultyFilter);
  }, [dungeons, difficultyFilter]);

  const bossDungeons = useMemo(
    () => filteredDungeons.filter((d) => d.type === "MONK_MODE" || d.difficulty === "HELL"),
    [filteredDungeons]
  );
  const regularDungeons = useMemo(
    () => filteredDungeons.filter((d) => d.type !== "MONK_MODE" && d.difficulty !== "HELL"),
    [filteredDungeons]
  );

  const handleStart = (dungeonId: string) => {
    const dungeon = dungeons?.find((d) => d.id === dungeonId);
    if (!dungeon) return;
    if (isRunning) {
      toast({ title: "Dungeon already in progress", description: "Finish your current dungeon before starting a new one." });
      return;
    }
    startDungeonStore(dungeonId, dungeon.durationMin);
    startDungeon.mutate(dungeonId);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <p className="text-red-400 text-lg font-semibold">Failed to load dungeons</p>
          <p className="text-gray-400 text-sm mt-2">{(error as Error).message}</p>
        </GlassCard>
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
      {isRunning && <DungeonActiveOverlay />}

      <motion.div variants={stagger.item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <Swords className="h-6 w-6 text-red-400" />
              Dungeons
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Enter dungeons to test your focus and earn massive rewards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficultyFilter(d.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                  difficultyFilter === d.value
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rpg-panel h-40 animate-pulse">
              <div className="h-full w-full bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <motion.div variants={stagger.item}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
              Available Dungeons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularDungeons.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                  <Shield className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-lg font-medium">No dungeons available</p>
                </div>
              ) : (
                regularDungeons.map((dungeon) => (
                  <DungeonCard
                    key={dungeon.id}
                    dungeon={dungeon}
                    playerLevel={playerLevel}
                    onStart={handleStart}
                  />
                ))
              )}
            </div>
          </motion.div>

          {bossDungeons.length > 0 && (
            <motion.div variants={stagger.item}>
              <div className="flex items-center gap-2 mb-3">
                <Skull className="h-5 w-5 text-red-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-red-400/80">
                  Boss Raids
                </h2>
                <Badge variant="error" size="sm">High Risk</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bossDungeons.map((dungeon) => (
                  <DungeonCard
                    key={dungeon.id}
                    dungeon={dungeon}
                    playerLevel={playerLevel}
                    onStart={handleStart}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
