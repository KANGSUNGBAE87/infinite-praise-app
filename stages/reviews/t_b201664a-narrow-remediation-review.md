# t_b201664a Narrow Remediation Review — 칭찬해줘

- Reviewer: dev-reviewer
- Date: 2026-06-20 KST
- Verdict: CHANGES_REQUIRED
- Approved: false
- Scope reviewed: D-20260620-001 narrow remediation only (`D1 reopen path`, `analytics/event/source schema`, `safety rewrite classification/tests`)

## Reviewed inputs
- `00_PROJECT_BRIEF.md`
- `01_DECISIONS.md` (`D-20260619-005`, `D-20260619-006`, `D-20260620-001`)
- `ai/plans/product-plan.md`
- `ai/plans/implementation-plan.md`
- `stages/10_UX_FINAL.md`
- `stages/20_ARCH_FINAL.md`
- `stages/reviews/t_8e666782-development-review.md`
- `stages/reviews/t_ac702c7f-static-contract-review.md`
- `stages/30_BUILD_REPORT.md`
- `ai/session-logs/2026-06-20-a3-narrow-remediation.md`
- parent builder handoff `t_b201664a`
- `/Users/kangsungbae/Documents/지식저장소/AI_CONTEXT.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/index.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/profile.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/operating-rules.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/workflows/app-platform-standard.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-platform.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md`
- `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/platform.md`

## Read-only baseline / fingerprint
- HEAD: `03ebb0d889c0c6b1658044d3c17891094faab401`
- Pre-review tracked status: `ai/session-logs/README.md` modified; large untracked tree already existed.
- Pre-review fingerprint: `14e2c7cc20bed735be4b6f13d850ffbe1c31320d5ab6e8dc974d4fecd058dbb0`
- Post-verification fingerprint before writing this report: `14e2c7cc20bed735be4b6f13d850ffbe1c31320d5ab6e8dc974d4fecd058dbb0`
- Result: review commands did not introduce additional tracked diff before artifact writing.

## Commands / checks run
1. `graphify query '칭찬해줘 D1 reopen analytics sanitizer event schema safety rewrite test App.tsx'`
2. `npm test`
   - Result: 16 files passed, 51 tests passed
3. `npm run build`
   - Result: TypeScript + Vite production build passed; `dist/assets/index-D3Cq9AIO.js` generated
4. Static searches
   - active `src/` direct SDK / transport scan: no direct Apps in Toss SDK, Google Play Billing, AdMob, Google Sign-In, `fetch`, `axios`, `XMLHttpRequest`, or `sendBeacon` markers found
   - active app import scan: no imports from legacy `src/core/ttsPrompt` / `src/core/voiceScript`
   - built bundle exact marker scan: no `gemini-2.5-flash-preview-tts`, `Kore`, or `ElevenLabs` markers found in `dist/`

## What passed
- `npm test` and `npm run build` both pass.
- The active product flow still avoids direct platform SDK imports and real analytics transport.
- Bundle verification did not show legacy TTS provider markers, so the excluded voice/TTS path was not reintroduced into the shipped bundle.
- No evidence was found of login, ads/IAP/payment/Toss points, backend transport, or release/store submission logic entering the active remediation path.

## Findings

### 1) D1 same-session leak is gone, but the approved reopened Step 5 path is still unreachable and unproven
Severity: High

Evidence:
- `src/App.tsx:45-64` restores saved state as-is; there is still no mount-time derivation that turns a persisted reopened session into `step: 5`.
- `src/App.tsx:176` saves the flow at `step: 4` with `sessionPhase: "initial"` after schedule save.
- `src/App.tsx:185-216` renders Screen 5/6 only when both `step === 5|6` and `sessionPhase === "reopened"` are true.
- No runtime path in `src/App.tsx` promotes a reopened saved state from `step: 4` into `step: 5`.
- `test/App.test.tsx:24-64` seeds `sessionPhase: "reopened"` while keeping `step: 4`, then asserts Screen 5 is still absent. That proves the negative first-session gate, not the positive reopened path required by UX/Architecture.
- `stages/30_BUILD_REPORT.md:13-15` claims check-in/result surfaces appear when a persisted reopened session exists, but the current source/test evidence does not show a reachable reopened Screen 5 state.

Why this still fails D-20260620-001:
- `stages/10_UX_FINAL.md:126-141,185-188,297-299` requires next-day/manual return with `notification | manual | unknown` re-entry and a visible Screen 5 check-in path.
- `stages/20_ARCH_FINAL.md:249-299` requires the reopened return flow to emit prompt/completion/reason events after an actual next-day return state, not just hide same-session leakage.

Minimum fix:
- Add explicit reopen restoration logic that promotes an approved persisted return state into `step: 5`.
- Add a positive regression test proving Screen 5 renders after persisted reopen, advances to Screen 6, and remains hidden in the first session.
- Remove or correct the build-report claim until the positive reopened path is actually reachable.

### 2) Analytics/privacy contract, event schema, and reopen source token still drift from the accepted spec
Severity: High

