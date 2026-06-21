---
version: 1.0
status: final
updated: 2026-06-20
canonical: true
project: 칭찬해줘
topic: QA/Release functional retest — corrupted localStorage fallback + regression smoke
input_decision: D-20260620-013
parent_review: stages/reviews/t_b512118f-localstorage-fallback-review.md
qa_profile: qa-functional
verdict: PASS
---

# QA functional retest — corrupted localStorage fallback

## Context

D-20260620-013 APPROVE_WITH_CHANGES에서 open_risk로 남은 P1 corrupted localStorage crash fix에 대한 functional retest. dev-reviewer가 t_b512118f에서 read-only remediation review로 PASS 판정한 fix를 runtime browser smoke로 재검증한다.

- QA profile: qa-functional (read-only tester)
- 제외 범위 유지: voice/TTS/audio, login, ads/IAP/payment/Toss points, backend/network, real notification, AI/counseling, direct SDK

## Environment

- Repository: /Users/kangsungbae/Documents/무한칭찬앱
- HEAD: `03ebb0d889c0c6b1658044d3c17891094faab401` (main)
- Node: (project local)
- Test runner: vitest v4.1.8
- Build: TypeScript 5.x + Vite v8.0.16
- Browser: localhost:5187 (vite dev server)
- OS: macOS 26.2
- Date: 2026-06-20 KST

## Commands run

```bash
cd /Users/kangsungbae/Documents/무한칭찬앱

# Build/test baseline
npm test      # 17 test files, 70 tests passed
npm run build # tsc --noEmit + vite build passed

# File integrity check (must match dev-reviewer baseline)
shasum -a 256 src/App.tsx test/LocalFirstI18n.test.tsx test/App.test.tsx \
  src/platform/adapters.ts package.json package-lock.json tsconfig.json \
  vitest.config.ts index.html
# All 9 hashes match t_b512118f baseline exactly
```

## File integrity

All 9 reviewed files unchanged from dev-reviewer baseline:

| File | SHA-256 |
|---|---|
| `src/App.tsx` | `0a592e22a41bd77893039abaf8b7068c8ace4f9fdb6434f467dcb6c03e35ba78` |
| `test/LocalFirstI18n.test.tsx` | `c4641cacaaf9802f9ed097e0df41827044c16144ce739fde9392af9ebd9d670c` |
| `test/App.test.tsx` | `6117b1f94855bf9672171206c450740226fcfb5de1d2520712d88e8298d2b09e` |
| `src/platform/adapters.ts` | `eb8ec52509cdc70058cec4b2e12aa29a3501ef62202cb50b41f4e2aa089e9a3a` |
| `package.json` | `3730189a952f2da70abe4361fe4726fa8b3e773fbb522d105bf6d3ad997481c2` |
| `package-lock.json` | `8692ff318adff345c7244cab45236c6ebebb98cb52ab07168a483ec9ed22369b` |
| `tsconfig.json` | `9d95efd07f01961b76d53a337ab0a7268adad4f4e518450993f2ab51ec8e6f77` |
| `vitest.config.ts` | `c278a0c928b45f9a4861c91e5b2ff3b2b8221e7a1f82c5ec380b37622ccb14c2` |
| `index.html` | `edb8afe2a00eb42cb76abbee558ecac22768b2f3f664a84f97d329396d6c1f3e` |

## Test/build verification

- `npm test` → **17 test files, 70 tests passed** (0 failures)
- `npm run build` → **tsc --noEmit && vite build passed**

## Flow 1: Corrupted localStorage fallback

### Setup

```js
localStorage.setItem('praise-me:state', 'not-valid-json{');
```

### Runtime execution

1. Seeded malformed `praise-me:state` with invalid JSON `not-valid-json{`
2. Reloaded page (`http://localhost:5187/`)
3. Observed landing screen

### Result: PASS

- **No crash.** Landing screen rendered: `자기 전, 오늘을 덜 가혹하게 닫고 싶나요?`
- **`praise-me:state` rewritten to valid JSON** default state (verifiable via `localStorage.getItem('praise-me:state')` → `{"sourceTag":"channel-direct","step":1,...}`)
- **0 JS errors** in browser console

```json
// Post-reload state (parseable):
{
  "sourceTag": "channel-direct",
  "step": 1,
  "targetConfirmed": false,
  "sessionPhase": "initial",
  "safetyState": "safe",
  "savedAt": null
}
```

