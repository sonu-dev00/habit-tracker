import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      theme: "light",
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

function calculateLevel(totalXp: number): number {
  if (totalXp >= 10000) return 10;
  if (totalXp >= 7500) return 9;
  if (totalXp >= 5000) return 8;
  if (totalXp >= 3500) return 7;
  if (totalXp >= 2000) return 6;
  if (totalXp >= 1000) return 5;
  if (totalXp >= 500) return 4;
  if (totalXp >= 250) return 3;
  if (totalXp >= 100) return 2;
  return 1;
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
