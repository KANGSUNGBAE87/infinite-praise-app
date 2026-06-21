# t_93fd25aa Remediation Review — 칭찬해줘

- Reviewer: dev-reviewer
- Date: 2026-06-20 KST
- Verdict: CHANGES_REQUIRED
- Approved: false
- Scope reviewed: D-20260620-002 narrow remediation only (`positive reopened Step 5/6 regression`, `analytics key/event/source closed contract`, `rewrite safety classification/events`)

## Reviewed inputs
- `01_DECISIONS.md` (`D-20260619-005`, `D-20260620-001`, `D-20260620-002`)
- `stages/10_UX_FINAL.md`
- `stages/20_ARCH_FINAL.md`
- `ai/plans/implementation-plan.md`
- `stages/30_BUILD_REPORT.md`
- `stages/reviews/t_b201664a-narrow-remediation-review.md`
- parent builder handoff `t_12545c51`
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
- Pre-review tracked fingerprint: `a7cdacc26ef5b330b39a736aa2b789de247357fee60ff8687d715a1c4829129f`
- Post-verification fingerprint before writing this report: `a7cdacc26ef5b330b39a736aa2b789de247357fee60ff8687d715a1c4829129f`
- Result: review commands did not introduce additional tracked diff before artifact writing.

## Commands / checks run
1. `graphify query '칭찬해줘 D1 reopen analytics sanitizer event schema safety rewrite test App.tsx'`
2. `npm test`
   - Result: 16 files passed, 51 tests passed.
3. `npm run build`
   - Result: TypeScript + Vite production build passed; `dist/assets/index-CPD3ooHY.js` generated.
4. Static source scans
   - active app import scan: no `import` matches for `ttsPrompt`, `voiceScript`, `@apps-in-toss`, Google login/billing, or AdMob inside `src/**/*.ts*`
   - approved-event token scan across `*.ts*`: zero matches for `rewrite_started`, `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `reopen_reason_tagged`, `message_blocked`, `vault_interest_handled`
5. Built bundle exact marker scan (`dist/**/*.js`)
   - no `gemini-2.5-flash-preview-tts`, `Kore`, or `ElevenLabs` markers found
   - `google_play_billing` / `admob` strings do appear, but only via planned stub identifier literals from `src/platform/adapters.ts`, not direct SDK imports

## What passed
- The positive reopened-path blocker is now closed. `src/App.tsx:66-68` promotes a persisted reopened state into Step 5, and `test/App.test.tsx:24-67` proves the first session stays on Step 4 while a persisted reopened state renders Screen 5 and advances to Screen 6.
- The analytics sanitizer now drops forbidden free-text-shaped keys instead of redacting them in place. `src/core/analyticsSanitizer.ts:1-34` and `test/analyticsSanitizer.test.ts:5-24` both match that contract.
- The reopen source token drift from `memory` is fixed. `src/App.tsx:20` and `src/i18n.ts:45-47,108-110` now use the approved `manual | notification | unknown` set.
- `npm test` and `npm run build` both pass.
- The active app flow still avoids direct platform SDK imports and real backend delivery code.

## Findings

### 1) Analytics/event contract is still not closed even though key dropping and source tokens were fixed
Severity: High

Evidence:
- `stages/10_UX_FINAL.md:95-99` requires `rewrite_started`, `rewrite_saved`, and `message_cautioned / message_blocked` for the rewrite screen.
- `stages/10_UX_FINAL.md:135-162,249-271` requires `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `checkin_completed`, `reopen_reason_tagged`, `message_kept | message_edited | message_skipped_today`, and `vault_interest_handled`.
- `stages/20_ARCH_FINAL.md:244-269,289-298` requires a closed, platform-neutral event schema and the next-day transition sequence `next_day_return -> checkin_prompt_viewed -> checkin_completed -> message_kept|message_edited|message_skipped_today -> reopen_reason_tagged -> vault_interest_*`.
- Project-wide `*.ts*` search returned zero matches for `rewrite_started`, `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `reopen_reason_tagged`, `message_blocked`, and `vault_interest_handled`, so the approved emit sites still do not exist in runtime code or tests.
- `src/App.tsx:168-169` emits `message_cautioned` or `rewrite_saved` on save, but there is still no `rewrite_started` when the user begins editing and no blocked-path event at all.
- `src/App.tsx:202-204` emits `checkin_completed` for `keep` and `skip`, and `message_edited` for `edit`, but it never emits `message_kept`, `message_skipped_today`, or `reopen_reason_tagged`.
- `src/App.tsx:215-216` emits `vault_interest_viewed` / `vault_interest_clicked`, but there is still no `vault_interest_handled` outcome event.
- `stages/30_BUILD_REPORT.md:15` claims the app now uses only approved coarse event/source fields, but the approved event contract above remains partially unimplemented.
- The Apps in Toss development gate treats approved-event mismatches and missing emit sites as Development `CHANGES_REQUIRED` even when tests/build are green (`docs/workflows/apps-in-toss-development-gate.md:81-88`).

Why this still fails D-20260620-002:
- The narrow remediation scope explicitly included the `analytics key/event/source closed contract`, not only the key sanitizer. The key-dropping fix is real, but the approved event wiring is still incomplete, so the contract remains open.

Minimum fix:
- Add the missing approved emit sites (`rewrite_started`, `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `reopen_reason_tagged`, `message_blocked`, `vault_interest_handled`) at the approved interactions.
- Rewire Step 5 outcomes so keep/edit/skip produce the approved `message_kept` / `message_edited` / `message_skipped_today` markers in addition to the check-in completion flow.
- Add at least one runtime regression test that fails if those approved event tokens are missing from the actual flow, not only from a helper.

