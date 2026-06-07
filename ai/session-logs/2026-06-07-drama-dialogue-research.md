# 세션 로그: 드라마/영화식 카피 조사

작성일: 2026-06-07
actor/tool: codex

## 사용자 요청

- 현재 칭찬 문구가 아니라, 드라마/영화에서 상황에 따라 가장 듣고 싶은 말처럼 설계해야 하는 것 아니냐는 문제 제기.
- 구현 전 조사를 요청.

## 진행

- 심리/커뮤니케이션 관점에서 validation, reassurance, self-compassion 자료를 조사.
- 한국 드라마/영화식 위로 대사의 기사와 분석 글을 확인.
- 실제 대사를 복제하지 않고 구조만 추출하는 방향으로 정리.

## 결정

- 무한칭찬앱의 카피는 "칭찬"보다 "장면 증언"에 가까워야 한다.
- 카피 엔진은 `praise catalog`보다 `scene line catalog`로 재정의하는 것이 맞다.
- 가장 중요한 패턴은 장면 증언, 허락, 동행/연속성, 책임 내려놓기, 감정의 품격 부여, 평범한 것의 회복, 말하지 않는 말이다.

## 산출물

- `ai/plans/2026-06-07-drama-dialogue-praise-research.md`

## 검증/명령

- 웹 조사 수행.
- 코드 변경 없음.

## 남은 작업

- 기존 `praiseCatalog.ts`를 조사 결과에 맞게 `sceneNeed` 기반 구조로 바꾸기.
- `voiceScript`를 `voiceBeat` 중심으로 확장하기.
- 카피 테스트 기준을 direct praise/미래 보장/조언 과다 금지 중심으로 재작성하기.

## 지식저장소 승격

- 프로젝트 고유 카피 전략이므로 `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/context.md`에 핵심 원칙을 반영할 후보.
