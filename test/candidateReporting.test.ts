import { describe, expect, it, vi, afterEach } from "vitest";
import { createCandidateReportAdapter } from "../src/core/candidateReporting";
import reportHandler from "../api/report-candidate";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("candidate reporting", () => {
  it("sends only report metadata and omits raw candidate text", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      accepted: true,
      stored: true,
    }), { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createCandidateReportAdapter("/api/report-candidate");
    const result = await adapter.report({
      candidateId: "fallback-nag-1",
      mode: "nag",
      expressionVariant: "firmer_line",
      source: "fallback",
      locale: "ko",
      surface: "candidate_card",
      reasonCode: "uncomfortable",
    });

    expect(result).toEqual({ accepted: true, stored: true });
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body).toEqual({
      candidateId: "fallback-nag-1",
      mode: "nag",
      expressionVariant: "firmer_line",
      source: "fallback",
      locale: "ko",
      surface: "candidate_card",
      reasonCode: "uncomfortable",
    });
    expect(JSON.stringify(body)).not.toContain("text");
  });

  it("uses Supabase Edge Function config by default when public env is present", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "public-anon-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      accepted: true,
      stored: true,
    }), { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createCandidateReportAdapter();
    await adapter.report({
      candidateId: "ai-1",
      mode: "praise",
      expressionVariant: "short_sentence",
      source: "ai",
      locale: "ko",
      surface: "candidate_card",
      reasonCode: "uncomfortable",
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://example.supabase.co/functions/v1/report-candidate");
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      "Content-Type": "application/json",
      apikey: "public-anon-key",
      Authorization: "Bearer public-anon-key",
    });
  });

  it("persists only safe report metadata with expression_variant", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    await reportHandler({
      method: "POST",
      body: {
        candidateId: "ai-1",
        mode: "praise",
        expressionVariant: "ack_then_act",
        source: "ai",
        locale: "ko",
        surface: "candidate_card",
        reasonCode: "uncomfortable",
      },
    }, { status });

    expect(status).toHaveBeenCalledWith(202);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const storedBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(storedBody).toMatchObject({
      candidate_id: "ai-1",
      mode: "praise",
      expression_variant: "ack_then_act",
      source: "ai",
      locale: "ko",
      surface: "candidate_card",
      reason_code: "uncomfortable",
    });
    expect(JSON.stringify(storedBody)).not.toContain("오늘 발표");
    expect(json).toHaveBeenCalledWith({ accepted: true, stored: true });
  });

  it("rejects report candidate ids that could smuggle raw text", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    await reportHandler({
      method: "POST",
      body: {
        candidateId: "ai-1-오늘 발표 끝낸 문장",
        mode: "praise",
        expressionVariant: "short_sentence",
        source: "ai",
        locale: "ko",
        surface: "candidate_card",
        reasonCode: "uncomfortable",
      },
    }, { status });

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ accepted: false, stored: false, reasonCode: "invalid_report" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects legacy style-only report payloads", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    await reportHandler({
      method: "POST",
      body: {
        candidateId: "ai-1",
        mode: "praise",
        style: "short_sentence",
        source: "ai",
        locale: "ko",
        surface: "candidate_card",
        reasonCode: "uncomfortable",
      },
    }, { status });

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ accepted: false, stored: false, reasonCode: "invalid_report" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
