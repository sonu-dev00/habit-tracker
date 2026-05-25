"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Sparkles,
  Zap,
  Star,
  Trophy,
} from "lucide-react";
import { BattlePassCard } from "@/components/rpg/BattlePassCard";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useBattlePass,
  useClaimBattlePassTier,
  useBuyPremiumBattlePass,
} from "@/lib/hooks/use-rpg";
import type { BattlePassTierDef } from "@/types";
const PREMIUM_COST = 500;

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.06 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  },
};

export default function BattlePassPage() {
  const { data, isPending, error } = useBattlePass();
  const claimTier = useClaimBattlePassTier();
  const buyPremium = useBuyPremiumBattlePass();

  const battlePass = data?.battlePass ?? null;
  const playerProgress = data?.playerProgress ?? null;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <p className="text-red-400 text-lg font-semibold">Failed to load battle pass</p>
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
      <motion.div variants={stagger.item}>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 p-8">
          <div className="absolute top-[-30%] right-[-10%] h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />
          <div className="absolute bottom-[-20%] left-[-5%] h-48 w-48 rounded-full bg-purple-500/10 blur-[80px]" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-100">
                  {battlePass?.name ?? "Battle Pass"}
                </h1>
                {battlePass && (
                  <p className="text-sm text-gray-400 mt-1">
                    Season {battlePass.season} &mdash;{" "}
                    {new Date(battlePass.startDate).toLocaleDateString()} →{" "}
                    {new Date(battlePass.endDate).toLocaleDateString()}
                  </p>
                )}
                {!battlePass && (
                  <p className="text-sm text-gray-400 mt-1">
                    Complete challenges to earn exclusive rewards
                  </p>
                )}
              </div>
            </div>

            {playerProgress && (
              <div className="flex items-center gap-3">
                <Badge
                  variant={playerProgress.tier === "PREMIUM" ? "brand" : "default"}
                  size="md"
                  className="px-4 py-1.5"
                >
                  {playerProgress.tier === "PREMIUM" ? (
                    <Star className="mr-1.5 h-4 w-4 text-amber-400" />
                  ) : (
                    <Sparkles className="mr-1.5 h-4 w-4" />
                  )}
                  {playerProgress.tier === "PREMIUM" ? "Premium" : "Free"}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {isPending ? (
        <div className="space-y-4">
          <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : !battlePass || !playerProgress ? (
        <motion.div variants={stagger.item} className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Shield className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No active battle pass</p>
          <p className="text-sm mt-1">Check back when a new season starts</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={stagger.item}>
            {playerProgress.tier !== "PREMIUM" && battlePass.tiers.some((t: BattlePassTierDef) => t.premiumReward) && (
              <GlassCard className="p-5 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-amber-400" />
                    <div>
                      <h3 className="font-semibold text-gray-100">Upgrade to Premium</h3>
                      <p className="text-sm text-gray-400">
                        Unlock premium rewards including exclusive cosmetics and boosters
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    icon={Star}
                    loading={buyPremium.isPending}
                    onClick={() => buyPremium.mutate()}
                  >
                    Upgrade - {PREMIUM_COST} ©
                  </Button>
                </div>
              </GlassCard>
            )}

            <BattlePassCard
              battlePass={playerProgress}
              tiers={battlePass.tiers}
              seasonName={battlePass.name}
              onClaimTier={(tier) => claimTier.mutate(tier)}
              onUpgrade={() => buyPremium.mutate()}
            />
          </motion.div>

          <motion.div variants={stagger.item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassCard className="p-4 flex items-center gap-3">
              <Zap className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-lg font-bold text-gray-100">{playerProgress.level}</p>
                <p className="text-xs text-gray-400">Current Level</p>
              </div>
            </GlassCard>
            <GlassCard className="p-4 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-lg font-bold text-gray-100">{playerProgress.claimedTiers.length}</p>
                <p className="text-xs text-gray-400">Tiers Claimed</p>
              </div>
            </GlassCard>
            <GlassCard className="p-4 flex items-center gap-3">
              <Star className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-lg font-bold text-gray-100">
                  {playerProgress.tier === "PREMIUM" ? "Premium" : "Free"}
                </p>
                <p className="text-xs text-gray-400">Pass Type</p>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
