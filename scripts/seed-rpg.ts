import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const QUESTS = [
  { type: "DAILY" as const, title: "Morning Routine", description: "Complete 3 habits before noon", xpReward: 50, coinReward: 10, target: 3 },
  { type: "DAILY" as const, title: "Fitness Challenge", description: "Complete a fitness habit", xpReward: 40, coinReward: 8, target: 1 },
  { type: "DAILY" as const, title: "Mind Sharpener", description: "Complete a learning habit", xpReward: 35, coinReward: 7, target: 1 },
  { type: "DAILY" as const, title: "Deep Work Session", description: "Complete a work habit", xpReward: 45, coinReward: 9, target: 1 },
  { type: "DAILY" as const, title: "Evening Wind-Down", description: "Complete a mind/spiritual habit after 6PM", xpReward: 30, coinReward: 6, target: 1 },
  { type: "WEEKLY" as const, title: "Perfect Week", description: "Complete habits every day for 7 days", xpReward: 500, coinReward: 100, target: 7 },
  { type: "WEEKLY" as const, title: "Fitness Warrior", description: "Complete 5 fitness habits this week", xpReward: 250, coinReward: 50, target: 5 },
  { type: "WEEKLY" as const, title: "Scholar's Path", description: "Complete 5 learning habits this week", xpReward: 250, coinReward: 50, target: 5 },
  { type: "WEEKLY" as const, title: "Social Butterfly", description: "Complete 3 social habits this week", xpReward: 150, coinReward: 30, target: 3 },
  { type: "WEEKLY" as const, title: "Money Mindset", description: "Complete 3 finance habits this week", xpReward: 200, coinReward: 40, target: 3 },
  { type: "MAIN" as const, title: "The Awakening", description: "Create your first 5 habits", xpReward: 100, coinReward: 20, target: 5, unlocksTitle: "The Awakened" },
  { type: "MAIN" as const, title: "Path of Consistency", description: "Reach a 7-day streak", xpReward: 200, coinReward: 50, target: 7, unlocksTitle: "The Consistent" },
  { type: "MAIN" as const, title: "The Dedicated Path", description: "Reach Level 10", xpReward: 500, coinReward: 100, target: 10, unlocksTitle: "The Dedicated" },
  { type: "MAIN" as const, title: "Unstoppable Force", description: "Reach Level 20", xpReward: 1000, coinReward: 200, target: 20, unlocksTitle: "The Unstoppable" },
  { type: "MAIN" as const, title: "Iron Will Testament", description: "Reach 1000 total completions", xpReward: 2000, coinReward: 500, target: 1000 },
  { type: "SIDE" as const, title: "Early Bird", description: "Complete a habit before 6AM", xpReward: 75, coinReward: 15, target: 1 },
  { type: "SIDE" as const, title: "Night Owl", description: "Complete a habit after 11PM", xpReward: 75, coinReward: 15, target: 1 },
  { type: "SIDE" as const, title: "Variety Master", description: "Complete habits in 5 different categories", xpReward: 100, coinReward: 20, target: 5 },
  { type: "HIDDEN" as const, title: "???", description: "Complete a dungeon run", xpReward: 200, coinReward: 50, target: 1 },
  { type: "HIDDEN" as const, title: "???", description: "Reach S-Rank", xpReward: 5000, coinReward: 1000, target: 1 },
  { type: "BOSS" as const, title: "The Final Boss", description: "Complete 10,000 habits total", xpReward: 10000, coinReward: 5000, target: 10000 },
  { type: "BOSS" as const, title: "Shadow Monarch", description: "Reach Monarch Rank", xpReward: 50000, coinReward: 10000, target: 1, unlocksTitle: "Shadow Monarch" },
];

