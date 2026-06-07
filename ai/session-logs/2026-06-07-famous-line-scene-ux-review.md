# 세션 로그: 명대사 기반 Scene-First UX 재검토

작성일: 2026-06-07
actor/tool: codex

## 사용자 요청

- AI는 쓰지 않고, 사용자가 별도 파일로 문장/음성 후보를 준비할 예정.
- 현재 `버텼다 -> 지침` 같은 선택지가 너무 허접하므로 재검토 요청.
- 감정/상황에 맞는 문장을 받을 수 있되, 가능하면 드라마/영화 명대사면 좋겠다는 방향 제시.
- 기획자 관점의 딥한 분석 요청.

## 결정

- 상황/감정은 UI에서 직접 고르는 값이 아니라 내부 매칭 태그로 숨긴다.
- 사용자는 `오늘의 장면`과 `지금 필요한 말`을 고르는 편이 직관적이다.
- 명대사/음성은 사용자가 준비한 별도 파일로 받아들일 수 있지만, 권리 상태가 안전한 항목만 앱에 노출한다.
- 권리 확보 전 MVP는 오리지널 scene line catalog를 fallback으로 둔다.

## 산출물

- `ai/plans/2026-06-07-famous-line-scene-ux-product-review.md`

## 코드 변경

- 없음. 이번 세션은 기획 리뷰와 문서화만 수행.

## 남은 작업

- `SceneCard`, `SceneNeed`, `SceneLineCandidate` 타입 설계.
- 사용자가 준비할 JSONL 파일 스키마 샘플 작성.
- 현재 UI를 `scene card -> needed line role -> full-screen voice stage`로 개편.
- 명대사/음성 파일의 `rightsStatus` 필터링 구현.

## 지식저장소 승격

- AI 없이 사용자 준비 파일을 받는 방향과 scene-first 선택 UX를 프로젝트 컨텍스트에 반영.
