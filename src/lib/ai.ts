const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const FALLBACK_MODEL = "gpt-4o-mini";
const PRIMARY_MODEL = "gpt-4o-mini";

const DAILY_QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "Motivation is what gets you started. Habit is what keeps you going. — Jim Ryun",
  "First we make our habits, then our habits make us. — Charles C. Noble",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Small daily improvements over time lead to stunning results. — Robin Sharma",
  "Be the change that you wish to see in the world. — Mahatma Gandhi",
  "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
];

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function getDb() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

async function callOpenAI(messages: ChatMessage[], maxTokens: number = 500): Promise<string> {
  if (!OPENAI_API_KEY) return "AI features are currently unavailable. Please configure your OPENAI_API_KEY.";

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: PRIMARY_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    if (response.status === 429) {
      return await callOpenAIFallback(messages, maxTokens);
    }
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function callOpenAIFallback(messages: ChatMessage[], maxTokens: number): Promise<string> {
  if (FALLBACK_MODEL === PRIMARY_MODEL) {
    return "AI service is currently busy. Please try again in a few minutes.";
  }

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: FALLBACK_MODEL,
        messages,
        max_tokens: Math.min(maxTokens, 300),
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return "AI service is currently busy. Please try again in a few minutes.";
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch {
    return "AI service is currently busy. Please try again in a few minutes.";
  }
}

function compressMessages(messages: ChatMessage[]): ChatMessage[] {
  const SYSTEM_BUDGET = 500;
  const USER_BUDGET = 300;
  const ASSISTANT_BUDGET = 300;

  return messages.map((m) => {
    const budget = m.role === "system" ? SYSTEM_BUDGET : m.role === "user" ? USER_BUDGET : ASSISTANT_BUDGET;
    if (m.content.length > budget) {
      return { ...m, content: m.content.slice(0, budget) + "..." };
    }
    return m;
  });
}

import { moderateInput } from "@/lib/ai-moderation";

export async function getMotivation(userId: string, habits: { name: string; streak?: number }[]): Promise<string> {
  const prisma = await getDb();

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are the System Voice from Solo Leveling — an all-knowing, epic narrator who speaks like an RPG game system. You address the user as a 'Player' or 'Hunter'. Use terms like 'Your journey continues', 'You have grown stronger', 'Daily Quest Assigned', 'Stat increased'. Be encouraging, specific, and personal, but speak with epic, cinematic energy. Keep responses under 150 words.",
    },
    {
      role: "user",
      content: `I am a habit-building player. My current habits: ${JSON.stringify(habits)}. Give me a motivational System Voice message to keep going. Refer to me as Player.`,
    },
  ];

  const compressed = compressMessages(messages);
  const { getCachedResponse, setCachedResponse } = await import("@/lib/ai-cache");
  const cached = await getCachedResponse(compressed);
  if (cached) return cached;

  const response = await callOpenAI(compressed);
  await setCachedResponse(compressed, response);
  return response;
}

export async function getRoast(userId: string, habits: { name: string; streak?: number; completions?: number }[]): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are a stern but caring System Voice from an RPG world. You speak to the Player with tough love, like a mentor testing their resolve. Use terms like 'This is your wake-up call, Player', 'Your stats are suffering', 'Penalty Quest incoming'. Be funny but never mean. Keep responses under 150 words.",
    },
    {
      role: "user",
      content: `Player habits and progress: ${JSON.stringify(habits)}. Give me a System Voice roast to get me motivated.`,
    },
  ];

  const compressed = compressMessages(messages);
  const { getCachedResponse, setCachedResponse } = await import("@/lib/ai-cache");
  const cached = await getCachedResponse(compressed);
  if (cached) return cached;

  const response = await callOpenAI(compressed);
  await setCachedResponse(compressed, response);
  return response;
}

export async function getWeeklyReview(
  userId: string,
  habits: { name: string; category?: string }[],
  completions: { date: string; habitName?: string }[]
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are the System Voice delivering a Weekly Performance Review to a Player in an RPG habit game. Speak like an epic game system evaluating the Player's progress. Use terms like 'Weekly Report', 'Performance Analysis', 'Clearance Rate', 'Stat Growth'. Provide specific insights, patterns, and actionable advice. Keep responses under 200 words.",
    },
    {
      role: "user",
      content: `Player habits: ${JSON.stringify(habits)}. Player completions this week: ${JSON.stringify(completions)}. Deliver the weekly performance review as the System Voice.`,
    },
  ];

  const compressed = compressMessages(messages);
  const { getCachedResponse, setCachedResponse } = await import("@/lib/ai-cache");
  const cached = await getCachedResponse(compressed);
  if (cached) return cached;

  const response = await callOpenAI(compressed);
  await setCachedResponse(compressed, response);
  return response;
}

