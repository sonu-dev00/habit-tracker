import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@habitforge.com" },
    update: {},
    create: {
      email: "admin@habitforge.com",
      name: "Admin",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log("Admin user created:", admin.email);

  await prisma.userHabitData.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  console.log("Creating Stripe products/prices (dev mode)...");
  console.log("Run: stripe products create --name=Pro --description='Pro Plan'");
  console.log("Run: stripe products create --name=Teams --description='Teams Plan'");
  console.log("Run: stripe prices create --product=PRODUCT_ID --unit-amount=900 --currency=usd --recurring=month");
  console.log("Run: stripe prices create --product=PRODUCT_ID --unit-amount=8900 --currency=usd --recurring=year");
  console.log("Run: stripe prices create --product=TEAMS_PRODUCT_ID --unit-amount=2900 --currency=usd --recurring=month");
  console.log("Run: stripe prices create --product=TEAMS_PRODUCT_ID --unit-amount=29900 --currency=usd --recurring=year");

  const featureFlags = [
    { name: "ai_coach", enabled: true, description: "AI-powered habit coaching" },
    { name: "advanced_analytics", enabled: true, description: "Advanced analytics dashboard" },
    { name: "team_challenges", enabled: true, description: "Team-based habit challenges" },
    { name: "weekly_reviews", enabled: true, description: "Weekly review emails" },
    { name: "referrals", enabled: true, description: "Referral program" },
    { name: "pomodoro_timer", enabled: true, description: "Built-in Pomodoro timer" },
    { name: "two_factor_auth", enabled: false, description: "Two-factor authentication" },
    { name: "sso_integration", enabled: false, description: "SSO integration" },
    { name: "api_access", enabled: true, description: "Public API access" },
    { name: "dark_mode", enabled: true, description: "Dark mode support" },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { name: flag.name },
      update: { enabled: flag.enabled, description: flag.description },
      create: flag,
    });
  }
  console.log("Feature flags created:", featureFlags.length);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyChallenges = [
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

  await prisma.dailyChallenge.deleteMany();
  for (const challenge of dailyChallenges) {
    await prisma.dailyChallenge.create({
      data: {
        date: today,
        title: challenge.title,
        description: challenge.description,
        xpReward: challenge.xpReward,
        requirement: challenge.requirement,
        isActive: true,
      },
    });
  }
  console.log("Daily challenges created:", dailyChallenges.length);

  const achievements = [
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

  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: { type: achievement.type },
    });

    if (existing) {
      await prisma.achievement.update({
        where: { id: existing.id },
        data: {
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
        },
      });
    } else {
      await prisma.achievement.create({
        data: {
          userId: admin.id,
          type: achievement.type,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          unlockedAt: new Date(),
        },
      });
    }
  }
  console.log("Sample achievements created:", achievements.length);

  console.log("Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Seed failed:", e);
    prisma.$disconnect();
    process.exit(1);
  });
