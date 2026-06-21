import type { PraiseEvent, PraiseMood, PraiseSituation } from "./praiseRepository";

export interface PraiseReceiptInput {
  events: PraiseEvent[];
  from: Date;
  to: Date;
}

export interface PraiseReceipt {
  totalCount: number;
  topSituation?: PraiseSituation;
  topMood?: PraiseMood;
  lines: string[];
}

const situationLabels: Record<PraiseSituation, string> = {
  endured: "버텼다",
  started: "시작했다",
  finished: "끝냈다",
  rested: "쉬었다",
  held_back: "참았다",
  cared: "챙겼다",
  brave: "용기냈다"
};

const countBy = <T extends string>(
  events: PraiseEvent[],
  key: (event: PraiseEvent) => T
): Map<T, number> => {
  const counts = new Map<T, number>();
  for (const event of events) {
    const value = key(event);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
};

const topEntry = <T extends string>(counts: Map<T, number>): [T, number] | undefined => {
  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0];
};

const situationLine = (situation: PraiseSituation, count: number): string => {
  if (situation === "endured") {
    return `\`${situationLabels[situation]}\`가 ${count}번 있었어. 요즘은 통과하는 날이 많았던 것 같아.`;
  }

  if (situation === "cared") {
    return `\`${situationLabels[situation]}\`가 ${count}번 있었어. 작지만 나를 돌보는 행동이 있었어.`;
  }

  return `\`${situationLabels[situation]}\`가 ${count}번 있었어. 그 선택도 이번 기간의 흔적이야.`;
};

export const createPraiseReceipt = ({
  events,
  from,
  to
}: PraiseReceiptInput): PraiseReceipt => {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  const scopedEvents = events.filter(
    (event) => event.createdAt >= fromTime && event.createdAt < toTime
  );

  if (scopedEvents.length === 0) {
    return {
      totalCount: 0,
      lines: [
        "이번 기간에는 아직 남긴 칭찬 기록이 없어. 없는 일을 만들지 않고, 다음에 누른 것부터 보여줄게."
      ]
    };
  }

  const situationCounts = countBy(scopedEvents, (event) => event.situation);
  const moodCounts = countBy(scopedEvents, (event) => event.mood);
  const topSituation = topEntry(situationCounts);
  const topMood = topEntry(moodCounts);
  const lines = [`이번 기간에 너는 나를 ${scopedEvents.length}번 알아봐 줬어.`];

  if (topSituation) {
    lines.push(situationLine(topSituation[0], topSituation[1]));
  }

  const receipt: PraiseReceipt = {
    totalCount: scopedEvents.length,
    lines
  };

  if (topSituation) {
    receipt.topSituation = topSituation[0];
  }

  if (topMood) {
    receipt.topMood = topMood[0];
  }

  return receipt;
};
