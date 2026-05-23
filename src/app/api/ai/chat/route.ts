import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chatWithAI, trackUsage, checkUsageLimit } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { sanitize } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = await rateLimiter.check(`ai-chat:${session.user.id}`);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait before sending another message.",
          retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    const usage = await checkUsageLimit(session.user.id);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: `Daily AI usage limit reached. You've used ${usage.used} of ${usage.limit} tokens. Upgrade to Pro for higher limits.`,
        },
        { status: 429 }
      );
    }

    const { message, context } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message is too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    const sanitizedMessage = sanitize(message);
    const response = await chatWithAI(session.user.id, sanitizedMessage, context || {});

    const estimatedTokens = Math.ceil((message.length + response.length) / 4);
    await trackUsage(session.user.id, "ai-chat", estimatedTokens);

    return NextResponse.json({
      success: true,
      data: { response },
      usage: { remaining: usage.remaining - estimatedTokens },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to process AI chat request" },
      { status: 500 }
    );
  }
}
