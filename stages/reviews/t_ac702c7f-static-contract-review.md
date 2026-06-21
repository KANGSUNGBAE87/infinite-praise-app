# t_ac702c7f Static Contract Review — 칭찬해줘

- Reviewer: dev-reviewer
- Date: 2026-06-20 KST
- Verdict: CHANGES_REQUIRED
- Scope reviewed: D-20260619-005 approved Development scope and D-20260619-006 remediation loop, static/code-contract verification only
- Runtime/browser QA: not in scope for this split card (`qa-functional` handles browser/manual QA)

## Reviewed inputs
- `01_DECISIONS.md`
- `stages/reviews/t_8e666782-development-review.md`
- `stages/10_UX_FINAL.md`
- `stages/20_ARCH_FINAL.md`
- `stages/30_BUILD_REPORT.md`
- `ai/plans/implementation-plan.md`
- parent builder handoff on kanban task `t_ac702c7f`
- `/Users/kangsungbae/Documents/지식저장소/AI_CONTEXT.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/index.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/profile.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/operating-rules.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-platform.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md`
- `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/platform.md`

## Read-only baseline / fingerprint
- HEAD: `03ebb0d889c0c6b1658044d3c17891094faab401`
- Pre-review tracked status: `ai/session-logs/README.md` modified; large untracked project tree already existed.
- Pre-review fingerprint: `ead3f6c6ca180a3b080f30be503f38250e3dc1ce818ee486a789546d6b274d63`
- Post-verification fingerprint: `ead3f6c6ca180a3b080f30be503f38250e3dc1ce818ee486a789546d6b274d63`
- Result: review commands did not introduce additional tracked diff.

## Commands / checks run
1. `graphify query '6-screen praise check-in flow App.tsx analytics sanitizer platform adapters locale routing D1 gating'`
2. `npm test`
   - Result: 16 files passed, 51 tests passed
3. `npm run build`
   - Result: production build passed; `dist/assets/index-D3Cq9AIO.js` generated
4. Static searches
   - `src/` direct platform SDK import / transport scan: no direct Apps in Toss SDK, AdMob, Billing, `fetch`, `axios`, `XMLHttpRequest`, `sendBeacon`, or `console` analytics transport found in active `src/`
   - `dist/` marker scan: no `tts`, `voice`, `ElevenLabs`, `Kore`, `gemini-2.5-flash-preview-tts` markers found in built bundle

## What passed
- `npm test` and `npm run build` both pass.
- Active source still keeps platform dependencies behind stub adapters; no direct Toss/Google SDK import was found in the product flow.
- No real network analytics transport was wired in the active `src/` path.
- Built bundle scan did not show TTS/voice provider markers.
- Preview fallback and reopen labels were moved into `src/i18n.ts`, so the specific raw `manual/notification/memory` UI leak from the previous review is no longer visible as untranslated English tokens.

## Blocking findings

### 1) D1 gating no longer leaks same-session, but the approved reopen path is still not implemented or tested
Severity: High

Evidence:
- `src/App.tsx:45-65` loads saved state as-is; there is no mount-time derivation that converts a persisted return state into Step 5.
- `src/App.tsx:176` keeps the app at `step: 4` with `sessionPhase: "initial"` after schedule save.
- `src/App.tsx:185-216` renders Step 5/6 only when both `(state.step === 5 || 6)` and `sessionPhase === "reopened"` are true.
- No source path sets `step: 5` when a reopened session is restored. The only explicit step transitions near the D1 flow are `step: 6` from the Step 5 buttons (`src/App.tsx:197,199`) or back to Step 3 for edit (`src/App.tsx:198`).
- The new regression test does not prove reopen behavior. `test/App.test.tsx:39-64` seeds `sessionPhase: "reopened"` but keeps `step: 4`, then asserts Step 5 is still absent.
- `stages/30_BUILD_REPORT.md:13-15,32` claims Check-in/Result appear after a persisted reopened session state, but the source and test evidence above do not demonstrate a reachable reopened Step 5 path.

Why this fails the approved contract:
- `stages/10_UX_FINAL.md:126-167` and `stages/20_ARCH_FINAL.md:289-298,467-469` require an explicit D1/manual-return flow where Step 5 and Step 6 are reachable after reopen/day-boundary state, not merely hidden during the first session.
- The previous blocker was “same-session exposure”; the remediation replaced it with “reopen path unreachable / unverified.” That is still outside D-20260619-005.

Minimum fix:
- Restore an explicit persisted return marker that re-enters Step 5 on reload/manual return/day-boundary.
- Add a positive regression that proves a reopened session renders Step 5, can advance to Step 6, and keeps fake-door hidden on first session only.
- Remove or correct the build-report claim until the reopened path is actually reachable.

### 2) Analytics/privacy contract and approved event schema still drift from the accepted spec
Severity: High

