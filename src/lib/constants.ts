import type { NavItem, SiteConfig, PricingPlan, FAQItem, Testimonial, Stats, HabitCategory, HabitPriority, HabitFrequency } from "@/types";

export const CATEGORIES: { value: HabitCategory; label: string; emoji: string; description: string }[] = [
  { value: "HEALTH", label: "Health", emoji: "🏥", description: "Physical health and wellness" },
  { value: "FITNESS", label: "Fitness", emoji: "💪", description: "Exercise and physical activity" },
  { value: "MIND", label: "Mind", emoji: "🧠", description: "Mental health and mindfulness" },
  { value: "WORK", label: "Work", emoji: "💼", description: "Career and productivity" },
  { value: "LEARNING", label: "Learning", emoji: "📚", description: "Education and skill development" },
  { value: "SOCIAL", label: "Social", emoji: "🤝", description: "Social connections and community" },
  { value: "FINANCE", label: "Finance", emoji: "💰", description: "Financial health and planning" },
  { value: "CREATIVE", label: "Creative", emoji: "🎨", description: "Creative expression and hobbies" },
  { value: "SPIRITUAL", label: "Spiritual", emoji: "🕯️", description: "Spiritual growth and reflection" },
  { value: "OTHER", label: "Other", emoji: "📌", description: "Miscellaneous habits" },
];

export const PRIORITIES: { value: HabitPriority; label: string; color: string; xpMultiplier: number }[] = [
  { value: "ESSENTIAL", label: "Essential", color: "text-red-500", xpMultiplier: 2 },
  { value: "IMPORTANT", label: "Important", color: "text-orange-500", xpMultiplier: 1.5 },
  { value: "NORMAL", label: "Normal", color: "text-blue-500", xpMultiplier: 1 },
  { value: "BONUS", label: "Bonus", color: "text-green-500", xpMultiplier: 0.5 },
];

export const FREQUENCIES: { value: HabitFrequency; label: string; icon: string }[] = [
  { value: "DAILY", label: "Daily", icon: "calendar" },
  { value: "WEEKLY", label: "Weekly", icon: "calendar-range" },
  { value: "MONTHLY", label: "Monthly", icon: "calendar-days" },
];

export const LEVELS: { level: number; xpRequired: number; title: string }[] = [
  { level: 1, xpRequired: 0, title: "Beginner" },
  { level: 2, xpRequired: 100, title: "Apprentice" },
  { level: 3, xpRequired: 250, title: "Consistent" },
  { level: 4, xpRequired: 500, title: "Dedicated" },
  { level: 5, xpRequired: 1000, title: "Disciplined" },
  { level: 6, xpRequired: 2000, title: "Habit Master" },
  { level: 7, xpRequired: 3500, title: "Iron Will" },
  { level: 8, xpRequired: 5000, title: "Unstoppable" },
  { level: 9, xpRequired: 7500, title: "Legendary" },
  { level: 10, xpRequired: 10000, title: "Habit Forger" },
];

