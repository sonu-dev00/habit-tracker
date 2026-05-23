export interface AchievementDef {
  id: string;
  type: "streak" | "completions" | "xp" | "habits" | "special";
  title: string;
  description: string;
  icon: string;
  threshold: number;
  xpReward: number;
}

export interface AchievementState {
  id: string;
  unlockedAt?: Date;
}

export interface UserStats {
  totalCompletions: number;
  bestStreak: number;
  xpEarned: number;
  totalHabits?: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-habit", type: "habits", title: "First Steps", description: "Create your first habit", icon: "🌱", threshold: 1, xpReward: 10 },
  { id: "habit-5", type: "habits", title: "Getting Started", description: "Create 5 habits", icon: "🌿", threshold: 5, xpReward: 25 },
  { id: "streak-3", type: "streak", title: "Consistent", description: "Reach a 3-day streak", icon: "🔥", threshold: 3, xpReward: 15 },
  { id: "streak-7", type: "streak", title: "Week Warrior", description: "Reach a 7-day streak", icon: "🔥", threshold: 7, xpReward: 50 },
  { id: "streak-14", type: "streak", title: "Two Week Streak", description: "Reach a 14-day streak", icon: "🔥", threshold: 14, xpReward: 100 },
  { id: "streak-30", type: "streak", title: "Monthly Master", description: "Reach a 30-day streak", icon: "🔥", threshold: 30, xpReward: 250 },
  { id: "completions-10", type: "completions", title: "Dedicated", description: "Complete 10 habits", icon: "✅", threshold: 10, xpReward: 20 },
  { id: "completions-50", type: "completions", title: "Half Century", description: "Complete 50 habits", icon: "✅", threshold: 50, xpReward: 75 },
  { id: "completions-100", type: "completions", title: "Century Club", description: "Complete 100 habits", icon: "🏆", threshold: 100, xpReward: 200 },
  { id: "completions-500", type: "completions", title: "Unstoppable", description: "Complete 500 habits", icon: "🏆", threshold: 500, xpReward: 500 },
  { id: "xp-100", type: "xp", title: "Apprentice", description: "Earn 100 XP", icon: "⭐", threshold: 100, xpReward: 10 },
  { id: "xp-1000", type: "xp", title: "Journeyman", description: "Earn 1,000 XP", icon: "⭐", threshold: 1000, xpReward: 50 },
  { id: "xp-5000", type: "xp", title: "Expert", description: "Earn 5,000 XP", icon: "💎", threshold: 5000, xpReward: 200 },
  { id: "xp-10000", type: "xp", title: "Legend", description: "Earn 10,000 XP", icon: "👑", threshold: 10000, xpReward: 500 },
];

export function checkAchievements(
  stats: UserStats,
  existing: AchievementState[]
): AchievementDef[] {
  const earnedIds = new Set(existing.map((e) => e.id));

  return ACHIEVEMENTS.filter((a) => {
    if (earnedIds.has(a.id)) return false;
    switch (a.type) {
      case "habits":
        return (stats.totalHabits ?? 0) >= a.threshold;
      case "streak":
        return stats.bestStreak >= a.threshold;
      case "completions":
        return stats.totalCompletions >= a.threshold;
      case "xp":
        return stats.xpEarned >= a.threshold;
      default:
        return false;
    }
  });
}
