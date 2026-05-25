"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TreePine,
  Shield,
  Zap,
  Sparkles,
  Unlock,
} from "lucide-react";
import { SkillCard } from "@/components/rpg/SkillCard";
import { GlassCard } from "@/components/ui/card";
import { useSkills, useUnlockSkill, useToggleSkill } from "@/lib/hooks/use-rpg";
import { useRPGProfileStore } from "@/store";
import { cn } from "@/lib/utils";
import type { PlayerRank, SkillType } from "@/types";

const SKILL_TABS: { label: string; type: SkillType; icon: typeof Shield }[] = [
  { label: "Passive", type: "PASSIVE", icon: Shield },
  { label: "Active", type: "ACTIVE", icon: Zap },
  { label: "Ultimate", type: "ULTIMATE", icon: Sparkles },
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.04 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  },
};

export default function SkillTreePage() {
  const [activeTab, setActiveTab] = useState<SkillType>("PASSIVE");
  const { data, isPending, error } = useSkills();
  const unlockSkill = useUnlockSkill();
  const toggleSkill = useToggleSkill();
  const { rank } = useRPGProfileStore();

  const playerLevel = useMemo(() => {
    const levelByRank: Record<string, number> = { E: 1, D: 5, C: 10, B: 20, A: 35, S: 50, NATIONAL: 75, MONARCH: 90 };
    return levelByRank[rank] ?? 1;
  }, [rank]);

  const skills = useMemo(() => data?.skills ?? [], [data?.skills]);
  const playerSkills = useMemo(() => data?.playerSkills ?? [], [data?.playerSkills]);

  const playerSkillMap = useMemo(() => {
    const map = new Map<string, (typeof playerSkills)[0]>();
    playerSkills.forEach((ps) => map.set(ps.skillId, ps));
    return map;
  }, [playerSkills]);

  const filteredSkills = useMemo(
    () => skills.filter((s) => s.type === activeTab),
    [skills, activeTab]
  );

  const stats = useMemo(() => {
    const unlocked = playerSkills.length;
    const total = skills.length;
    const active = playerSkills.filter((ps) => ps.isActive).length;
    return { unlocked, total, active };
  }, [skills, playerSkills]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <p className="text-red-400 text-lg font-semibold">Failed to load skill tree</p>
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
      <motion.div variants={stagger.item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <TreePine className="h-6 w-6 text-green-400" />
            Skill Tree
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Unlock and upgrade skills to enhance your hunting abilities
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Unlock className="h-4 w-4 text-green-400" />
            {stats.unlocked}/{stats.total}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-blue-400" />
            {stats.active} active
          </span>
        </div>
      </motion.div>

      <motion.div variants={stagger.item}>
        <div className="flex flex-wrap gap-2">
          {SKILL_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                )}
              >
                <TabIcon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rpg-panel h-40 animate-pulse">
              <div className="h-full w-full bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <TreePine className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No {activeTab.toLowerCase()} skills available</p>
          <p className="text-sm mt-1">Level up to unlock more skills</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              playerSkill={playerSkillMap.get(skill.id) ?? null}
              playerLevel={playerLevel}
              playerRank={rank as PlayerRank}
              onUnlock={(id) => unlockSkill.mutate(id)}
              onToggle={(id, active) => toggleSkill.mutate({ skillId: id, isActive: active })}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
