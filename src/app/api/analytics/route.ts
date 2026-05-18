import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : subDays(new Date(), 30);
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const [
      habits,
      completions,
      userData,
      weeklyCompletions,
      monthlyCompletions,
      categoryBreakdown,
      heatmapData,
    ] = await Promise.all([
      prisma.habit.findMany({
        where: { userId: session.user.id, isArchived: false },
        include: {
          completions: {
            where: {
              date: { gte: startDate, lte: endDate },
            },
          },
        },
      }),
      prisma.habitCompletion.findMany({
        where: {
          userId: session.user.id,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "asc" },
      }),
      prisma.userHabitData.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.habitCompletion.findMany({
        where: {
          userId: session.user.id,
          date: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.habitCompletion.findMany({
        where: {
          userId: session.user.id,
          date: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.habit.groupBy({
        by: ["category"],
        where: { userId: session.user.id, isArchived: false },
        _count: { id: true },
      }),
      prisma.habitCompletion.groupBy({
        by: ["date"],
        where: {
          userId: session.user.id,
          date: { gte: subDays(today, 30), lte: today },
        },
        _count: { id: true },
      }),
    ]);

    const totalHabits = habits.length;
    const activeHabits = habits.filter((h) => !h.isArchived).length;
    const totalCompletions = completions.length;
    const streak = userData?.streak || 0;
    const bestStreak = userData?.bestStreak || 0;
    const xp = userData?.xp || 0;
    const averagePerDay = totalCompletions > 0
      ? Math.round(totalCompletions / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))))
      : 0;

    const daysInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const completionRate = daysInRange > 0 && totalHabits > 0
      ? Math.round((totalCompletions / (daysInRange * totalHabits)) * 100)
      : 0;

    const weeklyStats = {
      completions: weeklyCompletions.length,
      habitsCompleted: new Set(weeklyCompletions.map((c) => c.habitId)).size,
      streak,
    };

    const monthlyStats = {
      completions: monthlyCompletions.length,
      habitsCompleted: new Set(monthlyCompletions.map((c) => c.habitId)).size,
      streak,
    };

    const categoryBreakdownData = await Promise.all(
      categoryBreakdown.map(async (cat) => {
        const catCompletions = await prisma.habitCompletion.count({
          where: {
            userId: session.user.id,
            habit: { category: cat.category },
            date: { gte: startDate, lte: endDate },
          },
        });
        return {
          category: cat.category,
          count: cat._count.id,
          completions: catCompletions,
        };
      })
    );

    const productivityScore = totalHabits > 0
      ? Math.min(100, Math.round((totalCompletions / (daysInRange * totalHabits)) * 100))
      : 0;

    const weeklyCompletionsData = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const count = completions.filter(
        (c) => format(new Date(c.date), "yyyy-MM-dd") === dateStr
      ).length;
      return { date: dateStr, count };
    });

    const monthlyCompletionsData = Array.from({ length: 30 }, (_, i) => {
      const d = subDays(today, 29 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const count = completions.filter(
        (c) => format(new Date(c.date), "yyyy-MM-dd") === dateStr
      ).length;
      return { date: dateStr, count };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalHabits,
          activeHabits,
          totalCompletions,
          streak,
          bestStreak,
          xp,
          averagePerDay,
          completionRate,
          productivityScore,
        },
        weeklyStats,
        monthlyStats,
        categoryBreakdown: categoryBreakdownData,
        weeklyCompletions: weeklyCompletionsData,
        monthlyCompletions: monthlyCompletionsData,
        heatmap: heatmapData.map((h) => ({
          date: format(new Date(h.date), "yyyy-MM-dd"),
          count: h._count.id,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
