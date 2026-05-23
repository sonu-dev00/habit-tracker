import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAchievements, ACHIEVEMENTS } from "@/lib/achievements";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievements = await prisma.achievement.findMany({
      where: { userId: session.user.id },
      select: { id: true, type: true, title: true, description: true, icon: true, xpReward: true, unlockedAt: true },
      orderBy: { unlockedAt: "desc" },
    });

    const allDefinitions = ACHIEVEMENTS.map((def) => {
      const earned = achievements.find((a) => a.id === def.id);
      return {
        ...def,
        unlockedAt: earned?.unlockedAt ?? null,
        unlocked: !!earned,
      };
    });

    return NextResponse.json({ success: true, data: allDefinitions });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await prisma.userHabitData.findUnique({ where: { userId: session.user.id } });

    const existingAchievements = await prisma.achievement.findMany({
      where: { userId: session.user.id },
      select: { id: true, unlockedAt: true },
    });
    const existing: { id: string; unlockedAt?: Date }[] = existingAchievements.map((a) => ({
      id: a.id,
      ...(a.unlockedAt ? { unlockedAt: a.unlockedAt } : {}),
    }));

    const totalHabits = await prisma.habit.count({ where: { userId: session.user.id } });

    const stats = {
      totalCompletions: userData?.totalCompletions ?? 0,
      bestStreak: userData?.bestStreak ?? 0,
      xpEarned: userData?.xp ?? 0,
      totalHabits,
    };

    const newlyUnlocked = checkAchievements(stats, existing);

    if (newlyUnlocked.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    await prisma.achievement.createMany({
      data: newlyUnlocked.map((a) => ({
        id: a.id,
        userId: session.user.id,
        type: a.type,
        title: a.title,
        description: a.description,
        icon: a.icon,
        xpReward: a.xpReward,
        unlockedAt: new Date(),
      })),
    });

    const totalXpGained = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);

    if (userData) {
      await prisma.userHabitData.update({
        where: { userId: session.user.id },
        data: { xp: { increment: totalXpGained } },
      });
    }

    return NextResponse.json({ success: true, data: newlyUnlocked, xpGained: totalXpGained });
  } catch (error) {
    console.error("Error checking achievements:", error);
    return NextResponse.json({ error: "Failed to check achievements" }, { status: 500 });
  }
}
