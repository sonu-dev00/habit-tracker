import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  createHabitSchema,
  updateHabitSchema,
  feedbackSchema,
  adminActionSchema,
  profileUpdateSchema,
} from "@/lib/validation";

describe("loginSchema", () => {
  it("accepts valid login", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "notanemail", password: "secret123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("createHabitSchema", () => {
  it("accepts valid habit", () => {
    const result = createHabitSchema.safeParse({
      name: "Exercise",
      description: "30 min workout",
      category: "HEALTH",
      priority: "ESSENTIAL",
      frequency: "DAILY",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = createHabitSchema.safeParse({
      category: "HEALTH",
      priority: "NORMAL",
      frequency: "DAILY",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = createHabitSchema.safeParse({
      name: "Test",
      category: "INVALID",
      priority: "NORMAL",
      frequency: "DAILY",
    });
    expect(result.success).toBe(false);
  });

  it("applies default xpReward", () => {
    const result = createHabitSchema.safeParse({
      name: "Read",
      category: "MIND",
      priority: "NORMAL",
      frequency: "DAILY",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.xpReward).toBe(5);
    }
  });
});

describe("updateHabitSchema", () => {
  it("accepts partial update", () => {
    const result = updateHabitSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("accepts empty update", () => {
    const result = updateHabitSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts isArchived flag", () => {
    const result = updateHabitSchema.safeParse({ isArchived: true });
    expect(result.success).toBe(true);
  });
});

describe("feedbackSchema", () => {
  it("accepts valid feedback", () => {
    const result = feedbackSchema.safeParse({
      type: "feature",
      message: "I would love a dark mode toggle!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short message", () => {
    const result = feedbackSchema.safeParse({
      type: "bug",
      message: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = feedbackSchema.safeParse({
      type: "invalid",
      message: "This is a valid feedback message",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminActionSchema", () => {
  it("accepts valid action", () => {
    const result = adminActionSchema.safeParse({
      action: "ban",
      userId: "user-123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts action with reason", () => {
    const result = adminActionSchema.safeParse({
      action: "ban",
      userId: "user-123",
      reason: "Spam",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid action", () => {
    const result = adminActionSchema.safeParse({
      action: "invalid",
      userId: "user-123",
    });
    expect(result.success).toBe(false);
  });
});

describe("profileUpdateSchema", () => {
  it("accepts valid profile update", () => {
    const result = profileUpdateSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL", () => {
    const result = profileUpdateSchema.safeParse({ image: "not-a-url" });
    expect(result.success).toBe(false);
  });
});
