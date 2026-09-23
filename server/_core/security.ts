import type { NextFunction, Request, Response } from "express";

type RateLimitOptions = { windowMs: number; max: number };

type Bucket = { count: number; resetAt: number };

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly windowMs: number;
  private readonly max: number;

  constructor({ windowMs, max }: RateLimitOptions) {
    if (windowMs <= 0 || max <= 0) throw new Error("Rate-limit window and max must be positive");
    this.windowMs = windowMs;
    this.max = max;
  }

  check(key: string, now = Date.now()): { allowed: boolean; remaining: number; resetAt: number } {
    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      const next = { count: 1, resetAt: now + this.windowMs };
      this.buckets.set(key, next);
      return { allowed: true, remaining: this.max - 1, resetAt: next.resetAt };
    }
    if (current.count >= this.max) return { allowed: false, remaining: 0, resetAt: current.resetAt };
    current.count += 1;
    return { allowed: true, remaining: this.max - current.count, resetAt: current.resetAt };
  }

  clearExpired(now = Date.now()) {
    this.buckets.forEach((bucket, key) => { if (bucket.resetAt <= now) this.buckets.delete(key); });
  }
}

export const apiRateLimiter = new RateLimiter({ windowMs: 60_000, max: 120 });

export function getRequestKey(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : req.ip;
  return ip || "unknown";
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

export function apiRateLimit(req: Request, res: Response, next: NextFunction) {
  const result = apiRateLimiter.check(getRequestKey(req));
  res.setHeader("X-RateLimit-Limit", "120");
  res.setHeader("X-RateLimit-Remaining", String(result.remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
  if (!result.allowed) {
    res.status(429).json({ error: "Too many requests. Please try again shortly." });
    return;
  }
  next();
}
