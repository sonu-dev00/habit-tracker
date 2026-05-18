import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { action, reason } = body;

    if (!action || !["ban", "unban", "delete", "promote", "demote"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be one of: ban, unban, delete, promote, demote" },
        { status: 400 }
      );
    }

    if (userId === session.user.id && action !== "demote") {
      return NextResponse.json(
        { error: "Cannot perform this action on yourself" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (action) {
      case "ban": {
        await prisma.user.update({
          where: { id: userId },
          data: { banned: true, banReason: reason || null },
        });
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: "BAN_USER",
            entity: "User",
            entityId: userId,
            metadata: { reason },
          },
        });
        break;
      }
      case "unban": {
        await prisma.user.update({
          where: { id: userId },
          data: { banned: false, banReason: null },
        });
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: "UNBAN_USER",
            entity: "User",
            entityId: userId,
          },
        });
        break;
      }
      case "delete": {
        await prisma.user.delete({ where: { id: userId } });
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: "DELETE_USER",
            entity: "User",
            entityId: userId,
            metadata: { reason },
          },
        });
        return NextResponse.json({ success: true, message: "User deleted" });
      }
      case "promote": {
        await prisma.user.update({
          where: { id: userId },
          data: { role: "ADMIN" },
        });
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: "PROMOTE_USER",
            entity: "User",
            entityId: userId,
          },
        });
        break;
      }
      case "demote": {
        if (targetUser.role !== "ADMIN") {
          return NextResponse.json(
            { error: "User is not an admin" },
            { status: 400 }
          );
        }
        await prisma.user.update({
          where: { id: userId },
          data: { role: "USER" },
        });
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: "DEMOTE_USER",
            entity: "User",
            entityId: userId,
          },
        });
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user action error:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
