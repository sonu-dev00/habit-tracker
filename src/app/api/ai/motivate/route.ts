import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMotivation, trackUsage } from "@/lib/ai";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id, isArchived: false },
      select: { name: true },
    });

    const userData = await prisma.userHabitData.findUnique({
      where: { userId: session.user.id },
      select: { streak: true },
    });

    if (habits.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          response: "You haven't created any habits yet! Start by adding a habit to begin your journey.",
        },
      });
    }

    const habitsWithStreak = habits.map((h) => ({
      name: h.name,
      streak: userData?.streak || 0,
    }));

    const response = await getMotivation(session.user.id, habitsWithStreak);
    await trackUsage(session.user.id, "ai-motivate", response.length / 4);

    return NextResponse.json({ success: true, data: { response } });
  } catch (error) {
    console.error("AI motivate error:", error);
    return NextResponse.json(
      { error: "Failed to get motivation" },
      { status: 500 }
    );
  }
}
