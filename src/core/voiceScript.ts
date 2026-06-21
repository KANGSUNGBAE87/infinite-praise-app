import type { PraiseMood } from "./praiseRepository";

export interface VoiceSegment {
  text: string;
  rate: number;
  pitch: number;
  volume: number;
  pauseMs: number;
}

export interface VoiceScript {
  segments: VoiceSegment[];
}

interface VoiceProfile {
  rate: number;
  pitch: number;
  volume: number;
  pauseMs: number;
}

const voiceProfiles: Record<PraiseMood, VoiceProfile> = {
  tired: { rate: 0.84, pitch: 0.9, volume: 0.9, pauseMs: 320 },
  anxious: { rate: 0.86, pitch: 0.92, volume: 0.9, pauseMs: 300 },
  numb: { rate: 0.83, pitch: 0.88, volume: 0.88, pauseMs: 340 },
  proud: { rate: 0.9, pitch: 0.98, volume: 0.92, pauseMs: 260 },
  angry: { rate: 0.88, pitch: 0.94, volume: 0.9, pauseMs: 300 },
  guilty: { rate: 0.85, pitch: 0.9, volume: 0.9, pauseMs: 330 },
  calm: { rate: 0.86, pitch: 0.92, volume: 0.88, pauseMs: 310 },
  energize: { rate: 0.96, pitch: 1.04, volume: 0.96, pauseMs: 220 }
};

const maxSegmentLength = 36;

const splitLongText = (text: string): string[] => {
  const trimmed = text.trim();

  if (trimmed.length <= maxSegmentLength) {
    return [trimmed];
  }

  const parts: string[] = [];
  let remaining = trimmed;

  while (remaining.length > maxSegmentLength) {
    const spaceIndex = remaining.lastIndexOf(" ", maxSegmentLength);
    const breakIndex = spaceIndex >= 12 ? spaceIndex : maxSegmentLength;
    parts.push(remaining.slice(0, breakIndex).trim());
    remaining = remaining.slice(breakIndex).trim();
  }

  if (remaining.length > 0) {
    parts.push(remaining);
  }

  return parts;
};

const splitIntoSpeakableParts = (message: string): string[] => {
  const normalized = message.replace(/\s+/g, " ").trim();
  const sentences = normalized.match(/[^.!?。]+[.!?。]?/g) ?? [normalized];

  return sentences.flatMap((sentence) => splitLongText(sentence)).filter(Boolean);
};

export const createVoiceScript = (
  message: string,
  mood: PraiseMood
): VoiceScript => {
  const profile = voiceProfiles[mood];
  const parts = splitIntoSpeakableParts(message);

  return {
    segments: parts.map((part, index) => ({
      text: part,
      rate: profile.rate,
      pitch: profile.pitch,
      volume: profile.volume,
      pauseMs: index === parts.length - 1 ? 0 : profile.pauseMs
    }))
  };
};
