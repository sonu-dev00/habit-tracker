"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  LogOut,
  Crown,
  Shield,
  Plus,
  Trophy,
  Coins,
} from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  useGuild,
  useCreateGuild,
  useJoinGuild,
  useLeaveGuild,
} from "@/lib/hooks/use-rpg";
import { RANKS } from "@/lib/rpg";
import { cn } from "@/lib/utils";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.05 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  },
};

const roleConfig: Record<string, { label: string; icon: typeof Crown; color: string }> = {
  LEADER: { label: "Leader", icon: Crown, color: "text-amber-400" },
  OFFICER: { label: "Officer", icon: Shield, color: "text-blue-400" },
  MEMBER: { label: "Member", icon: UserPlus, color: "text-gray-400" },
};

export default function GuildPage() {
  const { data, isLoading, error } = useGuild();
  const createGuild = useCreateGuild();
  const joinGuild = useJoinGuild();
  const leaveGuild = useLeaveGuild();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joiningGuild, setJoiningGuild] = useState<string | null>(null);
  const [guildName, setGuildName] = useState("");
  const [guildDesc, setGuildDesc] = useState("");

  const guild = data?.guild ?? null;
  const members = data?.members ?? [];
  const guildList = data?.guilds ?? [];

  const guildRankDef = useMemo(
    () => (guild ? RANKS.find((r) => r.rank === guild.requiredRank) ?? RANKS[0] : null),
    [guild]
  );

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => {
      const roleOrder = { LEADER: 0, OFFICER: 1, MEMBER: 2 };
      return (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3);
    }),
    [members]
  );

  const handleCreateGuild = () => {
    if (!guildName.trim()) return;
    createGuild.mutate(
      { name: guildName.trim(), description: guildDesc.trim() },
      { onSuccess: () => { setShowCreateForm(false); setGuildName(""); setGuildDesc(""); } }
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <p className="text-red-400 text-lg font-semibold">Failed to load guild data</p>
          <p className="text-gray-400 text-sm mt-2">{(error as Error).message}</p>
        </GlassCard>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (guild) {
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
              <Users className="h-6 w-6 text-blue-400" />
              {guild.name}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{guild.description}</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={LogOut}
            loading={leaveGuild.isPending}
            onClick={() => leaveGuild.mutate()}
          >
            Leave Guild
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={stagger.item} className="lg:col-span-2">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Members ({members.length})
                </h3>
              </div>
              <div className="space-y-2">
                {sortedMembers.map((member) => {
                  const role = roleConfig[member.role] ?? roleConfig.MEMBER;
                  const RoleIcon = role.icon;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
                    >
                      <Avatar
                        src={member.user?.image}
                        name={member.user?.name ?? "Unknown"}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {member.user?.name ?? "Unknown Hunter"}
                        </p>
                      </div>
                      <div className={cn("flex items-center gap-1 text-xs font-medium", role.color)}>
                        <RoleIcon className="h-3.5 w-3.5" />
                        {role.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={stagger.item} className="space-y-4">
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                Guild Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Level</span>
                  <span className="text-sm font-semibold text-gray-100">{guild.level}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">XP</span>
                    <span className="text-xs text-gray-400">{guild.xp.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${Math.min(100, (guild.xp % 1000) / 10)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Required Rank</span>
                  {guildRankDef && (
                    <Badge
                      size="sm"
                      style={{ borderColor: `${guildRankDef.color}40`, color: guildRankDef.color }}
                      className="border"
                    >
                      {guild.requiredRank}-Rank
                    </Badge>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
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
            <Users className="h-6 w-6 text-blue-400" />
            Guilds
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Join a guild to compete with other hunters and earn guild rewards
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          Create Guild
        </Button>
      </motion.div>

      {showCreateForm && (
        <motion.div
          variants={stagger.item}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
              Create New Guild
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Guild name"
                value={guildName}
                onChange={(e) => setGuildName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/30 transition-colors"
              />
              <textarea
                placeholder="Description (optional)"
                value={guildDesc}
                onChange={(e) => setGuildDesc(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/30 transition-colors resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={createGuild.isPending}
                  disabled={!guildName.trim()}
                  onClick={handleCreateGuild}
                >
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {guildList.length === 0 ? (
        <motion.div variants={stagger.item} className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Users className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No guilds available</p>
          <p className="text-sm mt-1">Create the first guild or check back later</p>
        </motion.div>
      ) : (
        <motion.div variants={stagger.item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guildList.map((g) => {
            const rankDef = RANKS.find((r) => r.rank === g.requiredRank) ?? RANKS[0];
            return (
              <GlassCard key={g.id} variant="interactive" className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-100 truncate">{g.name}</h4>
                      <p className="text-xs text-gray-400 truncate">{g.description || "No description"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge size="sm">
                    <Trophy className="mr-1 h-3 w-3" />
                    Lv. {g.level}
                  </Badge>
                  <Badge size="sm">
                    <Coins className="mr-1 h-3 w-3" />
                    {g.memberCount ?? 0} members
                  </Badge>
                  <Badge
                    size="sm"
                    style={{ borderColor: `${rankDef.color}40`, color: rankDef.color }}
                    className="border"
                  >
                    {g.requiredRank}+
                  </Badge>
                </div>

                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full"
                    icon={UserPlus}
                    loading={joiningGuild === g.id}
                    onClick={() => {
                      setJoiningGuild(g.id);
                      joinGuild.mutate(g.id, {
                        onSettled: () => setJoiningGuild(null),
                      });
                    }}
                  >
                    Join
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
