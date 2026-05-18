import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateHabitSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId } = await params;

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: {
        completions: {
          orderBy: { date: "desc" },
          take: 100,
        },
        user: {
          select: { userHabitData: true },
        },
      },
    });

    if (!habit || habit.userId !== session.user.id) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const userHabitData = habit.user?.userHabitData;

    return NextResponse.json({
      success: true,
      data: {
        ...habit,
        streak: userHabitData?.streak || 0,
        bestStreak: userHabitData?.bestStreak || 0,
        totalCompletions: userHabitData?.totalCompletions || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching habit:", error);
    return NextResponse.json(
      { error: "Failed to fetch habit" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ habitId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId } = await params;

    const existing = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateHabitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const habit = await prisma.habit.update({
      where: { id: habitId },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: habit });
  } catch (error) {
    console.error("Error updating habit:", error);
    return NextResponse.json(
      { error: "Failed to update habit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ habitId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId } = await params;

    const existing = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    await prisma.habit.delete({ where: { id: habitId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}
