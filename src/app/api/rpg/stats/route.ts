import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

async function ensurePlayerStats(userId: string) {
  const prisma = getPrisma();
  let stats = await prisma.playerStats.findUnique({ where: { userId } });
  if (!stats) {
    stats = await prisma.playerStats.create({ data: { userId } });
  }
  return stats;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stats = await ensurePlayerStats(session.user.id);

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
