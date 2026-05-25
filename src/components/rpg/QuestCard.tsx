"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Zap,
  Coins,
  CheckCircle,
  Swords,
  Eye,
  Compass,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PlayerQuest } from "@/types";

const questColors: Record<string, { badge: string; glow: string; border: string }> = {
  DAILY: {
    badge: "bg-blue-500/15 text-blue-400",
    glow: "glow-blue",
    border: "border-blue-500/20",
  },
  WEEKLY: {
    badge: "bg-purple-500/15 text-purple-400",
    glow: "glow-purple",
    border: "border-purple-500/20",
  },
  MAIN: {
    badge: "bg-red-500/15 text-red-400",
    glow: "glow-red",
    border: "border-red-500/20",
  },
  SIDE: {
    badge: "bg-green-500/15 text-green-400",
    glow: "glow-green",
    border: "border-green-500/20",
  },
  HIDDEN: {
    badge: "bg-fuchsia-500/15 text-fuchsia-400",
    glow: "glow-purple",
    border: "border-fuchsia-500/20",
  },
  BOSS: {
    badge: "bg-red-500/15 text-red-400",
    glow: "glow-red",
    border: "border-red-500/30",
  },
};

const questIcons: Record<string, typeof Swords> = {
  DAILY: Clock,
  WEEKLY: Clock,
  MAIN: Swords,
  SIDE: Compass,
  HIDDEN: Eye,
  BOSS: Target,
};

export interface QuestCardProps {
  quest: PlayerQuest;
  onClaim?: (id: string) => void;
}

export function QuestCard({ quest, onClaim }: QuestCardProps) {
  const { quest: questDef, progress, target, status } = quest;
  const questType = questDef?.type ?? "DAILY";
  const colors = questColors[questType] ?? questColors.DAILY;
  const isComplete = status === "COMPLETED";
  const isClaimed = status === "CLAIMED";
  const progressPct = Math.min(100, Math.round((progress / (target || 1)) * 100));
  const QuestIcon = questIcons[questType] ?? Compass;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rpg-panel overflow-hidden border-l-4 transition-all duration-200 hover:border-l-white/20",
        colors.border,
        colors.glow
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                colors.badge
              )}
            >
              <QuestIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-100 truncate">
                  {questDef?.title ?? "Unknown Quest"}
                </h4>
                <Badge
                  className={cn("text-[10px]", colors.badge)}
                  size="sm"
                >
                  {questType}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-gray-400 line-clamp-2">
                {questDef?.description ?? ""}
              </p>
            </div>
          </div>
        </div>

        {!isClaimed && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
              <span>
                Progress: {progress} / {target}
              </span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} />
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-amber-400">
              <Zap className="h-3.5 w-3.5" />
              +{questDef?.xpReward ?? 0} XP
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Coins className="h-3.5 w-3.5" />
              +{questDef?.coinReward ?? 0}
            </span>
          </div>

          {isComplete && !isClaimed && (
            <Button
              size="sm"
              variant="success"
              onClick={() => onClaim?.(quest.id)}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Claim
            </Button>
          )}

          {isClaimed && (
            <Badge variant="success" size="sm">
              <CheckCircle className="mr-1 h-3 w-3" />
              Claimed
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
