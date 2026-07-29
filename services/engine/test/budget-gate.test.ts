import { describe, expect, it, vi } from "vitest";
import { checkAndDecrementBudget, type RedisEvalClient } from "../src/middleware/budget-gate";

describe("Redis Budget Gate Middleware", () => {
  it("allows transaction when daily spend and wallet balance permit", async () => {
    const mockRedis: RedisEvalClient = {
      eval: vi.fn().mockResolvedValue([1, "OK"]),
    };

    const result = await checkAndDecrementBudget(
      mockRedis,
      "cid-1",
      "tid-1",
      100,
      1000,
      5000
    );

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();

    const dateStr = new Date().toISOString().split("T")[0];
    expect(mockRedis.eval).toHaveBeenCalledWith(
      expect.any(String),
      2,
      `budget:daily:cid-1:${dateStr}`,
      `wallet:balance:tid-1`,
      "100",
      "1000",
      "5000"
    );
  });

  it("rejects transaction when daily budget limit would be exceeded", async () => {
    const mockRedis: RedisEvalClient = {
      eval: vi.fn().mockResolvedValue([0, "REJECTED_BUDGET_EXHAUSTED"]),
    };

    const result = await checkAndDecrementBudget(
      mockRedis,
      "cid-1",
      "tid-1",
      500,
      1000,
      5000
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("REJECTED_BUDGET_EXHAUSTED");
  });

  it("rejects transaction when wallet balance is insufficient", async () => {
    const mockRedis: RedisEvalClient = {
      eval: vi.fn().mockResolvedValue([0, "REJECTED_WALLET_EMPTY"]),
    };

    const result = await checkAndDecrementBudget(
      mockRedis,
      "cid-1",
      "tid-1",
      500,
      1000,
      100
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("REJECTED_WALLET_EMPTY");
  });
});
