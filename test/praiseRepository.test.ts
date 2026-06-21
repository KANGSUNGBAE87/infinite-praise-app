import { describe, expect, it } from "vitest";
import {
  createMemoryPraiseRepository,
  type PraiseEvent
} from "../src/core/praiseRepository";

const baseEvent: PraiseEvent = {
  id: "event-1",
  date: "2026-06-07",
  situation: "endured",
  mood: "tired",
  messageId: "endured-tired-normal-1",
  message: "오늘은 해낸 게 없어 보여도, 버틴 것 자체가 일이었어.",
  depth: "normal",
  source: "manual",
  voiceEnabled: true,
  createdAt: Date.parse("2026-06-07T21:00:00+09:00")
};

describe("memory praise repository", () => {
  it("stores praise events without exposing mutable internal state", async () => {
    const repository = createMemoryPraiseRepository();

    await repository.savePraiseEvent(baseEvent);
    const saved = await repository.getPraiseEvents();
    saved[0]!.message = "mutated outside";

    const reloaded = await repository.getPraiseEvents();
    expect(reloaded).toEqual([baseEvent]);
  });

  it("updates a saved event reaction", async () => {
    const repository = createMemoryPraiseRepository();

    await repository.savePraiseEvent(baseEvent);
    await repository.updatePraiseReaction("event-1", "saved");

    await expect(repository.getPraiseEvents()).resolves.toEqual([
      { ...baseEvent, reaction: "saved" }
    ]);
  });

  it("returns recent praise events from newest to oldest", async () => {
    const repository = createMemoryPraiseRepository();
    await repository.savePraiseEvent({
      ...baseEvent,
      id: "old",
      createdAt: Date.parse("2026-06-05T21:00:00+09:00")
    });
    await repository.savePraiseEvent({
      ...baseEvent,
      id: "new",
      createdAt: Date.parse("2026-06-07T21:00:00+09:00")
    });

    const recent = await repository.getRecentPraiseEvents(1);

    expect(recent.map((event) => event.id)).toEqual(["new"]);
  });
});
