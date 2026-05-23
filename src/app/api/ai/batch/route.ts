import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkUsageLimit, trackUsage } from "@/lib/ai";
import { isCircuitOpen, recordSuccess, recordFailure } from "@/lib/ai-circuit-breaker";
import { getCachedResponse, setCachedResponse } from "@/lib/ai-cache";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usage = await checkUsageLimit(session.user.id);
    if (!usage.allowed) {
      return NextResponse.json({ error: "Daily AI usage limit reached" }, { status: 429 });
    }

    const { types } = await request.json();
    const requestedTypes: string[] = types || ["motivate", "roast"];
    const results: Record<string, string> = {};

    if (isCircuitOpen("openai")) {
      return NextResponse.json({
        success: true,
        data: {
          motivate: "AI service is temporarily unavailable. Please try again later.",
          roast: "AI service is temporarily unavailable. Please try again later.",
        },
      });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id, isArchived: false },
      select: { name: true },
    });

    const userData = await prisma.userHabitData.findUnique({
      where: { userId: session.user.id },
      select: { streak: true, totalCompletions: true },
    });

    if (habits.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          motivate: "You haven't created any habits yet! Start by adding a habit to begin your journey.",
          roast: "Can't roast you yet — you haven't set any habits to roast you about!",
        },
      });
    }

    const habitsJson = JSON.stringify(habits.map((h) => ({ name: h.name, streak: userData?.streak || 0, completions: userData?.totalCompletions || 0 })));

    for (const type of requestedTypes) {
      const systemPrompt = type === "motivate"
        ? "You are a motivational habit coach. Be encouraging, specific, and personal. Keep responses under 150 words."
        : "You are a playful but caring habit coach who uses gentle roasting to motivate. Be funny but never mean. Keep responses under 150 words.";

      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: type === "motivate"
          ? `My habits: ${habitsJson}. Give me a motivational message to keep going.`
          : `My habits and progress: ${habitsJson}. Roast me a little to get me motivated.` },
      ];

      const cached = await getCachedResponse(messages);
      if (cached) {
        results[type] = cached;
        continue;
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        results[type] = type === "motivate"
          ? "Keep going! Every small step counts toward your goals."
          : "You're doing better than you think — keep at it!";
        continue;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      results[type] = content;
      await setCachedResponse(messages, content);
    }

    recordSuccess("openai");
    const totalTokens = Object.values(results).reduce((sum, r) => sum + r.length, 0) / 2;
    await trackUsage(session.user.id, "ai-batch", Math.ceil(totalTokens));

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    recordFailure("openai");
    console.error("AI batch error:", error);
    return NextResponse.json(
      { error: "Failed to process AI batch request" },
      { status: 500 }
    );
  }
}
