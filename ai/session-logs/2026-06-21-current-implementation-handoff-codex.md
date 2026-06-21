---
version: 1.0
status: handoff-ready
updated: 2026-06-21
canonical: false
project: 칭찬해줘
actor: codex
topic: current implementation handoff
---

# 칭찬해줘 현재 구현 상태 이관 문서

## 목적

이 문서는 다른 AI 작업자가 `/Users/kangsungbae/Documents/무한칭찬앱`의 현재 상태를 바로 이어받을 수 있도록 만든 구현 이관 문서다. 오래된 오디오/리마인더 문서와 최신 6-screen 구현이 함께 남아 있으므로, 이 파일을 먼저 읽고 현재 활성 구현과 레거시 자산을 구분한다.

## 한 줄 결론

현재 앱은 **음성/TTS 없는 6-screen local-first 자기조율 MVP**다. 사용자는 한 줄 칭찬을 고르고, 필요하면 문구를 수정하고, 시간을 저장해 미리보기를 본다. 실제 알림은 보내지 않으며, D1 재방문 흐름은 `localStorage`에 저장된 `sessionPhase: "reopened"` 상태로 진입한다.

## 현재 승인/검증 상태

- 제품명: `칭찬해줘`
- 영어명: `Praise Me`
- 현재 구현 기준: 6-screen praise/check-in flow
- 현재 앱 성격: 비게임 생활형 앱, Apps in Toss first, Google Play compatible
- 현재 release 상태: **로컬/PWA 기능 검증은 통과했지만 스토어 출시 준비는 아님**
- 최신 검증:
  - `npm test` → 17 files passed, 70 tests passed
  - `npm run build` → TypeScript `tsc --noEmit` 통과, Vite production build 통과
- 현재 hard exclusions:
  - 실제 알림 delivery 없음
  - 음성, TTS, 오디오 재생 없음
  - AI 생성/상담 없음
  - 로그인 없음
  - 광고/IAP/결제/Toss points 없음
  - 백엔드/네트워크 전송 없음
  - store release/submission 없음

## 먼저 읽을 파일

다음 AI는 아래 순서로 읽으면 된다.

1. `AGENTS.md`, `CLAUDE.md`
   - 프로젝트 로컬 작업 규칙, Apps in Toss 우선, i18n/adapter/Graphify 규칙.
2. `00_PROJECT_BRIEF.md`
   - 2026-06-19 기준 소유자 입력과 "음성 없이 간다" 제약.
3. `01_DECISIONS.md`
   - CEO decision chain. 특히 `D-20260619-004`, `D-20260619-005`, `D-20260620-011`, `D-20260620-014`, `D-20260620-015`, `D-20260620-018`.
4. `stages/20_ARCH_FINAL.md`
   - 6-screen local-first architecture 승인 기준.
5. `stages/12_UI_DESIGN.md`, `ai/plans/design-plan.md`
   - warm/pastel A2 visual system, semantic button class, zero raw button rule.
6. `stages/42_QA_POLICY.md`
   - 기능/정책 QA 합성. Store release와 local validation의 경계를 분리한다.
7. `stages/30_BUILD_REPORT.md`
   - 최신 좁은 보정: Screen 6 analytics payload 제거, CTA 높이, selected border 보정.

## 제품/UX 현재형

현재 UI는 6단계 흐름이다.

1. Landing / Target Confirm
   - 자기 전 오늘을 덜 가혹하게 닫고 싶은 사용자에게 진입 확인.
   - Screen 1에서만 full language switcher (`한국어`, `English`)를 보여준다.
2. Praise Pick
   - 처음에는 칭찬 카드 3장만 보여준다.
   - `다른 한 줄 더 보기`를 누르면 2장이 추가되어 총 5장까지 확장된다.
   - 선택 후 `이 한 줄로 다음`으로 이동한다.
3. Rewrite Optional
   - 선택 문장을 사용자가 자기 말로 수정할 수 있다.
   - 로컬 keyword 기반 safety state가 있다.
   - `caution`은 저장 가능, `blocked`는 저장 불가.
4. Time Save + Preview
   - 시간 입력은 native `<input type="time">`이다.
   - `저장하고 미리보기`를 눌러 preview card를 채운다.
   - 정상 첫 세션은 여기서 멈춘다. 실제 알림이나 D1 자동 이동은 없다.
