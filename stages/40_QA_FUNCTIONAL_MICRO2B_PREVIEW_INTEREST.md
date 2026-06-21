---
version: 1.0
status: final
updated: 2026-06-20
canonical: false
project: 칭찬해줘
topic: QA/Release functional micro-2b — preview notification/fake-door only
input_decision: D-20260620-011
parent_recovery: t_7c024308 (micro-2a PASS)
run_id: 366
---

# QA/Release functional micro-2b — preview notification + fake-door interest

## Context

D-20260620-011 APPROVE로 QA/Release 진입. Micro-2a(t_7c024308)에서 local-first/i18n 검증 후 제외된 preview notification 및 fake-door interest handling을 별도 카드로 검증한다. 범위: preview-only notification limits, fake-door dismissible interest slot (step 6, D1 return only), excluded scope 재확인.

- QA profile: qa-functional (read-only tester)
- 제외 범위: voice/TTS/audio, login, ads/IAP/payment/Toss points, backend, store submission, direct platform SDK, broad local-first/i18n (→ t_7c024308)
- No product code changes.

## Environment

- Repository: /Users/kangsungbae/Documents/무한칭찬앱
- HEAD: `03ebb0d889c0c6b1658044d3c17891094faab401` (main)
- Node: v22.22.3
- npm: 10.9.8
- Test runner: vitest v4.1.8
- Build: tsc --noEmit + Vite v8.0.16 (✓ 120ms)
- OS: macOS 26.2
- Date: 2026-06-20 KST

## Commands run

```bash
cd /Users/kangsungbae/Documents/무한칭찬앱

# Environment fingerprint
git rev-parse HEAD  # 03ebb0d889c0c6b1658044d3c17891094faab401
git branch --show-current  # main
node --version  # v22.22.3

# Baseline
npm test      # 17 test files, 70 tests passed
npm run build # tsc --noEmit + vite build passed (120ms)

# Preview-only notification source audit
grep -n 'scheduleReminder\|preview_only\|previewOnly\|NotificationCapability' src/platform/adapters.ts
# Line 5: NotificationCapability includes "preview_only"
# Line 29: scheduleReminder returns { status: "preview_only" | "scheduled" | "blocked" }
# Line 67: scheduleReminder implementation returns { status: "preview_only", reason: "notifications_stubbed_in_mvp" }

grep -n 'previewOnly\|preview\.fallback\|schedule\.preview\|schedule\.body' src/i18n.ts
# ko line 39: "알림은 미리보기 전용으로 표시하고, 실제 전달은 하지 않아요."
# ko line 43: "미리보기 전용"
# en line 102: "Notifications are preview-only here; no real delivery happens yet."
# en line 106: "Preview only"

grep -n 'schedule\.previewOnly\|preview\.fallback' src/App.tsx
# Line 171, 225, 264: i18n.t("schedule.previewOnly") rendered in summary card, schedule, footer

# Network/backend/SDK exclusion audit — all 0 matches
grep -c '(fetch\|axios\|XMLHttpRequest\|sendBeacon\|@apps-in-toss)' src/App.tsx  # 0
grep -c '(ttsPrompt\|voiceScript\|TtsAdapter\|VoicePlayback)' src/App.tsx  # 0
grep -c '(login\|Login\|AuthAdapter\|getCurrentUser)' src/App.tsx  # 0
grep -c '(payment\|IAP\|AdMob\|TossPoints\|ads)' src/App.tsx  # 0

# No platform SDK imports anywhere in src
grep -r '@apps-in-toss\|admob\|google-signin\|billing-library\|notifee\|firebase' src/ --include='*.ts' --include='*.tsx'
# Only adapter type constants in platform/adapters.ts (no real imports)

# Fake-door interest audit
grep -n 'sessionPhase.*reopened\|InterestAction\|vault_interest\|result\.' src/App.tsx
# Line 8: InterestAction = "dismissed" | "registered"
# Line 66: Parsed state check for reopened
# Line 122: vault_interest_viewed event (step 6 && reopened)
# Line 248: step 6 rendered ONLY when sessionPhase === "reopened"
# Line 255: "관심 없음" → interestAction: "dismissed" + vault_interest_handled
# Line 256: "관심 등록" → interestAction: "registered" + vault_interest_clicked + vault_interest_handled

# Browser served smoke
npx serve dist -p 3457  # http://localhost:3457
# Tested: KO flow to step 4 (preview-only notification text)
# Tested: Reopened session → step 5 check-in → step 6 fake-door
# Tested: EN locale for fake-door screen
# Tested: "관심 없음" dismiss + "관심 등록" register both update state correctly
# Console errors: 0, JS errors: 0

# Analytics sanitizer check
grep -n 'FORBIDDEN_TEXT_KEYS\|sanitizeAnalytics' src/core/analyticsSanitizer.ts
# Line 12-24: 11 free-text field names blocked (text, rawText, freeText, praise, rewrite, message, etc.)
# Line 26: sanitizeAnalytics strips all forbidden keys + non-allowed keys
```

