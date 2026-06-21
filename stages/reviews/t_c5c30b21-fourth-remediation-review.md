# t_c5c30b21 Fourth Remediation Review — 칭찬해줘

- Reviewer: dev-reviewer
- Date: 2026-06-20 KST
- Verdict: CHANGES_REQUIRED
- Approved: false
- Scope reviewed: D-20260620-004 fourth narrow remediation only (`approved Step 4/5/6 analytics semantics + runtime proof`, `rewrite safety classification`, `preserved exclusions`)

## Reviewed inputs
- `01_DECISIONS.md` (`D-20260619-005` through `D-20260620-004`)
- `stages/10_UX_FINAL.md`
- `stages/20_ARCH_FINAL.md`
- `ai/plans/implementation-plan.md`
- `stages/30_BUILD_REPORT.md`
- `stages/reviews/t_8aa6fd28-third-remediation-review.md`
- parent builder handoff `t_da8c84a9`
- `/Users/kangsungbae/Documents/지식저장소/AI_CONTEXT.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/index.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/profile.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/operating-rules.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/workflows/app-platform-standard.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-platform.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/testing/index.md`
- `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/platform.md`
- project `AGENTS.md`

## Read-only baseline / fingerprint
- HEAD: `03ebb0d889c0c6b1658044d3c17891094faab401`
- Pre-review tracked status: only `ai/session-logs/README.md` was tracked-modified; the rest of the workspace already sat in a large untracked tree.
- Pre-review tracked fingerprint: `6d265c8823b17f11dbb1327c9e32cd39095fdd9f56b24c1f5df4ee812be45ba8`
- Post-verification fingerprint before writing this report: `6d265c8823b17f11dbb1327c9e32cd39095fdd9f56b24c1f5df4ee812be45ba8`
- Result: review commands did not introduce additional tracked diff before artifact writing.

## Commands / checks run
1. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && graphify query '칭찬해줘 fourth remediation approved analytics events App.tsx checkin safety vault interest'`
   - Result: low-signal traversal around `src/App.tsx`; useful only as a navigation aid, not as verdict evidence.
2. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && git rev-parse HEAD && git status --short && git status --porcelain=v1 | shasum -a 256`
   - Result: HEAD `03ebb0d889c0c6b1658044d3c17891094faab401`; tracked fingerprint `6d265c8823b17f11dbb1327c9e32cd39095fdd9f56b24c1f5df4ee812be45ba8` before and after verification.
3. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && npm test`
   - Result: `16` test files passed, `53` tests passed.
4. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && npm run build`
   - Result: `tsc --noEmit && vite build` passed; emitted `dist/assets/index-GuSeF0LX.js`.
