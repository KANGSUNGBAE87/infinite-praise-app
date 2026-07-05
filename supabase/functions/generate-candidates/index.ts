import { getBlockedReason, isBlockedText, sanitizeGenerationContext } from "../_shared/message-safety.ts";

type MessageMode = "praise" | "nag";
type Locale = "ko" | "en";
type ExpressionVariant = "short_sentence" | "action_suggestion" | "ack_then_act" | "notification_short" | "firmer_line";
type MessageSituation = "general" | "study" | "work" | "exercise" | "chores" | "sleep" | "phone";
type MessageFeeling = "tired" | "procrastinating" | "anxious" | "proud" | "overwhelmed" | "stuck";
type MessageTone = "warm" | "calm" | "practical" | "short" | "direct" | "witty";
type MessageIntensity = "gentle" | "firm" | "bold";

type ConstraintBundle = {
  mode: MessageMode;
  locale: Locale;
  situation: MessageSituation;
  feeling: MessageFeeling;
  tone: MessageTone;
  intensity: MessageIntensity;
};

type CandidateRequest = {
  mode?: MessageMode;
  context?: string;
  locale?: Locale;
  situation?: MessageSituation;
  feeling?: MessageFeeling;
  tone?: MessageTone;
  intensity?: MessageIntensity;
  constraintBundle?: Partial<ConstraintBundle>;
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
  return current.count > 20;
}

function isSituation(value: unknown): value is MessageSituation {
  return value === "general" || value === "study" || value === "work" || value === "exercise" || value === "chores" || value === "sleep" || value === "phone";
}

function isMode(value: unknown): value is MessageMode {
  return value === "praise" || value === "nag";
}

function isLocale(value: unknown): value is Locale {
  return value === "ko" || value === "en";
}

function isFeeling(value: unknown): value is MessageFeeling {
  return value === "tired" || value === "procrastinating" || value === "anxious" || value === "proud" || value === "overwhelmed" || value === "stuck";
}

function isTone(value: unknown): value is MessageTone {
  return value === "warm" || value === "calm" || value === "practical" || value === "short" || value === "direct" || value === "witty";
}

function isIntensity(value: unknown): value is MessageIntensity {
  return value === "gentle" || value === "firm" || value === "bold";
}

function defaultSituation(_mode: MessageMode): MessageSituation {
  return "study";
}

function defaultFeeling(mode: MessageMode): MessageFeeling {
  return mode === "praise" ? "tired" : "procrastinating";
}

function defaultTone(mode: MessageMode): MessageTone {
  return mode === "praise" ? "warm" : "calm";
}

function defaultIntensity(_mode: MessageMode): MessageIntensity {
  return "firm";
}

function sanitizeRequest(body: CandidateRequest) {
  const incomingBundle = body.constraintBundle ?? {};
  const mode: MessageMode = isMode(body.mode) ? body.mode : incomingBundle.mode === "nag" ? "nag" : "praise";
  const locale: Locale = isLocale(body.locale) ? body.locale : incomingBundle.locale === "en" ? "en" : "ko";
  const rawContext = typeof body.context === "string" ? body.context.slice(0, 120).trim() : "";
  const context = sanitizeGenerationContext(rawContext);
  const constraintBundle: ConstraintBundle = {
    mode,
    locale,
    situation: isSituation(body.situation) ? body.situation : isSituation(incomingBundle.situation) ? incomingBundle.situation : defaultSituation(mode),
    feeling: isFeeling(body.feeling) ? body.feeling : isFeeling(incomingBundle.feeling) ? incomingBundle.feeling : defaultFeeling(mode),
    tone: isTone(body.tone) ? body.tone : isTone(incomingBundle.tone) ? incomingBundle.tone : defaultTone(mode),
    intensity: isIntensity(body.intensity) ? body.intensity : isIntensity(incomingBundle.intensity) ? incomingBundle.intensity : defaultIntensity(mode),
  };

  return { ...constraintBundle, context, constraintBundle };
}

function extractJsonObject(content: string): unknown {
  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(trimmed);
}

