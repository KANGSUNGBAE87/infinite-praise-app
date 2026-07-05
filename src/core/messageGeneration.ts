import messageTemplateCatalog from "../data/message-templates.v0.1.json";
import { getBlockedReason, isBlockedText, sanitizeGenerationContext } from "./messageSafety";
import { getSupabaseFunctionConfig } from "./supabaseFunctions";
export { sanitizeGenerationContext } from "./messageSafety";

export type MessageMode = "praise" | "nag";
export type ExpressionVariant = "short_sentence" | "action_suggestion" | "ack_then_act" | "notification_short" | "firmer_line";
export type CandidateSource = "ai" | "fallback";
export type MessageSituation = "general" | "study" | "work" | "exercise" | "chores" | "sleep" | "phone";
export type MessageFeeling = "tired" | "procrastinating" | "anxious" | "proud" | "overwhelmed" | "stuck";
export type MessageTone = "warm" | "calm" | "practical" | "short" | "direct" | "witty";
export type MessageIntensity = "gentle" | "firm" | "bold";
export type MessagePurpose = "recognize" | "reassure" | "rest" | "start" | "stop";

export interface ConstraintBundle {
  mode: MessageMode;
  locale: "ko" | "en";
  situation: MessageSituation;
  feeling: MessageFeeling;
  tone: MessageTone;
  intensity: MessageIntensity;
}

export interface MessageCandidate {
  id: string;
  text: string;
  notificationText: string;
  expressionVariant: ExpressionVariant;
  mode: MessageMode;
  source: CandidateSource;
}

export interface GenerateRequest {
  mode: MessageMode;
  context: string;
  locale: "ko" | "en";
  situation?: MessageSituation;
  feeling?: MessageFeeling;
  tone?: MessageTone;
  intensity?: MessageIntensity;
  purpose?: MessagePurpose;
}

export interface GenerateResult {
  decision: "ok" | "blocked";
  source: CandidateSource;
  candidates: MessageCandidate[];
  reasonCode?: "self_harm" | "violence" | "hate" | "medical" | "abuse" | "private_data" | "invalid_response" | "network";
}

export interface MessageGenerationAdapter {
  generate(request: GenerateRequest): Promise<GenerateResult>;
}

type MessageGenerationAdapterOptions = {
  endpoint?: string;
  headers?: Record<string, string>;
};

export const expressionVariants: ExpressionVariant[] = ["short_sentence", "action_suggestion", "ack_then_act", "notification_short", "firmer_line"];
type TemplateRecord = {
  id: string;
  locale: "ko" | "en";
  mode: MessageMode;
  situations: MessageSituation[];
  feelings: MessageFeeling[];
  tones: MessageTone[];
  intensities: MessageIntensity[];
  purpose: MessagePurpose;
  expressionVariant?: ExpressionVariant;
  text: string;
  notificationText: string;
};

const templateRecords = messageTemplateCatalog.templates as TemplateRecord[];

function compactContext(context: string, locale: "ko" | "en") {
  const trimmed = context.trim().replace(/\s+/g, " ");
  if (!trimmed) return locale === "ko" ? "오늘 여기까지 온 것" : "showing up today";
  return trimmed.length > 28 ? `${trimmed.slice(0, 28)}...` : trimmed;
}

function renderTemplate(template: string, context: string) {
  return template.replaceAll("{context}", context);
}

function scoreTemplate(template: TemplateRecord, request: GenerateRequest) {
  let score = 0;
  if ((request.situation && template.situations.includes(request.situation)) || template.situations.includes("general")) score += 3;
  if (request.feeling && template.feelings.includes(request.feeling)) score += 3;
  if (request.tone && template.tones.includes(request.tone)) score += 2;
  if (request.intensity && template.intensities.includes(request.intensity)) score += 2;
  if (request.purpose && template.purpose === request.purpose) score += 1;
  return score;
}

function defaultSituation(mode: MessageMode): MessageSituation {
  return mode === "praise" ? "study" : "study";
}

function defaultFeeling(mode: MessageMode): MessageFeeling {
  return mode === "praise" ? "tired" : "procrastinating";
}

function defaultTone(mode: MessageMode): MessageTone {
  return mode === "praise" ? "warm" : "calm";
}

function defaultIntensity(mode: MessageMode): MessageIntensity {
  return mode === "praise" ? "firm" : "firm";
}

export function createConstraintBundle(request: GenerateRequest): ConstraintBundle {
  return {
    mode: request.mode,
    locale: request.locale,
    situation: request.situation ?? defaultSituation(request.mode),
    feeling: request.feeling ?? defaultFeeling(request.mode),
    tone: request.tone ?? defaultTone(request.mode),
    intensity: request.intensity ?? defaultIntensity(request.mode),
  };
}

