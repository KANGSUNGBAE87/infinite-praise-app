---
version: 1.0
status: draft
updated: 2026-06-20
canonical: true
project: 칭찬해줘
topic: QA/Release functional micro-1 — served rewrite/D1 analytics functional smoke
input_decision: D-20260620-011
parent_review: stages/reviews/t_0416e644-rewrite-analytics-remediation-review.md
parent_build: stages/30_BUILD_REPORT.md v1.6
---

# QA/Release functional micro-1 — rewrite/D1 analytics served smoke

## Context

D-20260620-011 APPROVE로 QA/Release 진입. 승인된 6-screen flow의 rewrite/D1 analytics 4개 핵심 지점을 runtime test + source audit으로 검증한다.

- QA profile: qa-functional (read-only tester)
- 제외 범위 유지: voice/TTS/audio, login, ads/IAP/payment/Toss points, backend, store submission, direct platform SDK

## Environment

- Repository: /Users/kangsungbae/Documents/무한칭찬앱
- HEAD: `03ebb0d889c0c6b1658044d3c17891094faab401` (main)
- Node: (project local)
- Test runner: vitest v4.1.8
- Build: TypeScript 5.x + Vite v8.0.16
- OS: macOS 26.2
- Date: 2026-06-20 KST

## Commands run

```bash
cd /Users/kangsungbae/Documents/무한칭찬앱

# Baseline verification
npm test      # 16 test files, 53 tests passed
npm run build # tsc --noEmit + vite build passed

# Source audit (active src/ only)
rg 'rewrite_started' src/       # 1 match: App.tsx:125, Step 2→3 transition effect
rg 'message_cautioned' src/     # 2 matches: App.tsx:113 (useEffect caution detect), App.tsx:208 (save button onClick)
rg 'rewrite_saved' src/         # 3 matches: App.tsx:138 (sanitizedPreview), App.tsx:208 (save), App.tsx:209 (keepOriginal)
rg 'message_blocked' src/       # 1 match: App.tsx:108 (useEffect blocked detect)
rg 'vault_interest_handled' src/ # 2 matches: App.tsx:255 (dismissed), App.tsx:256 (registered)
rg '(fetch|axios|XMLHttpRequest|sendBeacon|@apps-in-toss|ttsPrompt|voiceScript)' src/
# 0 matches in active flow — excluded scope intact

# Test runtime evidence (7 App.test.tsx tests relevant)
rg 'rewrite_started|message_cautioned|rewrite_saved|message_blocked' test/App.test.tsx
# 9 assertions covering exact cardinality, event sequence, caution-save outcome
```

## Checkpoint 1: rewrite_started single cardinality

### Approved contract

- `stages/10_UX_FINAL.md:253-257`: rewrite_started + rewrite_saved emitted in rewrite flow.
- `stages/20_ARCH_FINAL.md:249-299`: rewrite transition is a stable event contract.
- D-20260620-010: rewrite_started must emit exactly once per rewrite entry.

### Source evidence

- `src/App.tsx:124-126`: `rewrite_started` emits only inside `useEffect` when `state.step === 3 && checkinEventRef.current.step !== 3` — the Step 2 → Step 3 transition effect.
- Prior duplicate emit at Step 2 button click (old line ~194) is removed.

### Runtime evidence

- `test/App.test.tsx:58-76`: Blocked rewrite flow.
  - Event sequence includes `rewrite_started` exactly once.
  - `expect(countEvent("rewrite_started")).toBe(1)` — strict single-emission assertion.
- `test/App.test.tsx:197-218`: Normal rewrite flow (Step 2 → 3 → 4).
  - Event sequence: `..., "rewrite_started", "rewrite_saved", ...` — one `rewrite_started`, one `rewrite_saved`.
- `test/App.test.tsx:278-309`: Caution-save rewrite flow.
  - `expect(countEvent("rewrite_saved")).toBe(1)` — save counted once.

### Test result

```
✓ test/App.test.tsx (7 tests) 812ms
  ✓ renders the approved six-step flow from landing
  ✓ emits runtime events across the actual reopen flow
  ✓ drives the persisted reopened state through keep, edit, skip and vault interest paths
  ✓ stops the first session at schedule preview and reopens only after persisted return state
  ✓ blocks long free text from analytics payload preview
  ✓ shows the caution and blocked rewrite states
  ✓ persists locale and switches to English
```

Verdict: **PASS**. `rewrite_started` is single-emission by code (one useEffect) and runtime assertion (countEvent === 1).

---

## Checkpoint 2: caution-save preserves message_cautioned + rewrite_saved

### Approved contract

- `stages/10_UX_FINAL.md:95-104`: caution은 저장 가능, blocked는 저장 불가.
- `ai/plans/implementation-plan.md:107-129`: caution text remains saveable; blocked text does not.
- D-20260620-010: caution-save must emit both `message_cautioned` (safety classification) and `rewrite_saved` (successful save).

### Source evidence

- `src/App.tsx:111-114`: `message_cautioned` emitted via useEffect when safety classification is `"caution"`.
- `src/App.tsx:208-209`: Save button onClick emits `message_cautioned` (if caution) + `rewrite_saved`.
- Caution save button is **enabled** (`disabled={rewriteMessage.safety === "blocked"}`).
- Blocked save button is **disabled**.

### Runtime evidence

- `test/App.test.tsx:278-309`: Caution rewrite flow.
  1. Type "넌 왜 맨날 이러냐" → caution message appears, save button enabled.
  2. Type "죽어" → blocked message appears, save button disabled.
  3. Re-type "넌 왜 맨날 이러냐" → click save.
  4. `expectEventSequence("landing_viewed", ..., "rewrite_started", "message_cautioned", "rewrite_saved")`.
  5. `expect(countEvent("message_cautioned")).toBeGreaterThanOrEqual(1)`.
  6. `expect(countEvent("rewrite_saved")).toBe(1)`.

