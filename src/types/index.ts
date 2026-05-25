import type { DefaultSession } from "next-auth";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: "USER" | "ADMIN";
  stripeCustomerId: string | null;
  twoFactorEnabled: boolean;
  banned: boolean;
  banReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PlayerRank = "E" | "D" | "C" | "B" | "A" | "S" | "NATIONAL" | "MONARCH";
export type StatName = "strength" | "intelligence" | "discipline" | "focus" | "endurance" | "charisma" | "wisdom" | "energy";
export type QuestType = "DAILY" | "WEEKLY" | "MAIN" | "SIDE" | "HIDDEN" | "BOSS";
export type QuestStatus = "ACTIVE" | "COMPLETED" | "FAILED" | "CLAIMED";
export type DungeonType = "DEEP_WORK" | "STUDY" | "FITNESS" | "MONK_MODE" | "CUSTOM";
export type DungeonDifficulty = "NORMAL" | "HARD" | "EXTREME" | "HELL";
export type ItemRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
export type ItemType = "COSMETIC" | "BOOSTER" | "THEME" | "AVATAR" | "SKILL_BOOK" | "TITLE" | "CONSUMABLE";
export type GuildRole = "MEMBER" | "OFFICER" | "LEADER";
export type SkillType = "PASSIVE" | "ACTIVE" | "ULTIMATE";
export type BattlePassTier = "FREE" | "PREMIUM";

export interface PlayerProfile {
  id: string;
  userId: string;
  title: string;
  rank: PlayerRank;
  totalXp: number;
  coins: number;
  prestigeLevel: number;
  totalQuestsDone: number;
  dungeonsCleared: number;
  monstersDefeated: number;
  auraColor: string;
}

export interface PlayerStats {
  strength: number;
  intelligence: number;
  discipline: number;
  focus: number;
  endurance: number;
  charisma: number;
  wisdom: number;
  energy: number;
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  requirements: Record<string, unknown>;
  xpReward: number;
  coinReward: number;
  statRewards: Record<string, number> | null;
  itemReward: string | null;
  unlocksTitle: string | null;
  isActive: boolean;
  expiresAt: string | null;
}

export interface PlayerQuest {
  id: string;
  userId: string;
  questId: string;
  status: QuestStatus;
  progress: number;
  target: number;
  claimedAt: string | null;
  quest: Quest;
}

export interface Dungeon {
  id: string;
  type: DungeonType;
  difficulty: DungeonDifficulty;
  name: string;
  description: string;
  durationMin: number;
  xpReward: number;
  coinReward: number;
  statReward: string | null;
  requiredLevel: number;
}

export interface DungeonRun {
  id: string;
  userId: string;
  dungeonId: string;
  completed: boolean;
  durationSec: number;
  xpEarned: number;
  coinEarned: number;
  bossKilled: boolean;
  startedAt: string;
  completedAt: string | null;
  dungeon: Dungeon;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  price: number;
  effect: Record<string, unknown> | null;
  isLimited: boolean;
}

export interface PlayerInventory {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  isEquipped: boolean;
  acquiredAt: string;
  item: ShopItem;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  level: number;
  xp: number;
  requiredRank: PlayerRank;
  memberCount?: number;
}

export interface GuildMember {
  id: string;
  guildId: string;
  userId: string;
  role: GuildRole;
  joinedAt: string;
  user?: { name: string | null; image: string | null };
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  effect: Record<string, unknown>;
  requiredLevel: number;
  requiredRank: PlayerRank;
  price: number;
  icon: string;
}

export interface PlayerSkill {
  id: string;
  userId: string;
  skillId: string;
  level: number;
  isActive: boolean;
  skill: Skill;
}

export interface BattlePass {
  id: string;
  season: number;
  name: string;
  startDate: string;
  endDate: string;
  tiers: BattlePassTierDef[];
}

export interface BattlePassTierReward {
  label: string;
  description?: string;
  icon?: string;
}

export interface BattlePassTierDef {
  id: string;
  seasonId: string;
  tier: number;
  xpRequired: number;
  freeReward: BattlePassTierReward | null;
  premiumReward: BattlePassTierReward | null;
}

export interface PlayerBattlePass {
  id: string;
  userId: string;
  battlePassId: string;
  tier: BattlePassTier;
  level: number;
  xp: number;
  claimedTiers: number[];
}

export interface PlayerDailyReward {
  day: number;
  claimed: boolean;
}

export interface PlayerEvolution {
  path: string;
  stage: number;
}

export type HabitCategory = "HEALTH" | "FITNESS" | "MIND" | "WORK" | "LEARNING" | "SOCIAL" | "FINANCE" | "CREATIVE" | "SPIRITUAL" | "OTHER";
export type HabitPriority = "ESSENTIAL" | "IMPORTANT" | "NORMAL" | "BONUS";
export type HabitFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: HabitCategory;
  priority: HabitPriority;
  frequency: HabitFrequency;
  xpReward: number;
  timeToComplete: number;
  reminderTime: string | null;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[];
  userHabitData?: UserHabitData;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: Date;
  completedAt: Date;
  notes: string | null;
}

export interface UserHabitData {
  id: string;
  userId: string;
  streak: number;
  bestStreak: number;
  totalCompletions: number;
  xp: number;
  lastCompletionDate: Date | null;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  plan: "FREE" | "PRO" | "TEAMS";
  status: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
  xp: number;
  level: number;
  xpToNextLevel: number;
  habitBreakdown: { category: string; count: number; completions: number }[];
  weeklyCompletions: { date: string; count: number }[];
  completionRate: number;
  totalHabits: number;
  activeHabits: number;
  averagePerDay: number;
}

export interface Achievement {
  id: string;
  habitId: string | null;
  userId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt: Date | null;
}

export interface DailyChallenge {
  id: string;
  date: Date;
  title: string;
  description: string;
  xpReward: number;
  requirement: Record<string, unknown>;
  isActive: boolean;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
  };
}

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
  requiresPro?: boolean;
  requiresAdmin?: boolean;
  children?: NavItem[];
}

export interface PricingPlan {
  name: string;
  id: string;
  price: number;
  yearlyPrice?: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

export interface Stats {
  totalUsers: number;
  totalHabits: number;
  totalCompletions: number;
  activeSubscriptions: number;
  averageStreak: number;
  totalXpEarned: number;
}

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}



