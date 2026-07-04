export type MessageMode = "praise" | "nag";
export type CandidateStyle = "warm" | "short" | "practical" | "calm" | "direct";
export type CandidateSource = "ai" | "fallback";

export interface MessageCandidate {
  id: string;
  text: string;
  notificationText: string;
  style: CandidateStyle;
  mode: MessageMode;
  source: CandidateSource;
}

export interface GenerateRequest {
  mode: MessageMode;
  context: string;
  locale: "ko" | "en";
}

export interface GenerateResult {
  decision: "ok" | "blocked";
  source: CandidateSource;
  candidates: MessageCandidate[];
  reasonCode?: "self_harm" | "violence" | "hate" | "medical" | "abuse" | "invalid_response" | "network";
}

export interface MessageGenerationAdapter {
  generate(request: GenerateRequest): Promise<GenerateResult>;
}

const blockedPatterns = [
  "죽어",
  "자살",
  "자해",
  "폭력",
  "죽이고",
  "혐오",
  "진단",
  "치료",
  "한심",
  "꺼져",
];

const styles: CandidateStyle[] = ["warm", "short", "practical", "calm", "direct"];

const koPraiseTemplates = [
  "{context}까지 해낸 건 분명히 네가 버틴 증거야.",
  "완벽하지 않아도 {context}은 사라지지 않아.",
  "오늘의 너는 {context}을 해낸 사람으로 남아 있어.",
  "힘들었어도 {context}까지 온 너를 인정해.",
  "{context} 하나만으로도 오늘은 잘했다고 해도 돼.",
];

const koNagTemplates = [
  "생각은 충분히 했어. 지금 5분만 시작하자.",
  "폰은 내려두고, 해야 할 것 하나만 열어.",
  "완벽하게 말고 지금 첫 단계부터 하자.",
  "하기 싫은 건 알겠어. 그래도 시작은 지금이야.",
  "전부 하지 말고 첫 번째 하나만 끝내자.",
];

const enPraiseTemplates = [
  "You did this: {context}. That counts today.",
  "It did not have to be perfect. {context} still matters.",
  "Even on a hard day, {context} is something you carried through.",
  "Let yourself count {context} as real effort.",
  "Today, {context} is enough to say you did well.",
];

const enNagTemplates = [
  "You have thought enough. Start with five minutes.",
  "Put the phone down and open the one thing.",
  "Not perfectly. Just start the first step now.",
  "You do not have to want it. You just have to begin.",
  "Do not do everything. Finish the first piece.",
];

function compactContext(context: string, locale: "ko" | "en") {
  const trimmed = context.trim().replace(/\s+/g, " ");
  if (!trimmed) return locale === "ko" ? "오늘 여기까지 온 것" : "showing up today";
  return trimmed.length > 28 ? `${trimmed.slice(0, 28)}...` : trimmed;
}

export function isBlockedText(text: string) {
  return blockedPatterns.some((pattern) => text.includes(pattern));
}

export function createFallbackCandidates(request: GenerateRequest): MessageCandidate[] {
  const context = compactContext(request.context, request.locale);
  const templates = request.locale === "ko"
    ? request.mode === "praise" ? koPraiseTemplates : koNagTemplates
    : request.mode === "praise" ? enPraiseTemplates : enNagTemplates;

  return templates.map((template, index) => {
    const text = template.replace("{context}", context);
    return {
      id: `fallback-${request.mode}-${index + 1}`,
      text,
      notificationText: text.length > 32 ? `${text.slice(0, 32)}...` : text,
      style: styles[index] ?? "warm",
      mode: request.mode,
      source: "fallback",
    };
  });
}

function isCandidateStyle(value: unknown): value is CandidateStyle {
  return value === "warm" || value === "short" || value === "practical" || value === "calm" || value === "direct";
}

function normalizeCandidate(raw: unknown, mode: MessageMode, index: number): MessageCandidate | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  const text = typeof candidate.text === "string" ? candidate.text.trim() : "";
  const notificationText = typeof candidate.notificationText === "string" ? candidate.notificationText.trim() : text;
  const style = isCandidateStyle(candidate.style) ? candidate.style : styles[index] ?? "warm";
  if (!text || text.length < 6 || isBlockedText(text) || isBlockedText(notificationText)) return null;
  return {
    id: typeof candidate.id === "string" && candidate.id ? candidate.id : `ai-${index + 1}`,
    text,
    notificationText,
    style,
    mode,
    source: "ai",
  };
}

export function validateCandidateResponse(payload: unknown, mode: MessageMode): GenerateResult {
  if (!payload || typeof payload !== "object") {
    return { decision: "blocked", source: "fallback", candidates: [], reasonCode: "invalid_response" };
  }
  const response = payload as Record<string, unknown>;
  if (response.decision === "blocked" || response.decision === "crisis") {
    return { decision: "blocked", source: "fallback", candidates: [], reasonCode: "self_harm" };
  }
  if (!Array.isArray(response.candidates)) {
    return { decision: "blocked", source: "fallback", candidates: [], reasonCode: "invalid_response" };
  }
  const candidates = response.candidates
    .map((candidate, index) => normalizeCandidate(candidate, mode, index))
    .filter((candidate): candidate is MessageCandidate => candidate !== null)
    .slice(0, 5);

  if (candidates.length !== 5) {
    return { decision: "blocked", source: "fallback", candidates: [], reasonCode: "invalid_response" };
  }
  return { decision: "ok", source: "ai", candidates };
}

export function createMessageGenerationAdapter(endpoint = "/api/generate-candidates"): MessageGenerationAdapter {
  return {
    async generate(request) {
      if (isBlockedText(request.context)) {
        return { decision: "blocked", source: "fallback", candidates: [], reasonCode: "self_harm" };
      }
      if (typeof fetch !== "function") {
        return { decision: "ok", source: "fallback", candidates: createFallbackCandidates(request), reasonCode: "network" };
      }
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error(`AI proxy failed: ${response.status}`);
        const payload = await response.json();
        const validated = validateCandidateResponse(payload, request.mode);
        if (validated.decision === "ok") return validated;
        const fallbackResult: GenerateResult = { decision: "ok", source: "fallback", candidates: createFallbackCandidates(request) };
        if (validated.reasonCode) fallbackResult.reasonCode = validated.reasonCode;
        return fallbackResult;
      } catch {
        return { decision: "ok", source: "fallback", candidates: createFallbackCandidates(request), reasonCode: "network" };
      }
    },
  };
}
