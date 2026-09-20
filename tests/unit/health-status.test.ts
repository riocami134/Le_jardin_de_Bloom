import { describe, expect, it } from "vitest";
import { statusFromScore } from "@/lib/botanics/health-status";

describe("statusFromScore", () => {
  it.each([
    [90, "healthy"],
    [75, "healthy"],
    [74, "watch"],
    [50, "watch"],
    [49, "attention"],
    [0, "attention"],
  ])("score %i -> %s", (score, expected) => {
    expect(statusFromScore(score)).toBe(expected);
  });
});
