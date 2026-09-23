import { describe, expect, it } from "vitest";
import { RateLimiter } from "./_core/security";

describe("RateLimiter", () => {
  it("allows up to the configured limit and rejects the next request", () => {
    const limiter = new RateLimiter({ windowMs: 1_000, max: 2 });
    expect(limiter.check("reader", 100).allowed).toBe(true);
    expect(limiter.check("reader", 200).remaining).toBe(0);
    expect(limiter.check("reader", 300).allowed).toBe(false);
  });

  it("starts a fresh window after expiry and isolates keys", () => {
    const limiter = new RateLimiter({ windowMs: 1_000, max: 1 });
    expect(limiter.check("reader", 100).allowed).toBe(true);
    expect(limiter.check("writer", 100).allowed).toBe(true);
    expect(limiter.check("reader", 1_101).allowed).toBe(true);
  });
});
