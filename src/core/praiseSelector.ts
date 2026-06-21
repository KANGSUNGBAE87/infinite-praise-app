import type {
  PraiseDepth,
  PraiseEvent,
  PraiseMood,
  PraiseSituation
} from "./praiseRepository";

export interface PraiseCandidate {
  id: string;
  situation: PraiseSituation;
  mood: PraiseMood;
  depth: PraiseDepth;
  text: string;
}

export interface PraiseSelectionInput {
  situation: PraiseSituation;
  mood: PraiseMood;
  depth: PraiseDepth;
  now: Date;
  recentEvents: PraiseEvent[];
}

export interface PraiseSelection {
  messageId: string;
  message: string;
  reasons: string[];
}

export interface PraiseSelector {
  selectPraise(input: PraiseSelectionInput): PraiseSelection;
}

const reactionScore = (candidate: PraiseCandidate, events: PraiseEvent[]): number => {
  return events.reduce((score, event) => {
    if (event.messageId !== candidate.id) {
      return score;
    }

    if (event.reaction === "saved" || event.reaction === "replayed") {
      return score + 5;
    }

    if (event.reaction === "dismissed") {
      return score - 5;
    }

    return score;
  }, 0);
};

const lastUsedMessageIds = (events: PraiseEvent[]): Set<string> => {
  return new Set(
    [...events]
      .sort((left, right) => right.createdAt - left.createdAt)
      .slice(0, 3)
      .map((event) => event.messageId)
  );
};

export const createPraiseSelector = (
  candidates: PraiseCandidate[]
): PraiseSelector => ({
  selectPraise(input) {
    const matchingCandidates = candidates.filter(
      (candidate) =>
        candidate.situation === input.situation &&
        candidate.mood === input.mood &&
        candidate.depth === input.depth
    );

    if (matchingCandidates.length === 0) {
      throw new Error(
        `No praise candidate for ${input.situation}/${input.mood}/${input.depth}`
      );
    }

    const recentlyUsed = lastUsedMessageIds(input.recentEvents);
    const nonRepeating = matchingCandidates.filter(
      (candidate) => !recentlyUsed.has(candidate.id)
    );
    const pool = nonRepeating.length > 0 ? nonRepeating : matchingCandidates;

    const scoredCandidates = pool.map((candidate, index) => {
      const score = reactionScore(candidate, input.recentEvents);
      return { candidate, index, score };
    });

    scoredCandidates.sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.index - right.index;
    });

    const selected = scoredCandidates[0]!;
    const reasons = ["matched situation, mood, and depth"];

    if (selected.score > 0) {
      reasons.push("boosted by positive reactions");
    }

    if (nonRepeating.length !== matchingCandidates.length) {
      reasons.push("avoided messages used in the last three events");
    }

    return {
      messageId: selected.candidate.id,
      message: selected.candidate.text,
      reasons
    };
  }
});
