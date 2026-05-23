import { describe, it, expect } from "vitest";
import { sanitize, sanitizeObject } from "@/lib/sanitize";

describe("sanitize", () => {
  it("removes script tags", () => {
    const result = sanitize('hello <script>alert("xss")</script> world');
    expect(result).toBe("hello  world");
  });

  it("removes inline event handlers", () => {
    const result = sanitize('<button onclick="alert(1)">Click</button>');
    expect(result).toBe("Click");
  });

  it("removes javascript: protocol", () => {
    const result = sanitize('<a href="javascript:alert(1)">link</a>');
    expect(result).toBe("link");
  });

  it("removes all HTML tags", () => {
    const result = sanitize("<p>Hello</p><b>World</b>");
    expect(result).toBe("HelloWorld");
  });

  it("preserves normal text", () => {
    const result = sanitize("Hello, World!");
    expect(result).toBe("Hello, World!");
  });

  it("handles empty string", () => {
    const result = sanitize("");
    expect(result).toBe("");
  });

  it("trims whitespace", () => {
    const result = sanitize("  hello  ");
    expect(result).toBe("hello");
  });
});

describe("sanitizeObject", () => {
  it("sanitizes specified string fields", () => {
    const obj = {
      name: '<script>alert("xss")</script>John',
      description: "<p>Hello</p>",
      priority: "HIGH",
    };
    const result = sanitizeObject(obj, ["name", "description"]);
    expect(result.name).toBe('John');
    expect(result.description).toBe("Hello");
    expect(result.priority).toBe("HIGH");
  });

  it("ignores non-string fields", () => {
    const obj = {
      name: "Test",
      count: 42,
      enabled: true,
    };
    const result = sanitizeObject(obj, ["name", "count"]);
    expect(result.name).toBe("Test");
    expect(result.count).toBe(42);
  });
});
