---
version: 1.1
status: final
updated: 2026-06-20
canonical: false
project: 칭찬해줘
topic: QA/Release functional micro-2a — local-first/i18n only
input_decision: D-20260620-011
supersedes_failed_task: t_ec6bdccf (local-first/i18n subset)
parent_gate: t_92d35984
run_id: 363
---

# QA/Release functional micro-2a — local-first persistence + i18n

## Context

D-20260620-011 APPROVE로 QA/Release 진입. 원본 QA micro-2(t_ec6bdccf)가 crash+budget exhaustion으로 실패하여, local-first + i18n으로 범위를 축소한 recovery task. 6-screen flow의 ko/en 사용자 레이블과 localStorage 기반 로컬 우선 퍼시스턴스/재로드 동작만 검증한다.

- QA profile: qa-functional (read-only tester)
- 제외 범위: voice/TTS/audio, login, ads/IAP/payment/Toss points, backend, store submission, direct platform SDK, preview notifications, fake-door interest handling
- No product code changes.

## Environment

- Repository: /Users/kangsungbae/Documents/무한칭찬앱
- HEAD: `03ebb0d889c0c6b1658044d3c17891094faab401` (main)
- Branch: main
- Node: v22.22.3
- npm: 10.9.8
- Test runner: vitest v4.1.8
- Build: TypeScript 5.x + Vite v8.0.16
- OS: macOS 26.2
- Date: 2026-06-20 KST

## Commands run

```bash
cd /Users/kangsungbae/Documents/무한칭찬앱

# Environment fingerprint
git rev-parse HEAD  # 03ebb0d889c0c6b1658044d3c17891094faab401
git branch --show-current  # main
node --version  # v22.22.3

# Baseline verification
npm test      # 17 test files, 70 tests passed
npm run build # tsc --noEmit + vite build passed (62ms)

# i18n source audit
grep -o 'i18n\.t("[^"]*"' src/App.tsx | sort -u | wc -l  # 46 unique i18n keys
grep -c '"[a-zA-Z_.]\+":' src/i18n.ts  # 122 (61 ko + 61 en)

# Local-first persistence audit
grep -n 'localStorage\|setItem\|getItem\|loadLocale\|saveLocale' src/App.tsx
# 4 references: loadLocale (line 41), getItem("state") (line 46), saveLocale (line 80), setItem("state") (line 84)

# Excluded scope audit — all return 0 matches
grep -c '(fetch\|axios\|XMLHttpRequest\|sendBeacon\|@apps-in-toss)' src/App.tsx
grep -c '(ttsPrompt\|voiceScript\|TtsAdapter\|VoicePlayback)' src/App.tsx
grep -c '(login\|Login\|AuthAdapter\|getCurrentUser)' src/App.tsx
grep -c '(payment\|IAP\|AdMob\|TossPoints\|ads)' src/App.tsx

# Browser smoke test
npx serve dist -p 3456  # served at http://localhost:3456
# Verified: KO landing → EN switch → landing→praise→rewrite→schedule full flow
# Console errors: 0, JS errors: 0
# LocalStorage: locale "en" + state (step=4) both survive page reload
```

## Checkpoint 1: i18n ko/en label coverage (rewrite/D1 path)

### Source evidence

- `src/i18n.ts`: 61 ko labels, 61 en labels — all keys paired, 122 total labels.
- `src/App.tsx`: 46 unique `i18n.t()` calls across the 6-step flow.
- 모든 App.tsx i18n 키가 ko/en 양쪽에 정의되어 있다. 빠진 키 없음.
- 언어 전환 버튼: `"한국어"` / `"English"` 레이블은 `localeOptions` 배열에서 제공.
- praise options (`praiseOptions` array)는 `locale === "ko" ? option.ko : option.en`으로 선택.

### Runtime evidence (17 tests in test/LocalFirstI18n.test.tsx)

