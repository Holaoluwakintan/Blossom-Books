import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("profile.deleteAccount", () => {
  it("requires an authenticated account", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });
    await expect(caller.profile.deleteAccount()).rejects.toThrow();
  });
});
