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
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      habitCompletions,
      subscriptions,
      usersByPlan,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.habitCompletion.count(),
      prisma.subscription.groupBy({
        by: ["plan"],
        _count: { id: true },
        where: { status: "active" },
      }),
      prisma.subscription.groupBy({
        by: ["plan"],
        _count: { id: true },
        where: { status: "active" },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
    ]);

    const monthlyUsers = recentUsers.reduce<Record<string, number>>((acc, u) => {
      const month = u.createdAt.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return d.toISOString().slice(0, 7);
    });

    const revenueData = months.map((month) => ({
      month,
      amount: (subscriptions.find((s) => s.plan === "PRO")?._count.id || 0) * 9,
    }));

    const userAcquisition = months.map((month) => ({
      month,
      users: monthlyUsers[month] || 0,
    }));

    const planDistribution = [
      { plan: "FREE", count: totalUsers - usersByPlan.reduce((sum, s) => sum + s._count.id, 0) },
      ...usersByPlan.map((s) => ({ plan: s.plan, count: s._count.id })),
    ];

    return NextResponse.json({
      success: true,
      data: {
        revenue: revenueData,
        userAcquisition,
        planDistribution,
        featureUsage: [
          { feature: "Habit Tracking", usage: habitCompletions },
          { feature: "AI Chat", usage: 0 },
          { feature: "Pomodoro", usage: 0 },
        ],
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
