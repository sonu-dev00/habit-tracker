import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;

    const [guilds, myMembership] = await Promise.all([
      prisma.guild.findMany({
        include: { _count: { select: { members: true } } },
        orderBy: { level: "desc" },
      }),
      prisma.guildMember.findUnique({
        where: { userId },
        include: { guild: { include: { members: { include: { user: { select: { name: true, image: true } } } } } } },
      }),
    ]);

    const guild = myMembership?.guild ?? null;
    const members = myMembership?.guild?.members ?? [];

    return NextResponse.json({ success: true, data: { guilds, guild, members } });
  } catch (error) {
    console.error("Error fetching guilds:", error);
    return NextResponse.json({ error: "Failed to fetch guilds" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const existing = await prisma.guildMember.findUnique({ where: { userId } });
    if (existing) {
      return NextResponse.json({ error: "You are already in a guild" }, { status: 400 });
    }

    const guild = await prisma.guild.create({
      data: { name, description: description || "" },
    });

    await prisma.guildMember.create({
      data: { guildId: guild.id, userId, role: "LEADER" },
    });

    return NextResponse.json({ success: true, data: guild }, { status: 201 });
  } catch (error) {
    console.error("Error creating guild:", error);
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "A guild with that name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create guild" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;
    const body = await request.json();
    const { action, guildId } = body;

    if (!action || !guildId) {
      return NextResponse.json({ error: "action and guildId are required" }, { status: 400 });
    }

    if (action === "join") {
      const existing = await prisma.guildMember.findUnique({ where: { userId } });
      if (existing) {
        return NextResponse.json({ error: "You are already in a guild" }, { status: 400 });
      }

      const guild = await prisma.guild.findUnique({ where: { id: guildId } });
      if (!guild) {
        return NextResponse.json({ error: "Guild not found" }, { status: 404 });
      }

      try {
        const membership = await prisma.guildMember.create({
          data: { guildId, userId },
        });

        return NextResponse.json({ success: true, data: membership });
      } catch (err: unknown) {
        if ((err as { code?: string })?.code === "P2002") {
          return NextResponse.json({ error: "You are already in a guild" }, { status: 400 });
        }
        throw err;
      }
    }

    if (action === "leave") {
      const membership = await prisma.guildMember.findUnique({
        where: { userId },
      });
      if (!membership || membership.guildId !== guildId) {
        return NextResponse.json({ error: "You are not a member of this guild" }, { status: 400 });
      }

      if (membership.role === "LEADER") {
        const successors = await prisma.guildMember.findMany({
          where: { guildId, userId: { not: userId } },
          orderBy: [
            { role: "asc" },
            { joinedAt: "asc" },
          ],
        });

        if (successors.length === 0) {
          await prisma.guildMember.delete({ where: { userId } });
          await prisma.guild.delete({ where: { id: guildId } });
          return NextResponse.json({ success: true, data: { left: true, guildDeleted: true } });
        }

        const nextLeader = successors[0];
        await prisma.guildMember.update({
          where: { id: nextLeader.id },
          data: { role: "LEADER" },
        });
      }

      await prisma.guildMember.delete({ where: { userId } });

      const remaining = await prisma.guildMember.count({ where: { guildId } });
      if (remaining === 0) {
        await prisma.guild.delete({ where: { id: guildId } });
      }

      return NextResponse.json({ success: true, data: { left: true } });
    }

    return NextResponse.json({ error: "Invalid action. Use 'join' or 'leave'" }, { status: 400 });
  } catch (error) {
    console.error("Error updating guild membership:", error);
    return NextResponse.json({ error: "Failed to update guild membership" }, { status: 500 });
  }
}
