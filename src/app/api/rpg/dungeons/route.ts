import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/rpg";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const [dungeons, activeRuns] = await Promise.all([
      prisma.dungeon.findMany({ where: { isActive: true } }),
      prisma.dungeonRun.findMany({
        where: { userId: session.user.id, completed: false },
      }),
    ]);

    return NextResponse.json({ success: true, data: { dungeons, activeRuns } });
  } catch (error) {
    console.error("Error fetching dungeons:", error);
    return NextResponse.json({ error: "Failed to fetch dungeons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;
    const body = await request.json();
    const { dungeonId } = body;

    if (!dungeonId) {
      return NextResponse.json({ error: "dungeonId is required" }, { status: 400 });
    }

    const dungeon = await prisma.dungeon.findUnique({ where: { id: dungeonId } });
    if (!dungeon || !dungeon.isActive) {
      return NextResponse.json({ error: "Dungeon not found" }, { status: 404 });
    }

    const profile = await prisma.playerProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json({ error: "Player profile not found" }, { status: 404 });
    }

    const playerLevel = calculateLevel(profile.totalXp);
    if (playerLevel < dungeon.requiredLevel) {
      return NextResponse.json({ error: `Level ${dungeon.requiredLevel} required to enter this dungeon` }, { status: 400 });
    }

    const run = await prisma.$transaction(async (tx) => {
      const existingRun = await tx.dungeonRun.findFirst({
        where: { userId, completed: false },
      });
      if (existingRun) {
        throw new Error("Complete your current dungeon run first");
      }

      return tx.dungeonRun.create({
        data: { userId, dungeonId },
      });
    });

    return NextResponse.json({ success: true, data: run }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error starting dungeon run:", error);
    const err = error as { message?: string };
    if (err?.message === "Complete your current dungeon run first") {
      return NextResponse.json({ error: "Complete your current dungeon run first" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to start dungeon run" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;
    const body = await request.json();
    const { runId, bossKilled, durationSec } = body;

    if (!runId) {
      return NextResponse.json({ error: "runId is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const run = await tx.dungeonRun.findUnique({
        where: { id: runId },
        include: { dungeon: true },
      });

      if (!run || run.userId !== userId) {
        throw new Error("Dungeon run not found");
      }

      if (run.completed) {
        throw new Error("Dungeon run already completed");
      }

      const bossDefeated = typeof bossKilled === "boolean" ? bossKilled : false;
      const seconds = Math.max(1, typeof durationSec === "number" ? durationSec : 0);
      const dungeon = run.dungeon;

      const efficiencyMultiplier = dungeon.durationMin > 0
        ? Math.min(2, Math.max(0.5, dungeon.durationMin * 60 / seconds))
        : 1;

      const xpEarned = Math.floor(dungeon.xpReward * efficiencyMultiplier * (bossDefeated ? 1.5 : 1));
      const coinEarned = Math.floor(dungeon.coinReward * efficiencyMultiplier * (bossDefeated ? 1.5 : 1));

      const updatedRun = await tx.dungeonRun.update({
        where: { id: runId, completed: false },
        data: {
          completed: true,
          completedAt: new Date(),
          durationSec: seconds,
          bossKilled: bossDefeated,
          xpEarned,
          coinEarned,
        },
      });

      const profile = await tx.playerProfile.upsert({
        where: { userId },
        create: { userId, rank: "E", title: "The Unawakened" },
        update: {
          totalXp: { increment: xpEarned },
          coins: { increment: coinEarned },
          dungeonsCleared: { increment: 1 },
        },
      });

      return { run: updatedRun, xpEarned, coinEarned, profile };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Error completing dungeon run:", error);
    const err = error as { message?: string; code?: string };
    if (err?.code === "P2025" || err?.message === "Dungeon run not found") {
      return NextResponse.json({ error: "Dungeon run not found or already completed" }, { status: 404 });
    }
    if (err?.message === "Dungeon run already completed") {
      return NextResponse.json({ error: "Dungeon run already completed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to complete dungeon run" }, { status: 500 });
  }
}