Evidence:
- `src/core/analyticsSanitizer.ts:12-25` redacts arbitrary strings to `"[redacted]"`, but it does not remove forbidden free-text fields.
- `src/App.tsx:92-98` still constructs a preview payload with `praise` and `freeText` keys. That means the payload shape still carries free-text field names instead of a closed enum/count/category schema.
- `stages/20_ARCH_FINAL.md:244-247` explicitly says user-entered free-text fields should be removed before the adapter receives the payload.
- Event emission remains materially incomplete/wrong. `src/App.tsx` only emits:
  `landing_viewed`, `schedule_started`, `praise_selected`, `message_kept`, `message_skipped_today`, `reminder_created`, `preview_viewed`, `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `vault_interest_viewed`, `vault_interest_clicked`, `vault_interest_handled`.
- Approved events from `stages/10_UX_FINAL.md:249-271` / `stages/20_ARCH_FINAL.md:249-270` that are still missing or miswired in active source include:
  - missing: `target_confirmed`, `target_rejected`, `rewrite_started`, `rewrite_saved`, `message_cautioned`, `message_blocked`, `checkin_completed`, `reopen_reason_tagged`, `message_edited`
  - miswired: landing confirm currently emits `schedule_started` (`src/App.tsx:133`), landing reject emits `preview_viewed` (`src/App.tsx:134`), rewrite save emits `message_kept` (`src/App.tsx:163`), rewrite keep-original emits `message_skipped_today` (`src/App.tsx:164`), skip button emits `checkin_prompt_viewed` instead of a completed outcome (`src/App.tsx:199`)
- Reopen source schema still drifts from approved `notification | manual | unknown`. Active code uses `"manual" | "notification" | "memory"` in `src/App.tsx:20` and `src/i18n.ts:45-47,108-110`.

Why this fails the approved contract:
- D-20260619-005 approved “free-text analytics block” and trusted event verification. A payload with surviving free-text-shaped keys and missing/misnamed events does not satisfy the closed-schema requirement.
- The development gate explicitly treats approved-event mismatches as CHANGES_REQUIRED even when tests/build are green.

Minimum fix:
- Change the sanitizer contract from “redact value” to “drop disallowed key entirely” for free-text-shaped properties.
- Emit the approved events at the approved interaction points, including explicit `target_*`, `rewrite_*`, `message_cautioned|blocked`, `checkin_completed`, and `reopen_reason_tagged` markers.
- Replace `memory` with the approved `unknown` source token and add source-contract assertions in tests.

### 3) Rewrite safety semantics are still reversed, and the tests currently bless the wrong behavior
Severity: Medium

Evidence:
- `ai/plans/implementation-plan.md:113-128` and `stages/10_UX_FINAL.md:95-105` require self-blame/shaming examples to be `caution`, while self-harm/violence/medical-diagnosis style text must be `blocked`.
- Active code does the opposite: `src/App.tsx:35-36` places `죽어`, `자해`, `진단`, `치료`, `한심` in `cautionKeywords`, while `왜 맨날`, `넌 왜` are the only `blockedKeywords`.
- Because `rewriteMessage` blocks only when `blockedKeywords` match (`src/App.tsx:88-90,163`), `죽어` remains saveable while caution copy is shown.
- The regression test now codifies that incorrect behavior: `test/App.test.tsx:92-107` expects `한심해` to show caution, then expects `죽어` to show the same caution copy and leave `저장하기` enabled.
- There are still no `message_cautioned` / `message_blocked` emissions in active source, so the safety decision is neither measured nor protected by schema tests.

Why this fails the approved contract:
- The remediation acceptance explicitly called out `한심해`-style self-blame as caution, not blocked self-harm/violence text. The current rule set still does not separate those categories correctly.

Minimum fix:
- Move self-harm/violence/medical-diagnosis phrases into the blocked path and keep self-blame/shaming in caution.
- Add tests that prove `한심해` is saveable-with-caution and `죽어` is blocked-and-unsaveable.
- Emit `message_cautioned` / `message_blocked` consistently so the safety branch is observable.

## Final verdict
CHANGES_REQUIRED.

Static platform/bundle checks and green CI are real, but the remediation did not close the approved contract. Same-session D1 leakage is gone, yet the reopened D1 path is still unreachable/unproven; analytics still retain forbidden free-text-shaped keys and a drifted event/source schema; and rewrite safety still classifies self-harm language as caution instead of blocked.

## knowledge_candidates
- maturity: confirmed
  summary: For D1-gated local-first flows, a regression must prove the positive reopened path (Step 5/6 visible after persisted return) rather than only asserting those screens are absent in the first session.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_ac702c7f-static-contract-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/
- maturity: confirmed
  summary: If analytics payloads are contract-limited to enums/booleans/counts/coarse categories, redacting free-text values to placeholders is insufficient; the text-shaped keys themselves must be removed.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_ac702c7f-static-contract-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md
