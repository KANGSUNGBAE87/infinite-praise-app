/// <reference types="node" />

type MessageMode = "praise" | "nag";
type Locale = "ko" | "en";
type CandidateStyle = "warm" | "short" | "practical" | "calm" | "direct";

type CandidateRequest = {
  mode?: MessageMode;
  context?: string;
  locale?: Locale;
};

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status(code: number): {
    json(payload: unknown): void;
  };
};

const blockedPatterns = ["죽어", "자살", "자해", "폭력", "죽이고", "혐오", "진단", "치료", "한심", "꺼져"];
const styles: CandidateStyle[] = ["warm", "short", "practical", "calm", "direct"];

function isBlockedText(text: string) {
  return blockedPatterns.some((pattern) => text.includes(pattern));
}

function parseBody(body: unknown): CandidateRequest {
  if (typeof body === "string") return JSON.parse(body) as CandidateRequest;
  return (body ?? {}) as CandidateRequest;
}

function extractJsonObject(content: string): unknown {
  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(trimmed);
}

function createPrompt({ mode, context, locale }: { mode: MessageMode; context: string; locale: Locale }) {
  const tone = locale === "ko"
    ? "부드럽고 명확한 한국어"
    : "warm, calm, and clear English";
  const purpose = mode === "praise"
    ? locale === "ko" ? "나를 인정하고 칭찬하는 문장" : "self-praise lines that recognize effort"
    : locale === "ko" ? "살짝 밀어주되 모욕하지 않는 잔소리 문장" : "gentle nudge lines that move the user without shaming";

  return [
    "Return only a valid json object.",
    `Locale: ${locale}`,
    `Task: Create exactly 5 ${purpose}.`,
    `Tone: ${tone}.`,
    "Each candidate must be safe, non-clinical, non-diagnostic, and not cruel.",
    "Do not include names, contact details, medical advice, or crisis counseling.",
    "Use these styles in order: warm, short, practical, calm, direct.",
    "Schema: {\"decision\":\"ok\",\"candidates\":[{\"id\":\"c1\",\"text\":\"...\",\"notificationText\":\"...\",\"style\":\"warm\"}]}",
    `Situation: ${context || "(no context)"}`,
  ].join("\n");
}

function normalizeCandidates(payload: unknown, mode: MessageMode) {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as Record<string, unknown>;
  if (!Array.isArray(response.candidates)) return null;

  const candidates = response.candidates.slice(0, 5).map((raw, index) => {
    const candidate = raw as Record<string, unknown>;
    const text = typeof candidate.text === "string" ? candidate.text.trim() : "";
    const notificationText = typeof candidate.notificationText === "string" ? candidate.notificationText.trim() : text;
    const style = styles.includes(candidate.style as CandidateStyle) ? candidate.style as CandidateStyle : styles[index] ?? "warm";
    if (!text || text.length < 6 || isBlockedText(text) || isBlockedText(notificationText)) return null;
    return {
      id: typeof candidate.id === "string" && candidate.id ? candidate.id : `ai-${index + 1}`,
      text,
      notificationText,
      style,
      mode,
      source: "ai",
    };
  }).filter(Boolean);

  return candidates.length === 5 ? candidates : null;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method && req.method !== "POST") {
    res.status(405).json({ decision: "blocked", reasonCode: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(503).json({ decision: "blocked", reasonCode: "ai_key_missing" });
    return;
  }

  try {
    const body = parseBody(req.body);
    const mode: MessageMode = body.mode === "nag" ? "nag" : "praise";
    const locale: Locale = body.locale === "en" ? "en" : "ko";
    const context = typeof body.context === "string" ? body.context.slice(0, 120).trim() : "";

    if (isBlockedText(context)) {
      res.status(200).json({ decision: "blocked", reasonCode: "self_harm" });
      return;
    }

    const deepseekResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          {
            role: "system",
            content: "You generate short, safe app copy. You must return only json.",
          },
          {
            role: "user",
            content: createPrompt({ mode, context, locale }),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 900,
      }),
    });

    if (!deepseekResponse.ok) {
      res.status(502).json({ decision: "blocked", reasonCode: "ai_proxy_failed" });
      return;
    }

    const payload = await deepseekResponse.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      res.status(502).json({ decision: "blocked", reasonCode: "empty_ai_response" });
      return;
    }

    const parsed = extractJsonObject(content);
    const candidates = normalizeCandidates(parsed, mode);
    if (!candidates) {
      res.status(502).json({ decision: "blocked", reasonCode: "invalid_ai_response" });
      return;
    }

    res.status(200).json({ decision: "ok", candidates });
  } catch {
    res.status(500).json({ decision: "blocked", reasonCode: "server_error" });
  }
}
