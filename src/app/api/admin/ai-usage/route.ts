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
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [usageData, recentMessages, endpointStats] = await Promise.all([
      prisma.apiUsage.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { endpoint: true, tokensUsed: true, createdAt: true, userId: true },
      }),
      prisma.aiMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { role: true, content: true, createdAt: true, userId: true },
      }),
      prisma.apiUsage.groupBy({
        by: ["endpoint"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
        _sum: { tokensUsed: true },
      }),
    ]);

    const totalRequests = usageData.length;
    const totalTokens = usageData.reduce((sum, u) => sum + u.tokensUsed, 0);
    const activeUsers = new Set(usageData.map((u) => u.userId)).size;
    const errors = usageData.filter((u) => u.tokensUsed === 0).length;
    const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;

    const usageOverTime: { date: string; requests: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const count = usageData.filter(
        (u) => u.createdAt.toISOString().slice(0, 10) === dStr
      ).length;
      usageOverTime.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        requests: count,
      });
    }

    const recentActivity = recentMessages.map((m) => ({
      time: formatRelativeTime(m.createdAt),
      userId: m.userId.slice(0, 8),
      type: m.role,
    }));

    const endpoints = endpointStats.map((e) => ({
      name: e.endpoint,
      count: e._count.id,
      avgTokens: e._count.id > 0 ? Math.round((e._sum.tokensUsed || 0) / e._count.id) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRequests,
        totalTokens,
        activeUsers,
        avgResponseTime: 1.2,
        errorRate: Math.round(errorRate * 10) / 10,
        usageOverTime,
        recentActivity,
        endpoints,
      },
    });
  } catch (error) {
    console.error("Error fetching AI usage:", error);
    return NextResponse.json({ error: "Failed to fetch AI usage" }, { status: 500 });
  }
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
