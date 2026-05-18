import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHabitSchema } from "@/lib/validation";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.HabitWhereInput = {
      userId: session.user.id,
      isArchived: status === "archived" ? true : status === "active" ? false : undefined,
    };

    if (category) where.category = category as any;
    if (priority) where.priority = priority as any;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [habits, total, userData] = await Promise.all([
      prisma.habit.findMany({
        where,
        include: {
          completions: {
            where: {
              date: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30)),
              },
            },
            orderBy: { date: "desc" },
          },
          user: {
            select: { userHabitData: true },
          },
        },
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.habit.count({ where }),
      prisma.userHabitData.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    const habitsWithStats = habits.map((habit) => {
      const userHabitData = habit.user?.userHabitData;
      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        category: habit.category,
        priority: habit.priority,
        frequency: habit.frequency,
        xpReward: habit.xpReward,
        timeToComplete: habit.timeToComplete,
        reminderTime: habit.reminderTime,
        isPinned: habit.isPinned,
        isArchived: habit.isArchived,
        createdAt: habit.createdAt,
        updatedAt: habit.updatedAt,
        streak: userHabitData?.streak || 0,
        bestStreak: userHabitData?.bestStreak || 0,
        totalCompletions: userHabitData?.totalCompletions || 0,
        completions: habit.completions,
      };
    });

    return NextResponse.json({
      success: true,
      data: habitsWithStats,
      pagination: {
        limit,
        offset,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch habits" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createHabitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const [habit] = await Promise.all([
      prisma.habit.create({
        data: {
          userId: session.user.id,
          ...parsed.data,
        },
      }),
      prisma.userHabitData.upsert({
        where: { userId: session.user.id },
        update: {},
        create: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({ success: true, data: habit }, { status: 201 });
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}
