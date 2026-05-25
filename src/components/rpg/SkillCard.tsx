"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Lock,
  ArrowUp,
  Sparkles,
  Shield,
  Target,
  Brain,
  Eye,
  BookOpen,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/card";
import { RANKS } from "@/lib/rpg";
import type { Skill, PlayerSkill, SkillType, PlayerRank } from "@/types";

const skillIconMap: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  brain: Brain,
  target: Target,
  eye: Eye,
  "book-open": BookOpen,
  shield: Shield,
  zap: Zap,
};

const typeConfig: Record<
  SkillType,
  { label: string; variant: "info" | "warning" | "error" }
> = {
  PASSIVE: { label: "Passive", variant: "info" },
  ACTIVE: { label: "Active", variant: "warning" },
  ULTIMATE: { label: "Ultimate", variant: "error" },
};

function getDefaultIcon(type: SkillType): LucideIcon {
  switch (type) {
    case "PASSIVE":
      return Shield;
    case "ACTIVE":
      return Zap;
    case "ULTIMATE":
      return Sparkles;
  }
}

import { createElement } from "react";

function SkillIconDisplay({
  icon,
  type,
  isActive,
  isUnlocked,
}: {
  icon?: string | null;
  type: SkillType;
  isActive: boolean;
  isUnlocked: boolean;
}) {
  if (!isUnlocked) {
    return <Lock className="h-5 w-5 text-gray-600" aria-label="Locked skill" />;
  }
  const IconComp = icon
    ? skillIconMap[icon] ?? getDefaultIcon(type)
    : getDefaultIcon(type);
  return createElement(IconComp, {
    className: cn(
      "h-5 w-5",
      isActive ? "text-blue-400" : "text-gray-400"
    ),
  });
}

export interface SkillCardProps {
  skill: Skill;
  playerSkill?: PlayerSkill | null;
  playerLevel?: number;
  playerRank?: PlayerRank;
  onUnlock?: (id: string) => void;
  onToggle?: (id: string, active: boolean) => void;
}

export function SkillCard({
  skill,
  playerSkill = null,
  playerLevel = 1,
  playerRank = "E",
  onUnlock,
  onToggle,
}: SkillCardProps) {
  const isUnlocked = !!playerSkill;
  const isActive = playerSkill?.isActive ?? false;
  const currentLevel = playerSkill?.level ?? 0;

  const meetsLevelReq = playerLevel >= skill.requiredLevel;
  const rankIndex = RANKS.findIndex((r) => r.rank === playerRank);
  const reqRankIndex = RANKS.findIndex((r) => r.rank === skill.requiredRank);
  const meetsRankReq = reqRankIndex === -1 ? false : rankIndex >= reqRankIndex;

  const canUnlock = !isUnlocked && meetsLevelReq && meetsRankReq;
  const typeCfg = typeConfig[skill.type] ?? typeConfig.PASSIVE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard
        glow={isActive}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          isActive && "border-blue-500/30 shadow-blue-500/10",
          !isUnlocked && "opacity-70"
        )}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  isUnlocked ? "bg-white/10" : "bg-white/5"
                )}
              >
                <SkillIconDisplay
                  icon={skill.icon}
                  type={skill.type}
                  isActive={isActive}
                  isUnlocked={isUnlocked}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    className={cn(
                      "font-semibold truncate",
                      isUnlocked ? "text-gray-100" : "text-gray-400"
                    )}
                  >
                    {skill.name}
                  </h4>
                  {isActive && (
                    <Badge variant="info" size="sm" className="animate-pulse-glow">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                  {skill.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant={typeCfg.variant} size="sm">
              {typeCfg.label}
            </Badge>
            <Badge size="sm">
              Lv. {skill.requiredLevel}+
            </Badge>
            <Badge size="sm">
              {skill.requiredRank}-Rank
            </Badge>
          </div>

          {isUnlocked && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <ArrowUp className="h-3 w-3 text-green-400" />
              <span>Level {currentLevel}</span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              {!isUnlocked && !meetsLevelReq && (
                <span className="text-red-400">
                  Need Lv.{skill.requiredLevel}
                </span>
              )}
              {!isUnlocked && meetsLevelReq && !meetsRankReq && (
                <span className="text-red-400">
                  Need {skill.requiredRank}-Rank
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isUnlocked ? (
                <Button
                  size="xs"
                  variant={isActive ? "primary" : "secondary"}
                  disabled={skill.type === "PASSIVE"}
                  onClick={() => onToggle?.(skill.id, !isActive)}
                >
                  {isActive ? "Active" : "Toggle"}
                </Button>
              ) : (
                <Button
                  size="xs"
                  variant="primary"
                  disabled={!canUnlock}
                  onClick={() => onUnlock?.(skill.id)}
                >
                  <Sparkles className="h-3 w-3" />
                  Unlock
                </Button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