const axisLabelMaps = {
  ko: {
    praise: {
      situation: { general: "일반", study: "해낸 일", work: "버틴 일", exercise: "시도한 일", chores: "쉬어도 되는 날", sleep: "나를 지킨 일", phone: "다시 해보는 날" },
      feeling: { tired: "지침", procrastinating: "자책 중", anxious: "불안함", proud: "뿌듯함", overwhelmed: "벅참", stuck: "무기력" },
      tone: { warm: "다정하게", calm: "차분하게", practical: "담백하게", short: "든든하게", direct: "내 편처럼", witty: "가볍게" },
      intensity: { gentle: "살짝 인정", firm: "분명히 인정", bold: "깊게 감싸기" },
    },
    nag: {
      situation: { general: "일반", study: "공부 시작", work: "일 처리", exercise: "운동 가기", chores: "집안일", sleep: "수면", phone: "폰 내려놓기" },
      feeling: { tired: "지쳐서 멈춤", procrastinating: "미루는 중", anxious: "부담됨", proud: "반복 실수", overwhelmed: "산만함", stuck: "완벽주의" },
      tone: { warm: "다정한 압박", calm: "차분하게", practical: "현실적으로", short: "체크리스트처럼", direct: "짧고 단호하게", witty: "유머 조금" },
      intensity: { gentle: "살짝 밀기", firm: "정확히 짚기", bold: "단호하게 끊기" },
    },
  },
  en: {
    praise: {
      situation: { general: "general", study: "something I did", work: "something I endured", exercise: "something I tried", chores: "a day I can rest", sleep: "taking care of me", phone: "trying again" },
      feeling: { tired: "tired", procrastinating: "blaming myself", anxious: "anxious", proud: "proud", overwhelmed: "overwhelmed", stuck: "low energy" },
      tone: { warm: "warm", calm: "calm", practical: "plain", short: "steady", direct: "on my side", witty: "light" },
      intensity: { gentle: "a small nod", firm: "clear recognition", bold: "deep reassurance" },
    },
    nag: {
      situation: { general: "general", study: "start studying", work: "handle work", exercise: "go exercise", chores: "chores", sleep: "sleep", phone: "put phone down" },
      feeling: { tired: "too tired to move", procrastinating: "putting it off", anxious: "burdened", proud: "repeating a slip", overwhelmed: "scattered", stuck: "perfectionism" },
      tone: { warm: "warm pressure", calm: "calm", practical: "practical", short: "checklist-like", direct: "short and firm", witty: "a little humor" },
      intensity: { gentle: "a small push", firm: "name it clearly", bold: "firm reset" },
    },
  },
} as const;

function getAxisLabels(bundle: ConstraintBundle) {
  const maps = axisLabelMaps[bundle.locale][bundle.mode];
  return {
    situationLabel: maps.situation[bundle.situation],
    feelingLabel: maps.feeling[bundle.feeling],
    toneLabel: maps.tone[bundle.tone],
    intensityLabel: maps.intensity[bundle.intensity],
  };
}

function createPrompt({ mode, context, locale, situation, feeling, tone, intensity, constraintBundle }: {
  mode: MessageMode;
  context: string;
  locale: Locale;
  situation: MessageSituation;
  feeling: MessageFeeling;
  tone: MessageTone;
  intensity: MessageIntensity;
  constraintBundle: ConstraintBundle;
}) {
  const outputLanguage = locale === "ko" ? "natural Korean" : "natural English";
  const purpose = mode === "praise"
    ? locale === "ko" ? "나를 인정하고 칭찬하는 문장" : "self-praise lines that recognize effort"
    : locale === "ko" ? "살짝 밀어주되 모욕하지 않는 잔소리 문장" : "gentle nudge lines that move the user without shaming";
  const constraintJson = JSON.stringify(constraintBundle);
  const axisLabels = getAxisLabels(constraintBundle);

  return [
    "Return only a valid json object.",
    `Output language: ${outputLanguage}.`,
    `Task: Create exactly 5 ${purpose}.`,
    `Hard constraint bundle: ${constraintJson}.`,
    "The selected mode, locale, situation, feeling, tone, and intensity are hard constraints.",
    "All 5 candidates must stay inside that same selected combination.",
    "Candidate differences are expression pattern only, not different tones, moods, situations, feelings, modes, locales, or intensities.",
    "Expression variants must appear exactly once in this exact order: short_sentence, action_suggestion, ack_then_act, notification_short, firmer_line.",
    "Use expressionVariant exactly; do not use style.",
    "Each candidate must be safe, non-clinical, non-diagnostic, and not cruel.",
    "If the situation describes crisis, self-harm, suicidal ideation, violence, hate, abuse, medical diagnosis, or therapy needs, return {\"decision\":\"crisis\",\"candidates\":[]} without advice.",
    "Do not include names, contact details, medical advice, diagnosis, therapy, or crisis counseling.",
    "For nag/nudge lines, never shame the person. Forbidden examples: 한심하다, 넌 왜 이래, 의지가 없다, 살 빼야지, 네가 문제야, 매번 똑같아.",
    "Only point to the next small action. Do not evaluate the user's identity, body, worth, health, or character.",
    "Schema: {\"decision\":\"ok\",\"constraintBundle\":{\"mode\":\"praise\",\"locale\":\"ko\",\"situation\":\"study\",\"feeling\":\"tired\",\"tone\":\"warm\",\"intensity\":\"firm\"},\"candidates\":[{\"id\":\"c1\",\"text\":\"...\",\"notificationText\":\"...\",\"expressionVariant\":\"short_sentence\"}]}",
    `Selected metadata: situation=${situation}, feeling=${feeling}, tone=${tone}, intensity=${intensity}.`,
    `Selected semantic labels: situationLabel=${axisLabels.situationLabel}, feelingLabel=${axisLabels.feelingLabel}, toneLabel=${axisLabels.toneLabel}, intensityLabel=${axisLabels.intensityLabel}.`,
    `Situation: ${context || "(no context)"}`,
  ].join("\n");
}

