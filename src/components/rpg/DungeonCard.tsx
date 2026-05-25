"use client";

import { motion } from "framer-motion";
import {
  Swords,
  Clock,
  Zap,
  Coins,
  Shield,
  BookOpen,
  Dumbbell,
  Brain,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Dungeon, DungeonType, DungeonDifficulty } from "@/types";

const dungeonIcons: Record<DungeonType, typeof Swords> = {
  DEEP_WORK: Brain,
  STUDY: BookOpen,
  FITNESS: Dumbbell,
  MONK_MODE: Eye,
  CUSTOM: Swords,
};

const difficultyConfig: Record<
  DungeonDifficulty,
  { label: string; variant: "success" | "warning" | "error" | "brand"; color: string }
> = {
  NORMAL: { label: "Normal", variant: "success", color: "#22c55e" },
  HARD: { label: "Hard", variant: "warning", color: "#f59e0b" },
  EXTREME: { label: "Extreme", variant: "error", color: "#ef4444" },
  HELL: { label: "Hell", variant: "brand", color: "#a855f7" },
};

export interface DungeonCardProps {
  dungeon: Dungeon;
  playerLevel?: number;
  onStart?: (id: string) => void;
}

export function DungeonCard({ dungeon, playerLevel = 1, onStart }: DungeonCardProps) {
  const Icon = dungeonIcons[dungeon.type] ?? Swords;
  const diffCfg = difficultyConfig[dungeon.difficulty] ?? difficultyConfig.NORMAL;
  const meetsRequirement = playerLevel >= dungeon.requiredLevel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="rpg-panel overflow-hidden transition-all duration-200 hover:border-white/20"
    >
      <div
        className="h-1.5 w-full"
        style={{ background: diffCfg.color }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                background: `${diffCfg.color}20`,
                color: diffCfg.color,
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-gray-100">{dungeon.name}</h4>
              <p className="mt-0.5 text-sm text-gray-400 line-clamp-2">
                {dungeon.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant={diffCfg.variant} size="sm">
            <Shield className="mr-1 h-3 w-3" />
            {diffCfg.label}
          </Badge>
          <Badge size="sm">
            <Clock className="mr-1 h-3 w-3" />
            {dungeon.durationMin} min
          </Badge>
          {dungeon.requiredLevel > 1 && (
            <Badge
              variant={meetsRequirement ? "default" : "error"}
              size="sm"
            >
              Lv. {dungeon.requiredLevel}+
            </Badge>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-amber-400">
              <Zap className="h-3.5 w-3.5" />
              +{dungeon.xpReward} XP
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Coins className="h-3.5 w-3.5" />
              +{dungeon.coinReward}
            </span>
          </div>

          <Button
            size="sm"
            variant="primary"
            disabled={!meetsRequirement}
            onClick={() => onStart?.(dungeon.id)}
          >
            <Swords className="h-3.5 w-3.5" />
            Start
          </Button>
        </div>

        {!meetsRequirement && (
          <p className="mt-2 text-xs text-red-400">
            Requires Level {dungeon.requiredLevel}
          </p>
        )}
      </div>
    </motion.div>
  );
}
