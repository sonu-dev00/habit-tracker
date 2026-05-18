import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeeklyReview, trackUsage } from "@/lib/ai";
import { startOfWeek, endOfWeek, format } from "date-fns";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    const [habits, completions] = await Promise.all([
      prisma.habit.findMany({
        where: { userId: session.user.id, isArchived: false },
        select: { name: true, category: true },
      }),
      prisma.habitCompletion.findMany({
        where: {
          userId: session.user.id,
          date: { gte: weekStart, lte: weekEnd },
        },
        include: { habit: { select: { name: true } } },
        orderBy: { date: "asc" },
      }),
    ]);

    if (habits.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          response: "You didn't have any habits this week. Start building some habits to get a review next week!",
        },
      });
    }

    const completionsData = completions.map((c) => ({
      date: format(new Date(c.date), "yyyy-MM-dd"),
      habitName: c.habit.name,
    }));

    const response = await getWeeklyReview(session.user.id, habits, completionsData);
    await trackUsage(session.user.id, "ai-weekly-review", response.length / 4);

    const completionCount = completions.length;
    const uniqueHabits = new Set(completions.map((c) => c.habitId)).size;

    return NextResponse.json({
      success: true,
      data: {
        response,
        stats: {
          totalCompletions: completionCount,
          habitsCompleted: uniqueHabits,
          totalHabits: habits.length,
        },
      },
    });
  } catch (error) {
    console.error("AI weekly review error:", error);
    return NextResponse.json(
      { error: "Failed to get weekly review" },
      { status: 500 }
    );
  }
}
