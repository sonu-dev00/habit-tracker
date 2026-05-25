import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { RANKS, calculateLevel } from "@/lib/rpg";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;

    const [skills, playerSkills] = await Promise.all([
      prisma.skill.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.playerSkill.findMany({ where: { userId } }),
    ]);

    const skillMap = new Map(playerSkills.map((ps) => [ps.skillId, ps]));

    const skillsWithStatus = skills.map((skill) => {
      const ps = skillMap.get(skill.id);
      return {
        ...skill,
        unlocked: !!ps,
        level: ps?.level ?? 0,
        isActive: ps?.isActive ?? false,
        unlockedAt: ps?.unlockedAt ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      data: { skills, playerSkills },
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;
    const body = await request.json();
    const { skillId } = body;

    if (!skillId) {
      return NextResponse.json({ error: "skillId is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const skill = await tx.skill.findUnique({ where: { id: skillId } });
      if (!skill) {
        throw new Error("Skill not found");
      }

      const existing = await tx.playerSkill.findUnique({
        where: { userId_skillId: { userId, skillId } },
      });
      if (existing) {
        throw new Error("Skill already unlocked");
      }

      const profile = await tx.playerProfile.findUnique({ where: { userId } });
      if (!profile) {
        throw new Error("Player profile not found");
      }

      if (profile.coins < skill.price) {
        throw new Error("Not enough coins");
      }

      const playerRankIndex = RANKS.findIndex((r) => r.rank === profile.rank);
      const requiredRankIndex = RANKS.findIndex((r) => r.rank === skill.requiredRank);
      if (playerRankIndex < requiredRankIndex) {
        throw new Error(`Rank ${skill.requiredRank} required to unlock this skill`);
      }

      const playerLevel = calculateLevel(profile.totalXp);
      if (playerLevel < skill.requiredLevel) {
        throw new Error(`Level ${skill.requiredLevel} required to unlock this skill`);
      }

      const playerSkill = await tx.playerSkill.create({
        data: { userId, skillId, isActive: skill.type === "PASSIVE" },
      });

      const updatedProfile = await tx.playerProfile.update({
        where: { userId, coins: { gte: skill.price } },
        data: { coins: { decrement: skill.price } },
      });

      return { skill: playerSkill, coins: updatedProfile.coins };
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error unlocking skill:", error);
    const err = error as { message?: string; code?: string };
    if (err?.message === "Skill not found") {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }
    if (err?.message === "Skill already unlocked") {
      return NextResponse.json({ error: "Skill already unlocked" }, { status: 400 });
    }
    if (err?.message === "Player profile not found") {
      return NextResponse.json({ error: "Player profile not found" }, { status: 404 });
    }
    if (err?.message === "Not enough coins") {
      return NextResponse.json({ error: "Not enough coins" }, { status: 400 });
    }
    if (err?.message?.startsWith("Rank")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err?.message?.startsWith("Level")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Skill already unlocked" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to unlock skill" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;
    const body = await request.json();
    const { skillId, isActive } = body;

    if (!skillId || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "skillId and isActive are required" }, { status: 400 });
    }

    const playerSkill = await prisma.playerSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });

    if (!playerSkill) {
      return NextResponse.json({ error: "Skill not unlocked" }, { status: 404 });
    }

    const updated = await prisma.playerSkill.update({
      where: { id: playerSkill.id },
      data: { isActive },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error toggling skill:", error);
    return NextResponse.json({ error: "Failed to toggle skill" }, { status: 500 });
  }
}
