"use client";

import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Star, Info, Loader2 } from "lucide-react";
import { PlayerProfileHero } from "@/components/rpg/PlayerProfileHero";
import { StatBars } from "@/components/rpg/StatBars";
import { RankProgress } from "@/components/rpg/RankProgress";
import { DailyRewardCard } from "@/components/rpg/DailyRewardCard";
import { GlassCard } from "@/components/ui/card";
import { useRPGProfile, useDailyReward, useClaimDailyReward } from "@/lib/hooks/use-rpg";
import { useRPGProfileStore, useRPGStatsStore } from "@/store";
import { useShallow } from "zustand/react/shallow";
import { RANKS, TITLES } from "@/lib/rpg";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.06 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  },
};

export default function RPGProfilePage() {
  const { data, isPending, error } = useRPGProfile();
  const { data: dailyData } = useDailyReward();
  const claimDaily = useClaimDailyReward();
  const setProfile = useRPGProfileStore((s) => s.setProfile);
  const stats = useRPGStatsStore(
    useShallow((s) => ({
      strength: s.strength,
      intelligence: s.intelligence,
      discipline: s.discipline,
      focus: s.focus,
      endurance: s.endurance,
      charisma: s.charisma,
      wisdom: s.wisdom,
      energy: s.energy,
    }))
  );
  const setStats = useRPGStatsStore((s) => s.setStats);

  useEffect(() => {
    if (data?.profile) {
      setProfile({
        rank: data.profile.rank,
        title: data.profile.title,
        coins: data.profile.coins,
        prestigeLevel: data.profile.prestigeLevel,
        auraColor: data.profile.auraColor,
      });
    }
    if (data?.stats) {
      setStats(data.stats);
    }
  }, [data, setProfile, setStats]);

  const { rank, title, prestigeLevel } = useRPGProfileStore();

  const rankDef = useMemo(
    () => RANKS.find((r) => r.rank === rank) ?? RANKS[0],
    [rank]
  );

  const titleInfo = useMemo(() => {
    const found = Object.values(TITLES).find((t) => t.title === title);
    return found ?? { title, description: "Current title", requirement: "" };
  }, [title]);

  const claimedDays = useMemo(() => {
    return (dailyData?.claimedDays ?? []).map((d) => d.day);
  }, [dailyData]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <p className="text-red-400 text-lg font-semibold">Failed to load profile</p>
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
      className="max-w-4xl space-y-6"
    >
      <motion.div variants={stagger.item}>
        <PlayerProfileHero />
      </motion.div>

      <motion.div variants={stagger.item}>
        <DailyRewardCard
          claimedDays={claimedDays}
          currentStreak={dailyData?.currentStreak ?? 0}
          onClaim={() => claimDaily.mutate()}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={stagger.item}>
          <GlassCard className="p-5">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
              Player Stats
            </h3>
            <StatBars stats={stats} size="lg" />
          </GlassCard>
        </motion.div>

        <motion.div variants={stagger.item} className="space-y-6">
          <RankProgress />

          <GlassCard className="p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
              Current Title
            </h3>
            <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${rankDef.color}20`, color: rankDef.color }}
              >
                <Crown className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-100">{titleInfo.title}</h4>
                <p className="mt-0.5 text-sm text-gray-400">{titleInfo.description}</p>
                {titleInfo.requirement && (
                  <p className="mt-1 text-xs text-gray-500">{titleInfo.requirement}</p>
                )}
              </div>
            </div>
          </GlassCard>

          {prestigeLevel > 0 && (
            <GlassCard className="p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
                Prestige
              </h3>
              <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4">
                <Star className="h-8 w-8 text-amber-400" />
                <div>
                  <p className="font-semibold text-amber-300">
                    Prestige Level {prestigeLevel}
                  </p>
                  <p className="text-sm text-amber-400/70">
                    Bonus: +{(prestigeLevel * 10).toLocaleString()}% XP
                  </p>
                </div>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>

      <motion.div variants={stagger.item}>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-3">
            <Info className="h-4 w-4" />
            <span className="text-xs">
              Complete habits, earn XP, and level up to unlock new ranks and titles.
              Prestige resets your level but grants permanent XP bonuses.
            </span>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
