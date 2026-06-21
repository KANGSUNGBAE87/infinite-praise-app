import type { PraiseMood, PraiseSituation } from "./praiseRepository";

export type TtsProvider = "gemini";

export interface GeminiTtsRequestInput {
  text: string;
  situation: PraiseSituation;
  mood: PraiseMood;
  voice?: string;
  model?: string;
}

export interface GeminiTtsRequest {
  provider: TtsProvider;
  model: string;
  voice: string;
  text: string;
  prompt: string;
}

const defaultGeminiTtsModel = "gemini-2.5-flash-preview-tts";
const defaultGeminiVoice = "Kore";

const situationDirection: Record<PraiseSituation, string> = {
  endured: "The listener has endured the day and needs quiet witness, not pressure.",
  started: "The listener barely started and needs the small beginning to be noticed.",
  finished: "The listener completed something and needs permission to put it down.",
  rested: "The listener rested and needs the rest to feel legitimate.",
  held_back: "The listener held back anger or impulse and needs that restraint seen.",
  cared: "The listener did basic self-care and needs ordinary care to feel important.",
  brave: "The listener acted despite fear and needs courage acknowledged without exaggeration."
};

const moodDirection: Record<PraiseMood, string> = {
  tired: "gentle, low-energy, slow, warm, with small pauses",
  anxious: "steady, grounding, careful, no future guarantees",
  numb: "soft, quiet, accepting, without forcing emotion",
  proud: "warm, lightly smiling, letting pride stay",
  angry: "firm but calm, respecting boundaries",
  guilty: "gentle, nonjudgmental, easing guilt without dismissing it",
  calm: "quiet, simple, unforced",
  energize: "warm rally energy, bigger and brighter, but not shouting"
};

export const createGeminiTtsRequest = ({
  text,
  situation,
  mood,
  voice = defaultGeminiVoice,
  model = defaultGeminiTtsModel
}: GeminiTtsRequestInput): GeminiTtsRequest => ({
  provider: "gemini",
  model,
  voice,
  text,
  prompt: [
    "Read the Korean line exactly as written.",
    "Do not add words, do not translate, and do not explain.",
    situationDirection[situation],
    `Delivery style: ${moodDirection[mood]}.`,
    "Make it feel like a scene line spoken by someone who noticed what the listener went through."
  ].join(" ")
});
