import type { PraiseMood, PraiseSituation } from "./praiseRepository";

interface DeepPraiseInput {
  situation: PraiseSituation;
  mood: PraiseMood;
}

const situationDeepCopy: Record<PraiseSituation, string> = {
  endured:
    "버틴 날은 아무것도 못 한 날처럼 보일 수 있어. 그래도 오늘의 너는 하루 끝까지 몸을 데리고 왔어.",
  started:
    "시작은 작게 보일수록 쉽게 무시돼. 그래도 손을 댄 순간부터 오늘은 멈춘 날이 아니게 됐어.",
  finished:
    "끝낸 일은 네 안에서 생각보다 오래 남아. 오늘 하나를 닫아낸 사람이라는 사실을 지우지 말자.",
  rested:
    "쉬었다는 건 빠진 게 아니야. 회복할 자리를 만든 거고, 네 몸을 버려두지 않았다는 뜻이야.",
  held_back:
    "참아낸 순간에는 아무도 박수치지 않을 때가 많아. 그래도 그 짧은 멈춤이 상황을 지켜냈어.",
  cared:
    "나를 챙긴 일은 작아 보여도 생활의 바닥을 다시 놓는 일이야. 그 기본이 너를 내일까지 데려가.",
  brave:
    "용기는 멋진 표정으로만 오지 않아. 망설이는 채로 움직인 오늘의 너도 이미 용기 쪽에 서 있어."
};

const moodDeepCopy: Record<PraiseMood, string> = {
  tired: "그러니까 오늘은 더 증명하지 않아도 돼. 해낸 만큼 쉬는 것도 이어가는 방법이야.",
  anxious: "불안이 남아 있어도 괜찮아. 확신 없이 한 선택은 오히려 더 어려운 선택이었어.",
  numb: "지금 당장 뿌듯하지 않아도 괜찮아. 감정보다 늦게 도착하는 인정도 있어.",
  proud: "그 감각을 너무 빨리 접지 말자. 오늘만큼은 네가 너를 알아봐도 돼.",
  angry: "화가 있었다는 건 네 경계가 살아 있었다는 뜻이기도 해. 그 안에서 선택을 만든 게 중요해.",
  guilty: "죄책감이 말하는 전부를 믿지 않아도 돼. 너를 돌보는 일까지 벌로 만들 필요는 없어.",
  calm: "잔잔하게 남겨도 좋아. 큰 말 없이도 이건 오늘의 너를 설명하는 증거야.",
  energize:
    "좋아, 이건 크게 가져가자. 너 지금도 잘하고 있고, 다음 한 걸음도 너무 작게 볼 필요 없어."
};

export const createDeepPraise = ({ situation, mood }: DeepPraiseInput): string =>
  `${situationDeepCopy[situation]} ${moodDeepCopy[mood]}`;
