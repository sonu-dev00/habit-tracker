import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      recentUsers,
      totalHabits,
      totalCompletions,
      subscriptions,
      userGrowth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      prisma.habit.count(),
      prisma.habitCompletion.count(),
      prisma.subscription.count({
        where: { status: "active" },
      }),
      prisma.user.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const userGrowthData = userGrowth.reduce<Record<string, number>>((acc, g) => {
      const date = g.createdAt.toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + g._count.id;
      return acc;
    }, {});

    const growth = Object.entries(userGrowthData).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers: recentUsers.length,
          totalHabits,
          totalCompletions,
          monthlyRevenue: subscriptions * 9,
          subscriptions,
        },
        recentUsers: recentUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt.toISOString(),
        })),
        userGrowth: growth,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
