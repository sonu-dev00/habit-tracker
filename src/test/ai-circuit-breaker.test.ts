import { describe, it, expect, beforeEach } from "vitest";
import {
  isCircuitOpen,
  recordSuccess,
  recordFailure,
  resetCircuit,
} from "@/lib/ai-circuit-breaker";

describe("circuit breaker", () => {
  beforeEach(() => {
    resetCircuit("test");
  });

  it("starts closed", () => {
    expect(isCircuitOpen("test")).toBe(false);
  });

  it("opens after 5 failures", () => {
    for (let i = 0; i < 5; i++) {
      recordFailure("test");
    }
    expect(isCircuitOpen("test")).toBe(true);
  });

  it("stays closed with < 5 failures", () => {
    for (let i = 0; i < 4; i++) {
      recordFailure("test");
    }
    expect(isCircuitOpen("test")).toBe(false);
  });

  it("resets on success", () => {
    for (let i = 0; i < 5; i++) {
      recordFailure("test");
    }
    expect(isCircuitOpen("test")).toBe(true);
    recordSuccess("test");
    expect(isCircuitOpen("test")).toBe(false);
  });

  it("handles multiple circuits independently", () => {
    for (let i = 0; i < 5; i++) {
      recordFailure("circuit-a");
    }
    expect(isCircuitOpen("circuit-a")).toBe(true);
    expect(isCircuitOpen("circuit-b")).toBe(false);
  });

  it("resets via resetCircuit", () => {
    for (let i = 0; i < 5; i++) {
      recordFailure("test");
    }
    expect(isCircuitOpen("test")).toBe(true);
    resetCircuit("test");
    expect(isCircuitOpen("test")).toBe(false);
  });
});
