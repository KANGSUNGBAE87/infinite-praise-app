import { afterEach, describe, expect, it, vi } from "vitest";
import generateHandler from "../api/generate-candidates";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("generate-candidates API prompt contract", () => {
  it("adds mode-specific human labels so internal axis ids cannot be misread", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "deepseek-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{
        message: {
          content: JSON.stringify({
            decision: "ok",
            candidates: [
              { id: "ignored-1", text: "반복 실수는 여기서 끊고 지금 첫 줄만 열어요.", notificationText: "첫 줄만 열어요.", expressionVariant: "short_sentence" },
              { id: "ignored-2", text: "자책 말고 행동 하나만 정해요. 지금 첫 줄을 열어요.", notificationText: "첫 줄을 열어요.", expressionVariant: "action_suggestion" },
              { id: "ignored-3", text: "또 밀린 마음은 알아요. 그래도 오늘은 첫 줄만 처리해요.", notificationText: "첫 줄만 처리해요.", expressionVariant: "ack_then_act" },
              { id: "ignored-4", text: "반복은 줄이고, 지금 첫 줄만 열어요.", notificationText: "첫 줄만 열어요.", expressionVariant: "notification_short" },
              { id: "ignored-5", text: "여기서 멈추지 말고 첫 줄만 열어요.", notificationText: "첫 줄만 열어요.", expressionVariant: "firmer_line" },
            ],
          }),
        },
      }],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    await generateHandler({
      method: "POST",
      body: {
        mode: "nag",
        locale: "ko",
        context: "또 미루는 중",
        situation: "study",
        feeling: "proud",
        tone: "direct",
        intensity: "bold",
      },
    }, { status });

    const deepSeekBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    const prompt = deepSeekBody.messages[1].content;
    expect(prompt).toContain("feelingLabel=반복 실수");
    expect(prompt).toContain("toneLabel=짧고 단호하게");
    expect(prompt).toContain("intensityLabel=단호하게 끊기");
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      decision: "ok",
      constraintBundle: expect.objectContaining({ feeling: "proud" }),
    }));
  });
});
