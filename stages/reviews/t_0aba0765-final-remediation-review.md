# t_0aba0765 Final Remediation Review — 칭찬해줘

- Reviewer: dev-reviewer
- Date: 2026-06-20 KST
- Verdict: CHANGES_REQUIRED
- Approved: false
- Scope reviewed: D-20260620-005 final narrow remediation only (`self-blame caution-saveable split`, `ordered Step 4/5/6 runtime proof`, `schedule/preview/dismiss runtime coverage`, `build-report accuracy`, `preserved exclusions`)

## Reviewed inputs
- `01_DECISIONS.md` (`D-20260619-005` through `D-20260620-005`)
- `ai/plans/product-plan.md`
- `ai/plans/implementation-plan.md`
- `stages/10_UX_FINAL.md`
- `stages/20_ARCH_FINAL.md`
- `stages/30_BUILD_REPORT.md`
- `stages/reviews/t_c5c30b21-fourth-remediation-review.md`
- parent builder handoff `t_63763018`
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
1. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && if [ -f graphify-out/graph.json ]; then graphify query '칭찬해줘 D-20260620-005 App.test.tsx App.tsx schedule_started preview_viewed dismissed safety caution blocked'; else echo 'graphify graph missing'; fi`
   - Result: graph exists but returned stale/low-signal nodes around older App shapes, so I used it only as navigation aid, not verdict evidence.
2. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && git rev-parse HEAD && git status --short && git status --porcelain=v1 | shasum -a 256`
   - Result: HEAD `03ebb0d889c0c6b1658044d3c17891094faab401`; tracked fingerprint `6d265c8823b17f11dbb1327c9e32cd39095fdd9f56b24c1f5df4ee812be45ba8` before and after verification.
3. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && npm test`
   - Result: `16` test files passed, `53` tests passed.
4. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && npm run build`
   - Result: `tsc --noEmit && vite build` passed.
5. Targeted token scans across `src/` and `test/`
   - `src/App.tsx` now places `왜 맨날` / `넌 왜` in `cautionKeywords` and keeps `죽어` in `blockedKeywords`.
   - `test/App.test.tsx` now uses ordered `expectEventSequence(...)` assertions instead of `arrayContaining(...)` for the Step 4/5/6 regressions.
   - `test/App.test.tsx` contains runtime matches for `schedule_started` and `preview_viewed`.
   - `test/App.test.tsx` still has zero matches for `dismissed`.
6. Targeted exclusion scans under `src/`
   - `src/main.tsx` renders `App` directly; active product entrypoint does not mount legacy `ReminderApp`.
   - No direct `@apps-in-toss` SDK imports, `fetch(`, `axios`, or `WebSocket` matches in active entrypoint code.
   - Platform/login/payment/ads identifiers remain in `src/platform/adapters.ts` as stubs only.
   - Legacy TTS code remains in `src/core/ttsPrompt.ts`, but `src/App.tsx` and `src/main.tsx` do not import it.

## What passed
- `npm test` and `npm run build` both pass.
- The explicit safety split is now correct in source and runtime test coverage:
  - `src/App.tsx:35-36,96-97` classifies `왜 맨날` / `넌 왜` as caution and `죽어` as blocked.
  - `test/App.test.tsx:273-289` verifies `넌 왜 맨날 이러냐` shows the caution copy while `저장하기` remains enabled, and `죽어` shows the blocked copy while `저장하기` is disabled.
- Ordered runtime sequence assertions replaced the earlier token-presence-only pattern:
  - `test/App.test.tsx:103-112`, `138-145`, `171-189`, and `204-213` use `expectEventSequence(...)` instead of `arrayContaining(...)`.
- Step 4 runtime coverage for `schedule_started` and `preview_viewed` now exists in the first-session flow:
  - `test/App.test.tsx:192-213` exercises the live save interaction and asserts `rewrite_saved -> schedule_started -> reminder_created -> preview_viewed` in order.
