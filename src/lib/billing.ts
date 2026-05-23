export interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  teams: boolean | string;
}

export const PLANS = [
  { id: "FREE", name: "Free", price: 0, priceLabel: "Free", popular: false },
  { id: "PRO", name: "Pro", price: 999, priceLabel: "$9.99/mo", popular: true },
  { id: "TEAMS", name: "Teams", price: 2499, priceLabel: "$24.99/mo", popular: false },
];

export const FEATURES: PlanFeature[] = [
  { name: "Habits", free: "Up to 5", pro: "Unlimited", teams: "Unlimited" },
  { name: "Streak Tracking", free: true, pro: true, teams: true },
  { name: "Basic Analytics", free: true, pro: true, teams: true },
  { name: "Pomodoro Timer", free: true, pro: true, teams: true },
  { name: "AI Coach Chat", free: "10 msg/day", pro: "Unlimited", teams: "Unlimited" },
  { name: "Advanced Analytics", free: false, pro: true, teams: true },
  { name: "Achievements", free: true, pro: true, teams: true },
  { name: "Habit Templates", free: true, pro: true, teams: true },
  { name: "Custom Reminders", free: false, pro: true, teams: true },
  { name: "Export Data", free: false, pro: true, teams: true },
  { name: "Team Dashboard", free: false, pro: false, teams: true },
  { name: "Priority Support", free: false, pro: true, teams: true },
  { name: "AI Batch Operations", free: false, pro: false, teams: true },
];