export const ACHIEVEMENTS = [
  { type: "first_habit", title: "First Step", description: "Create your first habit", icon: "🌱", xpReward: 10 },
  { type: "seven_day_streak", title: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", xpReward: 50 },
  { type: "thirty_day_streak", title: "Monthly Master", description: "Maintain a 30-day streak", icon: "💎", xpReward: 200 },
  { type: "hundred_completions", title: "Century Club", description: "Complete 100 habits", icon: "🏆", xpReward: 100 },
  { type: "thousand_completions", title: "The Millennial", description: "Complete 1000 habits", icon: "👑", xpReward: 500 },
  { type: "five_categories", title: "Well Rounded", description: "Have habits in 5 categories", icon: "🎯", xpReward: 50 },
  { type: "all_categories", title: "Renaissance Soul", description: "Have habits in all categories", icon: "🌟", xpReward: 200 },
  { type: "early_bird", title: "Early Bird", description: "Complete a habit before 7 AM", icon: "🌅", xpReward: 25 },
  { type: "night_owl", title: "Night Owl", description: "Complete a habit after 11 PM", icon: "🦉", xpReward: 25 },
  { type: "perfect_week", title: "Perfect Week", description: "Complete all daily habits for a week", icon: "📅", xpReward: 100 },
  { type: "comeback_king", title: "Comeback King", description: "Regain a lost streak of 7+ days", icon: "🦁", xpReward: 75 },
  { type: "pro_member", title: "Pro Member", description: "Subscribe to Pro plan", icon: "⭐", xpReward: 100 },
];

export const DAILY_CHALLENGES = [
  { title: "Morning Stretch", description: "Start your day with a 5-minute stretch", xpReward: 15, requirement: { category: "FITNESS", minMinutes: 5 } },
  { title: "Read 10 Pages", description: "Read at least 10 pages of a book", xpReward: 15, requirement: { category: "LEARNING", minMinutes: 10 } },
  { title: "Drink 8 Glasses", description: "Drink 8 glasses of water today", xpReward: 10, requirement: { category: "HEALTH" } },
  { title: "No Social Media", description: "Avoid social media for 2 hours before bed", xpReward: 20, requirement: { category: "MIND", minMinutes: 120 } },
  { title: "Walk 10k Steps", description: "Walk 10,000 steps today", xpReward: 20, requirement: { category: "FITNESS", target: 10000 } },
  { title: "Meditate 10min", description: "Meditate for 10 minutes", xpReward: 15, requirement: { category: "MIND", minMinutes: 10 } },
  { title: "Journal Entry", description: "Write a journal entry about your day", xpReward: 10, requirement: { category: "MIND" } },
  { title: "Learn Something New", description: "Spend 15 minutes learning a new skill", xpReward: 15, requirement: { category: "LEARNING", minMinutes: 15 } },
  { title: "Call a Friend", description: "Call or message a friend you haven't talked to recently", xpReward: 15, requirement: { category: "SOCIAL" } },
  { title: "Save $5", description: "Put $5 into your savings", xpReward: 10, requirement: { category: "FINANCE" } },
];

export const SITE_CONFIG: SiteConfig = {
  name: "HabitForge",
  description: "Build better habits with AI-powered coaching, tracking, and gamification.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://habitforge.com",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/habitforge",
    github: "https://github.com/habitforge",
  },
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", requiresAuth: true },
  { title: "Habits", href: "/habits", requiresAuth: true },
  { title: "Analytics", href: "/analytics", requiresAuth: true, requiresPro: true },
  { title: "AI Coach", href: "/ai-coach", requiresAuth: true },
  { title: "Leaderboard", href: "/leaderboard", requiresAuth: true },
  { title: "Settings", href: "/settings", requiresAuth: true },
  { title: "Admin", href: "/admin", requiresAuth: true, requiresAdmin: true },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Free",
    id: "free",
    price: 0,
    description: "Get started with basic habit tracking",
    features: [
      "Up to 5 habits",
      "Basic tracking",
      "Daily streaks",
      "Achievement badges",
      "7-day history",
    ],
  },
  {
    name: "Pro",
    id: "pro",
    price: 9,
    yearlyPrice: 89,
    description: "Advanced features for serious habit builders",
    features: [
      "Unlimited habits",
      "AI coaching & motivation",
      "Advanced analytics",
      "Unlimited history",
      "Custom reminders",
      "Priority support",
      "Export data",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Teams",
    id: "teams",
    price: 29,
    yearlyPrice: 299,
    description: "Build habits together with your team",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Team challenges",
      "Shared analytics",
      "Admin dashboard",
      "API access",
      "SSO integration",
    ],
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is HabitForge?",
    answer: "HabitForge is an AI-powered habit tracking platform that helps you build and maintain positive habits through gamification, personalized coaching, and accountability features.",
    category: "general",
  },
  {
    question: "How does the AI coaching work?",
    answer: "Our AI analyzes your habit patterns, streaks, and progress to provide personalized motivation, suggestions, and weekly reviews. It adapts to your unique habits and goals.",
    category: "features",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-standard encryption for all data. Your habit data is private and never shared without your explicit consent. We are GDPR and CCPA compliant.",
    category: "security",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time from your account settings. Your data will remain accessible until the end of your billing period.",
    category: "billing",
  },
  {
    question: "What happens to my data if I downgrade?",
    answer: "Your data is preserved, but you'll be limited to the Free plan features (5 habits, 7-day history). Upgrading again will restore full access.",
    category: "billing",
  },
  {
    question: "How are XP and levels calculated?",
    answer: "XP is earned by completing habits. Each habit has a base XP reward (1-100) multiplied by priority level. Level thresholds increase progressively.",
    category: "features",
  },
  {
    question: "Can I use HabitForge with my team?",
    answer: "Yes! Our Teams plan supports up to 10 members with shared challenges, team analytics, and an admin dashboard for tracking group progress.",
    category: "teams",
  },
  {
    question: "Do you offer a student discount?",
    answer: "Yes, students can get 50% off the Pro plan with a valid .edu email address. Contact our support team for verification.",
    category: "billing",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    avatar: "/testimonials/sarah.jpg",
    content: "HabitForge completely transformed my daily routine. The AI coach keeps me motivated, and the streak system makes me never want to break my chain.",
    rating: 5,
  },
  {
    name: "Marcus Chen",
    role: "Entrepreneur",
    avatar: "/testimonials/marcus.jpg",
    content: "I've tried countless habit trackers, but HabitForge is different. The gamification and analytics helped me understand my patterns and improve consistently.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Student",
    avatar: "/testimonials/emily.jpg",
    content: "The team challenges feature helped my study group stay accountable. We've maintained a 30-day streak and our grades have never been better!",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Fitness Coach",
    avatar: "/testimonials/david.jpg",
    content: "I recommend HabitForge to all my clients. The habit categorization and weekly reviews provide insights that help them stay on track with their fitness goals.",
    rating: 4,
  },
  {
    name: "Lisa Thompson",
    role: "Writer",
    avatar: "/testimonials/lisa.jpg",
    content: "HabitForge helped me establish a consistent writing routine. From 0 to 2000 words daily - the progress tracking was a game changer.",
    rating: 5,
  },
];

export const STATS: Stats = {
  totalUsers: 50000,
  totalHabits: 500000,
  totalCompletions: 5000000,
  activeSubscriptions: 10000,
  averageStreak: 12,
  totalXpEarned: 25000000,
};

export const PLATFORM_FEE = 0.3;

export const APP_NAME = "HabitForge";
export const APP_DESCRIPTION = "Build better habits with AI-powered coaching";
export const APP_TAGLINE = "Forge Your Best Self";
export const SUPPORT_EMAIL = "support@habitforge.com";
