import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { DAILY_REWARDS } from "@/lib/rpg";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;

    const rewards = await prisma.playerDailyReward.findMany({
      where: { userId },
      orderBy: { day: "asc" },
    });

    const claimedDays = rewards;
    const claimedDayNumbers = rewards.map((r) => r.day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastReward = rewards.length > 0 ? rewards[rewards.length - 1] : null;
    let streak = 0;

    if (lastReward) {
      const lastDate = new Date(lastReward.claimedAt);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        streak = rewards.length;
      } else if (diffDays > 1) {
        streak = 0;
      }
    }

    const currentDay = streak >= 7 ? 1 : streak + 1;
    const claimedToday = lastReward
      ? new Date(lastReward.claimedAt).toDateString() === today.toDateString()
      : false;

    return NextResponse.json({
      success: true,
      data: {
        claimedDays,
        currentStreak: streak,
        currentDay,
        canClaim: !claimedToday,
        rewards: DAILY_REWARDS.map((r) => ({
          ...r,
          claimed: claimedDayNumbers.includes(r.day),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching daily rewards:", error);
    return NextResponse.json({ error: "Failed to fetch daily rewards" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const rewards = await tx.playerDailyReward.findMany({
        where: { userId },
        orderBy: { day: "asc" },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastReward = rewards.length > 0 ? rewards[rewards.length - 1] : null;

      if (lastReward) {
        const lastDate = new Date(lastReward.claimedAt);
        lastDate.setHours(0, 0, 0, 0);
        if (lastDate.getTime() === today.getTime()) {
          throw new Error("ALREADY_CLAIMED");
        }
        if (lastDate.getTime() < today.getTime()) {
          const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 1) {
            await tx.playerDailyReward.deleteMany({ where: { userId } });
          }
        }
      }

      const remaining = await tx.playerDailyReward.count({ where: { userId } });
      const day = remaining >= 7 ? 1 : remaining + 1;
      const reward = DAILY_REWARDS.find((r) => r.day === day) || DAILY_REWARDS[0];

      const dailyReward = await tx.playerDailyReward.create({
        data: { userId, day, claimedAt: new Date() },
      });

      const profile = await tx.playerProfile.upsert({
        where: { userId },
        create: { userId, rank: "E", title: "The Unawakened" },
        update: {
          totalXp: { increment: reward.xp },
          coins: { increment: reward.coins },
        },
      });

      return { dailyReward, profile, day, reward };
    });

    return NextResponse.json({
      success: true,
      data: {
        reward: { day: result.day, coins: result.reward.coins, xp: result.reward.xp },
        currentStreak: result.day,
        totalXp: result.profile.totalXp,
        coins: result.profile.coins,
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === "ALREADY_CLAIMED") {
      return NextResponse.json({ error: "Daily reward already claimed today" }, { status: 400 });
    }
    console.error("Error claiming daily reward:", error);
    return NextResponse.json({ error: "Failed to claim daily reward" }, { status: 500 });
  }
}
