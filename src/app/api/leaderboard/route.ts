import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));

    const users = await prisma.user.findMany({
      where: { banned: false },
      select: {
        id: true,
        name: true,
        image: true,
        userHabitData: { select: { xp: true, streak: true, totalCompletions: true } },
        _count: { select: { habits: true } },
      },
    });

    const entries = users
      .filter((u) => u.userHabitData)
      .map((u) => ({
        id: u.id,
        name: u.name || "Anonymous",
        image: u.image,
        xp: u.userHabitData!.xp,
        streak: u.userHabitData!.streak,
        totalCompletions: u.userHabitData!.totalCompletions,
        totalHabits: u._count.habits,
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit);

    const userEntry = entries.find((e) => e.id === session.user.id);
    const userRank = userEntry ? entries.indexOf(userEntry) + 1 : null;

    return NextResponse.json({
      success: true,
      data: entries.map((e, i) => ({ rank: i + 1, ...e })),
      total: entries.length,
      userRank,
      period,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
