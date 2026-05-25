"use client";

import { motion } from "framer-motion";
import {
  Gift,
  Check,
  Lock,
  Zap,
  Coins,
  Flame,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DAILY_REWARDS } from "@/lib/rpg";

export interface DailyRewardCardProps {
  claimedDays: number[];
  currentStreak: number;
  onClaim?: () => void;
  canClaim?: boolean;
  currentDay?: number;
}

export function DailyRewardCard({
  claimedDays,
  currentStreak,
  onClaim,
  canClaim: canClaimProp,
  currentDay: currentDayProp,
}: DailyRewardCardProps) {
  const currentDay = currentDayProp ?? ((currentStreak % 7) + 1);
  const canClaim = canClaimProp ?? !claimedDays.includes(currentDay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rpg-panel p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Daily Rewards
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-gray-300">
            {currentStreak}-day streak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAILY_REWARDS.map((reward, index) => {
          const day = index + 1;
          const isClaimed = claimedDays.includes(day);
          const isCurrentDay = day === currentDay;
          const isLocked = day > currentDay || (isCurrentDay && !canClaim);
          const isClaimable = isCurrentDay && canClaim;

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200",
                isClaimed && "border-green-500/20 bg-green-500/5",
                isClaimable &&
                  "border-blue-500/30 bg-blue-500/10 shadow-lg shadow-blue-500/10",
                isLocked && "border-white/5 bg-white/[0.02]"
              )}
            >
              {isCurrentDay && !isClaimed && (
                <div className="glow-blue absolute inset-0 rounded-xl pointer-events-none" />
              )}

              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  isClaimed && "bg-green-500/20",
                  isClaimable && "bg-blue-500/20 animate-pulse-glow",
                  isLocked && "bg-white/5"
                )}
              >
                {isClaimed ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : isLocked ? (
                  <Lock className="h-4 w-4 text-gray-600" />
                ) : (
                  <Gift className="h-4 w-4 text-blue-400" />
                )}
              </div>

              <span
                className={cn(
                  "text-xs font-bold",
                  isClaimed && "text-green-400",
                  isClaimable && "text-blue-400",
                  isLocked && "text-gray-600"
                )}
              >
                Day {day}
              </span>

              <div className="flex flex-col items-center gap-0.5">
                <span className="flex items-center gap-0.5 text-[10px] text-amber-400/80">
                  <Zap className="h-2.5 w-2.5" />
                  {reward.xp}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-yellow-400/80">
                  <Coins className="h-2.5 w-2.5" />
                  {reward.coins}
                </span>
              </div>

              {day === 7 && !isClaimed && (
                <Sparkles className="absolute -top-1.5 -right-1.5 h-4 w-4 text-amber-400" />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          variant="primary"
          size="md"
          disabled={!canClaim}
          onClick={onClaim}
          icon={Gift}
        >
          {canClaim ? "Claim Daily Reward" : "Come Back Tomorrow"}
        </Button>
      </div>
    </motion.div>
  );
}
