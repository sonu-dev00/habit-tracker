import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, a reset link has been sent.",
        },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetTokenHash,
        expires: expiresAt,
      },
    });

    await sendPasswordResetEmail(email, resetToken).catch((err) => {
      console.error(`Failed to send password reset email to ${email}:`, err);
    });

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, a reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