### Test result

`npm test` → 16/16 files, 53/53 tests passed. Caution/blocked test passes.

Verdict: **PASS**. Caution-save emits both `message_cautioned` and `rewrite_saved` separately; save outcome preserved.

---

## Checkpoint 3: blocked rewrite behavior (no regression)

### Approved contract

- `stages/10_UX_FINAL.md:95-104`: blocked text → 저장 버튼 비활성화.
- D-20260620-010: no regression of blocked rewrite behavior.

### Source evidence

- `src/App.tsx:108`: `message_blocked` emitted via useEffect when safety is `"blocked"`.
- `src/App.tsx:208`: Save button `disabled={rewriteMessage.safety === "blocked"}`.
- Rewrite screen shows blocked message (`i18n.t("rewrite.blocked")`).

### Runtime evidence

- `test/App.test.tsx:58-76`: Type "죽어" → `expect(screen.getByRole("button", { name: "저장하기" })).toBeDisabled()`.
- `test/App.test.tsx:278-309`: Type "죽어" → blocked message visible, save disabled.
  - Restore to caution text → save button re-enabled → save succeeds.

### Test result

Both blocked-rewrite assertion tests pass.

Verdict: **PASS**. Blocked rewrite disables save button, emits `message_blocked`, and does not leak `rewrite_saved` on blocked text.

---

## Checkpoint 4: D1 reopen / manual return flow

### Approved contract

- `stages/10_UX_FINAL.md:243-245`: 앱 재실행 시 마지막 상태 복원, check-in prompt 표시.
- `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed` emitted on D1 reopen.
- `vault_interest_handled` with `status: "dismissed"` payload on Result Screen dismiss.

### Source evidence

- `src/App.tsx:66-73`: On sessionPhase `"reopened"`, step restored to ≥5; reopenSource preserved.
- `src/App.tsx:127-133`: `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed` emitted on Step 5 + reopened.
- `src/App.tsx:121-123`: `vault_interest_viewed` emitted on Step 6 + reopened.
- `src/App.tsx:255`: Dismiss button emits `vault_interest_handled` with `status: "dismissed"`.

### Runtime evidence

- `test/App.test.tsx:79-195`: Persisted reopened state (manual, notification, unknown sources).
  - Screen 5 appears with check-in prompt (heading: "어제의 한 줄, 오늘도 맞나요?").
  - Keep → sequence includes `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `checkin_completed`, `message_kept`, `reopen_reason_tagged`, `vault_interest_viewed`.
  - Edit → `return_next_day`, `checkin_prompt_viewed`, `message_edited`.
  - Skip → dismiss button → `vault_interest_handled` with `expect(dismissEvent?.properties?.status).toBe("dismissed")`.
- `test/App.test.tsx:197-250`: First session stops at schedule preview; D1 reopen after localStorage restore shows Screen 5 (check-in).

### Test result

All 7 App.test.tsx tests pass, covering keep/edit/skip paths and vault interest dismiss payload.

Verdict: **PASS**. D1 reopen restores check-in state; manual/notification sources tracked; vault_interest_handled.status === "dismissed" confirmed.

---

## Checkpoint 5: excluded scope audit

### Excluded per D-20260620-011

- voice/TTS/audio, login, ads/IAP/payment/Toss points, backend, release/store submission, direct platform SDK, product expansion

### Source audit

| Scan | Result |
|------|--------|
| `rg 'rewrite_started' src/` | 1 match at App.tsx:125 (Step 2→3 effect only) |
| `rg '(fetch\|axios\|XMLHttpRequest\|sendBeacon\|@apps-in-toss)' src/` | 0 matches |
| `rg '(ttsPrompt\|voiceScript\|TtsAdapter\|VoicePlayback)' src/` | 0 matches in active flow |
| `rg '(login\|Login\|AuthAdapter\|getCurrentUser)' src/App.tsx` | 0 matches |
| `rg '(payment\|IAP\|AdMob\|TossPoints\|ads)' src/App.tsx` | 0 matches |
| Active flow imports only: `i18n`, `analyticsSanitizer`, `platform/adapters` | Pass |

Legacy TTS files (`src/core/ttsPrompt.ts`, `src/core/voiceScript.ts`) exist but are not imported by `src/App.tsx`.

### Test audit

- `test/App.test.tsx` mocks all platform adapters as stubs — no real network, auth, ads, or payment calls.
- No test exercises TTS/voice, login, ads, or payment flows.

Verdict: **PASS**. Excluded scope preserved.

---

## Final Verdict

**PASS**

All 4 approved rewrite/D1 analytics checkpoints verified with runtime test evidence and source audit. 16 test files / 53 tests pass. npm run build passes. No excluded-scope regression.

## Remaining risk / 미검증 영역

- Browser-served rendering (npm run build produces `dist/` — served smoke not run in Toss sandbox or live browser).
- Notification delivery remains preview-only by design (no real platform scheduling or backend).
- Legacy TTS/voice files remain in repo but outside active import graph.
- i18n English paths not covered by runtime test beyond locale switch rendering.

## knowledge_candidates

- maturity: confirmed
  summary: Rewrite analytics QA requires exact cardinality assertion (`countEvent === 1`) and caution-save outcome dual-event check (`message_cautioned` + `rewrite_saved` both present) — token presence alone insufficient.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/40_QA_FUNCTIONAL_MICRO1.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/

- maturity: confirmed
  summary: read-only functional QA for local-first apps can close D1/reopen analytics checkpoints via runtime test (vitest/Jest) before browser-served smoke; mock localStorage seeding reproduces persisted returned-user state.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/test/App.test.tsx (lines 79-195)
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/