### 2) Rewrite safety classification is still reversed, and the regression test still blesses the reversed behavior
Severity: High

Evidence:
- `ai/plans/implementation-plan.md:107-128` requires `caution` for self-blame/shaming and `blocked` for self-harm/violence/diagnosis/treatment language.
- `stages/10_UX_FINAL.md:95-104` requires `message_cautioned / message_blocked` and says risky text must be blocked with save disabled.
- `src/App.tsx:35-36` still puts `죽어`, `자해`, `진단`, `치료`, and `한심` into `cautionKeywords`, while `blockedKeywords` only contains `왜 맨날`, `넌 왜`.
- Because `rewriteMessage` blocks only on `blockedKeywords` (`src/App.tsx:93-94`) and the save button is disabled only when `rewriteMessage.safety === "blocked"` (`src/App.tsx:168`), self-harm text like `죽어` still lands in the caution/saveable branch.
- `test/App.test.tsx:95-110` still encodes that wrong behavior by expecting `한심해` and then `죽어` to show the same caution copy while leaving `저장하기` enabled.
- `stages/30_BUILD_REPORT.md:15` claims the rewrite branch now emits distinct caution vs blocked behavior, but the current source/test pair still prove the opposite.
- The approved `message_blocked` event is also still absent from project-wide `*.ts*` search, so the blocked branch is neither measurable nor regression-protected.

Why this still fails D-20260620-002:
- The narrow remediation explicitly called out `corrected safety classification/events`. The current code fixes neither the classification nor the blocked-event proof.

Minimum fix:
- Move self-harm/violence/diagnosis/treatment phrases into the blocked branch and keep self-blame/shaming in caution.
- Update `test/App.test.tsx` so `한심해` remains saveable-with-caution and `죽어` is blocked-and-unsaveable.
- Emit `message_blocked` when the blocked safety state is reached so the branch is observable and schema-protected.

## Exclusions preserved
Preserved for the active remediation path reviewed here:
- no active voice/TTS/audio import in `src/App.tsx`
- no AI/counseling flow
- no login
- no ads/IAP/payment/Toss points flow activation
- no backend or real notification delivery
- no release/store submission logic
- no direct Apps in Toss / Google Play SDK imports in active product code
- no unrelated UI/product expansion beyond the approved 6-screen shell

Residual note:
- Legacy TTS code and scripts still exist in the repository (`src/core/ttsPrompt.ts`, `test/ttsPrompt.test.ts`, `test/voiceScript.test.ts`, `package.json` `tts:*` scripts), but they are not imported by the active app flow and their exact provider markers do not appear in the built bundle.
- Planned adapter identifier strings for future stores/networks remain in `src/platform/adapters.ts`, so related plain strings appear in the bundle, but that is not evidence of direct SDK integration by itself.

## Final verdict
CHANGES_REQUIRED.

The reopened Step 5/6 regression is now positively proved, the sanitizer now drops forbidden keys, and the approved reopen source tokens are restored. But the narrow remediation still does not close the full approved analytics/event contract, and the rewrite safety classification/events are still reversed in both runtime code and tests. Green `npm test` / `npm run build` are real, but they do not override those remaining approved-scope blockers.

## Metadata
- artifact: `/Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_93fd25aa-remediation-review.md`
- head: `03ebb0d889c0c6b1658044d3c17891094faab401`
- tests:
  - `npm test` -> 16 files / 51 tests passed
  - `npm run build` -> passed
- diff_fingerprint: `a7cdacc26ef5b330b39a736aa2b789de247357fee60ff8687d715a1c4829129f`

## knowledge_candidates
- maturity: confirmed
  summary: When a local-first MVP has an approved event schema, remediation is not closed by sanitizer/helper fixes alone; reviewer should run a repo-wide token search in `src/` and `test/` for every approved event name before accepting green CI.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_93fd25aa-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md
- maturity: confirmed
  summary: Rewrite-safety remediation needs paired runtime assertions for both `caution` and `blocked` examples; otherwise tests can accidentally lock in the reversed classification while still passing.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_93fd25aa-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/
