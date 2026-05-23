import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, habitIds } = await request.json();
    if (!Array.isArray(habitIds) || habitIds.length === 0) {
      return NextResponse.json({ error: "habitIds must be a non-empty array" }, { status: 400 });
    }

    if (action === "archive") {
      await prisma.habit.updateMany({
        where: { id: { in: habitIds }, userId: session.user.id },
        data: { isArchived: true },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Batch PATCH error:", error);
    return NextResponse.json({ error: "Failed to update habits" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitIds } = await request.json();
    if (!Array.isArray(habitIds) || habitIds.length === 0) {
      return NextResponse.json({ error: "habitIds must be a non-empty array" }, { status: 400 });
    }

    const habits = await prisma.habit.findMany({
      where: { id: { in: habitIds }, userId: session.user.id },
      select: { id: true },
    });

    const validIds = habits.map((h) => h.id);
    if (validIds.length === 0) {
      return NextResponse.json({ error: "No matching habits found" }, { status: 404 });
    }

    await prisma.habitCompletion.deleteMany({ where: { habitId: { in: validIds } } });
    await prisma.habit.deleteMany({ where: { id: { in: validIds } } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Batch DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete habits" }, { status: 500 });
  }
}
