import { describe, expect, it } from "vitest";
import {
  createPraiseSelector,
  type PraiseCandidate
} from "../src/core/praiseSelector";
import type { PraiseEvent } from "../src/core/praiseRepository";

const candidates: PraiseCandidate[] = [
  {
    id: "endured-tired-normal-1",
    situation: "endured",
    mood: "tired",
    depth: "normal",
    text: "오늘은 해낸 게 없어 보여도, 버틴 것 자체가 일이었어."
  },
  {
    id: "endured-tired-normal-2",
    situation: "endured",
    mood: "tired",
    depth: "normal",
    text: "힘든 하루를 통과한 것만으로도 오늘은 충분히 의미가 있어."
  },
  {
    id: "started-energize-normal-1",
    situation: "started",
    mood: "energize",
    depth: "normal",
    text: "좋아, 지금은 힘을 실어줄게. 너 할 수 있어."
  }
];

const pastEvent = (
  messageId: string,
  createdAt: string,
  reaction?: PraiseEvent["reaction"]
): PraiseEvent => {
  const event: PraiseEvent = {
    id: `${messageId}-${createdAt}`,
    date: createdAt.slice(0, 10),
    situation: "endured",
    mood: "tired",
    messageId,
    message: "previous",
    depth: "normal",
    source: "manual",
    voiceEnabled: true,
    createdAt: Date.parse(createdAt)
  };

  if (reaction) {
    event.reaction = reaction;
  }

  return event;
};

describe("praise selector", () => {
  it("selects a candidate matching situation, mood, and requested depth", () => {
    const selector = createPraiseSelector(candidates);

    const selected = selector.selectPraise({
      situation: "started",
      mood: "energize",
      depth: "normal",
      now: new Date("2026-06-07T21:00:00+09:00"),
      recentEvents: []
    });

    expect(selected).toMatchObject({
      messageId: "started-energize-normal-1",
      message: "좋아, 지금은 힘을 실어줄게. 너 할 수 있어."
    });
    expect(selected.reasons).toContain("matched situation, mood, and depth");
  });

  it("avoids messages used in the last three events", () => {
    const selector = createPraiseSelector(candidates);

    const selected = selector.selectPraise({
      situation: "endured",
      mood: "tired",
      depth: "normal",
      now: new Date("2026-06-07T21:00:00+09:00"),
      recentEvents: [
        pastEvent("endured-tired-normal-1", "2026-06-07T20:00:00+09:00"),
        pastEvent("other", "2026-06-07T19:00:00+09:00"),
        pastEvent("another", "2026-06-07T18:00:00+09:00")
      ]
    });

    expect(selected.messageId).toBe("endured-tired-normal-2");
  });

  it("prefers saved and replayed candidates over dismissed candidates", () => {
    const selector = createPraiseSelector(candidates);

    const selected = selector.selectPraise({
      situation: "endured",
      mood: "tired",
      depth: "normal",
      now: new Date("2026-06-07T21:00:00+09:00"),
      recentEvents: [
        pastEvent("other-a", "2026-06-07T20:00:00+09:00"),
        pastEvent("other-b", "2026-06-07T19:00:00+09:00"),
        pastEvent("other-c", "2026-06-07T18:00:00+09:00"),
        pastEvent("endured-tired-normal-2", "2026-06-03T20:00:00+09:00", "dismissed"),
        pastEvent("endured-tired-normal-1", "2026-06-02T20:00:00+09:00", "replayed"),
        pastEvent("endured-tired-normal-1", "2026-06-01T20:00:00+09:00", "saved")
      ]
    });

    expect(selected.messageId).toBe("endured-tired-normal-1");
    expect(selected.reasons).toContain("boosted by positive reactions");
  });
});
