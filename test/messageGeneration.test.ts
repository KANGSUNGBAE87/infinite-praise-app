import { describe, expect, it, vi, afterEach } from "vitest";
import { createMessageGenerationAdapter, createFallbackCandidates, validateCandidateResponse } from "../src/core/messageGeneration";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AI message generation", () => {
  it("creates five distinct fallback candidates for praise and nag modes", () => {
    const praise = createFallbackCandidates({ mode: "praise", context: "오늘 발표를 끝냈어", locale: "ko" });
    const nag = createFallbackCandidates({ mode: "nag", context: "공부를 미루고 있어", locale: "ko" });

    expect(praise).toHaveLength(5);
    expect(nag).toHaveLength(5);
    expect(new Set(praise.map((candidate) => candidate.text)).size).toBe(5);
    expect(new Set(nag.map((candidate) => candidate.text)).size).toBe(5);
    expect(nag.every((candidate) => candidate.mode === "nag")).toBe(true);
  });

  it("rejects unsafe AI responses and keeps only valid five-candidate JSON", () => {
    const valid = validateCandidateResponse({
      decision: "ok",
      candidates: [
        { id: "c1", text: "오늘 발표 끝낸 건 분명히 해낸 일이야.", notificationText: "발표 끝낸 너, 오늘 해냈어.", style: "warm", mode: "praise", source: "ai" },
        { id: "c2", text: "긴장했어도 끝까지 간 네가 멋져.", notificationText: "끝까지 간 네가 멋져.", style: "short", mode: "praise", source: "ai" },
        { id: "c3", text: "완벽하지 않아도 마친 건 사라지지 않아.", notificationText: "마친 건 사라지지 않아.", style: "practical", mode: "praise", source: "ai" },
        { id: "c4", text: "오늘은 스스로에게 잘했다고 해도 돼.", notificationText: "스스로에게 잘했다고 해도 돼.", style: "calm", mode: "praise", source: "ai" },
        { id: "c5", text: "발표를 마친 너는 이미 한 고비를 넘었어.", notificationText: "한 고비를 넘었어.", style: "direct", mode: "praise", source: "ai" },
      ],
    }, "praise");

    expect(valid.decision).toBe("ok");
    expect(valid.candidates).toHaveLength(5);

    expect(validateCandidateResponse({
      decision: "ok",
      candidates: [
        { id: "c1", text: "죽어", notificationText: "죽어", style: "direct", mode: "nag", source: "ai" },
      ],
    }, "nag").decision).toBe("blocked");
  });

  it("calls a server proxy and falls back when the proxy fails", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        decision: "ok",
        candidates: [
          { id: "c1", text: "오늘 발표 끝낸 건 분명히 해낸 일이야.", notificationText: "발표 끝낸 너, 오늘 해냈어.", style: "warm", mode: "praise", source: "ai" },
          { id: "c2", text: "긴장했어도 끝까지 간 네가 멋져.", notificationText: "끝까지 간 네가 멋져.", style: "short", mode: "praise", source: "ai" },
          { id: "c3", text: "완벽하지 않아도 마친 건 사라지지 않아.", notificationText: "마친 건 사라지지 않아.", style: "practical", mode: "praise", source: "ai" },
          { id: "c4", text: "오늘은 스스로에게 잘했다고 해도 돼.", notificationText: "스스로에게 잘했다고 해도 돼.", style: "calm", mode: "praise", source: "ai" },
          { id: "c5", text: "발표를 마친 너는 이미 한 고비를 넘었어.", notificationText: "한 고비를 넘었어.", style: "direct", mode: "praise", source: "ai" },
        ],
      }), { status: 200 }))
      .mockRejectedValueOnce(new Error("offline")));

    const adapter = createMessageGenerationAdapter("/api/generate-candidates");
    const ai = await adapter.generate({ mode: "praise", context: "오늘 발표를 끝냈어", locale: "ko" });
    const fallback = await adapter.generate({ mode: "nag", context: "공부를 미루고 있어", locale: "ko" });

    expect(ai.source).toBe("ai");
    expect(ai.candidates).toHaveLength(5);
    expect(fallback.source).toBe("fallback");
    expect(fallback.candidates).toHaveLength(5);
  });
});
