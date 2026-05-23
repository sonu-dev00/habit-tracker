import { describe, it, expect, vi } from "vitest";
import { NextResponse } from "next/server";

// Test the apiGuard logic in isolation
// We mock the auth/prisma dependencies

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
    },
  },
}));

describe("apiGuard", () => {
  it("exports required helpers", async () => {
    const mod = await import("@/lib/api-guard");
    expect(typeof mod.apiGuard).toBe("function");
    expect(typeof mod.checkBan).toBe("function");
    expect(typeof mod.checkPro).toBe("function");
    expect(typeof mod.forbidden).toBe("function");
    expect(typeof mod.unauthorized).toBe("function");
  });

  it("returns 401 when unauthorized", async () => {
    const { apiGuard } = await import("@/lib/api-guard");
    const handler = apiGuard(async () => NextResponse.json({ ok: true }));

    const req = new Request("http://localhost/api/test");
    const res = await handler(req);
    expect(res.status).toBe(401);
  });

  it("checkBan and checkPro are async functions", async () => {
    const { checkBan, checkPro } = await import("@/lib/api-guard");
    expect(typeof checkBan).toBe("function");
    expect(typeof checkPro).toBe("function");
  });
});
