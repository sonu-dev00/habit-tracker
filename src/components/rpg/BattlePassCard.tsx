"use client";

import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Gift,
  Lock,
  Check,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PlayerBattlePass, BattlePassTierDef } from "@/types";

export interface BattlePassCardProps {
  battlePass: PlayerBattlePass;
  tiers: BattlePassTierDef[];
  seasonName: string;
  onClaimTier?: (tier: number) => void;
  onUpgrade?: () => void;
}

export function BattlePassCard({
  battlePass,
  tiers,
  seasonName,
  onClaimTier,
  onUpgrade,
}: BattlePassCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { level, xp, tier, claimedTiers } = battlePass;
  const isPremium = tier === "PREMIUM";

  const sortedTiers = useMemo(
    () => [...tiers].sort((a, b) => a.tier - b.tier),
    [tiers]
  );

  const currentTierIndex = useMemo(() => {
    for (let i = sortedTiers.length - 1; i >= 0; i--) {
      if (sortedTiers[i].xpRequired <= xp) return i;
    }
    return -1;
  }, [sortedTiers, xp]);

  const nextTierXp = useMemo(() => {
    const next = sortedTiers[currentTierIndex + 1];
    return next?.xpRequired ?? sortedTiers[sortedTiers.length - 1]?.xpRequired ?? 0;
  }, [sortedTiers, currentTierIndex]);

  const prevTierXp = useMemo(() => {
    const prev = sortedTiers[currentTierIndex];
    return prev?.xpRequired ?? 0;
  }, [sortedTiers, currentTierIndex]);

  const progress = useMemo(() => {
    if (nextTierXp <= prevTierXp) return 100;
    return Math.min(100, Math.round(((xp - prevTierXp) / (nextTierXp - prevTierXp)) * 100));
  }, [xp, prevTierXp, nextTierXp]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rpg-panel overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-100">{seasonName}</h3>
              {isPremium && (
                <Badge variant="brand" size="sm">
                  <Star className="mr-1 h-3 w-3" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-400">Level {level}</p>
          </div>
          {!isPremium && (
            <Button size="sm" variant="primary" onClick={onUpgrade}>
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade
            </Button>
          )}
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
            <span>Battle Pass XP</span>
            <span>
              {xp.toLocaleString()} / {nextTierXp.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-thin flex gap-3 overflow-x-auto p-4"
      >
        {sortedTiers.map((tierDef) => {
          const isClaimed = claimedTiers.includes(tierDef.tier);
          const isAvailable =
            xp >= tierDef.xpRequired && !isClaimed;
          const isLocked = xp < tierDef.xpRequired;

          return (
            <motion.div
              key={tierDef.id}
              whileHover={{ y: -2 }}
              className={cn(
                "flex w-40 shrink-0 flex-col rounded-xl border p-3 transition-all duration-200",
                isClaimed && "border-green-500/20 bg-green-500/5",
                isAvailable && "border-blue-500/30 bg-blue-500/5",
                isLocked && "border-white/5 bg-white/[0.02]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">
                  Tier {tierDef.tier}
                </span>
                {isClaimed && <Check className="h-4 w-4 text-green-400" />}
                {isLocked && !isClaimed && (
                  <Lock className="h-4 w-4 text-gray-600" />
                )}
                {isAvailable && (
                  <Sparkles className="h-4 w-4 text-blue-400 animate-pulse-glow" />
                )}
              </div>

              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <Gift className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-400 truncate">
                    {tierDef.freeReward?.label ?? "Free Reward"}
                  </span>
                </div>
                {tierDef.premiumReward && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Star className="h-3 w-3 text-amber-400" />
                    <span className="text-amber-300 truncate">
                      {tierDef.premiumReward?.label ?? "Premium Reward"}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-2">
                {isClaimed ? (
                  <Badge variant="success" size="sm" className="w-full justify-center">
                    <Check className="mr-1 h-3 w-3" />
                    Claimed
                  </Badge>
                ) : isAvailable ? (
                  <Button
                    size="xs"
                    variant="success"
                    className="w-full"
                    onClick={() => onClaimTier?.(tierDef.tier)}
                  >
                    <Gift className="h-3 w-3" />
                    Claim
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Lock className="h-3 w-3" />
                    Locked
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
