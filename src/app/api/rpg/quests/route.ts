import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

async function ensurePlayerProfile(userId: string) {
  const prisma = getPrisma();
  let profile = await prisma.playerProfile.findUnique({ where: { userId } });
  let stats = await prisma.playerStats.findUnique({ where: { userId } });
  if (!profile) {
    profile = await prisma.playerProfile.create({
      data: { userId, rank: "E", title: "The Unawakened" },
    });
  }
  if (!stats) {
    stats = await prisma.playerStats.create({ data: { userId } });
  }
  return { profile, stats };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;

    await ensurePlayerProfile(userId);

    const quests = await prisma.quest.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const playerQuests = await prisma.playerQuest.findMany({
      where: { userId },
    });

    const questMap = new Map(playerQuests.map((pq) => [pq.questId, pq]));

    const results = await Promise.all(
      quests.map(async (quest) => {
        let pq = questMap.get(quest.id);
        if (!pq) {
          pq = await prisma.playerQuest.create({
            data: { userId, questId: quest.id, status: "ACTIVE", target: 1 },
          });
        }
        return {
          id: pq.id,
          userId: pq.userId,
          questId: pq.questId,
          status: pq.status,
          progress: pq.progress,
          target: pq.target,
          claimedAt: pq.claimedAt,
          createdAt: pq.createdAt,
          quest,
        };
      })
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching quests:", error);
    return NextResponse.json({ error: "Failed to fetch quests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;
    const body = await request.json();
    const { questId } = body;

    if (!questId) {
      return NextResponse.json({ error: "questId is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const playerQuest = await tx.playerQuest.findUnique({
        where: { userId_questId: { userId, questId } },
        include: { quest: true },
      });

      if (!playerQuest) {
        throw new Error("Quest not found");
      }

      if (playerQuest.status !== "COMPLETED") {
        throw new Error("Quest is not yet completed");
      }

      const profile = await tx.playerProfile.findUnique({ where: { userId } });
      if (!profile) {
        throw new Error("Player profile not found");
      }

      const xpReward = playerQuest.quest.xpReward;
      const coinReward = playerQuest.quest.coinReward;

      const updatedProfile = await tx.playerProfile.update({
        where: { userId },
        data: {
          totalXp: { increment: xpReward },
          coins: { increment: coinReward },
          totalQuestsDone: { increment: 1 },
        },
      });

      await tx.playerQuest.update({
        where: { userId_questId: { userId, questId }, status: "COMPLETED" },
        data: { status: "CLAIMED", claimedAt: new Date() },
      });

      return { xpEarned: xpReward, coinsEarned: coinReward, profile: updatedProfile };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Error claiming quest:", error);
    const err = error as { message?: string; code?: string };
    if (err?.code === "P2025" || err?.message === "Quest not found") {
      return NextResponse.json({ error: "Quest not found or already claimed" }, { status: 404 });
    }
    if (err?.message === "Quest is not yet completed") {
      return NextResponse.json({ error: "Quest is not yet completed" }, { status: 400 });
    }
    if (err?.message === "Player profile not found") {
      return NextResponse.json({ error: "Player profile not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to claim quest reward" }, { status: 500 });
  }
}

export async function PUT() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      await tx.playerQuest.deleteMany({
        where: {
          userId,
          quest: { type: { in: ["DAILY", "WEEKLY"] } },
          status: { in: ["ACTIVE", "FAILED"] },
        },
      });

      const quests = await tx.quest.findMany({
        where: { isActive: true, type: { in: ["DAILY", "WEEKLY"] } },
      });

      await tx.playerQuest.createMany({
        data: quests.map((q) => ({
          userId,
          questId: q.id,
          status: "ACTIVE" as const,
          target: 1,
        })),
      });

      return quests.length;
    });

    return NextResponse.json({ success: true, data: { refreshed: result } });
  } catch (error) {
    console.error("Error refreshing quests:", error);
    return NextResponse.json({ error: "Failed to refresh quests" }, { status: 500 });
  }
}