---

## Checkpoint 1: Preview-only notification limits

### Source evidence

`src/platform/adapters.ts`:
- `NotificationCapability` type (line 5): `"preview_only"` is a first-class capability state, not a fallback.
- `scheduleReminder()` return type (line 29): `{ status: "preview_only" | "scheduled" | "blocked" }`. Runtime always returns `{ status: "preview_only", reason: "notifications_stubbed_in_mvp" }` (line 67).
- `getPermissionStatus()` and `requestPermission()` both return `"unsupported"` — no permission prompt ever fires.
- `cancelReminder()` returns `{ canceled: false, reason: "notifications_stubbed_in_mvp" }`.
- No real notification SDK imported: 0 matches for `notifee`, `firebase.*messaging`, `push.*notification`, or `@apps-in-toss.*notification` anywhere in `src/`.

`src/platform/adapters.ts` line 67 (verbatim):
```typescript
notifications: {
  status: "stub",
  capability: "preview_only",
  async getPermissionStatus(){ return "unsupported"; },
  async requestPermission(){ return "unsupported"; },
  async scheduleReminder(){ return { status: "preview_only", reason: "notifications_stubbed_in_mvp" }; },
  async cancelReminder(){ return { canceled: false, reason: "notifications_stubbed_in_mvp" }; }
}
```

No backend/network call accompanies scheduleReminder. `App.tsx:221` calls `announce("reminder_created")` and `announce("preview_viewed")` — but `announce()` → `analytics.track()` → returns `{ tracked: false, reason: "analytics_disabled_in_mvp" }`. No real outbound request.

### i18n copy evidence

| Key | KO | EN |
|-----|----|----|
| `schedule.previewOnly` | 미리보기 전용 | Preview only |
| `schedule.body` | 알림은 미리보기 전용으로 표시하고, 실제 전달은 하지 않아요. | Notifications are preview-only here; no real delivery happens yet. |
| `app.description` | 로컬 저장, ko/en 전환, 미리보기 전용 알림 흐름으로 먼저 검증해요. | Local-first storage, ko/en switching, and preview-only notification flow. |
| `status.previewOnly` | 미리보기 전용으로 표시 중이에요. | Shown as preview only. |
| `preview.fallback` | 내일의 나에게 남기는 한 줄 | One line kept for tomorrow |

### Runtime rendering evidence

`schedule.previewOnly` copy is rendered in 3 positions across all screens:

| Position | Source line | KO text | EN text |
|----------|-------------|---------|---------|
| Summary card (hero section) | App.tsx:171 | 미리보기 전용 | Preview only |
| Schedule screen article | App.tsx:225 | 미리보기 전용 | Preview only |
| Footer | App.tsx:264 | 미리보기 전용 | Preview only |

Browser served smoke confirms all 3 positions render in both locales. The schedule screen's `i18n.t("schedule.body")` paragraph (App.tsx:216) adds explicit context: "알림은 미리보기 전용으로 표시하고, 실제 전달은 하지 않아요."

Verdict: **PASS**. Notification is preview-only by design. scheduleReminder() returns `preview_only` status, requestPermission returns `unsupported`, no real push/notification SDK exists, no backend delivery call is made, and the user is explicitly informed via 3 text surfaces that delivery is not active.

---

## Checkpoint 2: Fake-door / dismissible interest handling (step 6, D1 return only)

### Source evidence

`src/App.tsx`:
- `InterestAction` type (line 8): `"dismissed" | "registered"` — binary choice with explicit dismissal path.
- `AppState.interestAction` (line 22): stored in state, initialized to `null`.
- Step 6 conditional render (line 248): `{state.step === 6 && state.sessionPhase === "reopened" && ( ... )}` — **only renders when reopened**, hidden on first session.
- `vault_interest_viewed` event (line 121-122): fires once per step 6 entry in reopened mode (ref-guarded).
- "관심 없음" button (line 255): sets `interestAction: "dismissed"`, fires `vault_interest_handled` with status `"dismissed"`.
- "관심 등록" button (line 256): sets `interestAction: "registered"`, fires `vault_interest_clicked` + `vault_interest_handled` with status `"registered"`.
- "처음부터" button (line 259): resets `interestAction: null` along with other state.

No dead-end: both dismiss and register are explicit actions that update state and fire analytics events. The step has a clean restart path.

### i18n copy evidence (step 6)