export async function getSuggestion(userId: string, habits: { name: string; category?: string; frequency?: string }[]): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are a habit formation expert. Suggest new habits based on existing ones, and give tips to improve consistency. Keep responses under 150 words.",
    },
    {
      role: "user",
      content: `My current habits: ${JSON.stringify(habits)}. What new habits should I add or how can I improve?`,
    },
  ];

  const compressed = compressMessages(messages);
  const { getCachedResponse, setCachedResponse } = await import("@/lib/ai-cache");
  const cached = await getCachedResponse(compressed);
  if (cached) return cached;

  const response = await callOpenAI(compressed);
  await setCachedResponse(compressed, response);
  return response;
}

export async function chatWithAI(
  userId: string,
  message: string,
  context: { habits?: unknown[]; stats?: unknown }
): Promise<string> {
  const moderation = moderateInput(message);
  if (!moderation.safe) {
    return "I can't process that request. Please keep the conversation respectful and constructive.";
  }

  const prisma = await getDb();
  const memories = await prisma.aiMemory.findMany({
    where: { userId },
    select: { key: true, value: true },
  });
  const memoryMap = memories.reduce((acc: Record<string, unknown>, m: { key: string; value: unknown }) => {
    acc[m.key] = m.value;
    return acc;
  }, {} as Record<string, unknown>);

  const previousMessages = await prisma.aiMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { role: true, content: true },
  });

  const historySummary = previousMessages
    .reverse()
    .slice(-6)
    .map((m: { role: string; content: string }) => `${m.role}: ${m.content.slice(0, 200)}`)
    .join("\n");

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are the System Voice — an epic RPG game system interface speaking to a Player in a habit-building journey. You track their stats, quests, and progress like a game UI. Context: ${JSON.stringify(context).slice(0, 500)}. Memories: ${JSON.stringify(memoryMap).slice(0, 300)}. Speak like an RPG system — use terms like 'Player', 'Quest', 'Stat', 'Level Up', 'Achievement Unlocked'. Be supportive but maintain the epic, cinematic tone. Keep responses concise.`,
    },
    ...(historySummary ? [{ role: "user" as const, content: `Recent history:\n${historySummary}` }] : []),
    { role: "user", content: message },
  ];

  const compressed = compressMessages(messages);
  const { getCachedResponse, setCachedResponse } = await import("@/lib/ai-cache");
  const { isCircuitOpen, recordSuccess, recordFailure } = await import("@/lib/ai-circuit-breaker");

  if (isCircuitOpen("openai")) {
    return "AI service is temporarily unavailable. Please try again later.";
  }

  const cached = await getCachedResponse(compressed);
  if (cached) return cached;

  try {
    const response = await callOpenAI(compressed);
    recordSuccess("openai");
    await setCachedResponse(compressed, response);

    await prisma.aiMessage.create({ data: { userId, role: "user", content: message } });
    await prisma.aiMessage.create({ data: { userId, role: "assistant", content: response } });

    return response;
  } catch (error) {
    recordFailure("openai");
    throw error;
  }
}

export function getDailyQuote(): string {
  const today = new Date().getDate();
  return DAILY_QUOTES[today % DAILY_QUOTES.length];
}

export async function trackUsage(userId: string, endpoint: string, tokensUsed: number): Promise<void> {
  const prisma = await getDb();
  await prisma.apiUsage.create({ data: { userId, endpoint, tokensUsed } });
}

const TIER_LIMITS: Record<string, number> = {
  FREE: 5000,
  PRO: 50000,
  TEAMS: 200000,
};

export async function getUserTier(userId: string): Promise<string> {
  const prisma = await getDb();
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });
  if (sub && (sub.plan === "PRO" || sub.plan === "TEAMS") && sub.status === "active") {
    return sub.plan;
  }
  return "FREE";
}

export async function checkUsageLimit(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const prisma = await getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [usage, tier] = await Promise.all([
    prisma.apiUsage.findMany({
      where: { userId, createdAt: { gte: today } },
    }),
    getUserTier(userId),
  ]);

  const totalTokens = usage.reduce((sum: number, u: { tokensUsed: number }) => sum + u.tokensUsed, 0);
  const limit = TIER_LIMITS[tier] || TIER_LIMITS.FREE;
  const remaining = Math.max(0, limit - totalTokens);

  return { allowed: remaining > 0, used: totalTokens, limit, remaining };
}

export async function cleanupOldAiMessages(): Promise<number> {
  const prisma = await getDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await prisma.aiMessage.deleteMany({
    where: { createdAt: { lt: thirtyDaysAgo } },
  });

  return result.count;
}

export async function storeMemory(userId: string, key: string, value: unknown): Promise<void> {
  const prisma = await getDb();
  await prisma.aiMemory.upsert({
    where: { userId_key: { userId, key } },
    update: { value: JSON.parse(JSON.stringify(value)) },
    create: { userId, key, value: JSON.parse(JSON.stringify(value)) },
  });
}

export async function retrieveMemory(userId: string, key: string): Promise<unknown> {
  const prisma = await getDb();
  const memory = await prisma.aiMemory.findUnique({
    where: { userId_key: { userId, key } },
  });
  return memory?.value || null;
}