const DUNGEONS = [
  { type: "DEEP_WORK" as const, difficulty: "NORMAL" as const, name: "Deep Work Dungeon", description: "Enter the realm of deep focus. Complete 25 minutes of uninterrupted work.", durationMin: 25, xpReward: 100, coinReward: 20, requiredLevel: 1 },
  { type: "DEEP_WORK" as const, difficulty: "HARD" as const, name: "Deep Work Citadel", description: "A grueling 45-minute deep work session. Only the focused survive.", durationMin: 45, xpReward: 200, coinReward: 40, requiredLevel: 5 },
  { type: "DEEP_WORK" as const, difficulty: "EXTREME" as const, name: "Deep Work Fortress", description: "90 minutes of pure concentration. The ultimate focus test.", durationMin: 90, xpReward: 500, coinReward: 100, requiredLevel: 15 },
  { type: "STUDY" as const, difficulty: "NORMAL" as const, name: "Study Sanctum", description: "A calm 25-minute study session to absorb knowledge.", durationMin: 25, xpReward: 80, coinReward: 15, requiredLevel: 1 },
  { type: "STUDY" as const, difficulty: "HARD" as const, name: "Study Tower", description: "60 minutes of intense studying. Knowledge awaits.", durationMin: 60, xpReward: 250, coinReward: 50, requiredLevel: 8 },
  { type: "FITNESS" as const, difficulty: "NORMAL" as const, name: "Fitness Dungeon", description: "A 20-minute workout challenge. Push your limits.", durationMin: 20, xpReward: 120, coinReward: 25, requiredLevel: 1 },
  { type: "FITNESS" as const, difficulty: "HARD" as const, name: "Fitness Trial Grounds", description: "45 minutes of intense physical training.", durationMin: 45, xpReward: 300, coinReward: 60, requiredLevel: 10 },
  { type: "FITNESS" as const, difficulty: "EXTREME" as const, name: "Fitness Hell Dungeon", description: "60 minutes of extreme workout. Only the strong survive.", durationMin: 60, xpReward: 500, coinReward: 100, requiredLevel: 20 },
  { type: "MONK_MODE" as const, difficulty: "HELL" as const, name: "Monk Mode Dungeon", description: "120 minutes of complete focus. No distractions. Pure discipline.", durationMin: 120, xpReward: 1000, coinReward: 200, requiredLevel: 30 },
  { type: "MONK_MODE" as const, difficulty: "NORMAL" as const, name: "Digital Detox Dungeon", description: "30 minutes without any digital distractions.", durationMin: 30, xpReward: 150, coinReward: 30, requiredLevel: 3 },
];

const SHOP_ITEMS = [
  { name: "Neon Green Aura", description: "A vibrant neon green aura effect", type: "COSMETIC" as const, rarity: "RARE" as const, price: 500 },
  { name: "Shadow Aura", description: "Dark purple shadow aura effect", type: "COSMETIC" as const, rarity: "EPIC" as const, price: 1000 },
  { name: "Crimson Aura", description: "Fiery red aura effect", type: "COSMETIC" as const, rarity: "RARE" as const, price: 750 },
  { name: "Royal Blue Theme", description: "Royal blue dashboard theme", type: "THEME" as const, rarity: "UNCOMMON" as const, price: 300 },
  { name: "Shadow Monarch Theme", description: "Dark sovereign theme", type: "THEME" as const, rarity: "EPIC" as const, price: 1500 },
  { name: "XP Booster (1hr)", description: "Double XP for 1 hour", type: "CONSUMABLE" as const, rarity: "UNCOMMON" as const, price: 100 },
  { name: "XP Booster (24hr)", description: "Double XP for 24 hours", type: "CONSUMABLE" as const, rarity: "RARE" as const, price: 500 },
  { name: "Coin Magnet (24hr)", description: "Double coins for 24 hours", type: "CONSUMABLE" as const, rarity: "RARE" as const, price: 400 },
  { name: "Streak Shield", description: "Protects your streak once", type: "CONSUMABLE" as const, rarity: "EPIC" as const, price: 300 },
  { name: "Shadow Monarch Title", description: "Equip the legendary Shadow Monarch title", type: "TITLE" as const, rarity: "LEGENDARY" as const, price: 5000 },
  { name: "Habit Forger Avatar", description: "Custom avatar frame", type: "AVATAR" as const, rarity: "EPIC" as const, price: 2000 },
  { name: "Skill: Focus Surge", description: "Learn the Focus Surge skill", type: "SKILL_BOOK" as const, rarity: "RARE" as const, price: 800 },
  { name: "Skill: Double Strike", description: "Learn the Double Strike skill", type: "SKILL_BOOK" as const, rarity: "EPIC" as const, price: 1500 },
  { name: "Skill: Time Warp", description: "Learn the Time Warp skill", type: "SKILL_BOOK" as const, rarity: "LEGENDARY" as const, price: 5000 },
];

