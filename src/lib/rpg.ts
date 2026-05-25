export type PlayerRank = "E" | "D" | "C" | "B" | "A" | "S" | "NATIONAL" | "MONARCH";
export type StatName = "strength" | "intelligence" | "discipline" | "focus" | "endurance" | "charisma" | "wisdom" | "energy";
export type CategoryStat = { category: string; stat: StatName; multiplier: number };

export interface LevelDef {
  level: number;
  xpRequired: number;
  title: string;
}

export interface RankDef {
  rank: PlayerRank;
  minLevel: number;
  minXp: number;
  minStreak: number;
  minCompletions: number;
  title: string;
  color: string;
  glowColor: string;
}

export const STAT_CATEGORY_MAP: CategoryStat[] = [
  { category: "FITNESS", stat: "strength", multiplier: 1 },
  { category: "HEALTH", stat: "endurance", multiplier: 1 },
  { category: "LEARNING", stat: "intelligence", multiplier: 1 },
  { category: "MIND", stat: "focus", multiplier: 1 },
  { category: "WORK", stat: "discipline", multiplier: 1 },
  { category: "SOCIAL", stat: "charisma", multiplier: 1 },
  { category: "SPIRITUAL", stat: "wisdom", multiplier: 1 },
  { category: "CREATIVE", stat: "wisdom", multiplier: 0.5 },
  { category: "FINANCE", stat: "intelligence", multiplier: 0.5 },
  { category: "OTHER", stat: "discipline", multiplier: 0.3 },
];

export const LEVELS: LevelDef[] = [
  { level: 1, xpRequired: 0, title: getLevelTitle(1) },
  ...Array.from({ length: 99 }, (_, i) => ({
    level: i + 2,
    xpRequired: Math.floor(100 * Math.pow(i + 2, 1.5)),
    title: getLevelTitle(i + 2),
  })),
];

export const RANKS: RankDef[] = [
  { rank: "E", minLevel: 1, minXp: 0, minStreak: 0, minCompletions: 0, title: "E-Rank Hunter", color: "#9ca3af", glowColor: "rgba(156,163,175,0.5)" },
  { rank: "D", minLevel: 5, minXp: 1500, minStreak: 3, minCompletions: 25, title: "D-Rank Hunter", color: "#22c55e", glowColor: "rgba(34,197,94,0.5)" },
  { rank: "C", minLevel: 10, minXp: 5000, minStreak: 7, minCompletions: 100, title: "C-Rank Hunter", color: "#3b82f6", glowColor: "rgba(59,130,246,0.5)" },
  { rank: "B", minLevel: 20, minXp: 20000, minStreak: 14, minCompletions: 500, title: "B-Rank Hunter", color: "#a855f7", glowColor: "rgba(168,85,247,0.5)" },
  { rank: "A", minLevel: 35, minXp: 75000, minStreak: 30, minCompletions: 2000, title: "A-Rank Hunter", color: "#f59e0b", glowColor: "rgba(245,158,11,0.5)" },
  { rank: "S", minLevel: 50, minXp: 200000, minStreak: 60, minCompletions: 5000, title: "S-Rank Hunter", color: "#ef4444", glowColor: "rgba(239,68,68,0.5)" },
  { rank: "NATIONAL", minLevel: 75, minXp: 500000, minStreak: 100, minCompletions: 15000, title: "National-Level Hunter", color: "#39ff14", glowColor: "rgba(57,255,20,0.5)" },
  { rank: "MONARCH", minLevel: 90, minXp: 1000000, minStreak: 200, minCompletions: 50000, title: "Shadow Monarch", color: "#ff00ff", glowColor: "rgba(255,0,255,0.6)" },
];

export const STAT_LABELS: Record<StatName, { label: string; icon: string; color: string }> = {
  strength: { label: "Strength", icon: "dumbbell", color: "#ef4444" },
  intelligence: { label: "Intelligence", icon: "brain", color: "#3b82f6" },
  discipline: { label: "Discipline", icon: "target", color: "#f59e0b" },
  focus: { label: "Focus", icon: "eye", color: "#8b5cf6" },
  endurance: { label: "Endurance", icon: "heart", color: "#22c55e" },
  charisma: { label: "Charisma", icon: "users", color: "#ec4899" },
  wisdom: { label: "Wisdom", icon: "book-open", color: "#06b6d4" },
  energy: { label: "Energy", icon: "zap", color: "#39ff14" },
};

