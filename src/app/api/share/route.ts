import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId } = await request.json();
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      select: { id: true, name: true, category: true, userId: true },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    if (habit.userId !== session.user.id) {
      return NextResponse.json({ error: "Not your habit" }, { status: 403 });
    }

    const shareToken = Buffer.from(`${habit.id}:${Date.now()}`).toString("base64url").slice(0, 12);

    await prisma.habit.update({
      where: { id: habitId },
      data: { shareToken },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/shared/${shareToken}`;

    return NextResponse.json({ success: true, data: { shareUrl, shareToken } });
  } catch (error) {
    console.error("Error sharing habit:", error);
    return NextResponse.json({ error: "Failed to share habit" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Share token required" }, { status: 400 });
    }

    const habit = await prisma.habit.findFirst({
      where: { shareToken: token },
      select: {
        name: true,
        description: true,
        category: true,
        priority: true,
        frequency: true,
        user: { select: { name: true } },
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Shared habit not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: habit.name,
        description: habit.description,
        category: habit.category,
        priority: habit.priority,
        frequency: habit.frequency,
        sharedBy: habit.user.name,
      },
    });
  } catch (error) {
    console.error("Error fetching shared habit:", error);
    return NextResponse.json({ error: "Failed to fetch shared habit" }, { status: 500 });
  }
}
