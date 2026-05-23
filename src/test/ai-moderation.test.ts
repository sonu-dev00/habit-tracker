import { describe, it, expect } from "vitest";
import { moderateInput } from "@/lib/ai-moderation";

describe("moderateInput", () => {
  it("allows normal text", () => {
    const result = moderateInput("Hello, I need help with my habits");
    expect(result.safe).toBe(true);
  });

  it("blocks script tags", () => {
    const result = moderateInput('<script>alert("xss")</script>');
    expect(result.safe).toBe(false);
  });

  it("blocks SQL injection patterns", () => {
    const result = moderateInput("DROP TABLE users");
    expect(result.safe).toBe(false);
  });

  it("blocks malicious URLs", () => {
    const result = moderateInput("Visit https://phishing.example.com");
    expect(result.safe).toBe(false);
  });

  it("rejects extremely long input", () => {
    const longText = "a".repeat(6000);
    const result = moderateInput(longText);
    expect(result.safe).toBe(false);
  });

  it("allows normal HTML tags (stripped first)", () => {
    const result = moderateInput("<b>Hello</b> <i>world</i>");
    expect(result.safe).toBe(true);
  });
});
