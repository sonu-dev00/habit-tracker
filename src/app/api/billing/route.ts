import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const userHabitCount = await prisma.habit.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        plan: subscription?.plan ?? "FREE",
        status: subscription?.status ?? "active",
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
        currentPeriodEnd: subscription?.stripeCurrentPeriodEnd,
        trialEnd: subscription?.trialEnd,
        habitCount: userHabitCount,
      },
    });
  } catch (error) {
    console.error("Error fetching billing info:", error);
    return NextResponse.json({ error: "Failed to fetch billing info" }, { status: 500 });
  }
}