function isConstraintBundle(value: unknown): value is ConstraintBundle {
  if (!value || typeof value !== "object") return false;
  const bundle = value as Record<string, unknown>;
  return (bundle.mode === "praise" || bundle.mode === "nag")
    && (bundle.locale === "ko" || bundle.locale === "en")
    && typeof bundle.situation === "string"
    && typeof bundle.feeling === "string"
    && typeof bundle.tone === "string"
    && typeof bundle.intensity === "string";
}

function sameConstraintBundle(actual: unknown, expected: ConstraintBundle) {
  if (!isConstraintBundle(actual)) return false;
  return actual.mode === expected.mode
    && actual.locale === expected.locale
    && actual.situation === expected.situation
    && actual.feeling === expected.feeling
    && actual.tone === expected.tone
    && actual.intensity === expected.intensity;
}

export function createFallbackCandidates(request: GenerateRequest): MessageCandidate[] {
  const context = compactContext(request.context, request.locale);
  const matching = templateRecords
    .filter((template) => template.locale === request.locale && template.mode === request.mode)
    .map((template, index) => ({ template, index, score: scoreTemplate(template, request) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const seen = new Set<string>();
  const selected = matching.filter(({ template }) => {
    if (seen.has(template.id)) return false;
    seen.add(template.id);
    return true;
  }).slice(0, 5);

  return selected.map(({ template }, index) => {
    const text = renderTemplate(template.text, context);
    const notificationText = renderTemplate(template.notificationText, context);
    return {
      id: `fallback-${request.mode}-${index + 1}`,
      text,
      notificationText: notificationText.length > 32 ? `${notificationText.slice(0, 32)}...` : notificationText,
      expressionVariant: template.expressionVariant ?? expressionVariants[index] ?? "short_sentence",
      mode: request.mode,
      source: "fallback",
    };
  });
}

function isExpressionVariant(value: unknown): value is ExpressionVariant {
  return value === "short_sentence"
    || value === "action_suggestion"
    || value === "ack_then_act"
    || value === "notification_short"
    || value === "firmer_line";
}

function normalizeCandidate(raw: unknown, mode: MessageMode, index: number): MessageCandidate | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  const text = typeof candidate.text === "string" ? candidate.text.trim() : "";
  const notificationText = typeof candidate.notificationText === "string" ? candidate.notificationText.trim() : text;
  const expressionVariant = isExpressionVariant(candidate.expressionVariant) ? candidate.expressionVariant : null;
  if (!expressionVariant || expressionVariant !== expressionVariants[index]) return null;
  if (!text || text.length < 6 || isBlockedText(text) || isBlockedText(notificationText)) return null;
  return {
    id: `ai-${index + 1}`,
    text,
    notificationText,
    expressionVariant,
    mode,
    source: "ai",
  };
}

export function validateCandidateResponse(payload: unknown, mode: MessageMode, expectedConstraintBundle?: ConstraintBundle): GenerateResult {
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
  if (expectedConstraintBundle && !sameConstraintBundle(response.constraintBundle, expectedConstraintBundle)) {
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

export function createMessageGenerationAdapter(options: MessageGenerationAdapterOptions | string = {}): MessageGenerationAdapter {
  const optionConfig = typeof options === "string" ? { endpoint: options } : options;
  const supabaseConfig = optionConfig.endpoint ? null : getSupabaseFunctionConfig("generate-candidates");
  const endpoint = optionConfig.endpoint ?? supabaseConfig?.endpoint ?? "/api/generate-candidates";
  const requestHeaders = {
    "Content-Type": "application/json",
    ...(supabaseConfig?.headers ?? {}),
    ...(optionConfig.headers ?? {}),
  };

  return {
    async generate(request) {
      const sanitizedContext = sanitizeGenerationContext(request.context);
      const reasonCode = getBlockedReason(sanitizedContext);
      if (reasonCode) {
        return { decision: "blocked", source: "fallback", candidates: [], reasonCode };
      }
      if (typeof fetch !== "function") {
        return { decision: "blocked", source: "fallback", candidates: [], reasonCode: "network" };
      }
      try {
        const constraintBundle = createConstraintBundle(request);
        const sanitizedRequest = {
          ...request,
          context: sanitizedContext,
          constraintBundle,
        };
        const response = await fetch(endpoint, {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(sanitizedRequest),
        });
        if (!response.ok) throw new Error(`AI proxy failed: ${response.status}`);
        const payload = await response.json();
        const validated = validateCandidateResponse(payload, request.mode, constraintBundle);
        if (validated.decision === "ok") return validated;
        return validated;
      } catch {
        return { decision: "blocked", source: "fallback", candidates: [], reasonCode: "network" };
      }
    },
  };
}
