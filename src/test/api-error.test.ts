import { describe, it, expect } from "vitest";
import { unauthorized, forbidden, badRequest, notFound, handleApiError } from "@/lib/api-error";

describe("API error helpers", () => {
  it("unauthorized returns 401", () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
  });

  it("unauthorized includes custom message", async () => {
    const res = unauthorized("Custom message");
    const body = await res.json();
    expect(body.error).toBe("Custom message");
  });

  it("forbidden returns 403", () => {
    const res = forbidden();
    expect(res.status).toBe(403);
  });

  it("badRequest returns 400", () => {
    const res = badRequest("Invalid input");
    expect(res.status).toBe(400);
  });

  it("notFound returns 404", () => {
    const res = notFound("User");
    expect(res.status).toBe(404);
  });

  it("handleApiError returns 500 for unknown errors", async () => {
    const res = handleApiError(new Error("Something broke"));
    expect(res.status).toBe(500);
  });
});
