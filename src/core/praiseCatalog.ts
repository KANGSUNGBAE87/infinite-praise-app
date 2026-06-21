import type { PraiseMood, PraiseSituation } from "./praiseRepository";
import type { PraiseCandidate } from "./praiseSelector";

export const praiseSituations = [
  "endured",
  "started",
  "finished",
  "rested",
  "held_back",
  "cared",
  "brave"
] as const satisfies readonly PraiseSituation[];

export const praiseMoods = [
  "tired",
  "anxious",
  "numb",
  "proud",
  "angry",
  "guilty",
  "calm",
  "energize"
] as const satisfies readonly PraiseMood[];

interface SituationCopy {
  action: string;
  image: string;
  proof: string;
}

type MoodLineBuilder = (situation: SituationCopy) => string;

const situationCopy: Record<PraiseSituation, SituationCopy> = {
  endured: {
    action: "오늘을 끝까지 지나왔어",
    image: "하루를 통과한 일",
    proof: "지금 여기까지 온 사실이 남아 있어"
  },
  started: {
    action: "작게라도 손을 댔어",
    image: "첫 칸을 연 일",
    proof: "네 손이 닿은 자리부터 흐름이 바뀌었어"
  },
  finished: {
    action: "하나를 끝까지 닫았어",
    image: "마지막 점을 찍은 일",
    proof: "끝냈다는 사실은 생각보다 오래 버팀목이 돼"
  },
  rested: {
    action: "멈춰서 숨을 골랐어",
    image: "쉬기로 한 선택",
    proof: "회복을 챙긴 건 다시 돌아올 자리를 만든 거야"
  },
  held_back: {
    action: "터뜨리기 전에 한 번 붙잡았어",
    image: "한 박자 늦춘 선택",
    proof: "그 짧은 틈이 상황을 지켜냈어"
  },
  cared: {
    action: "나를 챙기는 일을 해냈어",
    image: "밥, 물, 씻기, 잠을 챙긴 시간",
    proof: "기본을 챙긴 건 생활을 다시 세운 거야"
  },
  brave: {
    action: "불편함을 안고 앞으로 갔어",
    image: "망설임과 함께 움직인 일",
    proof: "용기는 편할 때보다 이런 장면에서 더 또렷해져"
  }
};

const moodLines: Record<PraiseMood, readonly MoodLineBuilder[]> = {
  tired: [
    (situation) => `지친 몸으로도 ${situation.action}. 오늘은 거기까지만 봐도 돼.`,
    (situation) => `에너지가 없던 날의 ${situation.image}, 가볍게 넘길 일이 아니야.`,
    (situation) => `${situation.proof}. 더 밀지 말고, 해낸 사람으로 쉬어도 돼.`
  ],
  anxious: [
    (situation) => `불안이 커도 ${situation.action}. 확신 없이 움직인 건 어려운 일이야.`,
    (situation) => `마음이 흔들릴 때의 ${situation.image}, 용기가 섞인 선택이야.`,
    (situation) => `${situation.proof}. 걱정이 있어도 방향은 사라지지 않았어.`
  ],
  numb: [
    (situation) => `아무 감각이 없어도 ${situation.action}. 느낌이 늦게 오는 날도 있어.`,
    (situation) => `${situation.image}, 기분보다 먼저 남은 행동의 흔적이야.`,
    (situation) => `${situation.proof}. 무덤덤해도 네가 한 일은 지워지지 않아.`
  ],
  proud: [
    (situation) => `${situation.action}. 오늘은 그걸 작게 접지 않아도 돼.`,
    (situation) => `${situation.image}, 네가 스스로 알아봐도 되는 성취야.`,
    (situation) => `${situation.proof}. 뿌듯함을 조금 더 오래 들고 있어도 돼.`
  ],
  angry: [
    (situation) => `화가 있는 와중에도 ${situation.action}. 감정을 망치지 않고 다룬 거야.`,
    (situation) => `${situation.image}, 네 경계를 지키려는 힘도 들어 있어.`,
    (situation) => `${situation.proof}. 세게 느꼈고, 그래도 선택을 만들었어.`
  ],
  guilty: [
    (situation) => `죄책감이 따라와도 ${situation.action}. 너를 벌주는 쪽만 답은 아니야.`,
    (situation) => `${situation.image}, 게으름보다 돌봄에 가까워.`,
    (situation) => `${situation.proof}. 미안함이 있어도 너를 돌볼 자격은 남아 있어.`
  ],
  calm: [
    (situation) => `잔잔하게 봐도 ${situation.action}. 오늘의 기록으로 남겨둘 만해.`,
    (situation) => `${situation.image}, 조용하지만 하루의 결을 바꿨어.`,
    (situation) => `${situation.proof}. 과장 없이, 이건 네가 해낸 일이야.`
  ],
  energize: [
    (situation) => `좋아, 오늘은 크게 말할게. ${situation.action}. 너 지금도 잘하고 있어.`,
    (situation) => `${situation.image}, 그냥 지나갈 일이 아니야. 이 흐름으로 한 걸음 더 갈 수 있어.`,
    (situation) => `${situation.proof}. 작게 접지 말자. 오늘의 너는 이미 움직였어.`
  ]
};

const createNormalCandidates = (
  situation: PraiseSituation,
  mood: PraiseMood
): PraiseCandidate[] => {
  const situationText = situationCopy[situation];
  const variants = moodLines[mood].map((buildLine) => buildLine(situationText));

  return variants.map((text, index) => ({
    id: `${situation}-${mood}-normal-${index + 1}`,
    situation,
    mood,
    depth: "normal",
    text
  }));
};

export const defaultPraiseCatalog: PraiseCandidate[] = praiseSituations.flatMap(
  (situation) => praiseMoods.flatMap((mood) => createNormalCandidates(situation, mood))
);