| Screen | KO labels verified | EN labels verified |
|--------|-------------------|-------------------|
| Landing (step 1) | 칭찬해줘, 자기 전 오늘을 덜 가혹하게 닫고 싶나요?, 맞아요 들어볼게요, 지금은 아니에요, 미리보기 전용, 오프라인에서는... | Praise Me, Want to end today a little less harshly?, Yes let me in, Not now, Preview only, Offline mode... |
| Praise (step 2) | 오늘의 한 줄을 골라요, 빈 화면 대신 큐레이션된..., 5개 praise options (ko) | Choose today's line, Start from a curated praise..., 5개 praise options (en) |
| Rewrite (step 3) | 원하면 내 말로 조금 바꿔요, 짧게만 수정해도 충분해요, 저장하기, 이대로 저장, 이 문구는 조금 더 다정하게..., 이 문구는 저장할 수 없어요 | Optionally rewrite it in your own words, A tiny edit is enough, Save, Save as is, This line could be a little gentler, This line cannot be saved |
| Schedule (step 4) | 시간을 하나만 저장해요, 알림은 미리보기 전용으로..., 받을 시간, 시간 저장, 저장 직후 미리보기 | Save one time slot, Notifications are preview-only..., Time, Save time, Preview after save |
| Check-in (step 5, D1 reopen) | 어제의 한 줄 오늘도 맞나요?, 다시 열었을 때 1-tap으로..., 유지, 내 말로 수정, 오늘은 건너뛰기, 왜 다시 열었나요?, 직접 다시 열었어요, 알림을 눌렀어요, 알림 또는 직접 다시 열었어요 | Does yesterday's line still feel right?, When you return tomorrow..., Keep it, Rewrite it, Skip today, Why did you reopen it?, Opened manually, Opened from a notification, Opened from a notification or manually |
| Result (step 6, D1 reopen) | 확인 결과, D1 복귀자에게만 조심스럽게..., 마음에 든 한 줄 보관함 보기, 관심 없음, 관심 등록, 가격 결제 할인 문구는 보여주지 않아요, 처음부터 | Check-in result, A gentle interest slot..., See the favorite-line vault, Not interested, Register interest, No price payment or discount copy is shown, Start over |
| Navigation | 1/6 단계~6/6 단계, 뒤로, 다음 | Step 1 of 6~Step 6 of 6, Back, Next |

모든 테스트 통과 (17/17). 각 스크린별 KO→EN 전환 후 heading, button, paragraph 레이블이 정확히 렌더링됨 (vitest v4.1.8, run 363).

### Browser served evidence

- `http://localhost:3456`에서 KO 랜딩 확인: "칭찬해줘", "자기 전, 오늘을 덜 가혹하게 닫고 싶나요?", "맞아요, 들어볼게요"
- EN 전환 확인: "Praise Me", "Want to end today a little less harshly?", "Yes, let me in"
- Step 2→3→4 EN flow에서 praise selection("Choose today's line"), rewrite("Optionally rewrite it in your own words" / "Save as is"), schedule("Save one time slot" / "Preview after save") 모두 정확
- Page reload: locale "en" 및 state (step=4) 모두 localStorage에서 복원, schedule 화면으로 바로 진입
- Console errors: 0, JS errors: 0

Verdict: **PASS**. 6-step flow의 모든 사용자 대상 레이블이 ko/en 양쪽에서 정확히 렌더링된다. i18n key 누락이나 locale mismatch 없음.

---

## Checkpoint 2: local-first persistence / reload behavior

### Source evidence

- `src/App.tsx:40-44`: 초기 locale 로드 — `platformAdapters.storage.loadLocale()` → 기본값 `"ko"`.
- `src/App.tsx:45-74`: 초기 state 로드 — `platformAdapters.storage.getItem("state")` → JSON 파싱. `sessionPhase === "reopened"`이면 step을 `>= 5`로 강제 설정.
- `src/App.tsx:79-81`: locale 변경 시 `platformAdapters.storage.saveLocale(locale)` 자동 호출 (useEffect).
- `src/App.tsx:83-85`: state 변경 시 `platformAdapters.storage.setItem("state", JSON.stringify(state))` 자동 호출 (useEffect).
- `src/platform/adapters.ts:55-58`: storage adapter는 `window.localStorage` (또는 memory fallback). locale key: `praise-me:locale-v1`, state key: `praise-me:state`.

### Runtime evidence (test/LocalFirstI18n.test.tsx)

| Test | Verdict | Evidence |
|------|---------|----------|
| persists app state to localStorage on every state change | PASS | Step 1→2 transition: localStorage state.step 1→2. Praise selection: selectedPraiseId = "p1" persisted. |
| restores state from localStorage on fresh render (reopened session) | PASS | Seeded reopened state (step=5, sessionPhase=reopened) → renders check-in screen, not landing. |
| forces reopened session to minimum step 5 regardless of saved step | PASS | Seeded step=3 but sessionPhase=reopened → renders step 5 (check-in), not rewrite. |
| falls back to default state when localStorage is empty | PASS | Empty localStorage → renders landing screen with default state. |
| persists locale choice across re-renders via localStorage | PASS | Seeded locale-v1="en" → renders "Praise Me", not "칭찬해줘". |
| local-first: no network calls during full 6-step flow | PASS | fetch spy confirms 0 calls through landing→praise→rewrite→schedule full flow. |

### Browser reload evidence