- Preserved exclusions still hold on the active product path reviewed here:
  - no active voice/TTS/audio,
  - no AI/counseling,
  - no login activation,
  - no ads/IAP/payment/Toss points activation,
  - no backend or real notification delivery,
  - no release/store submission logic,
  - no direct Apps in Toss / Google Play SDK imports in active product/domain logic.

## Findings

### 1) The final remediation still does not prove the `vault_interest_handled` dismissed branch explicitly enough for the approved runtime contract
Severity: High

Evidence:
- Acceptance item 5 requires runtime coverage for `schedule_started`, `preview_viewed`, and the dismissed branch of `vault_interest_handled`.
- `src/App.tsx:251` emits `announce("vault_interest_handled", { source: state.reopenSource, status: "dismissed" })` on the dismiss CTA.
- `test/App.test.tsx:180-189` clicks `관심 없음` and then only asserts that the ordered subsequence ends with `vault_interest_handled`.
- A repo-wide targeted search over `test/App.test.tsx` returned zero matches for `dismissed`, so the runtime test never proves that the emitted branch payload is actually the dismissed branch rather than just any `vault_interest_handled` emission.
- The shared development gate already treats approved event closure as both runtime wiring and payload-contract proof, not token existence alone (`/Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md:85,90-91`).

Why this still fails D-20260620-005:
- The prior blocker was narrowed to exact runtime proof shape. This remediation now proves the dismiss CTA emits `vault_interest_handled`, but it still does not assert the approved `dismissed` branch explicitly in test evidence.
- Because the test never checks `status: "dismissed"`, a regression that accidentally emits `registered` or omits the branch status would still pass green CI.

Minimum fix:
- Extend `test/App.test.tsx` so the dismiss-path runtime test inspects the tracked event payload and asserts that `vault_interest_handled` was emitted with `status === "dismissed"` after the dismiss click.
- Keep the ordered `expectEventSequence(...)` assertion, but add the explicit branch assertion rather than relying on event presence alone.

### 2) `stages/30_BUILD_REPORT.md` still overclaims closure because it says the dismiss branch is verified even though the explicit branch proof above is still missing
Severity: Medium

Evidence:
- `stages/30_BUILD_REPORT.md:13-15` says the remaining approved blockers are closed and that runtime regressions verify ordered live interactions including the dismiss branch of vault interest handling.
- The current test suite does prove counts (`16` files / `53` tests) and ordered sequence coverage, but Finding 1 shows it does not explicitly prove the dismissed branch payload.
- The counts in `stages/30_BUILD_REPORT.md:27-28` are now accurate; the remaining defect is the closure claim itself, not the numeric totals.

Why this matters:
- D-20260620-005 is the final narrow remediation gate. Overstating closure in the build report would give CEO gate input a false PASS signal even though one approved-scope runtime proof gap remains.

Minimum fix:
- After adding the explicit dismissed-branch assertion above, refresh `stages/30_BUILD_REPORT.md` so it only claims closure that is backed by the actual test evidence.

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
- Legacy reminder/TTS-oriented files still exist in the repository, but the active app path is `src/main.tsx -> src/App.tsx`, and that path does not import legacy TTS or direct platform SDK code.

## Final verdict
CHANGES_REQUIRED.

This final remediation does close most of the previously approved blockers: the self-blame caution-saveable split is now correct, the tests now use ordered sequence assertions instead of `arrayContaining`, and the first-session runtime path covers `schedule_started` plus `preview_viewed`. But the exact `vault_interest_handled` dismissed branch is still not explicitly proven in runtime test evidence, and the build report therefore still overstates closure. Because D-20260620-005 asked for exact approved-scope proof, this remains a narrow but blocking gap.

## Metadata
- artifact: `/Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_0aba0765-final-remediation-review.md`
- head: `03ebb0d889c0c6b1658044d3c17891094faab401`
- tests:
  - `npm test` -> `16` files / `53` tests passed
  - `npm run build` -> passed
- diff_fingerprint: `6d265c8823b17f11dbb1327c9e32cd39095fdd9f56b24c1f5df4ee812be45ba8`

## knowledge_candidates
- none; the reusable lessons relevant to this review are already promoted in `/Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md` and `/Users/kangsungbae/Documents/지식저장소/docs/testing/index.md`.
