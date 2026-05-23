import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const flags = await prisma.featureFlag.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: flags });
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    return NextResponse.json({ error: "Failed to fetch feature flags" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, enabled } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const flag = await prisma.featureFlag.create({
      data: { name, description: description || null, enabled: enabled || false },
    });

    return NextResponse.json({ success: true, data: flag }, { status: 201 });
  } catch (error) {
    console.error("Error creating feature flag:", error);
    return NextResponse.json({ error: "Failed to create feature flag" }, { status: 500 });
  }
}
