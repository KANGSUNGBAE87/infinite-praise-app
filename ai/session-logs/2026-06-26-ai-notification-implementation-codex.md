---
date: 2026-06-26
actor: codex
topic: ai-candidate-notification-implementation
---

# AI 후보 생성 + 실제 알림 구현 세션

## User request

- `칭찬해줘/잔소리해줘`를 중심으로 AI 후보 생성까지 바로 구현.
- 실제 알림도 붙이고, AI 고지도 앱에 즉시 표시.
- 서브에이전트를 활용해서 전체 구현.

## Subagents used

- `toss-compliance-auditor`: Apps in Toss Smart Message, Android notification permission, AI notice/reporting risk 확인.
- `code-mapper`: active route가 `src/App.tsx`임을 확인하고 `ReminderApp` wholesale 활성화는 비추천.
- `reviewer`: server proxy boundary, AI label/report, localStorage privacy, safety handling 필요성 확인.

## Decisions

- 앱명은 user-facing `내편한마디`, 영어명은 `A Word for Me`로 둔다.
- Screen 2는 `칭찬해줘 / 잔소리해줘` 모드 + 상황 입력 + AI 후보 5개 생성으로 전환한다.
- AI provider key는 클라이언트에 노출하지 않고 `/api/generate-candidates` 서버 프록시에서만 `DEEPSEEK_API_KEY`를 읽는다.
- AI 후보에는 라벨과 신고 액션을 붙인다.
- AI 프록시 실패/미설정 시 앱 안 기본 후보 5개로 폴백한다.
- 브라우저 Notification API가 가능하고 권한이 granted이면 실제 `Notification`을 예약한다.
- Apps in Toss 실푸시는 별도 Smart Message 서버, mTLS, 템플릿 검수, 알림 동의가 필요하므로 이번 구현에서는 클라이언트 직접 구현하지 않는다.
- AI 입력 context와 generated candidate drafts는 localStorage에 저장하지 않는다. 최종 선택/수정 문장만 저장한다.

## Files changed

- `.env.example`: server-only `DEEPSEEK_API_KEY` placeholder 추가.
- `api/generate-candidates.ts`: DeepSeek server proxy 추가.
- `src/core/messageGeneration.ts`: AI adapter, fallback candidates, response validation, unsafe text block 추가.
- `src/platform/adapters.ts`: browser Notification API 기반 schedule/cancel 구현.
- `src/App.tsx`: AI candidate UX, AI notice/reporting, notification scheduling, privacy-safe persistence, home notification notice 추가.
- `src/i18n.ts`: `내편한마디`/`A Word for Me`, AI labels, notification notices, settings copy 갱신.
- `src/styles.css`: candidate card, AI label, notification notice styles 추가.
- `test/*.test.*`: AI flow, notification scheduling, i18n/local persistence, adapter tests 갱신.
- `ai/plans/product-plan.md`, `ai/plans/implementation-plan.md`, `ai/plans/design-plan.md`: v0.5 현재 기준 반영.
- `ai/session-logs/screenshots/2026-06-26-ai-candidates-mobile.png`
- `ai/session-logs/screenshots/2026-06-26-ai-notification-home-mobile.png`

## Verification

- `npm run typecheck` passed.
- `npm test` passed: 18 files, 70 tests.
- `npm run build` passed.
- Local browser QA passed at `http://127.0.0.1:5173/infinite-praise-app/` with intercepted AI candidate response.

## Remaining risks

- Apps in Toss Smart Message real push still needs server-side mTLS, template/code review, notification agreement, and Toss user key handling.
- Google Play Data Safety / AI-generated content declaration must be revisited before store release.
- Browser Notification API is not a guaranteed mobile background notification system.
- DeepSeek proxy route needs deployment platform configuration and server-only secret injection before live AI calls.
- The current UI is improved, but a dedicated design review is still recommended before release packaging.

## Follow-up update: multi-time picker

User request:

- 기존 시간 선택 UI가 허접해 보이므로 Android/iOS 방식 참고.
- 원하는 경우 알림 시간을 여러 개 추가해서 받아볼 수 있어야 함.

Decisions:

- Native `<input type="time">` 하나를 제거하고, 저장된 시간 리스트 + add/edit sheet 구조로 전환.
- iOS compact date/time picker처럼 기본 화면은 버튼/행을 보여주고 편집은 sheet/modal에서 처리.
- Android/Material time picker처럼 시간 선택은 명시적인 selected state, AM/PM, 5분 단위 조정, confirm action으로 처리.
- 여러 시간은 `scheduleTimes[]`에 저장하고, legacy `scheduleTime`은 첫 시간/fallback migration 용도로 유지.

Files changed:

- `src/App.tsx`: multi-time state helpers, add/edit/remove picker state, all-times scheduling loop, formatted schedule summary.
- `src/i18n.ts`: time picker labels, quick options, multiple notification scheduled message.
- `src/styles.css`: time list, add/edit sheet, quick chips, AM/PM segmented control, stepper controls.
- `test/App.test.tsx`: failing-then-passing multi-time scheduling regression test.
- `ai/plans/product-plan.md`, `ai/plans/design-plan.md`, `ai/plans/implementation-plan.md`: v0.5.1/v0.6.1 note.

Verification:

- RED: `npm test -- test/App.test.tsx` failed because `오후 09:30`/`시간 추가` UI did not exist.
- GREEN: `npm test -- test/App.test.tsx` passed: 12 tests.
- `npm run typecheck` passed.
- `npm test -- test/LocalFirstI18n.test.tsx test/i18n.test.ts` passed: 10 tests.
- Full `npm test` passed: 18 files, 71 tests.
- `npm run build` passed.
- `graphify update . --no-cluster` refreshed project graph after code/doc updates.
- Local Playwright mobile QA at `390x844` passed with visible times `오후 09:30`, `오전 08:00`, no page/console errors.
- Screenshots:
  - `ai/session-logs/screenshots/2026-06-26-multi-time-picker-sheet-mobile.png`
  - `ai/session-logs/screenshots/2026-06-26-multi-time-list-mobile.png`

Note:

- In-app browser automation attach timed out while opening a new browser-use tab, so visual QA was completed with local Playwright against the same localhost URL.

## Knowledge promotion

- No global rule promotion performed in this session.
- Project-local canonical plans and session log were updated.