- EN locale + schedule (step 4) state both persisted across `browser_navigate` reload.
- localStorage `praise-me:locale-v1` = `"en"`, `praise-me:state` contains correct `step: 4`, `sessionPhase: "initial"`.

### Known finding: corrupted localStorage crash

`test: crashes on corrupted localStorage state (known: no try/catch in JSON.parse)` — **PASS (bug confirmed)**: `src/App.tsx:47`의 `JSON.parse(saved)`가 손상된 localStorage 값에서 `SyntaxError`를 throw함. try/catch가 없어 앱이 crash. Builder remediation 필요 (CHANGES_REQUIRED).

Verdict: **PASS with 1 known finding**. localStorage 기반 state/locale persistence는 모든 정상 케이스에서 정확히 동작한다. state 변경 시 자동 저장, reload 시 state/locale 복원, reopened session의 step 5 강제 상승이 모두 확인되었다. 단, 손상된 localStorage에 대한 방어 코드 부재는 remediation 필요.

---

## Checkpoint 3: excluded scope audit

### Source audit

| Pattern | Scope | Result |
|---------|-------|--------|
| `grep -c '(fetch\|axios\|XMLHttpRequest\|sendBeacon\|@apps-in-toss)' src/App.tsx` | Backend/network/platform SDK | 0 matches |
| `grep -c '(ttsPrompt\|voiceScript\|TtsAdapter\|VoicePlayback)' src/App.tsx` | TTS/voice | 0 matches |
| `grep -c '(login\|Login\|AuthAdapter\|getCurrentUser)' src/App.tsx` | Auth/login | 0 matches |
| `grep -c '(payment\|IAP\|AdMob\|TossPoints\|ads)' src/App.tsx` | Payment/IAP/ads | 0 matches |

Active flow (src/App.tsx)는 `i18n`, `analyticsSanitizer`, `platform/adapters`만 import. 모든 platform adapter는 stub 상태 (`status: "stub"`). Analytics adapter는 `track()` 호출 시 `{ tracked: false, reason: "analytics_disabled_in_mvp" }` 반환.

### Runtime evidence

- `test: local-first: no network calls during full 6-step flow`: fetch spy가 0회 호출 확인.
- 모든 App.test.tsx / LocalFirstI18n.test.tsx 테스트는 platform adapter를 stub으로 mock — 실제 네트워크/인증/결제/광고 호출 없음.
- Browser served smoke: Network 탭에서 외부 요청 0건. Console errors 0, JS errors 0.

Verdict: **PASS**. Backend/network/login/payment/ad/platform SDK가 active flow에 전혀 침투하지 않았다.

---

## Final Verdict

**PASS (with CHANGES_REQUIRED: 1 known finding)**

모든 local-first persistence 및 i18n ko/en 레이블이 6-step flow에서 정상 동작한다. 17개 runtime test (LocalFirstI18n.test.tsx) + 기존 7개 App.test.tsx + 전체 70개 test 통과. npm run build 통과. Browser served smoke 0 console errors. Page reload 후 locale/state 모두 localStorage에서 정확히 복원됨.

## Findings requiring builder remediation

1. **Corrupted localStorage crash** (`src/App.tsx:47`): `JSON.parse(saved)`에 try/catch가 없어 손상된 localStorage 값에서 앱이 crash함. 초기 state 로드에 `try { JSON.parse(saved) } catch { null }` 패턴 추가 권장.

## Remaining risk / 미검증 영역

- Notification delivery: preview-only by design, 이 task 범위에서 제외.
- Fake-door interest handling (vault_interest_handled): micro-2 recovery에서 범위 축소로 제외. 별도 QA 카드(t_007f6e18)에서 처리.
- Reminder feature files (src/features/reminder/)는 active flow 밖 — 이 task 범위에서 제외.
- Legacy TTS/voice 파일 (src/core/ttsPrompt.ts, src/core/voiceScript.ts)은 repo에 존재하나 active import graph 밖.
- Toss sandbox / 실제 앱인토스 환경 smoke 테스트는 아직 수행되지 않음.
- localStorage 손상 crash 외의 에러 케이스 (storage quota, private browsing 등)는 테스트되지 않음.

## knowledge_candidates

- maturity: provisional
  summary: i18n QA should assert each screen's heading/button/label text in both locales via runtime rendering test, not just count locale keys. Unicode curly quotes ('\u2019) in EN labels must be matched exactly — ASCII apostrophe assertion will fail.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/test/LocalFirstI18n.test.tsx
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/

- maturity: provisional
  summary: Local-first QA should test both empty localStorage (default state) and corrupted localStorage (graceful degradation, not crash). JSON.parse without try/catch is a crash vector in local-first apps.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/test/LocalFirstI18n.test.tsx (corrupted localStorage crash test)
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/
