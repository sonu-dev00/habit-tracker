import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateLevel } from "@/lib/rpg";

export type Theme = "dark" | "light";
export type WeekStart = "monday" | "sunday";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
    }),
    { name: "habitforge-theme" }
  )
);

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
  setUser: (user: { id: string; name: string | null; email: string | null; image: string | null; role: string | null }) => void;
  updateUser: (updates: Partial<{ name: string; email: string; image: string; role: string }>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      email: null,
      image: null,
      role: null,
      setUser: (user) => set({ ...user }),
      updateUser: (updates) => set((state) => ({ ...state, ...updates })),
      clearUser: () => set({ id: null, name: null, email: null, image: null, role: null }),
    }),
    { name: "habitforge-user" }
  )
);

interface XPState {
  xp: number;
  level: number;
  totalXp: number;
  addXp: (amount: number) => void;
  setLevel: (level: number) => void;
  setXp: (xp: number) => void;
  setTotalXp: (totalXp: number) => void;
  reset: () => void;
}

export const useXPStore = create<XPState>()(
  persist(
    (set) => ({
      xp: 0,
      level: 1,
      totalXp: 0,
      addXp: (amount) =>
        set((state) => {
          const newTotalXp = state.totalXp + amount;
          return {
            xp: state.xp + amount,
            totalXp: newTotalXp,
            level: calculateLevel(newTotalXp),
          };
        }),
      setLevel: (level) => set({ level }),
      setXp: (xp) => set({ xp }),
      setTotalXp: (totalXp) => set({ totalXp, level: calculateLevel(totalXp) }),
      reset: () => set({ xp: 0, level: 1, totalXp: 0 }),
    }),
    { name: "habitforge-xp" }
  )
);

interface SettingsState {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  focusMode: boolean;
  weekStart: WeekStart;
  setSoundEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setFocusMode: (enabled: boolean) => void;
  setWeekStart: (start: WeekStart) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      notificationsEnabled: true,
      focusMode: false,
      weekStart: "monday",
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setFocusMode: (focusMode) => set({ focusMode }),
      setWeekStart: (weekStart) => set({ weekStart }),
    }),
    { name: "habitforge-settings" }
  )
);

interface PomodoroState {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  isRunning: boolean;
  isBreak: boolean;
  remainingTime: number;
  sessionsCompleted: number;
  setWorkDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  setLongBreakDuration: (duration: number) => void;
  setSessionsBeforeLongBreak: (count: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  setIsBreak: (isBreak: boolean) => void;
  setRemainingTime: (time: number) => void;
  incrementSessionsCompleted: () => void;
  resetPomodoro: () => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set) => ({
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      isRunning: false,
      isBreak: false,
      remainingTime: 25 * 60,
      sessionsCompleted: 0,
      setWorkDuration: (workDuration) => set({ workDuration, remainingTime: workDuration * 60 }),
      setBreakDuration: (breakDuration) => set({ breakDuration }),
      setLongBreakDuration: (longBreakDuration) => set({ longBreakDuration }),
      setSessionsBeforeLongBreak: (sessionsBeforeLongBreak) => set({ sessionsBeforeLongBreak }),
      setIsRunning: (isRunning) => set({ isRunning }),
      setIsBreak: (isBreak) => set({ isBreak }),
      setRemainingTime: (remainingTime) => set({ remainingTime }),
      incrementSessionsCompleted: () => set((state) => ({ sessionsCompleted: state.sessionsCompleted + 1 })),
      resetPomodoro: () => set({
        isRunning: false,
        isBreak: false,
        remainingTime: 25 * 60,
        sessionsCompleted: 0,
      }),
    }),
    { name: "habitforge-pomodoro" }
  )
);

interface OnboardingState {
  completed: boolean;
  currentStep: number;
  setCompleted: () => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      currentStep: 0,
      setCompleted: () => set({ completed: true, currentStep: 0 }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      reset: () => set({ completed: false, currentStep: 0 }),
    }),
    { name: "habitforge-onboarding" }
  )
);

