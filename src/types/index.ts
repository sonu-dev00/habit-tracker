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
  requirement: Record<string, any>;
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



