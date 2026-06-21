import { describe, expect, it } from "vitest";
import { sanitizeAnalytics } from "../src/core/analyticsSanitizer";

describe("sanitizeAnalytics", () => {
  it("drops forbidden text-shaped analytics keys and keeps only closed contract fields", () => {
    const payload = sanitizeAnalytics({
      event: "message_kept",
      source: "manual",
      screen: "step-3",
      reasonTag: "should disappear",
      praise: "짧은 사용자 문장",
      rewrite: "이것도 짧은 입력",
      tags: ["safe", "짧은 태그"],
      count: 2,
      choice: "rewrite",
    });

    expect(payload).toEqual({
      event: "message_kept",
      source: "manual",
      screen: "step-3",
      choice: "rewrite",
    });
  });
});
