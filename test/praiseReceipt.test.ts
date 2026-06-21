import { describe, expect, it } from "vitest";
import { createPraiseReceipt } from "../src/core/praiseReceipt";
import type { PraiseEvent } from "../src/core/praiseRepository";

const event = (
  overrides: Partial<PraiseEvent> & Pick<PraiseEvent, "id" | "situation" | "mood" | "createdAt">
): PraiseEvent => ({
  date: new Date(overrides.createdAt).toISOString().slice(0, 10),
  messageId: "message",
  message: "message",
  depth: "normal",
  source: "manual",
  voiceEnabled: true,
  ...overrides
});

describe("praise receipt", () => {
  it("summarizes only events inside the requested date range", () => {
    const receipt = createPraiseReceipt({
      events: [
        event({
          id: "outside",
          situation: "finished",
          mood: "proud",
          createdAt: Date.parse("2026-05-31T21:00:00+09:00")
        }),
        event({
          id: "inside-1",
          situation: "endured",
          mood: "tired",
          createdAt: Date.parse("2026-06-02T21:00:00+09:00")
        }),
        event({
          id: "inside-2",
          situation: "endured",
          mood: "anxious",
          createdAt: Date.parse("2026-06-03T21:00:00+09:00")
        })
      ],
      from: new Date("2026-06-01T00:00:00+09:00"),
      to: new Date("2026-06-08T00:00:00+09:00")
    });

    expect(receipt.totalCount).toBe(2);
    expect(receipt.lines).toContain("이번 기간에 너는 나를 2번 알아봐 줬어.");
    expect(receipt.lines).toContain("`버텼다`가 2번 있었어. 요즘은 통과하는 날이 많았던 것 같아.");
  });

  it("uses self-recognition language instead of scores or rankings", () => {
    const receipt = createPraiseReceipt({
      events: [
        event({
          id: "inside",
          situation: "cared",
          mood: "numb",
          createdAt: Date.parse("2026-06-02T21:00:00+09:00")
        })
      ],
      from: new Date("2026-06-01T00:00:00+09:00"),
      to: new Date("2026-06-08T00:00:00+09:00")
    });

    const text = receipt.lines.join(" ");
    expect(text).toContain("작지만 나를 돌보는 행동이 있었어.");
    expect(text).not.toMatch(/점수|순위|랭킹|달성률|생산성/);
  });

  it("returns an empty-state receipt without inventing actions", () => {
    const receipt = createPraiseReceipt({
      events: [],
      from: new Date("2026-06-01T00:00:00+09:00"),
      to: new Date("2026-06-08T00:00:00+09:00")
    });

    expect(receipt.totalCount).toBe(0);
    expect(receipt.lines).toEqual([
      "이번 기간에는 아직 남긴 칭찬 기록이 없어. 없는 일을 만들지 않고, 다음에 누른 것부터 보여줄게."
    ]);
  });
});
