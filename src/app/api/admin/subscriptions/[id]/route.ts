import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await _request.json();
    const { action } = body;

    if (!action || !["cancel", "restore"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const subscription = await prisma.subscription.findUnique({ where: { id } });
    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (action === "cancel") {
      await prisma.subscription.update({
        where: { id },
        data: { status: "canceled", cancelAtPeriodEnd: true },
      });
    } else {
      await prisma.subscription.update({
        where: { id },
        data: { status: "active", cancelAtPeriodEnd: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}
