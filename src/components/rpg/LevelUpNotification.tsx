"use client";

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  TrendingUp,
  Award,
  CheckCircle,
  Swords,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  string,
  { icon: ReactNode; borderGlow: string; textNeon: string }
> = {
  levelup: {
    icon: <Zap className="h-6 w-6" />,
    borderGlow: "glow-green",
    textNeon: "text-neon",
  },
  rankup: {
    icon: <TrendingUp className="h-6 w-6" />,
    borderGlow: "glow-purple",
    textNeon: "text-neon",
  },
  achievement: {
    icon: <Award className="h-6 w-6" />,
    borderGlow: "glow-blue",
    textNeon: "text-neon",
  },
  quest: {
    icon: <CheckCircle className="h-6 w-6" />,
    borderGlow: "glow-green",
    textNeon: "text-neon",
  },
  dungeon: {
    icon: <Swords className="h-6 w-6" />,
    borderGlow: "glow-red",
    textNeon: "text-neon",
  },
};

export interface LevelUpNotificationProps {
  type?: "levelup" | "rankup" | "achievement" | "quest" | "dungeon";
  title: string;
  description: string;
  icon?: ReactNode;
  color?: string;
  isVisible: boolean;
  onDismiss?: () => void;
  duration?: number;
}

export function LevelUpNotification({
  type = "levelup",
  title,
  description,
  icon,
  color,
  isVisible,
  onDismiss,
  duration = 4000,
}: LevelUpNotificationProps) {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onDismiss]);

  const cfg = typeConfig[type] ?? typeConfig.levelup;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={cn(
            "pointer-events-auto fixed top-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2",
            cfg.borderGlow
          )}
        >
          <div
            className={cn(
              "rpg-panel animate-level-up overflow-hidden border-2 p-5",
              type === "rankup" && "animate-rank-up"
            )}
            style={
              color
                ? { borderColor: color, boxShadow: `0 0 30px ${color}40` }
                : undefined
            }
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10"
                style={color ? { color } : undefined}
              >
                {icon ?? cfg.icon ?? <Sparkles className="h-6 w-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "text-xl font-bold",
                    cfg.textNeon,
                    type === "rankup" && "animate-pulse-glow",
                    type === "achievement" && "text-gradient"
                  )}
                  style={color ? { color } : undefined}
                >
                  {title}
                </h3>
                <p className="mt-1 text-sm text-gray-400">{description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