| Key | KO | EN |
|-----|----|----|
| `result.title` | 확인 결과 | Check-in result |
| `result.body` | D1 복귀자에게만 조심스럽게 보이는 관심 슬롯이에요. | A gentle interest slot appears only for D1 returners. |
| `result.cta` | 마음에 든 한 줄 보관함 보기 | See the favorite-line vault |
| `result.dismiss` | 관심 없음 | Not interested |
| `result.register` | 관심 등록 | Register interest |
| `result.notice` | 가격, 결제, 할인 문구는 보여주지 않아요. | No price, payment, or discount copy is shown. |
| `result.hidden` | 첫 세션에서는 숨겨져요. | Hidden on the first session. |

### Trust-safe constraints verified

| Constraint | Evidence |
|-----------|----------|
| No price copy | `result.notice`: "가격, 결제, 할인 문구는 보여주지 않아요." Confirmed via grep: 0 price/payment/discount strings in step 6 JSX. |
| No paywall language | UX gate: "금지 톤" includes "지금 결제", "오늘만 할인". None present in result.* copy. |
| No urgency | No countdown, timer, or scarcity language in any i18n label. |
| Hidden on first session | Conditional render guards: `sessionPhase === "reopened"`. First session (step 1→4) never reaches step 6. |
| Dismissible | "관심 없음"/"Not interested" button explicitly dismisses. `interestAction: "dismissed"` stored in state. |
| Re-registerable | "관심 등록"/"Register interest" button always visible alongside dismiss. |
| Analytics sanitized | `sanitizeAnalytics()` (analyticsSanitizer.ts:26-33) strips 11 free-text field names before tracking. Step 6 payload shows: `{"event":"rewrite_saved","source":"channel-direct","screen":"step-6"}` — no user content. |

### Browser runtime evidence

**KO locale (reopened → step 5 check-in → step 6 mask):**

```
Step 5 of 6: 체크인 → "유지" 클릭
→ Step 6: "확인 결과"
  "D1 복귀자에게만 조심스럽게 보이는 관심 슬롯이에요."
  "마음에 든 한 줄 보관함 보기"
  "가격, 결제, 할인 문구는 보여주지 않아요."
  [관심 없음] [관심 등록]
```

- "관심 없음" 클릭 → localStorage: `interestAction: "dismissed"` (console verified)
- "관심 등록" 클릭 → localStorage: `interestAction: "registered"` (console verified)
- Reload 후 `interestAction` state 유지 (localStorage persistence)

**EN locale (same flow):**

```
Step 5: Check-in → "Keep it" click
→ Step 6: "Check-in result"
  "A gentle interest slot appears only for D1 returners."
  "See the favorite-line vault"
  "No price, payment, or discount copy is shown."
  [Not interested] [Register interest]
```

**First session (initial phase):**
- Normal flow: step 1 → 2 → 3 → 4. Step 4 is the maximum step. Step 6 code block is never entered because `sessionPhase: "initial"`.
- Reloading into initial phase: localStorage restored `sessionPhase: "initial"` → step capped at saved step (≤ 4). Step 6 unreachable.

Verdict: **PASS**. Fake-door interest slot is correctly gated to D1 return only, dismissible + re-registerable, explicitly free of price/payment/discount copy, and generates sanitized analytics events. No dead-end — both dismiss and register are complete actions with state persistence.

---

## Checkpoint 3: No payment/ad/login/platform SDK in active flow

### Source audit

| Pattern | Scope | App.tsx matches | Verified via |
|---------|-------|-----------------|-------------|
| `fetch\|axios\|XMLHttpRequest\|sendBeacon\|@apps-in-toss` | Network/backend/platform SDK | 0 | grep |
| `ttsPrompt\|voiceScript\|TtsAdapter\|VoicePlayback` | TTS/voice | 0 | grep |
| `login\|Login\|AuthAdapter\|getCurrentUser` | Auth/login | 0 | grep |
| `payment\|IAP\|AdMob\|TossPoints\|ads` | Payment/IAP/ads | 0 | grep |
| `import.*@apps-in-toss\|import.*admob\|import.*billing` | Platform SDK imports | 0 | grep -r src/ |

All platform adapters are stub status:

```typescript
// src/platform/adapters.ts — runtime behavior
auth.getCurrentUser()       → { status: "anonymous" }
payment.hasEntitlement()    → false
ads.showPlacement()         → { shown: false, reason: "ads_disabled_in_mvp" }
analytics.track()           → { tracked: false, reason: "analytics_disabled_in_mvp" }
notifications.scheduleReminder() → { status: "preview_only", reason: "notifications_stubbed_in_mvp" }
storage.*                   → window.localStorage (or memory fallback)
```

