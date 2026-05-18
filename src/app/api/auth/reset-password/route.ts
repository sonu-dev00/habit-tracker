import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: tokenHash },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({
        where: { token: tokenHash },
      });
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await prisma.verificationToken.delete({
      where: { token: tokenHash },
    });

    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password has been reset successfully. You can now sign in.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
