import { describe, expect, it } from "vitest";
import { createGeminiTtsRequest } from "../src/core/ttsPrompt";

describe("Gemini TTS prompt preparation", () => {
  it("keeps the chosen sentence unchanged while adding delivery direction", () => {
    const text = "쉰 게 빠진 건 아니야. 돌아올 자리를 만든 거야.";
    const request = createGeminiTtsRequest({
      text,
      situation: "rested",
      mood: "guilty"
    });

    expect(request.text).toBe(text);
    expect(request.prompt).toContain("Korean");
    expect(request.prompt).toContain("gentle");
    expect(request.prompt).toContain("guilt");
    expect(request.provider).toBe("gemini");
  });

  it("uses a bigger rally direction only for energize", () => {
    const calm = createGeminiTtsRequest({
      text: "오늘은 여기까지 해도 돼.",
      situation: "endured",
      mood: "calm"
    });
    const energize = createGeminiTtsRequest({
      text: "무서웠는데 했잖아. 오늘은 그걸 크게 가져가자.",
      situation: "brave",
      mood: "energize"
    });

    expect(calm.prompt).not.toContain("rally");
    expect(energize.prompt).toContain("rally");
  });
});
