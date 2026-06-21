import { describe, expect, it } from "vitest";
import { createVoiceScript } from "../src/core/voiceScript";

describe("voice script", () => {
  it("splits praise into short spoken segments with pauses", () => {
    const script = createVoiceScript(
      "지친 몸으로도 작게라도 손을 댔어. 오늘은 거기까지만 봐도 돼.",
      "tired"
    );

    expect(script.segments.length).toBeGreaterThan(1);
    expect(script.segments.every((segment) => segment.text.length <= 36)).toBe(true);
    expect(script.segments.some((segment) => segment.pauseMs >= 220)).toBe(true);
  });

  it("uses a softer profile for tired praise than energize praise", () => {
    const tired = createVoiceScript("오늘을 지나왔어. 여기까지 온 것도 일이야.", "tired");
    const energize = createVoiceScript("오늘을 지나왔어. 너 지금 잘하고 있어.", "energize");

    expect(tired.segments[0]?.rate).toBeLessThan(energize.segments[0]?.rate ?? 0);
    expect(tired.segments[0]?.pitch).toBeLessThan(energize.segments[0]?.pitch ?? 0);
  });
});