export const TITLES: Record<string, { title: string; description: string; requirement: string }> = {
  "The Unawakened": { title: "The Unawakened", description: "Beginning of the journey", requirement: "Start your path" },
  "The Awakened": { title: "The Awakened", description: "You have opened your eyes", requirement: "Reach Level 2" },
  "The Consistent": { title: "The Consistent", description: "Discipline is your weapon", requirement: "Reach Level 5" },
  "The Dedicated": { title: "The Dedicated", description: "No obstacle can stop you", requirement: "Reach Level 10" },
  "The Unstoppable": { title: "The Unstoppable", description: "Momentum is your ally", requirement: "Reach Level 20" },
  "Iron Will": { title: "Iron Will", description: "Your resolve is unbreakable", requirement: "Reach Level 30" },
  "Discipline Beast": { title: "Discipline Beast", description: "Habits are your nature", requirement: "Reach Level 40" },
  "Mind of Steel": { title: "Mind of Steel", description: "Mental fortitude incarnate", requirement: "Reach Level 50" },
  "Shadow Monarch": { title: "Shadow Monarch", description: "You command the darkness", requirement: "Reach Monarch Rank" },
  "The Legendary": { title: "The Legendary", description: "Your name echoes through time", requirement: "Reach Level 75" },
  "Habit Forger": { title: "Habit Forger", description: "You shape reality through routine", requirement: "Reach Level 100" },
  "The Beginner": { title: "The Beginner", description: "Every master was once a beginner", requirement: "Complete your first habit" },
};

export function getLevelTitle(level: number): string {
  if (level >= 100) return "Habit Forger";
  if (level >= 75) return "The Legendary";
  if (level >= 50) return "Mind of Steel";
  if (level >= 40) return "Discipline Beast";
  if (level >= 30) return "Iron Will";
  if (level >= 20) return "The Unstoppable";
  if (level >= 10) return "The Dedicated";
  if (level >= 5) return "The Consistent";
  if (level >= 2) return "The Awakened";
  return "The Unawakened";
}

export function calculateLevel(totalXp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].xpRequired) return LEVELS[i].level;
  }
  return 1;
}

export function getXpForLevel(level: number): number {
  const def = LEVELS.find((l) => l.level === level);
  return def?.xpRequired ?? 0;
}

export function getXpProgress(totalXp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progress: number; title: string } {
  const level = calculateLevel(totalXp);
  const currentLevelDef = LEVELS.find((l) => l.level === level)!;
  const nextLevel = Math.min(level + 1, 100);
  const nextLevelDef = LEVELS.find((l) => l.level === nextLevel)!;
  const currentLevelXp = currentLevelDef.xpRequired;
  const nextLevelXp = nextLevel === level ? currentLevelXp : nextLevelDef.xpRequired;
  const xpInLevel = totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progress = level >= 100 ? 100 : Math.min(100, Math.round((xpInLevel / (xpNeeded || 1)) * 100));
  return { level, currentLevelXp, nextLevelXp, progress, title: currentLevelDef.title };
}

export function calculateRank(params: { level: number; totalXp: number; bestStreak: number; totalCompletions: number }): { rank: PlayerRank; rankDef: RankDef } {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    const r = RANKS[i];
    if (
      params.level >= r.minLevel &&
      params.totalXp >= r.minXp &&
      params.bestStreak >= r.minStreak &&
      params.totalCompletions >= r.minCompletions
    ) {
      return { rank: r.rank, rankDef: r };
    }
  }
  return { rank: "E", rankDef: RANKS[0] };
}

export function calculateXpFromHabit(xpReward: number, streak: number, priorityMultiplier: number): number {
  const baseXp = xpReward * priorityMultiplier;
  const streakBonus = Math.min(streak * 2, 50);
  const bonus = Math.floor(baseXp * (streakBonus / 100));
  return baseXp + bonus;
}

export function calculateCoinsFromHabit(xpEarned: number): number {
  return Math.max(1, Math.floor(xpEarned / 5));
}

export function calculateStatIncrease(category: string): number {
  const mapping = STAT_CATEGORY_MAP.find((m) => m.category === category);
  if (!mapping) return 0;
  const base = mapping.multiplier;
  const randomFactor = 0.5 + Math.random() * 0.5;
  const gain = Math.max(0.1, base * randomFactor);
  return Math.round(gain * 10) / 10;
}

export function getLevelUpXpBonus(level: number): number {
  return level * 10;
}

export const DAILY_REWARDS = [
  { day: 1, coins: 10, xp: 50 },
  { day: 2, coins: 15, xp: 75 },
  { day: 3, coins: 20, xp: 100 },
  { day: 4, coins: 25, xp: 125 },
  { day: 5, coins: 50, xp: 200 },
  { day: 6, coins: 75, xp: 300 },
  { day: 7, coins: 100, xp: 500 },
];