const SKILLS = [
  { name: "Focus Surge", description: "Increase focus stat by 50% for 30 minutes after completing a dungeon", type: "PASSIVE" as const, effect: { stat: "focus", multiplier: 1.5, duration: 30 }, requiredLevel: 5, requiredRank: "D" as const, price: 0, icon: "eye" },
  { name: "Double Strike", description: "Double XP for the next 5 habit completions", type: "ACTIVE" as const, effect: { type: "xp_multiplier", multiplier: 2, count: 5, cooldown: 360 }, requiredLevel: 10, requiredRank: "C" as const, price: 0, icon: "zap" },
  { name: "Time Warp", description: "Reduce all dungeon durations by 25%", type: "PASSIVE" as const, effect: { type: "dungeon_time_reduction", multiplier: 0.75 }, requiredLevel: 20, requiredRank: "B" as const, price: 0, icon: "clock" },
  { name: "Iron Will", description: "Streak decay reduced by 50% on missed days", type: "PASSIVE" as const, effect: { type: "streak_decay_reduction", multiplier: 0.5 }, requiredLevel: 15, requiredRank: "C" as const, price: 0, icon: "shield" },
  { name: "Coin Mastery", description: "Earn 25% more coins from all sources", type: "PASSIVE" as const, effect: { type: "coin_multiplier", multiplier: 1.25 }, requiredLevel: 8, requiredRank: "D" as const, price: 0, icon: "coins" },
  { name: "Shadow Step", description: "Skip one daily quest penalty per week", type: "ACTIVE" as const, effect: { type: "skip_penalty", count: 1, cooldown: 168 }, requiredLevel: 25, requiredRank: "A" as const, price: 0, icon: "move" },
  { name: "Berserker Mode", description: "Triple XP for 15 minutes, but lose 10 energy", type: "ACTIVE" as const, effect: { type: "xp_multiplier", multiplier: 3, count: 999, duration: 15, energyCost: 10, cooldown: 720 }, requiredLevel: 30, requiredRank: "A" as const, price: 0, icon: "flame" },
  { name: "Monarch's Authority", description: "All stats increased by 20% permanently", type: "PASSIVE" as const, effect: { type: "all_stats_multiplier", multiplier: 1.2 }, requiredLevel: 50, requiredRank: "S" as const, price: 0, icon: "crown" },
  { name: "Eternal Discipline", description: "Habit completions grant 50% more discipline stat XP", type: "PASSIVE" as const, effect: { stat: "discipline", multiplier: 1.5 }, requiredLevel: 12, requiredRank: "C" as const, price: 0, icon: "target" },
  { name: "Mind Palace", description: "Double intelligence gains from learning habits", type: "PASSIVE" as const, effect: { stat: "intelligence", multiplier: 2, category: "LEARNING" }, requiredLevel: 18, requiredRank: "B" as const, price: 0, icon: "brain" },
];

const BATTLE_PASS_SEASONS = [
  {
    season: 1,
    name: "Shadow Awakening",
    tiers: Array.from({ length: 30 }, (_, i) => ({
      tier: i + 1,
      xpRequired: (i + 1) * 200,
      freeReward: { coins: (i + 1) * 10, xpBoost: 0 },
      premiumReward: { coins: (i + 1) * 25, xpBoost: i % 5 === 0 ? 2 : 0, item: i % 10 === 0 ? "cosmetic" : null },
    })),
  },
];

async function seed() {
  console.log("Seeding RPG content...");

  for (const quest of QUESTS) {
    await prisma.quest.create({
      data: {
        type: quest.type,
        title: quest.title,
        description: quest.description,
        requirements: { target: quest.target, type: "completions" },
        xpReward: quest.xpReward,
        coinReward: quest.coinReward,
        unlocksTitle: quest.unlocksTitle || null,
      },
    });
  }
  console.log(`Created ${QUESTS.length} quests`);

  for (const dungeon of DUNGEONS) {
    await prisma.dungeon.create({ data: dungeon });
  }
  console.log(`Created ${DUNGEONS.length} dungeons`);

  for (const item of SHOP_ITEMS) {
    await prisma.shopItem.create({ data: item });
  }
  console.log(`Created ${SHOP_ITEMS.length} shop items`);

  for (const skill of SKILLS) {
    await prisma.skill.create({ data: skill });
  }
  console.log(`Created ${SKILLS.length} skills`);

  for (const bp of BATTLE_PASS_SEASONS) {
    const season = await prisma.battlePass.create({
      data: {
        season: bp.season,
        name: bp.name,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });
    for (const tier of bp.tiers) {
      await prisma.battlePassTierDef.create({
        data: {
          battlePassId: season.id,
          tier: tier.tier,
          xpRequired: tier.xpRequired,
          freeReward: tier.freeReward,
          premiumReward: tier.premiumReward,
        },
      });
    }
  }
  console.log("Created battle pass season 1");

  console.log("RPG content seeded successfully!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
