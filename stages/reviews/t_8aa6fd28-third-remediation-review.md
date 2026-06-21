# t_8aa6fd28 Third Remediation Review — 칭찬해줘

- Reviewer: dev-reviewer
- Date: 2026-06-20 KST
- Verdict: CHANGES_REQUIRED
- Approved: false
- Scope reviewed: D-20260620-003 third narrow remediation only (`approved runtime/test analytics tokens`, `Step 5 keep/edit/skip outcome wiring`, `rewrite safety classification`, `preserved exclusions`)

## Reviewed inputs
- `01_DECISIONS.md` (`D-20260619-005` through `D-20260620-003`)
- `stages/10_UX_FINAL.md`
- `stages/20_ARCH_FINAL.md`
- `ai/plans/implementation-plan.md`
- `stages/30_BUILD_REPORT.md`
- `stages/reviews/t_93fd25aa-remediation-review.md`
- parent builder handoff `t_ee570de0`
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
- Pre-review tracked status: only `ai/session-logs/README.md` was tracked-modified; the rest of the repo already sat in a large untracked tree.
- Pre-review tracked fingerprint: `b23741592828817629f2c64e16e6ea51ee7d8ae0f3078ff59722e48cfe9f12fd`
- Post-verification fingerprint before writing this report: `b23741592828817629f2c64e16e6ea51ee7d8ae0f3078ff59722e48cfe9f12fd`
- Result: review commands did not introduce any additional tracked diff before artifact writing.

## Commands / checks run
1. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && graphify query '칭찬해줘 approved analytics events rewrite safety checkin fake-door App.tsx tests'`
   - Result: low-signal graph traversal around `src/App.tsx`; useful for confirming the active screen shell still centers on `App.tsx`, but not sufficient for verdict without direct source/test inspection.
2. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && npm test`
   - Result: 16 files passed, 52 tests passed.
3. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && npm run build`
   - Result: TypeScript check + Vite production build passed; `dist/assets/index-qucq5CO3.js` generated.
4. Targeted static scans of approved analytics tokens in `src/**/*.ts*` and `test/**/*.ts*`
   - `src/` now contains runtime matches for `rewrite_started`, `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `message_blocked`, `message_kept`, `message_edited`, `message_skipped_today`, `vault_interest_viewed`, `vault_interest_clicked`, and `vault_interest_handled` inside `src/App.tsx`.
   - `test/` still has zero matches for `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `checkin_completed`, `reopen_reason_tagged`, `message_edited`, `message_skipped_today`, `vault_interest_viewed`, `vault_interest_clicked`, and `vault_interest_handled`.
   - `test/analyticsSanitizer.test.ts` mentions `message_kept`, but only as a helper payload key, not as runtime wiring proof.
   - `schedule_started` and `preview_viewed` remain zero-match in both `src/` and `test/`.
5. Targeted exclusion scans
   - `src/**/*.tsx` import scan returned zero direct imports for `@apps-in-toss`, Google login/billing, AdMob, `ttsPrompt`, or `voiceScript` in the active UI/product entrypoints.
   - Plain `apps_in_toss`, `google_play_billing`, and `admob` strings still exist in `src/platform/adapters.ts`, but only as stub/planned identifiers.
   - `src/core/ttsPrompt.ts` still exists and still contains `gemini-2.5-flash-preview-tts` / `Kore`, but it is not imported by `src/App.tsx`.

## What passed
- `npm test` and `npm run build` both pass.
- The reopened Step 5 entry is still positively restored: `src/App.tsx:66-68` promotes a persisted reopened state into Step 5, and `test/App.test.tsx:66-109` proves the first session stops at Step 4 while a persisted reopened state renders the check-in screen and advances to Screen 6.
- The analytics sanitizer still drops forbidden text-shaped keys instead of redacting them in place. `src/core/analyticsSanitizer.ts:1-34` and `test/analyticsSanitizer.test.ts:5-24` both preserve that contract.
- The active product flow still avoids direct Apps in Toss / Google Play SDK imports, real backend wiring, real notification delivery, login activation, ads/IAP/payment activation, and voice/TTS/audio activation.

## Changed-file review
- `src/App.tsx`
  - Good: added the previously missing runtime emit sites for several approved tokens and now blocks obvious self-harm terms like `죽어` at runtime.
  - Remaining problem: several approved events still have wrong semantics or missing partner events, and the self-blame/shaming split is only partially corrected.
- `test/App.test.tsx`
  - Good: now contains a real blocked-path runtime regression and a positive reopened-state render regression.
  - Remaining problem: it still does not exercise the Step 5/6 event family (`return_next_day*`, `checkin_*`, `reopen_reason_tagged`, `vault_interest_*`) or the self-blame phrase example that was explicitly called out in the approved safety contract.
- `stages/30_BUILD_REPORT.md`
  - Remaining problem: it overstates closure by claiming the approved analytics/safety blockers are closed even though the runtime/test contract gaps below remain.

## Findings

### 1) The approved event contract is still not closed: Step 5/6 semantics drift, and `test/` still lacks runtime proof for the reopened flow tokens
Severity: High

Evidence:
- `stages/10_UX_FINAL.md:135-162,249-271` requires the approved Step 5/6 chain: `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `checkin_completed`, `reopen_reason_tagged`, `message_kept | message_edited | message_skipped_today`, `vault_interest_viewed`, `vault_interest_clicked`, and `vault_interest_handled`.
- `stages/20_ARCH_FINAL.md:249-299` requires a closed event schema and explicitly sequences `next_day_return -> checkin_prompt_viewed -> checkin_completed -> message_kept|message_edited|message_skipped_today -> reopen_reason_tagged -> vault_interest_*`.
- Project-wide test scan returned zero matches for `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `checkin_completed`, `reopen_reason_tagged`, `message_edited`, `message_skipped_today`, `vault_interest_viewed`, `vault_interest_clicked`, and `vault_interest_handled`, so the reopened-flow tokens still do not exist in `test/` as required by this task.
- `src/App.tsx:200` emits `message_kept` from Screen 3 `이대로 저장`, even though `message_kept` is an approved next-day check-in outcome token, not an initial rewrite-screen token.
- `src/App.tsx:233` emits `checkin_completed` and `message_kept` for the keep path, but never emits `reopen_reason_tagged`.
- `src/App.tsx:234` emits `message_edited` and `reopen_reason_tagged` for the edit path, but never emits `checkin_completed`.
- `src/App.tsx:246-247` only emits `vault_interest_viewed` when the dismiss button is clicked; the register path emits `vault_interest_clicked` + `vault_interest_handled` without any `vault_interest_viewed`, so the view event is still not tied to actual slot visibility.
- `src/App.tsx:212` still emits `reminder_created` only; `schedule_started` and `preview_viewed` remain absent from both `src/` and `test/`, which leaves the approved schedule/preview event list incomplete.
- `stages/30_BUILD_REPORT.md:13-15` claims the remaining approved analytics blockers are closed, but the runtime/test evidence above still contradicts that claim.
- The Apps in Toss development gate explicitly treats missing approved event emit sites or test proof as Development `CHANGES_REQUIRED`, even when CI is green (`docs/workflows/apps-in-toss-development-gate.md:81-89`).

Why this still fails D-20260620-003:
- The third remediation was supposed to prove approved runtime/test tokens with actual wiring evidence. The `src/` emit-site additions are partial progress, but several Step 5/6 semantics are still wrong and `test/` still does not protect the reopened-flow token family at all.

Minimum fix:
- Rewire event semantics so Screen 3 no longer emits Step 5 outcome tokens.
- Ensure keep/edit/skip each produce the approved companion events (`checkin_completed`, `message_*`, `reopen_reason_tagged`) in the correct order.
- Emit `vault_interest_viewed` on actual result-slot visibility, not only on dismiss click.
- Add a runtime regression in `test/App.test.tsx` that drives a persisted reopened state through keep/edit/skip and asserts the approved Step 5/6 token family.
- Add the missing schedule/preview tokens or explicitly narrow them out through approved docs if they are no longer required.

### 2) The rewrite safety split is still only partially corrected: `왜 맨날` / `넌 왜` remain blocked even though self-blame/shaming must stay caution-saveable
Severity: High

Evidence:
- `ai/plans/implementation-plan.md:113-117` defines `caution` for self-blame/shaming and `blocked` for self-harm, violence, diagnosis, and treatment language.
- `stages/10_UX_FINAL.md:95-104` requires a caution-saveable path plus a blocked-unsaveable path for truly unsafe text.
- `src/App.tsx:35-36` sets `cautionKeywords = ["한심"]` but still places `왜 맨날` and `넌 왜` inside `blockedKeywords` together with real blocked terms like `죽어`, `자해`, `폭력`, `진단`, and `치료`.
- That means the approved self-blame example family (`넌 왜 맨날 이러냐`-style phrasing) is still blocked-unsaveable instead of caution-saveable.
- `test/App.test.tsx:137-154` only proves `한심해` => caution and `죽어` => blocked. There is still no regression asserting that `왜 맨날` / `넌 왜` stays saveable-with-caution.
- `stages/30_BUILD_REPORT.md:14-15` claims the rewrite safety split is corrected, but the remaining blocked self-blame phrases show that the implementation is only partially fixed.

Why this still fails D-20260620-003:
- The approved safety rule is category-based, not example-based. Fixing `한심해` while leaving `왜 맨날` / `넌 왜` in the blocked bucket still violates the required self-blame/shaming contract.

Minimum fix:
- Move `왜 맨날` / `넌 왜` into the caution-saveable branch (or replace the keyword split with a clearer rule that keeps self-blame/shaming out of the blocked bucket).
- Add a runtime regression in `test/App.test.tsx` proving that a `넌 왜 맨날 이러냐`-style input shows caution copy and keeps `저장하기` enabled, while `죽어` stays blocked-and-unsaveable.

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

This remediation made real progress: the obvious blocked path now emits `message_blocked`, the persisted reopened-state render works again, and the sanitizer/key-drop fix still holds. But the approved runtime/test event contract is still not closed for the reopened flow, and the self-blame/shaming safety split is still only partially corrected. Green `npm test` / `npm run build` are real, but they do not override those remaining approved-scope blockers.

## Metadata
- artifact: `/Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_8aa6fd28-third-remediation-review.md`
- head: `03ebb0d889c0c6b1658044d3c17891094faab401`
- tests:
  - `npm test` -> 16 files / 52 tests passed
  - `npm run build` -> passed
- diff_fingerprint: `b23741592828817629f2c64e16e6ea51ee7d8ae0f3078ff59722e48cfe9f12fd`

## knowledge_candidates
- maturity: confirmed
  summary: Approved analytics remediation should verify token semantics and runtime test coverage together; a token can exist in `src/` yet still be wrong if it fires on the wrong screen or lacks `test/` coverage for the approved flow.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_8aa6fd28-third-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md
- maturity: confirmed
  summary: Safety-classification regressions need at least one explicit self-blame phrase example and one self-harm phrase example in runtime tests; fixing only one shaming keyword can leave the category split partially wrong while CI still passes.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_8aa6fd28-third-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/
