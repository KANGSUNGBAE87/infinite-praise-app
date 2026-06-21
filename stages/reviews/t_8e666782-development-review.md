# t_8e666782 Development B Review — 칭찬해줘

- Reviewer: dev-reviewer
- Date: 2026-06-19 KST
- Verdict: CHANGES_REQUIRED
- Scope reviewed: D-20260619-005 only (`6-screen local-first v0.1`, ko/en, trust-safe analytics, Apps in Toss first / Google Play compatible, no real platform SDK import)

## Reviewed inputs
- `00_PROJECT_BRIEF.md`
- `01_DECISIONS.md`
- `stages/10_UX_FINAL.md`
- `stages/20_ARCH_FINAL.md`
- `ai/plans/implementation-plan.md`
- `stages/30_BUILD_REPORT.md`
- `/Users/kangsungbae/Documents/지식저장소/AI_CONTEXT.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/index.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/profile.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/operating-rules.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/workflows/app-platform-standard.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-platform.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md`
- `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/platform.md`

## Read-only baseline
- Baseline HEAD: `03ebb0d`
- Baseline tracked diff before review: `ai/session-logs/README.md` modified; large untracked project tree already existed.
- Re-check after verification: no additional tracked diff was introduced by review commands.

## Commands and verification run
1. `graphify query '6-screen praise check-in flow, App.tsx, analytics sanitizer, platform adapters'`
2. `npm test`
   - Result: 16 files passed, 51 tests passed
3. `npm run build`
   - Result: TypeScript + Vite build passed, `dist/assets/index-C2sK7us7.js` generated
4. Static searches
   - No direct platform SDK import found in product/domain code
   - No `fetch`, `axios`, `XMLHttpRequest`, `navigator.sendBeacon`, or console logging found in `src/`
   - Built bundle search for `tts`, `gemini-2.5-flash-preview-tts`, `Kore`, `ElevenLabs` returned 0 matches
5. Browser QA on `http://127.0.0.1:5173`
   - App renders over dev server (builder’s `file://dist/index.html` blank-page note did not reproduce on served app)
   - Reproduced same-session Step 5/6 exposure and raw short free-text appearing in the analytics payload preview

## What passed
- Main app entry now renders the new praise/check-in shell instead of the old reminder home.
- `npm test` and `npm run build` both pass.
- No direct Toss / Google Play SDK imports were found in product/domain flow code.
- No real network/analytics transport is wired in the current MVP stub.
- Legacy TTS/voice files remain in the repo, but the built bundle did not include TTS markers.

## Blocking findings

### 1. Approved D1-only flow is implemented as a same-session flow
Severity: High

Accepted UX/Architecture requires:
- initial session: Landing → Praise Pick → Rewrite → Schedule/Preview
- later D1/manual return only: Check-in → Result/Fake-door

Actual implementation:
- `src/App.tsx:162` sets `returnedNextDay: true` immediately when the user saves the first schedule.
- `src/App.tsx:171-199` then renders Check-in and Result in the same first-session path.
- `test/App.test.tsx:24-40` codifies this wrong behavior by asserting that the result/fake-door is reached immediately after `시간 저장` and `유지` in the same run.
- Browser QA confirmed the first session reaches `5/6 단계` immediately after schedule save, then `6/6 단계` with `마음에 든 한 줄 보관함 보기` visible.

Why this fails the approved scope:
- `stages/10_UX_FINAL.md` explicitly says Screen 5 is next-day check-in and Screen 6 is D1-return-only.
- `stages/20_ARCH_FINAL.md` ties `vault_interest_viewed` to D1 return only.

Minimum fix:
- Keep first session ending at save + preview.
- Gate Step 5 and Step 6 behind an explicit reopen/day-boundary state (`manual_return | notification_return | unknown`) instead of setting `returnedNextDay` during initial save.
- Update tests so D1 behavior requires simulated reopen/return state, not same-session progression.

### 2. Trust-safe analytics contract is broken
Severity: High

Actual implementation:
- `src/core/analyticsSanitizer.ts:1-15` only redacts strings longer than 40 characters; short user-authored text passes through unchanged.
- `src/App.tsx:149` emits `rewrite_saved` with `{ text: state.rewriteText }`.
- `src/App.tsx:84` builds a preview payload containing `praise` and `freeText` from user text.
- Browser QA showed the final payload preview as:
  - `{"event":"rewrite_saved","praise":"오늘은 할 만큼 했어.","freeText":"오늘은 할 만큼 했어."}`
  proving short free text survives sanitization.

