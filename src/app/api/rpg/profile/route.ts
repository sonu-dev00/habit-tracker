import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

async function ensurePlayerProfile(userId: string) {
  const prisma = getPrisma();

  const existingProfile = await prisma.playerProfile.findUnique({ where: { userId } });
  const existingStats = await prisma.playerStats.findUnique({ where: { userId } });

  if (existingProfile && existingStats) {
    return { profile: existingProfile, stats: existingStats };
  }

  return prisma.$transaction(async (tx) => {
    const profile = existingProfile ?? await tx.playerProfile.create({
      data: { userId, rank: "E", title: "The Unawakened" },
    });
    const stats = existingStats ?? await tx.playerStats.create({
      data: { userId },
    });
    return { profile, stats };
  });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { profile, stats } = await ensurePlayerProfile(session.user.id);

    return NextResponse.json({ success: true, data: { profile, stats } });
  } catch (error) {
    console.error("Error fetching RPG profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const prisma = getPrisma();

    const updateData: Record<string, string> = {};
    if (typeof body.title === "string") updateData.title = body.title;
    if (typeof body.auraColor === "string") updateData.auraColor = body.auraColor;

    const profile = Object.keys(updateData).length === 0
      ? await prisma.playerProfile.findUnique({ where: { userId: session.user.id } })
      : await prisma.playerProfile.update({
          where: { userId: session.user.id },
          data: updateData,
        });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Error updating RPG profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
