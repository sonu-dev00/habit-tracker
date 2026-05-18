export class RateLimiter {
  private requests: Map<string, { count: number; resetAt: number }>;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.requests = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  private getKey(identifier: string): string {
    return identifier;
  }

  check(identifier: string): { success: boolean; remaining: number; resetAt: number } {
    const key = this.getKey(identifier);
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || now >= entry.resetAt) {
      this.requests.set(key, { count: 1, resetAt: now + this.windowMs });
      return { success: true, remaining: this.maxRequests - 1, resetAt: now + this.windowMs };
    }

    if (entry.count >= this.maxRequests) {
      return { success: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { success: true, remaining: this.maxRequests - entry.count, resetAt: entry.resetAt };
  }

  reset(identifier: string): void {
    this.requests.delete(this.getKey(identifier));
  }

  getRemaining(identifier: string): number {
    const key = this.getKey(identifier);
    const entry = this.requests.get(key);
    if (!entry || Date.now() >= entry.resetAt) return this.maxRequests;
    return Math.max(0, this.maxRequests - entry.count);
  }

  getResetAt(identifier: string): number | null {
    const entry = this.requests.get(this.getKey(identifier));
    return entry ? entry.resetAt : null;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now >= entry.resetAt) {
        this.requests.delete(key);
      }
    }
  }
}

const globalForRateLimiter = globalThis as unknown as {
  rateLimiter: RateLimiter | undefined;
};

export const rateLimiter = globalForRateLimiter.rateLimiter ?? new RateLimiter(60000, 100);

if (process.env.NODE_ENV !== "production") {
  globalForRateLimiter.rateLimiter = rateLimiter;
}

setInterval(() => {
  rateLimiter.cleanup();
}, 60000);

export const authLimiter = new RateLimiter(60000, 5);
export const apiLimiter = new RateLimiter(60000, 60);
export const emailLimiter = new RateLimiter(60000, 3);
