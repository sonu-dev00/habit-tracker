import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkUsageLimit, trackUsage } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { sanitize } from "@/lib/sanitize";
import { moderateInput } from "@/lib/ai-moderation";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = await rateLimiter.check(`ai-stream:${session.user.id}`);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const usage = await checkUsageLimit(session.user.id);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: `Daily AI usage limit reached (${usage.used}/${usage.limit} tokens)` },
        { status: 429 }
      );
    }

    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const sanitizedMessage = sanitize(message);
    const moderation = moderateInput(sanitizedMessage);
    if (!moderation.safe) {
      return NextResponse.json({ error: "Message content not allowed" }, { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    const stream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are HabitForge AI, a personal habit coaching assistant. Be friendly, supportive, and practical. Keep responses concise.",
          },
          { role: "user", content: sanitizedMessage },
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!stream.ok) {
      const error = await stream.text();
      return NextResponse.json({ error: `OpenAI error: ${stream.status}` }, { status: 502 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        const reader = stream.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

            for (const line of lines) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  fullResponse += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        const estimatedTokens = Math.ceil(fullResponse.length / 4);
        await trackUsage(session.user.id, "ai-chat-stream", estimatedTokens);

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI stream error:", error);
    return NextResponse.json({ error: "Failed to process stream" }, { status: 500 });
  }
}