## Flow 2: Valid reopened state restore → step-5 check-in

### Setup

```js
const reopenedState = {
  "sourceTag":"reopen","step":3,"targetConfirmed":true,
  "selectedPraiseId":"p1","selectedPraise":"오늘 하루 수고 많았어요",
  "scheduleTime":"21:30","sessionPhase":"reopened",
  "safetyState":"safe","reopenSource":"reopen-detected",
  "savedAt":"2026-06-20T12:00:00Z"
};
localStorage.setItem('praise-me:state', JSON.stringify(reopenedState));
localStorage.setItem('praise-me:locale-v1', 'ko');
```

### Runtime execution

1. Seeded valid reopened state with `step: 3`, `sessionPhase: "reopened"`, locale `ko`
2. Reloaded page
3. Observed step-5 check-in screen

### Result: PASS

- **Step-5 check-in restored** (step=3 normalized to minimum step=5): `5/6 단계`, `내일의 나에게 남기는 한 줄`, `어제의 한 줄, 오늘도 맞나요?`
- Reopen source selector visible: `왜 다시 열었나요?` → `알림 또는 직접 다시 열었어요`
- Action buttons present: `유지`, `내 말로 수정`, `오늘은 건너뛰기`
- **0 JS errors** in browser console

## Flow 3: Locale persistence ko/en after reload

### Runtime execution

1. Seeded `praise-me:locale-v1 = 'ko'`, reloaded → Korean landing confirmed (`자기 전, 오늘을 덜 가혹하게 닫고 싶나요?`)
2. Clicked `English` button → page switched to English (`Want to end today a little less harshly?`, `Yes, let me in`, `Not now`)
3. Reloaded page → English persisted, `localStorage.getItem('praise-me:locale-v1') === 'en'`

### Result: PASS

- **ko→en switch** functional
- **en persists after reload** — `praise-me:locale-v1 = 'en'` in localStorage
- **0 JS errors** in browser console across both loads (total console: 0 JS errors from 3 navigations)

## Excluded scope verification

Excluded capabilities remain absent in active flow:

- **No voice/TTS/audio**: no `ttsPrompt`, `voiceScript`, or audio elements in snapshot
- **No login/auth**: no sign-in, token, or auth adapter active
- **No ads/IAP/payment/Toss points**: no billing, ads, or payment calls in console/network
- **No backend/network calls**: local-first, no `fetch`/`axios`/`XMLHttpRequest` in active App.tsx
- **No real notification**: adapters.ts keeps `notifications = preview_only`
- **No AI/counseling**: no LLM prompt or API call in active flow
- **No direct SDK**: all platform access through `platform/adapters.ts` stubs

## Scope note

Browser smoke was limited to served local-first flows (no external network, no Toss sandbox/test environment). Storage backend (`praise-me:state`, `praise-me:locale-v1`) uses browser localStorage — same as the app code. No new regression detected.

## Regression summary

| Flow | Console JS errors | Crash | State correct | Locale correct |
|---|---|---|---|---|
| 1. Corrupted localStorage | 0 | No | Default (rewritten) | ko (default) |
| 2. Reopened restore (step-5) | 0 | No | Step-5 check-in | ko |
| 3. Locale persistence ko/en | 0 | No | — | en (persisted) |

## Verdict

**PASS.**

1. Corrupted `praise-me:state` gracefully falls back to safe default state without crash (Flow 1)
2. Valid reopened state preserves step-5 minimum behavior (Flow 2)
3. Locale persistence ko/en survives reload (Flow 3)
4. `npm test` (17 files, 70 tests) and `npm run build` pass independently
5. 0 browser console/JS errors across all 3 flows
6. File hashes match dev-reviewer baseline — no mutation introduced
7. Excluded scopes remain absent: voice/TTS/audio, login, ads/IAP/payment/Toss points, backend, real notifications, AI/counseling, direct SDK

No regression detected. Fix is verified at runtime and ready for CEO gate.

## 미검증 영역

- Toss sandbox/test environment (local browser only)
- Apps in Toss WebView render / close/back gesture
- Google Play Android build / Capacitor/TWA shell
- Offline network condition (local server)
- Privacy/Data Safety pre-submission audit
- Release/store packaging
