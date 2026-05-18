import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRoast, trackUsage } from "@/lib/ai";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id, isArchived: false },
      include: {
        completions: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        },
      },
    });

    if (habits.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          response: "No habits to roast! You've got a clean slate... but also no habits. Maybe start one?",
        },
      });
    }

    const habitsData = habits.map((h) => ({
      name: h.name,
      completions: h.completions.length,
    }));

    const response = await getRoast(session.user.id, habitsData);
    await trackUsage(session.user.id, "ai-roast", response.length / 4);

    return NextResponse.json({ success: true, data: { response } });
  } catch (error) {
    console.error("AI roast error:", error);
    return NextResponse.json(
      { error: "Failed to get roast" },
      { status: 500 }
    );
  }
}
