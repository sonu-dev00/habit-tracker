"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award, Flame, Target, Star, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  image: string | null;
  xp: number;
  streak: number;
  totalCompletions: number;
  totalHabits: number;
}

function fetchLeaderboard(period: string): Promise<{ data: LeaderboardEntry[]; userRank: number | null }> {
  return fetch(`/api/leaderboard?period=${period}`).then((r) => r.json());
}

const rankIcons = [
  { icon: Trophy, color: "text-yellow-400" },
  { icon: Medal, color: "text-gray-300" },
  { icon: Award, color: "text-orange-400" },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => fetchLeaderboard(period),
  });

  const entries = data?.data ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-sm text-gray-400 mt-1">Top habit builders ranked by XP</p>
        </div>
        <div className="w-36">
          <Select
            options={[
              { value: "all", label: "All Time" },
              { value: "monthly", label: "This Month" },
            ]}
            value={period}
            onChange={setPeriod}
            placeholder="Period"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
        </div>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="divide-y divide-white/5">
            {entries.map((entry) => {
              const RankIcon = rankIcons[entry.rank - 1]?.icon;
              const rankColor = rankIcons[entry.rank - 1]?.color;
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex w-10 items-center justify-center">
                    {RankIcon ? (
                      <RankIcon className={cn("h-5 w-5", rankColor)} />
                    ) : (
                      <span className="text-sm font-mono text-gray-600">
                        #{entry.rank}
                      </span>
                    )}
                  </div>
                  <Avatar src={entry.image} name={entry.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {entry.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <Badge variant="brand" size="sm">
                        <Star className="h-3 w-3 mr-1" />
                        {entry.xp.toLocaleString()} XP
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-400" />
                        {entry.streak} day streak
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {entry.totalCompletions}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {entry.totalHabits}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
