"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Target,
  Trophy,
  Lock,
  Unlock,
  Sparkles,
  Star,
} from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useUserStore, useXPStore } from "@/store";
import { LEVELS, ACHIEVEMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/types";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.05 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
  },
};

const achievementIcons: Record<string, string> = {};
ACHIEVEMENTS.forEach((a) => {
  achievementIcons[a.type] = a.icon;
});

function mockAchievements(): Achievement[] {
  const unlockedTypes = [
    "first_habit",
    "seven_day_streak",
    "hundred_completions",
    "five_categories",
    "early_bird",
    "comeback_king",
  ];
  const now = new Date();
  return ACHIEVEMENTS.map((a) => ({
    id: a.type,
    habitId: null,
    userId: "user-1",
    type: a.type,
    title: a.title,
    description: a.description,
    icon: a.icon,
    xpReward: a.xpReward,
    unlockedAt: unlockedTypes.includes(a.type)
      ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      : null,
  }));
}

function AchievementCard({
  achievement,
}: {
  achievement: Achievement;
}) {
  const isUnlocked = !!achievement.unlockedAt;

  return (
    <motion.div
      variants={stagger.item}
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        isUnlocked
          ? "border-white/10 bg-white/5"
          : "border-white/5 bg-white/[0.02] opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
            isUnlocked
              ? "bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/20"
              : "bg-white/5 border border-white/10"
          )}
        >
          {isUnlocked ? achievement.icon : <Lock className="h-4 w-4 text-gray-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                "text-sm font-semibold",
                isUnlocked ? "text-gray-100" : "text-gray-500"
              )}
            >
              {achievement.title}
            </h4>
            {isUnlocked && (
              <Badge variant="success" size="sm">
                +{achievement.xpReward} XP
              </Badge>
            )}
          </div>
          <p
            className={cn(
              "text-xs mt-0.5",
              isUnlocked ? "text-gray-400" : "text-gray-600"
            )}
          >
            {achievement.description}
          </p>
          {isUnlocked && achievement.unlockedAt && (
            <p className="text-[10px] text-gray-500 mt-1">
              Unlocked{" "}
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StatsRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-100">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { name, email, image } = useUserStore();
  const { level, xp, totalXp } = useXPStore();

  const currentLevelData = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const nextLevelData = LEVELS.find((l) => l.level === level + 1);
  const prevLevelXp = currentLevelData.xpRequired;
  const nextLevelXp = nextLevelData?.xpRequired ?? prevLevelXp + 1000;
  const xpInLevel = totalXp - prevLevelXp;
  const xpNeeded = nextLevelXp - prevLevelXp;
  const xpProgress = Math.min(
    100,
    Math.round((xpInLevel / xpNeeded) * 100)
  );

  const achievements = useMemo(() => mockAchievements(), []);
  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="max-w-2xl space-y-6"
    >
      <motion.div variants={stagger.item}>
        <GlassCard className="p-6 flex flex-col items-center text-center">
          <Avatar
            src={image}
            name={name ?? "Forger"}
            size="xl"
            className="mb-4"
          />
          <h1 className="text-xl font-bold text-gray-100">
            {name ?? "Forger"}
          </h1>
          {email && (
            <p className="text-sm text-gray-400 mt-0.5">{email}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="brand" size="md">
              <Sparkles className="h-3 w-3 mr-1" />
              Level {level} &mdash; {currentLevelData.title}
            </Badge>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={stagger.item}>
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-200">
              Experience
            </span>
            <span className="text-xs text-gray-500">
              {totalXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
          {nextLevelData && (
            <p className="text-xs text-gray-500 mt-2">
              {nextLevelXp - totalXp} XP to Level {level + 1} &mdash;{" "}
              {nextLevelData.title}
            </p>
          )}
        </GlassCard>
      </motion.div>

      <motion.div
        variants={stagger.item}
        className="grid grid-cols-3 gap-3"
      >
        <StatsRow
          icon={Target}
          label="Habits"
          value={8}
          color="bg-blue-500/15 text-blue-400"
        />
        <StatsRow
          icon={Flame}
          label="Completions"
          value={143}
          color="bg-orange-500/15 text-orange-400"
        />
        <StatsRow
          icon={Trophy}
          label="Badges"
          value={unlockedCount}
          color="bg-amber-500/15 text-amber-400"
        />
      </motion.div>

      <motion.div variants={stagger.item}>
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-100">
                Achievements
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {unlockedCount} / {achievements.length} unlocked
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Star className="h-4 w-4 text-amber-400" />
              <span>
                {achievements
                  .filter((a) => a.unlockedAt)
                  .reduce((sum, a) => sum + a.xpReward, 0)}{" "}
                XP
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((a) => (
              <AchievementCard key={a.type} achievement={a} />
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
