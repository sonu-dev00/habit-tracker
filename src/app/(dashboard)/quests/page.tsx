"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ScrollText,
  RefreshCw,
  CheckCircle,
  Swords,
  Clock,
} from "lucide-react";
import { QuestCard } from "@/components/rpg/QuestCard";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuests, useClaimQuest, useRefreshQuests } from "@/lib/hooks/use-rpg";
import { cn } from "@/lib/utils";
import type { QuestType } from "@/types";

const QUEST_TABS: { label: string; type: QuestType; icon: typeof Swords }[] = [
  { label: "Daily", type: "DAILY", icon: Clock },
  { label: "Weekly", type: "WEEKLY", icon: Clock },
  { label: "Main", type: "MAIN", icon: Swords },
  { label: "Side", type: "SIDE", icon: ScrollText },
  { label: "Hidden", type: "HIDDEN", icon: ScrollText },
  { label: "Boss", type: "BOSS", icon: Swords },
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.05 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  },
};

export default function QuestsPage() {
  const [activeTab, setActiveTab] = useState<QuestType>("DAILY");
  const { data: quests, isPending, error } = useQuests();
  const claimQuest = useClaimQuest();
  const refreshQuests = useRefreshQuests();

  const filteredQuests = useMemo(() => {
    if (!quests) return [];
    return quests.filter((q) => q.quest.type === activeTab);
  }, [quests, activeTab]);

  const stats = useMemo(() => {
    if (!quests) return { total: 0, completed: 0, active: 0, claimed: 0 };
    return {
      total: quests.length,
      completed: quests.filter((q) => q.status === "COMPLETED").length,
      active: quests.filter((q) => q.status === "ACTIVE").length,
      claimed: quests.filter((q) => q.status === "CLAIMED").length,
    };
  }, [quests]);

  const isRefreshable = activeTab === "DAILY" || activeTab === "WEEKLY";

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <p className="text-red-400 text-lg font-semibold">Failed to load quests</p>
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
            <ScrollText className="h-6 w-6 text-amber-400" />
            Quest Board
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Complete quests to earn XP, coins, and rare rewards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>{stats.completed} done</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4 text-blue-400" />
            <span>{stats.active} active</span>
          </div>
          {isRefreshable && (
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              loading={refreshQuests.isPending}
              onClick={() => refreshQuests.mutate()}
            >
              Refresh
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div variants={stagger.item}>
        <div className="flex flex-wrap gap-2">
          {QUEST_TABS.map((tab) => {
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

      <motion.div variants={stagger.item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rpg-panel h-32 animate-pulse">
              <div className="h-full w-full bg-white/5 rounded-lg" />
            </div>
          ))
        ) : filteredQuests.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
            <ScrollText className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-lg font-medium">No {activeTab.toLowerCase()} quests available</p>
            <p className="text-sm mt-1">Check back later or refresh the list</p>
          </div>
        ) : (
          filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onClaim={(id) => claimQuest.mutate(id)}
            />
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