5. Next-day Check-in
   - `sessionPhase: "reopened"`로 저장된 상태를 다시 열 때 진입한다.
   - `유지`, `내 말로 수정`, `오늘은 건너뛰기` 세 카드는 동등한 visual weight를 가진다.
   - 재방문 source는 `manual`, `notification`, `unknown` 중 하나다.
6. Result / Trust-safe Monetization Slot
   - D1 재방문자에게만 favorite-line vault 관심 슬롯을 보여준다.
   - `관심 없음`, `관심 등록` 둘 다 가능해야 하며 가격/결제/할인 문구는 없다.

## 활성 코드 구조

### Entry

- `src/main.tsx`
  - `StrictMode`로 `App`을 렌더링한다.
- `src/App.tsx`
  - 현재 활성 앱의 대부분을 담고 있다.
  - `Step = 1 | 2 | 3 | 4 | 5 | 6` 상태 머신.
  - active imports는 `i18n`, `analyticsSanitizer`, `platform/adapters`뿐이다.

### App state

`AppState`의 주요 필드:

- `sourceTag`: 유입 태그. 현재 기본값은 `channel-direct`.
- `step`: 현재 화면 단계.
- `selectedPraiseId`, `selectedPraise`: 선택된 칭찬.
- `rewriteText`: 사용자가 수정한 문구.
- `scheduleTime`: `HH:mm`, 기본값 `21:30`.
- `previewText`: 저장 후 미리보기 문구.
- `checkinAction`: `keep | edit | skip | null`.
- `reopenSource`: `manual | notification | unknown`.
- `safetyState`: `safe | caution | blocked`.
- `interestAction`: `dismissed | registered | null`.
- `sessionPhase`: `initial | reopened`.
- `savedAt`: 저장 시각 timestamp.

### Persistence

- Locale key: `praise-me:locale-v1`
- App state key: `praise-me:state`
- 저장은 `platformAdapters.storage`를 통해 localStorage에 쓴다.
- `normalizeStoredState()`가 corrupted localStorage JSON을 try/catch로 복구한다.
- `sessionPhase === "reopened"`이면 저장된 step이 5보다 작아도 check-in screen인 Step 5로 강제한다.

### i18n

- `src/i18n.ts`
  - `ko`, `en` 두 locale.
  - 한국어 기본, 영어 선택 가능.
  - English app title은 `Praise Me`.
  - 모든 주요 UI copy는 `i18n.t()`를 통해 렌더링한다.

### Visual system

- `src/styles.css`
  - A2 visual system의 `--pm-*` token을 구현한다.
  - 핵심 semantic classes:
    - `pm-primary-cta`
    - `pm-secondary-cta`
    - `pm-choice-card`
    - `pm-text-action`
    - `lang-option`
    - `lang-compact`
  - 모든 App button은 className을 가진다. `rg -n "<button" src/App.tsx` 기준 16개 button이 있고 raw/default button은 없다.
  - 선택 카드 border는 현재 `var(--pm-primary)`로 보정됐다.
  - `pm-primary-cta` min-height는 56px, `pm-secondary-cta`는 52px이다.

### Analytics sanitizer

- `src/core/analyticsSanitizer.ts`
  - closed allowlist만 통과시킨다.
  - allowed keys: `event`, `source`, `action`, `status`, `locale`, `choice`, `variant`, `screen`
  - forbidden text-shaped keys는 전부 drop한다.
  - `sourceTag`는 현재 allowlist에 없으므로 sanitizer를 거치면 drop된다. 실제 analytics를 켤 때 이 스키마를 다시 설계해야 한다.

### Platform adapters

- `src/platform/adapters.ts`
  - 전부 MVP stub이다.
  - `auth.getCurrentUser()` → anonymous
  - `payment.hasEntitlement()` → false
  - `ads.showPlacement()` → `{ shown: false, reason: "ads_disabled_in_mvp" }`
  - `analytics.track()` → `{ tracked: false, reason: "analytics_disabled_in_mvp" }`
  - `notifications.scheduleReminder()` → `{ status: "preview_only", reason: "notifications_stubbed_in_mvp" }`
  - 실제 Apps in Toss/Google Play SDK import는 없다.

## 활성/비활성 코드 구분

활성 앱 런타임은 `src/App.tsx` 중심이다. 아래 파일들은 존재하지만 현재 `App.tsx` import graph 밖이거나 레거시/후보 자산에 가깝다.

- `src/domain/reminders/*`
  - 이전 알림형 MVP의 typed reminder repository/schedule/template 도메인.
  - 테스트는 유지되고 통과한다.
  - 현재 6-screen `App.tsx`는 이 도메인을 직접 쓰지 않는다.
