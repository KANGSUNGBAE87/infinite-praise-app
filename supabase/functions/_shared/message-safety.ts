export type SafetyReason = "self_harm" | "violence" | "hate" | "medical" | "abuse" | "private_data";

type SafetyRule = {
  reason: SafetyReason;
  patterns: string[];
};

const blockedRules: SafetyRule[] = [
  { reason: "self_harm", patterns: ["죽어", "자살", "자해", "죽고 싶", "못 살겠"] },
  { reason: "violence", patterns: ["폭력", "죽이고", "때려", "해쳐"] },
  { reason: "hate", patterns: ["혐오", "벌레", "쓰레기 같은"] },
  { reason: "medical", patterns: ["진단", "치료", "처방", "복용", "병원", "공황", "우울증"] },
  {
    reason: "abuse",
    patterns: [
      "한심",
      "꺼져",
      "의지가 없",
      "네가 문제",
      "너는 문제",
      "매번 똑같",
      "이러다 망",
      "살 빼",
      "뚱뚱",
    ],
  },
];

export function getBlockedReason(text: string): SafetyReason | null {
  const compact = text.replace(/\s+/g, " ").trim();
  for (const rule of blockedRules) {
    if (rule.patterns.some((pattern) => compact.includes(pattern))) return rule.reason;
  }
  return null;
}

export function isBlockedText(text: string) {
  return getBlockedReason(text) !== null;
}

export function sanitizeGenerationContext(text: string) {
  return text
    .replace(/([가-힣]{2,4})(?=\s*(?:\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}))/giu, "[이름]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu, "[이메일]")
    .replace(/\b(?:\+?82[-\s]?)?0?1[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/g, "[연락처]")
    .replace(/\b\d{2,3}[-\s]\d{3,4}[-\s]\d{4}\b/g, "[연락처]")
    .replace(/(병원|진단|치료|처방|복용|투약|공황|우울증|불안장애|자해|자살)/g, "[건강정보]")
    .replace(/\s+/g, " ")
    .trim();
}