5. Targeted token scan across `src/` and `test/`
   - `src/` contains runtime matches for `schedule_started`, `preview_viewed`, `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `checkin_completed`, `reopen_reason_tagged`, `message_kept`, `message_edited`, `message_skipped_today`, `vault_interest_viewed`, `vault_interest_clicked`, and `vault_interest_handled`.
   - `test/App.test.tsx` contains reopen-flow token-presence assertions for keep/edit/skip, but a targeted scan returned zero matches there for `schedule_started`, `preview_viewed`, and `dismissed`.
6. Targeted exclusion scans under `src/`
   - No `fetch(`/`axios`/`WebSocket` matches in active source.
   - No direct `@apps-in-toss` SDK import matches in active product/domain entrypoints.
   - Platform/payment/ads identifiers remain in `src/platform/adapters.ts` as stubs only.
   - Legacy TTS code remains in `src/core/ttsPrompt.ts`, but `src/App.tsx` does not import it.

## What passed
- `npm test` and `npm run build` both pass.
- The Screen 3 initial-save bug is fixed: `message_kept` no longer fires from the rewrite screen. The only runtime `message_kept` emit site is the reopened keep action in `src/App.tsx:242`.
- Persisted reopened state is still positively restored into Step 5: `src/App.tsx:66-68` promotes a reopened saved state into the check-in screen, and `test/App.test.tsx:169-212` proves first-session flow stops at Screen 4 while reopened persisted state lands on Screen 5 and can advance to Screen 6.
- `vault_interest_viewed` is now tied to actual result-slot visibility rather than dismiss click only: `src/App.tsx:117-119` fires it when reopened users reach Step 6.
- Preserved exclusions still hold on the active product path reviewed here: no active voice/TTS/audio, no AI/counseling, no login activation, no ads/IAP/payment/Toss points activation, no backend or real notification delivery, no release/store submission logic, and no direct Apps in Toss / Google Play SDK imports in active product/domain logic.

## Findings

### 1) The approved safety split is still wrong for the explicit self-blame example: `넌 왜 맨날 이러냐` remains blocked-unsaveable instead of caution-saveable
Severity: High

Evidence:
- `ai/plans/implementation-plan.md:113-124` defines self-blame/shaming as `caution` and self-harm/violence/diagnosis/treatment as `blocked`.
- `stages/10_UX_FINAL.md:95-104` requires `message_cautioned` and `message_blocked` as separate rewrite outcomes.
- `src/App.tsx:35-36` still sets `blockedKeywords = ["죽어", "자해", "폭력", "진단", "치료", "왜 맨날", "넌 왜"]`, so the approved self-blame family is still classified as blocked.
- `test/App.test.tsx:240-257` only proves `한심해` => caution and `죽어` => blocked. There is no runtime regression for the required `넌 왜 맨날 이러냐` caution-saveable branch.
- The testing guidance explicitly requires one self-blame example and one self-harm example to stay under test (`/Users/kangsungbae/Documents/지식저장소/docs/testing/index.md:18-20`).

Why this fails acceptance:
- Acceptance item 7 explicitly names `넌 왜 맨날 이러냐` as caution-saveable and `죽어` as blocked-unsaveable. Current code still blocks the former.

Minimum fix:
- Remove `왜 맨날` / `넌 왜` from the blocked bucket and place them in the caution-saveable branch (or replace the keyword split with a rule that preserves the approved category split).
- Add a runtime regression in `test/App.test.tsx` that uses a `넌 왜 맨날 이러냐`-style input, verifies caution copy, and confirms `저장하기` remains enabled while `죽어` stays blocked.

### 2) Step 4/5/6 remediation still lacks approved runtime proof: sequence is not asserted, schedule/preview are untested, and the dismiss branch is still uncovered
Severity: High

Evidence:
- `stages/10_UX_FINAL.md:115-118,136-142,159-162` and `stages/20_ARCH_FINAL.md:249-299` require the Step 4/5/6 event contract: `schedule_started -> reminder_created -> preview_viewed -> return_next_day/return_next_day_manual -> checkin_prompt_viewed -> checkin_completed -> message_* -> reopen_reason_tagged -> vault_interest_*`.
- `src/App.tsx:123-126` emits `schedule_started` and `preview_viewed` immediately on entering Step 4, while the preview card is rendered unconditionally in `src/App.tsx:222-226`; this does not prove the approved "save then preview" semantics from `stages/10_UX_FINAL.md:106-124`.
- `test/App.test.tsx:92-166` drives persisted reopened keep/edit/skip through live interactions, but every event assertion uses `expect.arrayContaining(...)`, so the test only checks presence and does not assert the emitted token sequence required by acceptance item 3.
- A targeted scan of `test/App.test.tsx` returned zero matches for `schedule_started`, `preview_viewed`, and `dismissed`, so there is still no runtime test proof for Step 4 schedule/preview tokens or the dismiss branch of `vault_interest_handled`.
- `test/App.test.tsx:162-166` covers the register path only; there is still no dismiss-path coverage even though acceptance item 5 asks for register/dismiss adequacy.
- The Apps in Toss development gate explicitly treats missing approved token/runtime proof as Development `CHANGES_REQUIRED` even when CI is green (`/Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md:81-89`).

Why this fails acceptance:
- Acceptance items 3, 5, and 6 require runtime proof of the persisted reopened keep/edit/skip flow, token sequence assertions from live interactions, adequate register/dismiss coverage, and approved schedule/preview handling. This remediation now has partial token presence, but not the required proof shape.

Minimum fix:
- Add runtime assertions that check the exact ordered event sequence for keep/edit/skip, not just presence via `arrayContaining`.
- Add Step 4 runtime coverage for `schedule_started` and `preview_viewed`, and either align them to the approved save→preview semantics or explicitly block on an approved artifact conflict instead of silently drifting.
- Add dismiss-path coverage that verifies `vault_interest_handled` carries the `dismissed` branch from live interaction.

### 3) `stages/30_BUILD_REPORT.md` still overclaims closure and reports stale verification numbers
Severity: Medium

Evidence:
- `stages/30_BUILD_REPORT.md:13-15` says the remaining analytics/safety blockers are closed and claims runtime regressions now verify the approved live interaction contract.
- `stages/30_BUILD_REPORT.md:27-28` reports `52` tests passed, but the actual `npm test` run in this review returned `53` passed tests.
- Findings 1 and 2 above still contradict the build report's closure claim.

Why this matters:
- CEO gate input is supposed to rely on exact evidence. A stale/overstated build report can incorrectly signal that the approved blockers are closed when they are not.

Minimum fix:
- After the code/test fixes above, refresh `stages/30_BUILD_REPORT.md` with exact command output and only the blockers that are truly closed.

## Exclusions preserved
Preserved for the active remediation path reviewed here:
- no voice/TTS/audio activation in the active product entrypoint
- no AI/counseling flow
- no login activation
- no ads/IAP/payment/Toss points activation
- no backend or real notification delivery
- no release/store submission logic
- no direct Apps in Toss / Google Play SDK imports in active product/domain logic

Residual note:
- Legacy TTS-related code and tests still exist in the repository, but the active app path does not import them.
- Planned auth/payment/ads identifiers remain in `src/platform/adapters.ts`; those literals are adapter stubs, not direct SDK integrations by themselves.

## Final verdict
CHANGES_REQUIRED.

This fourth remediation did close two prior gaps: Screen 3 no longer emits `message_kept`, and the reopened result-slot visibility now emits `vault_interest_viewed` from the actual Step 6 screen. But the approved safety contract still fails the explicit `넌 왜 맨날 이러냐` caution-saveable case, and the Step 4/5/6 runtime proof is still incomplete because the tests do not assert ordered live-interaction sequences and still omit schedule/preview plus dismiss coverage. Green `npm test` / `npm run build` are real, but they do not close those remaining approved-scope blockers.

## Metadata
- artifact: `/Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_c5c30b21-fourth-remediation-review.md`
- head: `03ebb0d889c0c6b1658044d3c17891094faab401`
- tests:
  - `npm test` -> `16` files / `53` tests passed
  - `npm run build` -> passed
- diff_fingerprint: `6d265c8823b17f11dbb1327c9e32cd39095fdd9f56b24c1f5df4ee812be45ba8`

## knowledge_candidates
- maturity: confirmed
  summary: For approved analytics-contract remediations, runtime tests must assert ordered live-interaction event sequences; `arrayContaining` only proves token presence and can miss wrong order or missing branch coverage.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_c5c30b21-fourth-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/index.md
- maturity: confirmed
  summary: Safety regression closure for emotion/self-regulation apps needs an explicit caution-saveable self-blame phrase example and an explicit blocked self-harm phrase example in runtime tests, not only category-adjacent keywords.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_c5c30b21-fourth-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/index.md
- maturity: confirmed
  summary: If a build report claims approved blockers are closed, it must match the exact current test counts and the actual reviewer-verified contract state; stale green numbers are themselves a gate risk.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_c5c30b21-fourth-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md
