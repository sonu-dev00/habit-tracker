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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [subscriptions, payments, pendingPayments] = await Promise.all([
      prisma.subscription.findMany({
        where: { status: "active" },
        select: { plan: true },
      }),
      prisma.paymentHistory.findMany({
        where: { createdAt: { gte: startOfMonth }, status: "succeeded" },
        select: { amount: true, plan: true },
      }),
      prisma.paymentHistory.findMany({
        where: { status: "pending" },
        select: { amount: true },
      }),
    ]);

    const monthlyRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const byPlan: Record<string, { amount: number; count: number }> = {};

    for (const sub of subscriptions) {
      if (!byPlan[sub.plan]) byPlan[sub.plan] = { amount: 0, count: 0 };
      byPlan[sub.plan].count++;
    }

    for (const p of payments) {
      if (!byPlan[p.plan]) byPlan[p.plan] = { amount: 0, count: 0 };
      byPlan[p.plan].amount += p.amount;
    }

    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    const paymentHistory = await prisma.paymentHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        plan: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    });

    const yearlyData = await prisma.paymentHistory.findMany({
      where: { createdAt: { gte: startOfYear }, status: "succeeded" },
      select: { amount: true, createdAt: true },
    });

    const monthlyTrend: { month: string; amount: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const m = new Date(now.getFullYear(), i, 1);
      const mEnd = new Date(now.getFullYear(), i + 1, 1);
      const total = yearlyData
        .filter((p) => p.createdAt >= m && p.createdAt < mEnd)
        .reduce((s, p) => s + p.amount, 0);
      monthlyTrend.push({
        month: m.toLocaleString("en-US", { month: "short" }),
        amount: total,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        mrr: monthlyRevenue,
        arr: monthlyRevenue * 12,
        byPlan: Object.entries(byPlan).map(([plan, d]) => ({
          plan,
          amount: d.amount,
          count: d.count,
        })),
        paymentHistory,
        pendingInvoices: pendingPayments.length,
        pendingAmount,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 });
  }
}
