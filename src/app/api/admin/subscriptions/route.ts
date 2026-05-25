import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));

    const where: Record<string, unknown> = {};
    if (plan) where.plan = plan;
    if (status) where.status = status;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    const activeCount = await prisma.subscription.count({ where: { status: "active" } });
    const trialCount = await prisma.subscription.count({ where: { status: "trialing" } });
    const canceledCount = await prisma.subscription.count({ where: { status: { in: ["canceled", "incomplete_expired"] } } });
    const pastDueCount = await prisma.subscription.count({ where: { status: "past_due" } });
    const totalRevenue = (activeCount + trialCount) * 9; // rough estimate

    return NextResponse.json({
      success: true,
      data: subscriptions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: { active: activeCount, trial: trialCount, canceled: canceledCount, pastDue: pastDueCount, totalRevenue },
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
