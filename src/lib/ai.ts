const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
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
      model: "gpt-4o-mini",
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

export async function getMotivation(userId: string, habits: { name: string; streak?: number }[]): Promise<string> {
  const prisma = await getDb();
  const memories = await prisma.aiMemory.findMany({
    where: { userId },
    select: { key: true, value: true },
  });

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are a motivational habit coach. Be encouraging, specific, and personal. Keep responses under 150 words.",
    },
    {
      role: "user",
      content: `My habits: ${JSON.stringify(habits)}. Give me a motivational message to keep going.`,
    },
  ];

  return callOpenAI(messages);
}

export async function getRoast(userId: string, habits: { name: string; streak?: number; completions?: number }[]): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are a playful but caring habit coach who uses gentle roasting to motivate. Be funny but never mean. Keep responses under 150 words.",
    },
    {
      role: "user",
      content: `My habits and progress: ${JSON.stringify(habits)}. Roast me a little to get me motivated.`,
    },
  ];
  return callOpenAI(messages);
}

export async function getWeeklyReview(
  userId: string,
  habits: { name: string; category?: string }[],
  completions: { date: string; habitName?: string }[]
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are an analytical habit coach. Provide a weekly review with specific insights, patterns, and actionable advice. Keep responses under 200 words.",
    },
    {
      role: "user",
      content: `My habits: ${JSON.stringify(habits)}. My completions this week: ${JSON.stringify(completions)}. Give me my weekly review.`,
    },
  ];
  return callOpenAI(messages);
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
  return callOpenAI(messages);
}

export async function chatWithAI(
  userId: string,
  message: string,
  context: { habits?: any[]; stats?: any }
): Promise<string> {
  const prisma = await getDb();
  const memories = await prisma.aiMemory.findMany({
    where: { userId },
    select: { key: true, value: true },
  });
  const memoryMap = memories.reduce((acc: Record<string, any>, m: { key: string; value: any }) => {
    acc[m.key] = m.value;
    return acc;
  }, {} as Record<string, any>);

  const previousMessages = await prisma.aiMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { role: true, content: true },
  });

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are HabitForge AI, a personal habit coaching assistant. Context: ${JSON.stringify(context)}. Memories: ${JSON.stringify(memoryMap)}. Be friendly, supportive, and practical. Keep responses concise.`,
    },
    ...previousMessages.reverse().map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const response = await callOpenAI(messages);

  await prisma.aiMessage.create({ data: { userId, role: "user", content: message } });
  await prisma.aiMessage.create({ data: { userId, role: "assistant", content: response } });

  return response;
}

export function getDailyQuote(): string {
  const today = new Date().getDate();
  return DAILY_QUOTES[today % DAILY_QUOTES.length];
}

export async function trackUsage(userId: string, endpoint: string, tokensUsed: number): Promise<void> {
  const prisma = await getDb();
  await prisma.apiUsage.create({ data: { userId, endpoint, tokensUsed } });
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

  const usage = await prisma.apiUsage.findMany({
    where: { userId, createdAt: { gte: today } },
  });

  const totalTokens = usage.reduce((sum: number, u: { tokensUsed: number }) => sum + u.tokensUsed, 0);
  const limit = 10000;
  const remaining = Math.max(0, limit - totalTokens);

  return { allowed: remaining > 0, used: totalTokens, limit, remaining };
}

export async function storeMemory(userId: string, key: string, value: any): Promise<void> {
  const prisma = await getDb();
  await prisma.aiMemory.upsert({
    where: { userId_key: { userId, key } },
    update: { value },
    create: { userId, key, value },
  });
}

export async function retrieveMemory(userId: string, key: string): Promise<any | null> {
  const prisma = await getDb();
  const memory = await prisma.aiMemory.findUnique({
    where: { userId_key: { userId, key } },
  });
  return memory?.value || null;
}
