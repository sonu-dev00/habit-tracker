import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { calculateCoinsFromHabit, STAT_CATEGORY_MAP, calculateStatIncrease, calculateLevel, calculateRank, getLevelUpXpBonus } from "@/lib/rpg";

const ACHIEVEMENT_DEFS = [
  { type: "first_habit", title: "First Step", description: "Complete your first habit", icon: "🌱", xpReward: 10 },
  { type: "five_habits", title: "Getting Started", description: "Complete 5 habits", icon: "🌟", xpReward: 25 },
  { type: "ten_habits", title: "Double Digits", description: "Complete 10 habits", icon: "💫", xpReward: 50 },
  { type: "week_streak", title: "Week Warrior", description: "Reach a 7-day streak", icon: "🔥", xpReward: 50 },
  { type: "month_streak", title: "Monthly Master", description: "Reach a 30-day streak", icon: "💎", xpReward: 200 },
  { type: "all_complete", title: "All In", description: "Complete all habits in a day", icon: "🏆", xpReward: 100 },
];

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ habitId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const { habitId } = await params;

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit || habit.userId !== session.user.id) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.habitCompletion.findUnique({
      where: {
        habitId_userId_date: {
          habitId,
          userId: session.user.id,
          date: today,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Habit already completed today" },
        { status: 409 }
      );
    }

    const completion = await prisma.habitCompletion.create({
      data: {
        habitId,
        userId: session.user.id,
        date: today,
      },
    });

    const userData = await prisma.userHabitData.findUnique({
      where: { userId: session.user.id },
    });

    let newStreak = (userData?.streak || 0) + 1;
    if (userData?.lastCompletionDate) {
      const lastDate = new Date(userData.lastCompletionDate);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 1) newStreak = 1;
    }

    const xpEarned = habit.xpReward;
    const coinsEarned = calculateCoinsFromHabit(xpEarned);
    const newBestStreak = Math.max(userData?.bestStreak || 0, newStreak);
    const totalCompletions = (userData?.totalCompletions || 0) + 1;

    let profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    });
    let stats = await prisma.playerStats.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await prisma.playerProfile.create({
        data: { userId: session.user.id, rank: "E", title: "The Unawakened" },
      });
    }
    if (!stats) {
      stats = await prisma.playerStats.create({
        data: { userId: session.user.id },
      });
    }

    const oldLevel = calculateLevel(profile.totalXp);
    const oldRankResult = calculateRank({
      level: oldLevel,
      totalXp: profile.totalXp,
      bestStreak: userData?.bestStreak || 0,
      totalCompletions: userData?.totalCompletions || 0,
    });

    const categoryMapping = STAT_CATEGORY_MAP.find(
      (m) => m.category === habit.category
    );
    const statName = categoryMapping?.stat || "discipline";
    const statIncrease = calculateStatIncrease(habit.category);
    const statGains: Record<string, number> = {
      [statName]: statIncrease,
    };

    let totalXpToAdd = xpEarned;

    profile = await prisma.playerProfile.update({
      where: { userId: session.user.id },
      data: {
        totalXp: { increment: xpEarned },
        coins: { increment: coinsEarned },
      },
    });

    await prisma.playerStats.update({
      where: { userId: session.user.id },
      data: {
        [statName]: { increment: statIncrease },
      },
    });

    const newLevel = calculateLevel(profile.totalXp);
    let levelUp: { oldLevel: number; newLevel: number } | null = null;
    if (newLevel > oldLevel) {
      const xpBonus = getLevelUpXpBonus(newLevel);
      totalXpToAdd += xpBonus;
      profile = await prisma.playerProfile.update({
        where: { userId: session.user.id },
        data: { totalXp: { increment: xpBonus } },
      });
      levelUp = { oldLevel, newLevel };
    }

    const newRankResult = calculateRank({
      level: newLevel,
      totalXp: profile.totalXp,
      bestStreak: newBestStreak,
      totalCompletions,
    });
    let rankUp: { oldRank: string; newRank: string } | null = null;
    if (newRankResult.rank !== oldRankResult.rank) {
      rankUp = { oldRank: oldRankResult.rank, newRank: newRankResult.rank };
    }

    const activeQuests = await prisma.playerQuest.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
    });

    const questProgress: Array<{
      questId: string;
      progress: number;
      target: number;
      completed: boolean;
    }> = [];

    for (const pq of activeQuests) {
      const newProgress = pq.progress + 1;
      const completed = newProgress >= pq.target;
      await prisma.playerQuest.update({
        where: { id: pq.id },
        data: {
          progress: newProgress,
          ...(completed ? { status: "COMPLETED" as const } : {}),
        },
      });
      questProgress.push({
        questId: pq.questId,
        progress: newProgress,
        target: pq.target,
        completed,
      });
    }

    const activeBP = await prisma.battlePass.findFirst({
      where: { isActive: true },
    });

    if (activeBP) {
      const playerBP = await prisma.playerBattlePass.findUnique({
        where: { userId: session.user.id },
      });
      if (playerBP && playerBP.battlePassId === activeBP.id) {
        await prisma.playerBattlePass.update({
          where: { userId: session.user.id },
          data: { xp: { increment: xpEarned } },
        });
      } else if (!playerBP) {
        await prisma.playerBattlePass.create({
          data: {
            userId: session.user.id,
            battlePassId: activeBP.id,
            xp: xpEarned,
          },
        });
      }
    }

    await prisma.userHabitData.update({
      where: { userId: session.user.id },
      data: {
        streak: newStreak,
        bestStreak: newBestStreak,
        totalCompletions: { increment: 1 },
        xp: { increment: xpEarned },
        lastCompletionDate: today,
      },
    });

    const newAchievements: Array<{
      id: string; userId: string; habitId: string | null;
      type: string; title: string; description: string; icon: string; xpReward: number;
      unlockedAt: Date | null;
    }> = [];
    const existingAchievements = await prisma.achievement.findMany({
      where: { userId: session.user.id },
      select: { type: true },
    });
    const existingTypes = new Set(existingAchievements.map((a) => a.type));

    type CheckFn = () => boolean | Promise<boolean>;
    const checks: { type: string; check: CheckFn }[] = [
      { type: "first_habit", check: () => totalCompletions >= 1 },
      { type: "five_habits", check: () => totalCompletions >= 5 },
      { type: "ten_habits", check: () => totalCompletions >= 10 },
      { type: "week_streak", check: () => newStreak >= 7 },
      { type: "month_streak", check: () => newStreak >= 30 },
      {
        type: "all_complete",
        check: async () => {
          const totalHabits = await prisma.habit.count({
            where: { userId: session.user.id, isArchived: false },
          });
          if (totalHabits === 0) return false;
          const todayCompletions = await prisma.habitCompletion.count({
            where: {
              userId: session.user.id,
              date: today,
            },
          });
          return todayCompletions >= totalHabits;
        },
      },
    ];

    for (const check of checks) {
      if (existingTypes.has(check.type)) continue;
      const def = ACHIEVEMENT_DEFS.find((a) => a.type === check.type);
      if (!def) continue;

      const earned = await Promise.resolve(check.check());

      if (earned) {
        const achievement = await prisma.achievement.create({
          data: {
            userId: session.user.id,
            habitId,
            type: def.type,
            title: def.title,
            description: def.description,
            icon: def.icon,
            xpReward: def.xpReward,
          },
        });

        await prisma.userHabitData.update({
          where: { userId: session.user.id },
          data: { xp: { increment: def.xpReward } },
        });

        await prisma.playerProfile.update({
          where: { userId: session.user.id },
          data: { totalXp: { increment: def.xpReward } },
        });

        newAchievements.push(achievement);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        completion,
        xpEarned: totalXpToAdd,
        streak: newStreak,
        bestStreak: newBestStreak,
        totalCompletions,
        coinsEarned,
        statGains,
        levelUp,
        rankUp,
        newAchievements,
        questProgress,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error completing habit:", error);
    return NextResponse.json(
      { error: "Failed to complete habit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ habitId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const { habitId } = await params;

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit || habit.userId !== session.user.id) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completion = await prisma.habitCompletion.findUnique({
      where: {
        habitId_userId_date: {
          habitId,
          userId: session.user.id,
          date: today,
        },
      },
    });

    if (!completion) {
      return NextResponse.json(
        { error: "No completion found for today" },
        { status: 404 }
      );
    }

    await prisma.habitCompletion.delete({
      where: { id: completion.id },
    });

    const userData = await prisma.userHabitData.findUnique({
      where: { userId: session.user.id },
    });

    const newStreak = Math.max(0, (userData?.streak || 0) - 1);

    await prisma.userHabitData.update({
      where: { userId: session.user.id },
      data: {
        streak: newStreak,
        totalCompletions: { decrement: 1 },
        xp: { decrement: habit.xpReward },
      },
    });

    await prisma.playerProfile.update({
      where: { userId: session.user.id },
      data: {
        totalXp: { decrement: habit.xpReward },
        coins: { decrement: calculateCoinsFromHabit(habit.xpReward) },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing completion:", error);
    return NextResponse.json(
      { error: "Failed to remove completion" },
      { status: 500 }
    );
  }
}
