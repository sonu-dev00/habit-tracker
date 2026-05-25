"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PlayerProfile, PlayerStats, PlayerQuest, Dungeon, DungeonRun, ShopItem, PlayerInventory, Guild, GuildMember, Skill, PlayerSkill, PlayerBattlePass, PlayerDailyReward, BattlePass } from "@/types";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json.data;
}

export function useRPGProfile() {
  return useQuery({
    queryKey: ["rpg", "profile"],
    queryFn: () => fetchJson<{ profile: PlayerProfile; stats: PlayerStats }>("/api/rpg/profile"),
    staleTime: 30 * 1000,
  });
}

export function useUpdateRPGProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PlayerProfile>) =>
      fetchJson("/api/rpg/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rpg", "profile"] }),
  });
}

export function useRPGStats() {
  return useQuery({
    queryKey: ["rpg", "stats"],
    queryFn: () => fetchJson<PlayerStats>("/api/rpg/stats"),
    staleTime: 30 * 1000,
  });
}

export function useQuests() {
  return useQuery({
    queryKey: ["rpg", "quests"],
    queryFn: () => fetchJson<PlayerQuest[]>("/api/rpg/quests"),
    staleTime: 30 * 1000,
  });
}

export function useClaimQuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questId: string) =>
      fetchJson("/api/rpg/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId, action: "claim" }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rpg", "quests"] });
      qc.invalidateQueries({ queryKey: ["rpg", "profile"] });
      qc.invalidateQueries({ queryKey: ["xp"] });
    },
  });
}

export function useRefreshQuests() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson("/api/rpg/quests", {
        method: "PUT",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rpg", "quests"] }),
  });
}

export function useDungeons() {
  return useQuery({
    queryKey: ["rpg", "dungeons"],
    queryFn: () => fetchJson<{ dungeons: Dungeon[]; activeRuns: DungeonRun[] }>("/api/rpg/dungeons"),
    staleTime: 60 * 1000,
  });
}

export function useStartDungeon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dungeonId: string) =>
      fetchJson("/api/rpg/dungeons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dungeonId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rpg", "dungeons"] }),
  });
}

export function useCompleteDungeon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { runId: string; durationSec: number; bossKilled: boolean }) =>
      fetchJson("/api/rpg/dungeons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rpg", "dungeons"] });
      qc.invalidateQueries({ queryKey: ["rpg", "profile"] });
      qc.invalidateQueries({ queryKey: ["xp"] });
    },
  });
}

export function useShop() {
  return useQuery({
    queryKey: ["rpg", "shop"],
    queryFn: () =>
      fetchJson<{ items: ShopItem[]; inventory: PlayerInventory[] }>("/api/rpg/shop"),
    staleTime: 60 * 1000,
  });
}

export function useBuyItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      fetchJson("/api/rpg/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rpg", "shop"] });
      qc.invalidateQueries({ queryKey: ["rpg", "profile"] });
    },
  });
}

export function useGuild() {
  return useQuery({
    queryKey: ["rpg", "guild"],
    queryFn: () => fetchJson<{ guild: Guild | null; members: GuildMember[]; guilds: Guild[] }>("/api/rpg/guild"),
    staleTime: 30 * 1000,
  });
}

export function useCreateGuild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      fetchJson("/api/rpg/guild", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rpg", "guild"] }),
  });
}

export function useJoinGuild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guildId: string) =>
      fetchJson("/api/rpg/guild", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId, action: "join" }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rpg", "guild"] }),
  });
}

export function useLeaveGuild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson("/api/rpg/guild", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave" }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rpg", "guild"] }),
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ["rpg", "skills"],
    queryFn: () => fetchJson<{ skills: Skill[]; playerSkills: PlayerSkill[] }>("/api/rpg/skills"),
    staleTime: 60 * 1000,
  });
}

export function useUnlockSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) =>
      fetchJson("/api/rpg/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rpg", "skills"] }),
  });
}

export function useToggleSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, isActive }: { skillId: string; isActive: boolean }) =>
      fetchJson("/api/rpg/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId, isActive }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rpg", "skills"] }),
  });
}

export function useBattlePass() {
  return useQuery({
    queryKey: ["rpg", "battle-pass"],
    queryFn: () => fetchJson<{ battlePass: BattlePass; playerProgress: PlayerBattlePass }>("/api/rpg/battle-pass"),
    staleTime: 60 * 1000,
  });
}

export function useClaimBattlePassTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tierNumber: number) =>
      fetchJson("/api/rpg/battle-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierNumber }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rpg", "battle-pass"] });
      qc.invalidateQueries({ queryKey: ["rpg", "profile"] });
    },
  });
}

export function useBuyPremiumBattlePass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson("/api/rpg/battle-pass", {
        method: "PUT",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rpg", "battle-pass"] }),
  });
}

export function useDailyReward() {
  return useQuery({
    queryKey: ["rpg", "daily-reward"],
    queryFn: () => fetchJson<{ claimedDays: PlayerDailyReward[]; currentStreak: number; canClaim: boolean; currentDay: number }>("/api/rpg/daily-reward"),
    staleTime: 60 * 1000,
  });
}

export function useClaimDailyReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson("/api/rpg/daily-reward", {
        method: "POST",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rpg", "daily-reward"] });
      qc.invalidateQueries({ queryKey: ["rpg", "profile"] });
      qc.invalidateQueries({ queryKey: ["xp"] });
    },
  });
}
