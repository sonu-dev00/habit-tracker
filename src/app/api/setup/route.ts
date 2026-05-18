import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      return NextResponse.json({
        success: true,
        data: { setupRequired: false },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        setupRequired: true,
        message: "No users found. Create the first admin account to get started.",
      },
    });
  } catch (error) {
    console.error("Setup check error:", error);
    return NextResponse.json(
      { error: "Failed to check setup status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      return NextResponse.json(
        { error: "Setup has already been completed" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    await prisma.userHabitData.create({
      data: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully. Please sign in.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to complete setup" },
      { status: 500 }
    );
  }
}
