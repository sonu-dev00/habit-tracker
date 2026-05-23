import { describe, it, expect, beforeEach } from "vitest";
import { getCachedResponse, setCachedResponse, clearCache } from "@/lib/ai-cache";

describe("AI cache", () => {
  beforeEach(() => {
    clearCache();
  });

  it("returns null for uncached request", async () => {
    const result = await getCachedResponse([
      { role: "user", content: "Hello" },
    ]);
    expect(result).toBeNull();
  });

  it("returns cached response for identical messages", async () => {
    const messages = [
      { role: "system", content: "You are a coach" },
      { role: "user", content: "Motivate me" },
    ];
    await setCachedResponse(messages, "You can do it!");
    const result = await getCachedResponse(messages);
    expect(result).toBe("You can do it!");
  });

  it("returns null for different messages", async () => {
    await setCachedResponse(
      [{ role: "user", content: "Hello" }],
      "Hi there!"
    );
    const result = await getCachedResponse([
      { role: "user", content: "Goodbye" },
    ]);
    expect(result).toBeNull();
  });

  it("handles empty messages array", async () => {
    const result = await getCachedResponse([]);
    expect(result).toBeNull();
  });
});
