/// <reference types="node" />

type MessageMode = "praise" | "nag";
type ExpressionVariant = "short_sentence" | "action_suggestion" | "ack_then_act" | "notification_short" | "firmer_line";
type Locale = "ko" | "en";

type ReportRequest = {
  candidateId?: string;
  mode?: MessageMode;
  expressionVariant?: ExpressionVariant;
  source?: "ai" | "fallback";
  locale?: Locale;
  surface?: "candidate_card";
  reasonCode?: "uncomfortable" | "unsafe" | "irrelevant";
};

type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

const expressionVariants: ExpressionVariant[] = ["short_sentence", "action_suggestion", "ack_then_act", "notification_short", "firmer_line"];
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function parseBody(body: unknown): ReportRequest {
  if (!body || typeof body !== "object") return {};
  return body as ReportRequest;
}

function getClientKey(req: ApiRequest) {
  const forwarded = req.headers?.["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return raw?.split(",")[0]?.trim() || "local";
}

function isRateLimited(req: ApiRequest) {
  const key = getClientKey(req);
  const now = Date.now();
  const current = rateLimitBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 30;
}

function normalizeReport(body: ReportRequest) {
  const candidateId = typeof body.candidateId === "string" ? body.candidateId.trim() : "";
  const mode: MessageMode = body.mode === "nag" ? "nag" : "praise";
  const rawExpressionVariant = body.expressionVariant;
  const expressionVariant = rawExpressionVariant && expressionVariants.includes(rawExpressionVariant) ? rawExpressionVariant : null;
  const source = body.source === "ai" ? "ai" : "fallback";
  const locale: Locale = body.locale === "en" ? "en" : "ko";
  const reasonCode = body.reasonCode === "unsafe" || body.reasonCode === "irrelevant" ? body.reasonCode : "uncomfortable";

  if (!/^(ai-[1-5]|fallback-(praise|nag)-[1-5])$/.test(candidateId) || !expressionVariant) return null;

  return {
    candidate_id: candidateId,
    mode,
    expression_variant: expressionVariant,
    source,
    locale,
    surface: "candidate_card",
    reason_code: reasonCode,
  };
}

async function persistReport(report: NonNullable<ReturnType<typeof normalizeReport>>) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tableName = process.env.SUPABASE_REPORTS_TABLE || "praise_candidate_reports";

  if (!supabaseUrl || !serviceRoleKey) {
    return { stored: false, reasonCode: "report_backend_not_configured" };
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(report),
  });

  if (!response.ok) {
    return { stored: false, reasonCode: "report_persist_failed" };
  }

  return { stored: true };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ accepted: false, stored: false, reasonCode: "method_not_allowed" });
    return;
  }

  if (isRateLimited(req)) {
    res.status(429).json({ accepted: false, stored: false, reasonCode: "rate_limited" });
    return;
  }

  const report = normalizeReport(parseBody(req.body));
  if (!report) {
    res.status(400).json({ accepted: false, stored: false, reasonCode: "invalid_report" });
    return;
  }

  try {
    const result = await persistReport(report);
    res.status(202).json({ accepted: true, ...result });
  } catch {
    res.status(502).json({ accepted: true, stored: false, reasonCode: "report_backend_failed" });
  }
}
