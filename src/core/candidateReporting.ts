import type { ExpressionVariant, MessageMode } from "./messageGeneration";
import { getSupabaseFunctionConfig } from "./supabaseFunctions";

export type CandidateReportPayload = {
  candidateId: string;
  mode: MessageMode;
  expressionVariant: ExpressionVariant;
  source: "ai" | "fallback";
  locale: "ko" | "en";
  surface: "candidate_card";
  reasonCode?: "uncomfortable" | "unsafe" | "irrelevant";
};

export type CandidateReportResult = {
  accepted: boolean;
  stored: boolean;
  reasonCode?: string;
};

export type CandidateReportAdapter = {
  report(payload: CandidateReportPayload): Promise<CandidateReportResult>;
};

type CandidateReportAdapterOptions = {
  endpoint?: string;
  headers?: Record<string, string>;
};

export function createCandidateReportAdapter(options: CandidateReportAdapterOptions | string = {}): CandidateReportAdapter {
  const optionConfig = typeof options === "string" ? { endpoint: options } : options;
  const supabaseConfig = optionConfig.endpoint ? null : getSupabaseFunctionConfig("report-candidate");
  const endpoint = optionConfig.endpoint ?? supabaseConfig?.endpoint ?? "/api/report-candidate";
  const requestHeaders = {
    "Content-Type": "application/json",
    ...(supabaseConfig?.headers ?? {}),
    ...(optionConfig.headers ?? {}),
  };

  return {
    async report(payload) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          return { accepted: true, stored: false, reasonCode: "report_backend_failed" };
        }

        const body = await response.json().catch(() => null) as Partial<CandidateReportResult> | null;
        const result: CandidateReportResult = {
          accepted: body?.accepted ?? true,
          stored: body?.stored ?? false,
        };
        if (body?.reasonCode) result.reasonCode = body.reasonCode;
        return result;
      } catch {
        return { accepted: true, stored: false, reasonCode: "report_backend_unavailable" };
      }
    },
  };
}
