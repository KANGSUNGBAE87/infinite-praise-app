# 세션 로그: 칭찬 카피 반복성 수정

작성일: 2026-06-07
actor/tool: codex

## 사용자 요청

- 앱에서 칭찬 내용이 너무 똑같게 느껴진다는 피드백.
- 같은 상황/톤을 눌렀을 때 반복되는 복붙 느낌을 줄이는 구현 요청.

## 결정

- normal-depth 칭찬 카탈로그를 상황 7개 x 톤 8개 x 3문장으로 확장한다.
- `힘내자` 톤에는 고에너지 응원을 허용하되, 다른 톤에는 `무조건 할 수 있어`, `넌 최고야` 같은 과장 문구가 섞이지 않게 유지한다.
- 저장하지 않은 칭찬도 프리뷰 히스토리에 넣어 최근 문장 반복을 피한다.
- 반복성 문제를 테스트로 고정한다.

## 변경 파일

- `src/core/praiseCatalog.ts`
- `src/App.tsx`
- `test/praiseCatalog.test.ts`
- `test/App.test.tsx`
- `ai/plans/2026-06-06-non-llm-tts-implementation-plan.md`

## 검증

- RED: `npm test -- test/praiseCatalog.test.ts test/App.test.tsx` 실패 확인
  - 조합별 후보 1개뿐인 문제
  - `분명히 의미가 있어` 보일러플레이트 반복 문제
  - 저장 전 반복 클릭 시 동일 문장 반복 문제
- GREEN: `npm test -- test/praiseCatalog.test.ts test/App.test.tsx`
- 전체 검증:
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
  - `npm audit --audit-level=critical`
- 브라우저 QA:
  - `http://127.0.0.1:5173/`에서 `시작했다 -> 지침`을 3회 반복해 서로 다른 3개 문장 확인
  - 모바일 390x844 뷰포트에서 칭찬 문장이 결과 카드 폭을 넘지 않는지 확인

## 남은 위험

- 현재 카탈로그는 normal-depth 중심이다. `short`와 `deep` 후보는 아직 정식 카탈로그로 분리되지 않았다.
- 실제 앱인토스/React Native 이식 시 TTS, 저장소, i18n 어댑터 연결이 필요하다.
- 장기적으로는 사용자 반응 기반으로 문장 계열을 조절해야 한다.

## 지식저장소 승격

- 프로젝트 고유 제품 판단이므로 `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/`의 제품 노트에 간단히 반영할 후보.
