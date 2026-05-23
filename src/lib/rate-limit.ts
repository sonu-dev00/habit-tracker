import { Redis } from "ioredis";

function getRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  return new Redis(url, { maxRetriesPerRequest: 3, retryStrategy: (times) => Math.min(times * 50, 2000) });
}

export class RateLimiter {
  private redis: Redis | null;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.redis = null;
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  private async ensureRedis(): Promise<Redis | null> {
    if (!this.redis) {
      this.redis = getRedis();
    }
    return this.redis;
  }

  async check(identifier: string): Promise<{ success: boolean; remaining: number; resetAt: number }> {
    const redis = await this.ensureRedis();
    if (!redis) {
      return { success: true, remaining: this.maxRequests, resetAt: Date.now() + this.windowMs };
    }

    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const multi = redis.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zadd(key, now, `${now}:${Math.random()}`);
    multi.zcard(key);
    multi.pexpire(key, this.windowMs);
    multi.pttl(key);

    const results = await multi.exec();
    if (!results) {
      return { success: true, remaining: this.maxRequests, resetAt: now + this.windowMs };
    }

    const count = results[2]?.[1] as number || 0;
    const ttl = results[4]?.[1] as number || this.windowMs;

    return {
      success: count <= this.maxRequests,
      remaining: Math.max(0, this.maxRequests - count),
      resetAt: now + ttl,
    };
  }

  async reset(identifier: string): Promise<void> {
    const redis = await this.ensureRedis();
    if (redis) {
      await redis.del(`ratelimit:${identifier}`);
    }
  }

  async getRemaining(identifier: string): Promise<number> {
    const redis = await this.ensureRedis();
    if (!redis) return this.maxRequests;

    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);
    return Math.max(0, this.maxRequests - count);
  }

  async getResetAt(identifier: string): Promise<number | null> {
    const redis = await this.ensureRedis();
    if (!redis) return null;

    const key = `ratelimit:${identifier}`;
    const ttl = await redis.pttl(key);
    if (ttl <= 0) return null;
    return Date.now() + ttl;
  }
}

const globalForRateLimiter = globalThis as unknown as {
  defaultLimiter: RateLimiter | undefined;
};

function createDefault(): RateLimiter {
  return new RateLimiter(60000, 100);
}

export const rateLimiter = globalForRateLimiter.defaultLimiter ?? createDefault();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimiter.defaultLimiter = rateLimiter;
}

export const authLimiter = new RateLimiter(60000, 5);
export const apiLimiter = new RateLimiter(60000, 60);
export const emailLimiter = new RateLimiter(60000, 3);
