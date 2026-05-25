import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;

    const activePass = await prisma.battlePass.findFirst({
      where: { isActive: true },
      include: { tiers: { orderBy: { tier: "asc" } } },
      orderBy: { startDate: "desc" },
    });

    if (!activePass) {
      return NextResponse.json({ success: true, data: null });
    }

    const playerPass = await prisma.playerBattlePass.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      data: {
        battlePass: activePass,
        playerProgress: playerPass,
      },
    });
  } catch (error) {
    console.error("Error fetching battle pass:", error);
    return NextResponse.json({ error: "Failed to fetch battle pass" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;
    const body = await request.json();
    const { tierNumber } = body;

    if (typeof tierNumber !== "number") {
      return NextResponse.json({ error: "tierNumber is required" }, { status: 400 });
    }

    const activePass = await prisma.battlePass.findFirst({
      where: { isActive: true },
      include: { tiers: true },
    });

    if (!activePass) {
      return NextResponse.json({ error: "No active battle pass" }, { status: 404 });
    }

    const playerPass = await prisma.playerBattlePass.findUnique({
      where: { userId },
    });

    if (!playerPass) {
      return NextResponse.json({ error: "Battle pass not joined" }, { status: 404 });
    }

    const claimed: number[] = typeof playerPass.claimedTiers === "string"
      ? JSON.parse(playerPass.claimedTiers as string)
      : (playerPass.claimedTiers as number[]);

    if (claimed.includes(tierNumber)) {
      return NextResponse.json({ error: "Tier already claimed" }, { status: 400 });
    }

    const tierDef = activePass.tiers.find((t) => t.tier === tierNumber);
    if (!tierDef) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    if (playerPass.level < tierDef.tier) {
      return NextResponse.json({ error: "Level too low for this tier" }, { status: 400 });
    }

    claimed.push(tierNumber);

    const reward = playerPass.tier === "PREMIUM" ? tierDef.premiumReward : tierDef.freeReward;

    await prisma.playerBattlePass.update({
      where: { userId },
      data: { claimedTiers: claimed },
    });

    return NextResponse.json({ success: true, data: { tier: tierNumber, reward } });
  } catch (error) {
    console.error("Error claiming battle pass tier:", error);
    return NextResponse.json({ error: "Failed to claim tier reward" }, { status: 500 });
  }
}

export async function PUT() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;

    const activePass = await prisma.battlePass.findFirst({ where: { isActive: true } });
    if (!activePass) {
      return NextResponse.json({ error: "No active battle pass" }, { status: 404 });
    }

    const existingPass = await prisma.playerBattlePass.findUnique({
      where: { userId },
    });

    if (existingPass && existingPass.tier === "PREMIUM") {
      return NextResponse.json({ error: "Already on premium battle pass" }, { status: 400 });
    }

    const PREMIUM_COST = 500;

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.playerProfile.findUnique({ where: { userId } });
      if (!profile) {
        throw new Error("Player profile not found");
      }

      if (profile.coins < PREMIUM_COST && !existingPass) {
        throw new Error(`Not enough coins. Premium costs ${PREMIUM_COST} coins.`);
      }

      if (existingPass) {
        await tx.playerProfile.update({
          where: { userId },
          data: { coins: { decrement: PREMIUM_COST } },
        });

        return tx.playerBattlePass.update({
          where: { userId },
          data: { tier: "PREMIUM" },
        });
      }

      await tx.playerProfile.update({
        where: { userId },
        data: { coins: { decrement: PREMIUM_COST } },
      });

      return tx.playerBattlePass.create({
        data: { userId, battlePassId: activePass.id, tier: "PREMIUM" },
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Error purchasing premium battle pass:", error);
    const err = error as { message?: string };
    if (err?.message === "Player profile not found") {
      return NextResponse.json({ error: "Player profile not found" }, { status: 404 });
    }
    if (err?.message?.startsWith("Not enough coins")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to purchase premium battle pass" }, { status: 500 });
  }
}