interface RPGProfileState {
  rank: string;
  title: string;
  coins: number;
  prestigeLevel: number;
  auraColor: string;
  setProfile: (profile: Partial<RPGProfileState>) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  setRank: (rank: string) => void;
  setTitle: (title: string) => void;
}

export const useRPGProfileStore = create<RPGProfileState>()(
  persist(
    (set, get) => ({
      rank: "E",
      title: "The Unawakened",
      coins: 0,
      prestigeLevel: 0,
      auraColor: "#39ff14",
      setProfile: (profile) => set((s) => ({ ...s, ...profile })),
      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
      spendCoins: (amount) => {
        const state = get();
        if (state.coins >= amount) {
          set({ coins: state.coins - amount });
          return true;
        }
        return false;
      },
      setRank: (rank) => set({ rank }),
      setTitle: (title) => set({ title }),
    }),
    { name: "habitforge-rpg-profile" }
  )
);

interface RPGStatsState {
  strength: number;
  intelligence: number;
  discipline: number;
  focus: number;
  endurance: number;
  charisma: number;
  wisdom: number;
  energy: number;
  setStats: (stats: Partial<RPGStatsState>) => void;
  addStat: (stat: keyof RPGStatsState, amount: number) => void;
}

export const useRPGStatsStore = create<RPGStatsState>()(
  persist(
    (set) => ({
      strength: 1,
      intelligence: 1,
      discipline: 1,
      focus: 1,
      endurance: 1,
      charisma: 1,
      wisdom: 1,
      energy: 100,
      setStats: (stats) => set((s) => ({ ...s, ...stats })),
      addStat: (stat, amount) => set((s) => ({ ...s, [stat]: Math.round(((s as unknown as Record<string, number>)[stat] + amount) * 10) / 10 })),
    }),
    { name: "habitforge-rpg-stats" }
  )
);

let notificationCounter = 0;

interface LevelUpNotification {
  id: string;
  type: "levelup" | "rankup" | "achievement" | "quest" | "dungeon";
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

interface NotificationState {
  notifications: LevelUpNotification[];
  addNotification: (n: Omit<LevelUpNotification, "id">) => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  (set) => ({
    notifications: [],
    addNotification: (n) => set((s) => ({
      notifications: [...s.notifications, { ...n, id: `notif-${++notificationCounter}-${Date.now()}` }],
    })),
    clearNotifications: () => set({ notifications: [] }),
    removeNotification: (id) => set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
  })
);

interface DungeonState {
  isRunning: boolean;
  currentDungeon: string | null;
  remainingTime: number;
  totalDuration: number;
  bossPhase: boolean;
  bossHealth: number;
  startDungeon: (dungeonId: string, durationMin: number) => void;
  tick: () => void;
  completeDungeon: () => void;
  cancelDungeon: () => void;
  damageBoss: (damage: number) => void;
}

export const useDungeonStore = create<DungeonState>()(
  (set, get) => ({
    isRunning: false,
    currentDungeon: null,
    remainingTime: 0,
    totalDuration: 0,
    bossPhase: false,
    bossHealth: 100,
    startDungeon: (dungeonId, durationMin) => set({
      isRunning: true,
      currentDungeon: dungeonId,
      remainingTime: durationMin * 60,
      totalDuration: durationMin * 60,
      bossPhase: false,
      bossHealth: 100,
    }),
    tick: () => {
      const state = get();
      if (!state.isRunning || state.remainingTime <= 0) return;
      const newTime = state.remainingTime - 1;
      const bossPhase = newTime <= state.totalDuration * 0.2;
      set({
        remainingTime: newTime,
        bossPhase,
      });
    },
    completeDungeon: () => set({
      isRunning: false,
      currentDungeon: null,
      remainingTime: 0,
      bossPhase: false,
    }),
    cancelDungeon: () => set({
      isRunning: false,
      currentDungeon: null,
      remainingTime: 0,
      totalDuration: 0,
      bossPhase: false,
      bossHealth: 100,
    }),
    damageBoss: (damage) => set((s) => ({
      bossHealth: Math.max(0, s.bossHealth - damage),
    })),
  })
);
