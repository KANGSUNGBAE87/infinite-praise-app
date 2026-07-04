# 2026-06-26 Vault And Settings Tabs

Actor: codex

## User Request

- 현재 알림 설정 메뉴가 들어가 있는지 확인.
- 보관함 버튼을 눌러도 화면이 안 바뀌는 이유 확인.

## Decisions Made

- 실제 알림은 아직 구현하지 않고 `preview_only` 상태를 유지한다.
- 설정 하단 탭은 언어 토글이 아니라 실제 설정 화면으로 진입하게 한다.
- 설정 화면에는 알림 상태를 명확히 표시한다: 현재는 앱 안 미리보기만 저장되고, 실제 알림은 권한 동의/문구 검수/데이터 선언 확인 후 붙인다.
- 보관함은 다음날 체크인에서 `도움됐어`를 누른 문장을 모아두는 최소 기능으로 유지한다.

## Files Changed

- `src/App.tsx`
  - 홈 플로우와 하단 탭 화면 렌더링 조건을 분리.
  - 보관함 탭 클릭 시 홈 화면이 계속 남는 문제 수정.
  - 설정 탭 화면 추가.
- `src/i18n.ts`
  - 설정/알림 상태 문구의 ko/en 번역 추가.
- `src/styles.css`
  - 설정 카드 스타일 추가.
- `test/App.test.tsx`
  - 저장 후 홈에서 보관함/설정 탭 전환을 검증하는 테스트 추가.

## Verification

- `npm test -- test/App.test.tsx`
  - 9 tests passed.
- `npm test`
  - 17 test files passed, 72 tests passed.
- `npm run build`
  - TypeScript and Vite production build succeeded.
- Browser QA via Playwright against `http://127.0.0.1:5176/infinite-praise-app/`
  - 저장 후 보관함 탭 진입 확인.
  - 저장 후 설정 탭 진입 확인.
  - 보관함/설정 화면에서 홈 헤드라인이 남지 않는 것 확인.
  - 하단 탭 active class 확인.
- `/Users/kangsungbae/.codex/bin/graphify update . --no-cluster`
  - Graphify code graph updated.

## Remaining Risks

- 실제 알림 권한 요청, Apps in Toss 스마트 발송, Google Play 알림 권한/데이터 선언은 아직 미구현.
- 보관함은 첫 세션 저장 직후에는 비어 있고, 다음날 체크인에서 `도움됐어`를 선택해야 쌓인다.

## Next Steps

- 실제 알림 구현 전에 Apps in Toss 알림 동의/스마트 발송 문서와 Google Play Android 13+ 알림 권한/Data safety 선언을 다시 확인한다.
- 보관함이 첫 사용자에게 비어 보이는 문제는 UX 문구 또는 저장 시점 재설계로 개선할 수 있다.

## Knowledge Store Promotion

- 현재 내용은 프로젝트 구현 로그로 충분하며, 별도 지식저장소 승격은 보류.
