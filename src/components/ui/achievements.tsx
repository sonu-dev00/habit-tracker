"use client";

import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/card";
import type { Achievement } from "@/lib/hooks/use-achievements";
import { useAchievements } from "@/lib/hooks/use-achievements";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.03 } } },
  item: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
  },
};

export function AchievementsGrid({ compact }: { compact?: boolean }) {
  const { data: achievements, isLoading } = useAchievements();

  if (isLoading) {
    return (
      <div className={cn("grid gap-3", compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}>
        {Array.from({ length: compact ? 6 : 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  const list = achievements ?? [];
  const unlockedCount = list.filter((a) => a.unlocked).length;

  return (
    <div>
      {!compact && (
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <p className="text-sm text-gray-400">
            {unlockedCount} / {list.length} achievements unlocked
          </p>
        </div>
      )}
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className={cn("grid gap-3", compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}
      >
        {list.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} compact={compact} />
        ))}
      </motion.div>
    </div>
  );
}

function AchievementCard({ achievement, compact }: { achievement: Achievement; compact?: boolean }) {
  return (
    <motion.div variants={stagger.item}>
      <GlassCard
        className={cn(
          "p-4 flex flex-col items-center text-center transition-all",
          achievement.unlocked
            ? "border-yellow-500/20 bg-yellow-500/5"
            : "opacity-50 grayscale"
        )}
      >
        <div className={cn(
          "flex items-center justify-center rounded-xl mb-2",
          achievement.unlocked ? "bg-yellow-500/15" : "bg-white/5",
          compact ? "h-8 w-8" : "h-10 w-10"
        )}>
          {achievement.unlocked ? (
            <span className={compact ? "text-lg" : "text-xl"}>{achievement.icon}</span>
          ) : (
            <Lock className={cn("text-gray-600", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
          )}
        </div>
        {!compact && (
          <>
            <p className="text-xs font-medium text-gray-200 truncate w-full">{achievement.title}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{achievement.description}</p>
            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-[9px] text-gray-600 mt-1">
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </>
        )}
      </GlassCard>
    </motion.div>
  );
}