function normalizeCandidates(payload: unknown, mode: MessageMode) {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as Record<string, unknown>;
  if (response.decision === "blocked" || response.decision === "crisis") return null;
  if (!Array.isArray(response.candidates)) return null;

  const candidates = response.candidates.slice(0, 5).map((raw, index) => {
    const candidate = raw as Record<string, unknown>;
    const text = typeof candidate.text === "string" ? candidate.text.trim() : "";
    const notificationText = typeof candidate.notificationText === "string" ? candidate.notificationText.trim() : text;
    const expressionVariant = expressionVariants[index];
    if (candidate.expressionVariant !== expressionVariant) return null;
    if (!text || text.length < 6 || isBlockedText(text) || isBlockedText(notificationText)) return null;
    return {
      id: `ai-${index + 1}`,
      text,
      notificationText,
      expressionVariant,
      mode,
      source: "ai",
    };
  }).filter(Boolean);

  return candidates.length === 5 ? candidates : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ decision: "blocked", reasonCode: "method_not_allowed" }, 405);
  }

  if (isRateLimited(req)) {
    return jsonResponse({ decision: "blocked", reasonCode: "rate_limited" }, 429);
  }

  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) {
    return jsonResponse({ decision: "blocked", reasonCode: "ai_key_missing" }, 503);
  }
  const baseUrl = Deno.env.get("DEEPSEEK_BASE_URL")?.trim().replace(/\/$/, "") || "https://api.deepseek.com";
  const model = Deno.env.get("PRAISE_DEEPSEEK_MODEL")?.trim() || "deepseek-chat";

  try {
    const body = await req.json().catch(() => ({})) as CandidateRequest;
    const { mode, locale, context, situation, feeling, tone, intensity, constraintBundle } = sanitizeRequest(body);

    const reasonCode = getBlockedReason(context);
    if (reasonCode) {
      return jsonResponse({ decision: "blocked", reasonCode });
    }

    const deepseekResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You generate short, safe app copy. You must return only json.",
          },
          {
            role: "user",
            content: createPrompt({ mode, context, locale, situation, feeling, tone, intensity, constraintBundle }),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.65,
        max_tokens: 900,
      }),
    });

    if (!deepseekResponse.ok) {
      return jsonResponse({ decision: "blocked", reasonCode: "ai_proxy_failed" }, 502);
    }

    const payload = await deepseekResponse.json() as {
      choices?: Array<{
        finish_reason?: string;
        message?: {
          content?: string;
          reasoning_content?: string;
        };
        text?: string;
      }>;
    };
    const firstChoice = payload.choices?.[0];
    const finalContent = firstChoice?.message?.content;
    const reasoningContent = firstChoice?.message?.reasoning_content;
    const content = finalContent || firstChoice?.text;
    if (!content) {
      return jsonResponse({
        decision: "blocked",
        reasonCode: "empty_ai_response",
        finishReason: firstChoice?.finish_reason ?? null,
        ...(wantsDebug(req) ? {
          contentLength: finalContent?.length ?? 0,
          reasoningLength: reasoningContent?.length ?? 0,
        } : {}),
      }, 502);
    }

    let parsed: unknown;
    try {
      parsed = extractJsonObject(content);
    } catch {
      return jsonResponse({
        decision: "blocked",
        reasonCode: "invalid_ai_response",
        finishReason: firstChoice?.finish_reason ?? null,
        ...(wantsDebug(req) ? {
          contentLength: content.length,
          reasoningLength: reasoningContent?.length ?? 0,
        } : {}),
      }, 502);
    }
    const candidates = normalizeCandidates(parsed, mode);
    if (!candidates) {
      return jsonResponse({
        decision: "blocked",
        reasonCode: "invalid_ai_response",
        finishReason: firstChoice?.finish_reason ?? null,
        ...(wantsDebug(req) ? {
          contentLength: content.length,
          reasoningLength: reasoningContent?.length ?? 0,
        } : {}),
      }, 502);
    }

    return jsonResponse({ decision: "ok", constraintBundle, candidates });
  } catch (error) {
    return jsonResponse({
      decision: "blocked",
      reasonCode: "server_error",
      ...(wantsDebug(req) ? { errorName: error instanceof Error ? error.name : "unknown" } : {}),
    }, 500);
  }
});