Event-contract mismatch:
- Approved events in UX/Architecture include `landing_viewed`, `schedule_started`, `reminder_created`, `preview_viewed`, `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `reopen_reason_tagged`, `message_kept`, `message_edited`, `message_skipped_today`, `vault_interest_viewed`, `vault_interest_clicked`, `vault_interest_handled`.
- Current code emits only `target_confirmed`, `target_rejected`, `praise_selected`, `rewrite_saved`, `schedule_saved`, `checkin_completed`, `vault_interest_handled` (`src/App.tsx:90,119,120,149,162,183-185,197-198`).
- The approved source/reason split required by UX (`notification | manual | unknown`) is not logged as approved events.

Why this fails the approved scope:
- D-20260619-005 explicitly approved `free-text analytics block`.
- `stages/20_ARCH_FINAL.md:244-247` says user-entered free text must never be included in analytics payloads and properties must be closed enums/booleans/counts/coarse categories only.

Minimum fix:
- Replace length-based redaction with a contract that drops all user-authored free-text fields regardless of length.
- Emit only approved closed-schema properties.
- Restore the approved event names and source/reason instrumentation.
- Add tests that fail on any free-text field, including short text.

### 3. Rewrite safety and i18n routing do not match the approved contract
Severity: Medium

Safety mismatch:
- `stages/10_UX_FINAL.md` requires separate caution vs blocked behavior.
- `src/App.tsx:34,80-82` collapses several self-blame phrases into the blocked path and uses a length rule for caution.
- `test/App.test.tsx:70-85` expects `한심해` to be blocked, even though the approved rule set classifies self-blame/shaming examples as caution-saveable rather than blocked.
- No `message_cautioned` / `message_blocked` event split is implemented.

I18n routing mismatch:
- `src/App.tsx:76` hardcodes fallback preview text instead of routing through the locale catalog.
- `src/App.tsx:178-180` hardcodes `manual`, `notification`, `memory` option labels; browser QA showed these raw English tokens inside the Korean flow.
- This breaks the requirement that user-facing strings route through active locale paths.

Minimum fix:
- Implement explicit safety statuses (`safe`, `caution`, `blocked`) aligned to the approved examples, with save allowed for caution.
- Add tests that distinguish caution from blocked.
- Move the preview fallback and reopen-reason labels into `src/i18n.ts` (or locale modules) and assert both ko/en render correctly.

## Changed-file risk review
- `src/App.tsx`
  - Highest-risk file. It currently owns state transitions, analytics emission, safety classification, and parts of i18n fallback. Most review findings originate here.
- `src/core/analyticsSanitizer.ts`
  - Critical privacy boundary. Current implementation is insufficient because it uses length-based redaction instead of field-based blocking.
- `src/i18n.ts`
  - Locale coverage exists, but key user-facing strings still bypass the catalog from `App.tsx`.
- `src/platform/adapters.ts`
  - No direct SDK imports found. Stubbed boundaries are safe as no-op adapters today, but the approved minimal-adapter intent is still broader than strictly necessary because auth/payment/ads stubs remain present.
- `test/App.test.tsx`
  - Currently reinforces two contract violations: same-session D1 flow and blocked-vs-caution collapse.
- `test/analyticsSanitizer.test.ts`
  - Too weak. It only proves long-text redaction and does not protect against short free-text leaks.

## Recommended remediation scope for a new dev-builder task
1. Split first-session save/preview from D1/manual-return check-in/result flow and update state restoration accordingly.
2. Replace analytics sanitizer with a strict allowlist/denylist that removes all free-text fields and reintroduce the approved event schema.
3. Align rewrite safety semantics and tests with the approved caution/blocked contract; route remaining hardcoded user-facing strings through locale catalogs.

## Final verdict
CHANGES_REQUIRED.

The build is green and the rendered shell is broadly aligned, but the current implementation still violates the approved product contract in three material ways: it exposes the D1-only flow in the first session, it allows short user free text to survive the analytics boundary, and it collapses approved safety/i18n contracts. This should not advance to the studio-ceo gate yet.

## knowledge_candidates
- maturity: confirmed
  summary: For D1-gated local-first flows, green end-to-end tests are not sufficient unless they simulate a real reopen/day-boundary; same-session walkthroughs can falsely approve retention-only screens.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_8e666782-development-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/
- maturity: confirmed
  summary: Analytics sanitizers for user-authored text must block by field contract, not by text length; otherwise short custom text slips through even when the transport is still stubbed.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_8e666782-development-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md
