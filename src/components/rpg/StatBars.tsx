"use client";

import { motion } from "framer-motion";
import {
  Dumbbell,
  Brain,
  Target,
  Eye,
  Heart,
  Users,
  BookOpen,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STAT_LABELS } from "@/lib/rpg";
import type { PlayerStats, StatName } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  brain: Brain,
  target: Target,
  eye: Eye,
  heart: Heart,
  users: Users,
  "book-open": BookOpen,
  zap: Zap,
};

const barClassMap: Record<string, string> = {
  strength: "stat-bar-strength",
  intelligence: "stat-bar-intelligence",
  discipline: "stat-bar-discipline",
  focus: "stat-bar-focus",
  endurance: "stat-bar-endurance",
  charisma: "stat-bar-charisma",
  wisdom: "stat-bar-wisdom",
  energy: "stat-bar-energy",
};

const MAX_STAT = 999;

export interface StatBarsProps {
  stats: PlayerStats;
  size?: "sm" | "lg";
}

export function StatBars({ stats, size = "lg" }: StatBarsProps) {
  const statKeys = (Object.keys(stats) as StatName[]).filter(
    (k) => k in STAT_LABELS
  );

  return (
    <div className={cn("flex flex-col gap-2", size === "sm" ? "gap-1.5" : "gap-3")}>
      {statKeys.map((key) => {
        const labelDef = STAT_LABELS[key];
        const value = stats[key] ?? 0;
        const percentage = Math.min(100, (value / MAX_STAT) * 100);
        const Icon = labelDef ? (iconMap[labelDef.icon] ?? Zap) : Zap;

        return (
          <div key={key} className="flex flex-col gap-1">
            <div
              className={cn(
                "flex items-center justify-between",
                size === "sm" ? "mb-0.5" : "mb-1"
              )}
            >
              <div className="flex items-center gap-1.5">
                <Icon
                  className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")}
                  style={{ color: labelDef?.color ?? "#fff" }}
                />
                <span
                  className={cn(
                    "font-medium text-gray-300",
                    size === "sm" ? "text-xs" : "text-sm"
                  )}
                >
                  {labelDef?.label ?? key}
                </span>
              </div>
              <span
                className={cn(
                  "font-bold tabular-nums",
                  size === "sm" ? "text-xs" : "text-sm",
                  size === "sm" ? "text-gray-300" : "text-gray-100"
                )}
                style={{ color: labelDef?.color }}
              >
                {value}
              </span>
            </div>
            <div
              className={cn(
                "overflow-hidden rounded-full bg-white/10",
                size === "sm" ? "h-2" : "h-3"
              )}
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={MAX_STAT}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                className={cn(
                  "h-full rounded-full",
                  barClassMap[key] ?? "bg-gradient-to-r from-blue-500 to-purple-500"
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