Evidence:
- `src/core/analyticsSanitizer.ts:12-25` still redacts disallowed string values to `"[redacted]"`; it does not drop forbidden free-text-shaped keys.
- `src/App.tsx:92-98` still constructs a preview payload with `praise` and `freeText` keys, so the closed-schema contract is still violated even if values are redacted.
- `test/analyticsSanitizer.test.ts:5-24` blesses this wrong contract by expecting `praise` and `rewrite` keys to survive as `"[redacted]"` rather than disappear.
- `src/App.tsx` still mis-emits or omits approved events. Current active events include `landing_viewed`, `schedule_started`, `praise_selected`, `message_kept`, `message_skipped_today`, `reminder_created`, `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `vault_interest_viewed`, `vault_interest_clicked`, `vault_interest_handled`.
- Approved events still missing or miswired versus `stages/10_UX_FINAL.md:95-99,135-162,249-271` and `stages/20_ARCH_FINAL.md:249-270`: `target_confirmed`, `target_rejected`, `rewrite_started`, `rewrite_saved`, `message_cautioned`, `message_blocked`, `checkin_completed`, `reopen_reason_tagged`, `message_edited`.
- Specific miswirings remain in `src/App.tsx`: landing confirm emits `schedule_started` (`133`), landing reject emits `preview_viewed` (`134`), rewrite save emits `message_kept` (`163`), rewrite keep-original emits `message_skipped_today` (`164`), and skip emits `checkin_prompt_viewed` instead of a completed outcome (`199`).
- `src/App.tsx:20` and `src/i18n.ts:45-47,108-110` still use reopen source `memory`, while approved UX data is `notification | manual | unknown`.

Why this still fails D-20260620-001:
- `stages/20_ARCH_FINAL.md:244-247` says user-entered free text must never be included in analytics payloads and recommends removing free-text fields before the adapter receives them.
- `docs/workflows/apps-in-toss-development-gate.md:81-88` treats approved-event mismatches and missing actual emit sites as Development `CHANGES_REQUIRED` even when tests/build are green.

Minimum fix:
- Change the sanitizer contract to drop disallowed text-shaped keys entirely.
- Replace `memory` with approved `unknown` source token.
- Wire the approved event names at the approved interactions and add tests that fail if forbidden keys or unapproved source tokens remain.

### 3) Rewrite safety classification is still reversed, and the tests still approve the reversed behavior
Severity: Medium

Evidence:
- `ai/plans/implementation-plan.md:113-128` and `stages/10_UX_FINAL.md:95-105` require self-blame/shaming examples to be `caution`, while self-harm/violence/diagnosis/treatment language must be `blocked`.
- `src/App.tsx:35-36` still places `죽어`, `자해`, `진단`, `치료`, `한심` in `cautionKeywords`, while `blockedKeywords` only contains `왜 맨날`, `넌 왜`.
- Because blocked copy is shown only when `blockedKeywords` match (`src/App.tsx:88-90`), self-harm language still lands in the saveable caution path.
- `test/App.test.tsx:92-107` still expects `죽어` to show caution copy and keeps `저장하기` enabled.
- No `message_cautioned` / `message_blocked` event emissions exist in active source, so the safety branch is neither observable nor schema-protected.

Why this still fails D-20260620-001:
- The narrow remediation acceptance explicitly called out rewrite safety classification/tests as one of the only three permitted blocker themes.
- Current code and tests still encode the reversed classification instead of proving the approved split.

Minimum fix:
- Move self-harm/violence/diagnosis/treatment phrases into the blocked branch and keep self-blame/shaming in caution.
- Add tests proving `한심해` is saveable-with-caution and `죽어` is blocked-and-unsaveable.
- Emit `message_cautioned` / `message_blocked` consistently so the safety contract is measurable.

## Exclusions preserved
Preserved for the active remediation path:
- no voice/TTS/audio import in active app flow
- no AI/counseling flow in active app flow
- no login
- no ads/IAP/payment/Toss points
- no backend transport
- no release/store submission logic
- no direct platform SDK imports in active product flow
- no unrelated UI/product expansion beyond the existing 6-screen shell evidence reviewed here

Residual note:
- Legacy voice/TTS files, tests, and package scripts still exist in the repository (`src/core/ttsPrompt.ts`, `src/core/voiceScript.ts`, `test/ttsPrompt.test.ts`, `test/voiceScript.test.ts`, `package.json` `tts:*` scripts), but they are not imported into the active app flow and their provider markers do not appear in the built bundle.

## Final verdict
CHANGES_REQUIRED.

`npm test` and `npm run build` pass, but the narrow remediation did not close the three approved blockers. The first-session leak was removed, yet the positive reopened Screen 5 path is still unreachable/unproven; analytics still preserve forbidden text-shaped keys plus drifted event/source schema; and rewrite safety/tests still classify self-harm language as caution instead of blocked.

## Metadata
- artifact: `/Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_b201664a-narrow-remediation-review.md`
- head: `03ebb0d889c0c6b1658044d3c17891094faab401`
- tests:
  - `npm test` → 16 files / 51 tests passed
  - `npm run build` → passed
- diff_fingerprint: `14e2c7cc20bed735be4b6f13d850ffbe1c31320d5ab6e8dc974d4fecd058dbb0`

## knowledge_candidates
- maturity: confirmed
  summary: For D1-gated local-first flows, remediation is not closed until a regression proves the positive reopened state transition into the next screen; a negative first-session assertion alone is insufficient.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_b201664a-narrow-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/
- maturity: confirmed
  summary: If analytics contracts are limited to enums/booleans/counts/coarse categories, tests must fail on the presence of forbidden free-text-shaped keys themselves, not only on raw string values.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_b201664a-narrow-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md