- `src/features/reminder/*`
  - 이전 reminder UI 분리본.
  - 현재 entrypoint가 사용하지 않는다.
- `src/core/deepPraise.ts`, `praiseCatalog.ts`, `praiseRepository.ts`, `praiseSelector.ts`, `praiseReceipt.ts`
  - 초기 자기칭찬/receipt 도메인.
  - 테스트는 유지되고 통과한다.
  - 현재 6-screen UI의 primary path는 아니다.
- `src/core/ttsPrompt.ts`, `voiceScript.ts`, `scripts/tts/gemini-tts.mjs`
  - TTS/voice 후보 자산.
  - 사용자 지시와 승인 범위상 현재 MVP core에서 제외한다.
- `src/data/quote-pack.v0.1.json`, `audio-manifest.v0.1.json`
  - 오디오/quote pack 과거 자산.
  - `audio-manifest` asset status는 대부분 `missing`이고 현재 core flow에서는 쓰지 않는다.
- `src/data/message-templates.v0.1.json`
  - reminder template data. 현재 6-screen App은 쓰지 않지만 tests가 release template 품질을 검증한다.

## Safety contract

현재 rewrite safety는 AI/moderation이 아니라 단순 로컬 keyword rule이다.

- `cautionKeywords`: `한심`, `왜 맨날`, `넌 왜`
- `blockedKeywords`: `죽어`, `자해`, `폭력`, `진단`, `치료`
- `caution`
  - 안내 문구 표시.
  - 저장 가능.
  - `message_cautioned` 이벤트 발생 가능.
- `blocked`
  - 저장 버튼 disabled.
  - `message_blocked` 이벤트 발생.

주의: 이 rule은 완전한 유해문구 탐지 시스템이 아니다. 정책상 가장 안전한 제품 방향은 자유 입력 원문을 실제 알림 본문으로 내보내지 않고, 앱 내부 local preview에만 보관하는 것이다.

## Analytics event contract

현재 주요 이벤트:

- `landing_viewed`
- `target_confirmed`
- `target_rejected`
- `praise_selected`
- `rewrite_started`
- `message_blocked`
- `message_cautioned`
- `rewrite_saved`
- `schedule_started`
- `reminder_created`
- `preview_viewed`
- `return_next_day`
- `return_next_day_manual`
- `checkin_prompt_viewed`
- `checkin_completed`
- `message_kept`
- `message_edited`
- `message_skipped_today`
- `reopen_reason_tagged`
- `vault_interest_viewed`
- `vault_interest_clicked`
- `vault_interest_handled`

중요한 검증 포인트:

- `rewrite_started`는 한 rewrite session에서 한 번만 나와야 한다.
- caution text를 저장하면 `message_cautioned`와 `rewrite_saved`가 모두 나와야 한다.
- blocked text는 저장 불가이며 `rewrite_saved`가 나오면 안 된다.
- D1 result에서 `관심 없음`을 누르면 `vault_interest_handled.status === "dismissed"`가 나와야 한다.
- free-text 원문은 analytics payload에 들어가면 안 된다.

현재 analytics adapter는 no-op이므로 외부 전송은 없다. 그래도 테스트는 이벤트 이름과 sanitizer 계약을 검증한다.

## 테스트 현황

현재 `npm test` 기준:

- 17 test files
- 70 tests
- 모두 통과

핵심 테스트 파일:

- `test/App.test.tsx`
  - landing render
  - rewrite blocked/caution
  - persisted reopened state
  - Step 4에서 첫 세션이 멈추는지
  - D1 keep/edit/skip/fake-door event flow
  - locale switch
  - free-text analytics guard
- `test/LocalFirstI18n.test.tsx`
  - localStorage persistence
  - corrupted localStorage fallback
  - 6-screen ko/en label coverage
  - no network calls during full first-session flow
- `test/analyticsSanitizer.test.ts`
  - free-text-shaped keys drop
  - closed contract fields only keep
- `test/platformAdapters.test.ts`
  - all MVP adapters stubbed
  - notification remains preview-only
- `test/reminder*.test.ts`
  - legacy reminder schema/repository/schedule/template quality
- `test/praise*.test.ts`, `test/voiceScript.test.ts`, `test/ttsPrompt.test.ts`
  - older praise/audio domain assets. They pass but are not current primary UX.

## Local runbook

Install dependencies are already present in this workspace.

```bash
npm run dev
```

Expected:

