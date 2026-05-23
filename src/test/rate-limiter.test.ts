import { describe, it, expect, beforeEach } from "vitest";

// We test the in-memory fallback behavior of the rate limiter
// The Redis-based limiter delegates to the in-memory fallback when no Redis URL is set

describe("RateLimiter (in-memory fallback)", () => {
  let RateLimiter: typeof import("@/lib/rate-limit").RateLimiter;

  beforeEach(async () => {
    const mod = await import("@/lib/rate-limit");
    RateLimiter = mod.RateLimiter;
  });

  it("allows requests within limit", async () => {
    const limiter = new RateLimiter(60000, 5);
    const result = await limiter.check("test-user");
    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(4);
  });

  it("returns resetAt in the future", async () => {
    const limiter = new RateLimiter(60000, 10);
    const result = await limiter.check("test-user-2");
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it("handles concurrent rate limiters independently", async () => {
    const limiterA = new RateLimiter(60000, 100);
    const limiterB = new RateLimiter(60000, 50);

    const resultA = await limiterA.check("user-a");
    const resultB = await limiterB.check("user-b");

    expect(resultA.success).toBe(true);
    expect(resultB.success).toBe(true);
  });

  it("returns remaining count", async () => {
    const limiter = new RateLimiter(60000, 100);
    await limiter.check("test-remaining");
    const remaining = await limiter.getRemaining("test-remaining");
    expect(remaining).toBeGreaterThanOrEqual(98);
  });

  it("resets state", async () => {
    const limiter = new RateLimiter(60000, 2);
    await limiter.check("test-reset");
    await limiter.check("test-reset");
    await limiter.reset("test-reset");
    const remaining = await limiter.getRemaining("test-reset");
    expect(remaining).toBe(2);
  });

  it("uses default window and max when not specified", async () => {
    const limiter = new RateLimiter();
    const result = await limiter.check("test-default");
    expect(result.success).toBe(true);
    expect(result.remaining).toBeLessThanOrEqual(100);
  });
});
