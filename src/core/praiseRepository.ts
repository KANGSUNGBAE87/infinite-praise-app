export type PraiseSituation =
  | "endured"
  | "started"
  | "finished"
  | "rested"
  | "held_back"
  | "cared"
  | "brave";

export type PraiseMood =
  | "tired"
  | "anxious"
  | "numb"
  | "proud"
  | "angry"
  | "guilty"
  | "calm"
  | "energize";

export type PraiseDepth = "short" | "normal" | "deep";
export type PraiseSource = "manual" | "reminder" | "focus_after" | "wake_after";
export type PraiseReaction = "saved" | "replayed" | "dismissed";

export interface PraiseEvent {
  id: string;
  date: string;
  situation: PraiseSituation;
  mood: PraiseMood;
  messageId: string;
  message: string;
  depth: PraiseDepth;
  source: PraiseSource;
  reaction?: PraiseReaction;
  voiceEnabled: boolean;
  createdAt: number;
}

export interface PraiseRepository {
  savePraiseEvent(event: PraiseEvent): Promise<void>;
  getPraiseEvents(): Promise<PraiseEvent[]>;
  getRecentPraiseEvents(limit: number): Promise<PraiseEvent[]>;
  updatePraiseReaction(id: string, reaction: PraiseReaction): Promise<void>;
}

const cloneEvent = (event: PraiseEvent): PraiseEvent => ({ ...event });

export const createMemoryPraiseRepository = (
  initialEvents: PraiseEvent[] = []
): PraiseRepository => {
  const events = initialEvents.map(cloneEvent);

  return {
    async savePraiseEvent(event) {
      events.push(cloneEvent(event));
    },

    async getPraiseEvents() {
      return events.map(cloneEvent);
    },

    async getRecentPraiseEvents(limit) {
      return [...events]
        .sort((left, right) => right.createdAt - left.createdAt)
        .slice(0, limit)
        .map(cloneEvent);
    },

    async updatePraiseReaction(id, reaction) {
      const event = events.find((candidate) => candidate.id === id);
      if (event) {
        event.reaction = reaction;
      }
    }
  };
};
