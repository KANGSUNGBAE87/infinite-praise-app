import { describe, expect, it, vi, afterEach } from "vitest";
import { createMessageGenerationAdapter, createFallbackCandidates, validateCandidateResponse, sanitizeGenerationContext } from "../src/core/messageGeneration";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("AI message generation", () => {
  const constraintBundle = {
    mode: "praise",
    locale: "ko",
    situation: "exercise",
    feeling: "procrastinating",
    tone: "calm",
    intensity: "firm",
  };

  const expressionCandidates = [
    { id: "c1", text: "오늘 헬스장까지 못 가도 괜찮아요. 대신 5분만 몸을 풀고 끝내요.", notificationText: "5분만 몸을 풀고 끝내요.", expressionVariant: "short_sentence", mode: "praise", source: "ai" },
    { id: "c2", text: "쉬고 싶은 마음은 인정해요. 그래도 완전히 멈추진 말고 가볍게 하나만 해요.", notificationText: "가볍게 하나만 해요.", expressionVariant: "action_suggestion", mode: "praise", source: "ai" },
    { id: "c3", text: "오늘 목표는 완벽한 운동이 아니에요. 지금 할 수 있는 작은 움직임이면 충분해요.", notificationText: "작은 움직임이면 충분해요.", expressionVariant: "ack_then_act", mode: "praise", source: "ai" },
    { id: "c4", text: "헬스장에 못 가는 날도 있어요. 다만 내 몸을 놓치지 않게 5분만 움직여요.", notificationText: "5분만 움직여요.", expressionVariant: "notification_short", mode: "praise", source: "ai" },
    { id: "c5", text: "지금은 쉬고 싶어도, 내일의 나를 위해 아주 작게만 시작해요.", notificationText: "아주 작게만 시작해요.", expressionVariant: "firmer_line", mode: "praise", source: "ai" },
  ];

  it("creates five distinct fallback candidates for praise and nag modes", () => {
    const praise = createFallbackCandidates({ mode: "praise", context: "오늘 발표를 끝냈어", locale: "ko" });
    const nag = createFallbackCandidates({ mode: "nag", context: "공부를 미루고 있어", locale: "ko" });

    expect(praise).toHaveLength(5);
    expect(nag).toHaveLength(5);
    expect(new Set(praise.map((candidate) => candidate.text)).size).toBe(5);
    expect(new Set(nag.map((candidate) => candidate.text)).size).toBe(5);
    expect(new Set(praise.map((candidate) => candidate.expressionVariant)).size).toBe(5);
    expect(new Set(nag.map((candidate) => candidate.expressionVariant)).size).toBe(5);
    expect(nag.every((candidate) => candidate.mode === "nag")).toBe(true);
  });

  it("routes fallback copy through situation, feeling, tone, and intensity metadata", () => {
    const candidates = createFallbackCandidates({
      mode: "nag",
      context: "수학 문제집",
      locale: "ko",
      situation: "study",
      feeling: "procrastinating",
      tone: "direct",
      intensity: "firm",
    });

    expect(candidates).toHaveLength(5);
    expect(candidates.some((candidate) => candidate.text.includes("수학 문제집"))).toBe(true);
    expect(candidates.some((candidate) => candidate.text.includes("첫 문제") || candidate.text.includes("5분"))).toBe(true);
    expect(candidates.every((candidate) => !candidate.text.includes("한심") && !candidate.text.includes("의지"))).toBe(true);
  });

  it("masks private details before sending generation context to the server proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      decision: "ok",
      constraintBundle: { ...constraintBundle, mode: "nag", situation: "work", feeling: "overwhelmed", tone: "calm", intensity: "gentle" },
      candidates: expressionCandidates.map((candidate, index) => ({ ...candidate, id: `n${index + 1}`, mode: "nag" })),
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createMessageGenerationAdapter("/api/generate-candidates");
    await adapter.generate({
      mode: "nag",
      context: "홍길동 010-1234-5678 test@example.com 병원 진단 기록",
      locale: "ko",
      situation: "work",
      feeling: "overwhelmed",
      tone: "calm",
      intensity: "gentle",
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.context).not.toContain("홍길동");
    expect(body.context).not.toContain("010-1234-5678");
    expect(body.context).not.toContain("test@example.com");
    expect(body.context).not.toContain("병원");
    expect(body.context).toContain("[이름]");
    expect(body.context).toContain("[연락처]");
    expect(body.context).toContain("[이메일]");
    expect(body.situation).toBe("work");
    expect(body.feeling).toBe("overwhelmed");
    expect(body.constraintBundle).toMatchObject({
      mode: "nag",
      locale: "ko",
      situation: "work",
      feeling: "overwhelmed",
      tone: "calm",
      intensity: "gentle",
    });
    expect(sanitizeGenerationContext("김민수 01012345678")).toBe("[이름] [연락처]");
  });

  it("requires five expression variants under the selected constraint bundle", () => {
    const valid = validateCandidateResponse({
      decision: "ok",
      constraintBundle,
      candidates: expressionCandidates,
    }, "praise");

    expect(valid.decision).toBe("ok");
    expect(valid.candidates).toHaveLength(5);
    expect(valid.candidates.map((candidate) => candidate.id)).toEqual(["ai-1", "ai-2", "ai-3", "ai-4", "ai-5"]);
    expect(new Set(valid.candidates.map((candidate) => candidate.expressionVariant))).toEqual(new Set([
      "short_sentence",
      "action_suggestion",
      "ack_then_act",
      "notification_short",
      "firmer_line",
    ]));

    expect(validateCandidateResponse({
      decision: "ok",
      constraintBundle,
      candidates: [
        { id: "c1", text: "오늘 발표 끝낸 건 분명히 해낸 일이야.", notificationText: "발표 끝낸 너, 오늘 해냈어.", style: "warm", mode: "praise", source: "ai" },
        { id: "c2", text: "긴장했어도 끝까지 간 네가 멋져.", notificationText: "끝까지 간 네가 멋져.", style: "short", mode: "praise", source: "ai" },
        { id: "c3", text: "완벽하지 않아도 마친 건 사라지지 않아.", notificationText: "마친 건 사라지지 않아.", style: "practical", mode: "praise", source: "ai" },
        { id: "c4", text: "오늘은 스스로에게 잘했다고 해도 돼.", notificationText: "스스로에게 잘했다고 해도 돼.", style: "calm", mode: "praise", source: "ai" },
        { id: "c5", text: "발표를 마친 너는 이미 한 고비를 넘었어.", notificationText: "한 고비를 넘었어.", style: "direct", mode: "praise", source: "ai" },
      ],
    }, "praise").decision).toBe("blocked");

    expect((validateCandidateResponse as unknown as (payload: unknown, mode: "praise", bundle: typeof constraintBundle) => { decision: string })({
      decision: "ok",
      constraintBundle: { ...constraintBundle, tone: "warm" },
      candidates: expressionCandidates,
    }, "praise", constraintBundle).decision).toBe("blocked");

    expect(validateCandidateResponse({
      decision: "ok",
      candidates: [
        { id: "c1", text: "죽어", notificationText: "죽어", expressionVariant: "firmer_line", mode: "nag", source: "ai" },
      ],
    }, "nag").decision).toBe("blocked");

    expect(validateCandidateResponse({
      decision: "ok",
      candidates: [
        { id: "c1", text: "의지가 없으면 아무것도 안 돼.", notificationText: "의지가 없으면 안 돼.", style: "direct" },
        { id: "c2", text: "또 미루면 네가 문제야.", notificationText: "네가 문제야.", style: "short" },
        { id: "c3", text: "너는 매번 똑같아.", notificationText: "매번 똑같아.", style: "practical" },
        { id: "c4", text: "정신 차려. 이러다 망한다.", notificationText: "정신 차려.", style: "calm" },
        { id: "c5", text: "한심하게 굴지 마.", notificationText: "한심하게 굴지 마.", style: "direct" },
      ],
    }, "nag").decision).toBe("blocked");
  });

  it("calls a server proxy and hides local fallback candidates when the proxy fails", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        decision: "ok",
        constraintBundle: { ...constraintBundle, situation: "study", feeling: "tired", tone: "warm", intensity: "firm" },
        candidates: expressionCandidates,
      }), { status: 200 }))
      .mockRejectedValueOnce(new Error("offline")));

    const adapter = createMessageGenerationAdapter("/api/generate-candidates");
    const ai = await adapter.generate({ mode: "praise", context: "오늘 발표를 끝냈어", locale: "ko" });
    const fallback = await adapter.generate({ mode: "nag", context: "공부를 미루고 있어", locale: "ko" });

    expect(ai.source).toBe("ai");
    expect(ai.candidates).toHaveLength(5);
    expect(fallback.source).toBe("fallback");
    expect(fallback.decision).toBe("blocked");
    expect(fallback.reasonCode).toBe("network");
    expect(fallback.candidates).toHaveLength(0);
  });

  it("uses Supabase Edge Function config by default when public env is present", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "public-anon-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      decision: "ok",
      constraintBundle: { ...constraintBundle, situation: "study", feeling: "tired", tone: "warm", intensity: "firm" },
      candidates: expressionCandidates,
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createMessageGenerationAdapter();
    await adapter.generate({ mode: "praise", context: "오늘 발표를 끝냈어", locale: "ko" });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://example.supabase.co/functions/v1/generate-candidates");
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      "Content-Type": "application/json",
      apikey: "public-anon-key",
      Authorization: "Bearer public-anon-key",
    });
  });
});
