import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("stories.list input contract", () => {
  const caller = appRouter.createCaller({
    user: null,
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  });

  it("accepts bounded pagination and returns an array when the database is unavailable", async () => {
    const result = await caller.stories.list({ query: "hope", limit: 10, offset: 20 });
    expect(result).toEqual([]);
  });

  it("rejects invalid pagination instead of allowing unbounded reads", async () => {
    await expect(caller.stories.list({ limit: 0, offset: 0 })).rejects.toThrow();
    await expect(caller.stories.list({ limit: 101, offset: 0 })).rejects.toThrow();
    await expect(caller.stories.list({ limit: 10, offset: -1 })).rejects.toThrow();
  });

  it("rejects oversized search input", async () => {
    await expect(caller.stories.list({ query: "x".repeat(121), limit: 10, offset: 0 })).rejects.toThrow();
  });
});
