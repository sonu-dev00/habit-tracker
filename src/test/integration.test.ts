import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    habit: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    habitCompletion: {},
    userHabitData: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
    },
    achievement: {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

describe("Habits API", () => {
  it("handles habit creation", async () => {
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.habit.create).mockResolvedValue({ id: "h-1", name: "Test", userId: "user-1" } as any);

    const { POST } = await import("@/app/api/habits/route");
    const req = new Request("http://localhost/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Habit", category: "HEALTH", priority: "NORMAL", frequency: "DAILY" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.name).toBe("Test");
  });

  it("rejects invalid habit data", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any);

    const { POST } = await import("@/app/api/habits/route");
    const req = new Request("http://localhost/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", category: "INVALID", priority: "NORMAL", frequency: "DAILY" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("requires auth for fetching habits", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null as any);

    const { GET } = await import("@/app/api/habits/route");
    const req = new Request("http://localhost/api/habits");
    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });
});

describe("Notifications API", () => {
  it("fetches notifications for authenticated user", async () => {
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.notification.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.notification.count).mockResolvedValue(0);

    const { GET } = await import("@/app/api/notifications/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("marks all notifications read", async () => {
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 3 } as any);

    const { PATCH } = await import("@/app/api/notifications/route");
    const req = new Request("http://localhost/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });
});

describe("Achievements", () => {
  it("defines achievement types with thresholds", async () => {
    const { ACHIEVEMENTS } = await import("@/lib/achievements");
    expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
    ACHIEVEMENTS.forEach((a: any) => {
      expect(a.id).toBeDefined();
      expect(a.threshold).toBeGreaterThan(0);
    });
  });

  it("filters already unlocked achievements", async () => {
    const { checkAchievements } = await import("@/lib/achievements");
    const existing = [{ id: "first-habit" }];
    const unlocked = checkAchievements({ totalCompletions: 1, bestStreak: 0, xpEarned: 0 }, existing);
    expect(unlocked.find((a: any) => a.id === "first-habit")).toBeUndefined();
  });

  it("unlocks streak achievement at 7 days", async () => {
    const { checkAchievements } = await import("@/lib/achievements");
    const unlocked = checkAchievements({ totalCompletions: 10, bestStreak: 7, xpEarned: 100 }, []);
    expect(unlocked.find((a: any) => a.id === "streak-7")).toBeDefined();
  });

  it("unlocks XP achievement at threshold", async () => {
    const { checkAchievements } = await import("@/lib/achievements");
    const unlocked = checkAchievements({ totalCompletions: 0, bestStreak: 0, xpEarned: 5000 }, []);
    expect(unlocked.find((a: any) => a.id === "xp-5000")).toBeDefined();
  });

  it("does not unlock achievement below threshold", async () => {
    const { checkAchievements } = await import("@/lib/achievements");
    const unlocked = checkAchievements({ totalCompletions: 2, bestStreak: 1, xpEarned: 10 }, []);
    expect(unlocked.find((a: any) => a.id === "completions-10")).toBeUndefined();
    expect(unlocked.find((a: any) => a.id === "streak-7")).toBeUndefined();
    expect(unlocked.find((a: any) => a.id === "xp-1000")).toBeUndefined();
  });
});