- Vite serves on `http://127.0.0.1:<port>/`.
- If 5173 is busy, Vite automatically picks the next available port.

Verification commands:

```bash
npm test
npm run build
```

Current observed result on 2026-06-21:

```text
npm test      -> 17 files passed, 70 tests passed
npm run build -> tsc --noEmit passed, vite build passed
```

## Visual evidence

Screenshot artifacts exist under `ai/session-logs/screenshots/`.

Important files:

- `a2-screen1-landing.png`
- `a2-screen2-praise-pick.png`
- `a2-screen3-rewrite.png`
- `qa-screen1-ko-360x740.png`
- `qa-screen1-en-360x740.png`
- `qa-screen2-initial-ko-360x740.png`
- `qa-screen2-selected-ko-360x740.png`
- `qa-screen3-ko-360x740.png`
- `qa-screen4-before-ko-360x740.png`
- `qa-screen4-after-ko-360x740.png`
- `qa-screen5-ko-360x740.png`
- `qa-screen6-ko-360x740.png`

Known history:

- Visual QA found Screen 6 analytics JSON payload exposure, Screen 6 CTA height issue, and selected card border color issue.
- Latest `stages/30_BUILD_REPORT.md` says those were fixed.
- Current source confirms:
  - no `Sanitized payload` user-facing article in `App.tsx`
  - fake-door buttons use `pm-secondary-cta` and `pm-primary-cta`
  - selected card border uses `var(--pm-primary)`

## Store / platform readiness

Current local/prototype readiness:

- Functional local QA: pass after P1 localStorage remediation.
- Policy QA: pass/conditional for local web/PWA validation.
- Visual/UI A2 remediation: implemented and tested.

Not ready for store submission:

- Apps in Toss sandbox test not done.
- Toss app QR/test-scheme test not done.
- 개인정보처리방침 URL not prepared.
- Google Play Data Safety form not prepared.
- Safe Area and Toss WebView behavior not verified on real Apps in Toss environment.
- Real notification path not designed or implemented.
- Analytics is disabled; enabling analytics needs privacy/schema review.

## Git/worktree warning

Do not assume `git status` means "all of these files were changed by you." This workspace has many untracked project files and generated artifacts already present. Before editing, inspect the current file and preserve unrelated user/agent work.

Current notable state at this handoff:

- Branch: `main`
- Many files are untracked, including project docs, `src/`, `test/`, `stages/`, and `graphify-out/`.
- `ai/session-logs/README.md` is modified.
- Do not run destructive cleanup or broad `git add -A`.

## Safe next steps for another AI

If continuing implementation:

1. Re-check `01_DECISIONS.md` and current `stages/30_BUILD_REPORT.md`.
2. Run `npm test` and `npm run build` before changing code.
3. Keep the hard exclusions: no voice/TTS/audio, no SDK, no real notification, no login/ads/IAP/backend.
4. Preserve semantic button classes and A2 design tokens.
5. If touching analytics, keep the closed sanitizer contract and add tests for event cardinality and payload shape.
6. If touching localStorage, keep corrupted-state fallback tests green.
7. If moving toward store release, stop and run the Apps in Toss release gate first. This is not store-ready yet.

If doing QA:

1. Serve locally with `npm run dev`.
2. Test 360x740 and 390x844.
3. Walk all 6 screens in ko and at least screens 1, 2, 4, 6 in en.
4. Seed `localStorage` with `sessionPhase: "reopened"` to test D1 screens.
5. Verify no user-facing JSON/debug payload appears.
6. Verify Screen 6 fake-door remains dismissible and has no price/payment/discount language.

If refactoring:

1. `src/App.tsx` is the largest risk because it contains the whole flow and event emit sites.
2. Extracting domain/session logic is reasonable, but only after locking behavior with tests.
3. Do not wire existing `domain/reminders` into the live App unless the product scope explicitly returns to reminder management. It is legacy relative to the current 6-screen flow.

## Session evidence

This handoff was created after reading the current stage docs, active source, selected tests, and current build/test output.

Commands run during handoff creation:

```bash
/Users/kangsungbae/.codex/bin/graphify query "칭찬해줘 현재 구현 상태 알림형 MVP architecture components tests platform adapters"
npm test
npm run build
```

Results:

- `graphify query` surfaced `ai/plans/implementation-plan.md` and 6-screen architecture nodes.
- `npm test` passed 70/70.
- `npm run build` passed.

## Knowledge-store promotion

No cross-project reusable rule was promoted during this handoff. The artifact is project-local and intended as the next-AI starting point.
