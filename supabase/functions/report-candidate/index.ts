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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const expressionVariants: ExpressionVariant[] = ["short_sentence", "action_suggestion", "ack_then_act", "notification_short", "firmer_line"];
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function wantsDebug(req: Request) {
  return req.headers.get("x-debug-shape") === "1";
}

function getClientKey(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "edge";
}

function isRateLimited(req: Request) {
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ accepted: false, stored: false, reasonCode: "method_not_allowed" }, 405);
  }

  if (isRateLimited(req)) {
    return jsonResponse({ accepted: false, stored: false, reasonCode: "rate_limited" }, 429);
  }

  const report = normalizeReport(await req.json().catch(() => ({})) as ReportRequest);
  if (!report) {
    return jsonResponse({ accepted: false, stored: false, reasonCode: "invalid_report" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const tableName = Deno.env.get("SUPABASE_REPORTS_TABLE") || "praise_candidate_reports";

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ accepted: true, stored: false, reasonCode: "report_backend_not_configured" }, 202);
  }

  try {
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
      return jsonResponse({
        accepted: true,
        stored: false,
        reasonCode: "report_persist_failed",
        ...(wantsDebug(req) ? { upstreamStatus: response.status } : {}),
      }, 202);
    }

    return jsonResponse({ accepted: true, stored: true }, 202);
  } catch {
    return jsonResponse({ accepted: true, stored: false, reasonCode: "report_backend_failed" }, 202);
  }
});
