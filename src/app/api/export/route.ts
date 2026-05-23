import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id },
      include: {
        completions: {
          orderBy: { date: "desc" },
          take: 365,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Name", "Category", "Priority", "Frequency", "XP Reward", "Completions (30d)", "Created At", "Status"];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const rows = habits.map((h) => {
      const recentCompletions = h.completions.filter((c) => c.date >= thirtyDaysAgo).length;
      return [
        `"${h.name.replace(/"/g, '""')}"`,
        h.category,
        h.priority,
        h.frequency,
        h.xpReward.toString(),
        recentCompletions.toString(),
        h.createdAt.toISOString().slice(0, 10),
        h.isArchived ? "Archived" : "Active",
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="habitforge-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