Active App.tsx imports only:
```typescript
import { useEffect, useMemo, useRef, useState } from "react";
import { createI18n, isLocale, localeOptions, type Locale } from "./i18n";
import { sanitizeAnalytics } from "./core/analyticsSanitizer";
import { createMvpPlatformAdapters } from "./platform/adapters";
```

No direct SDK imports. No `@apps-in-toss/framework` runtime usage (type constants only in adapter definitions).

### Excluded scope residual — legacy files

These files exist in the repo but are outside the active import graph (not imported by App.tsx or its transitive dependencies):

- `src/core/ttsPrompt.ts`, `src/core/voiceScript.ts` — legacy TTS, not imported by App.tsx
- `src/features/reminder/*` — old reminder shell, excluded from active flow
- `test/geminiTtsCli.test.ts`, `test/ttsPrompt.test.ts`, `test/voiceScript.test.ts` — legacy tests, pass but test excluded features

All 70 tests pass. No test failure related to excluded scope.

Verdict: **PASS**. No payment, ad, login, or platform SDK behavior exists in the active product flow. All adapters return no-op/stub responses. User can complete the full 6-step flow without any backend/network/platform dependency.

---

## Checkpoint 4: Browser served smoke — console + JavaScript errors

### Evidence

| Run | Console errors | JS errors | Locale | Action |
|-----|---------------|-----------|--------|--------|
| Initial land | 0 | 0 | KO | Step 1 loaded |
| Step 1→2 | 0 | 0 | KO | Praise pick rendered |
| Step 2→3 | 0 | 0 | KO | Rewrite rendered |
| Step 3→4 | 0 | 0 | KO | Schedule + preview rendered |
| Reopened step 5 | 0 | 0 | KO | Check-in rendered |
| Step 5→6 | 0 | 0 | KO | Fake-door rendered |
| "관심 없음" click | 0 | 0 | KO | State updated |
| Reopened step 5→6 | 0 | 0 | EN | EN fake-door rendered |
| "Register interest" click | 0 | 0 | EN | State updated |

Total: 0 console errors, 0 JavaScript errors across all test paths.

---

## Final Verdict

**PASS**

All 3 checkpoints pass with 0 findings requiring remediation. Preview-only notification, fake-door interest handling, and excluded scope boundaries function exactly as approved.

## Checkpoint summary

| # | Checkpoint | Verdict | Evidence key |
|---|-----------|---------|-------------|
| 1 | Preview-only notification limits | PASS | scheduleReminder → preview_only; no real SDK; 3× "미리보기 전용" surfaces |
| 2 | Fake-door interest handling (step 6, D1 only) | PASS | sessionPhase gate; dismissible + registerable; 0 price/payment copy; sanitized analytics |
| 3 | No payment/ad/login/platform SDK | PASS | 0 matches all categories; all adapters stub; no direct SDK imports |

## Findings requiring builder remediation

None.

## Remaining risk / 미검증 영역

- Reminder feature files (`src/features/reminder/`) exist but are outside active flow — not tested.
- Legacy TTS/voice files exist in repo but outside active import graph — not tested.
- Browser-served Network tab: all analytics calls return `tracked: false` — no real outbound request made, but HTTP-layer verification was not instrumented.
- Toss sandbox / 실제 앱인토스 mini-app 환경 smoke는 이 task 범위 밖 (preview-only by design, 실제 delivery 환경이 아니므로).
- Corrupted localStorage crash finding (micro-2a, `App.tsx:47`) remains un-remediated at this HEAD — builder fix pending. This affects fake-door state restoration in corrupted localStorage scenarios but falls under micro-2a scope.

## knowledge_candidates

- maturity: provisional
  summary: Preview-only notification QA should verify (a) scheduleReminder returns preview_only at the adapter level, (b) requestPermission returns unsupported, (c) no real push/notification SDK is imported, and (d) user-facing copy explicitly states delivery is not active — all 4 must hold to confirm preview-only is not a disguised stub.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/src/platform/adapters.ts
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/

- maturity: provisional
  summary: Fake-door monetization QA must verify (a) slot only shows on D1 return (not first session), (b) dismiss and register are both available as explicit actions, (c) no price/payment/discount/urgency copy exists in the slot text, (d) analytics events are emitted with sanitized payloads, and (e) neither action creates a dead-end — both must leave the user in a stable UI state.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/10_UX_FINAL.md (Screen 6 spec)
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/

- maturity: provisional
  summary: Notification adapter capability enum should include "preview_only" as a first-class state, not as a broken "unsupported" fallback. When scheduleReminder returns preview_only, callers should not treat it as an error — it is the intended runtime contract for MVP.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/src/platform/adapters.ts:5 (NotificationCapability type)
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md
