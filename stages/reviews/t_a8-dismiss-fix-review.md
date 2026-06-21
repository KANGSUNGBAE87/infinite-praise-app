# t_a8-dismiss-fix-review — 칭찬해줘 B8 Review

- Reviewer: dev-reviewer
- Date: 2026-06-20 KST
- Verdict: PASS
- Approved: true
- Scope reviewed: D-20260620-007 one-time exact dismiss proof/report fix only (`vault_interest_handled.status === "dismissed"` proof + `stages/30_BUILD_REPORT.md` v1.4 accuracy)

## Reviewed inputs
- `01_DECISIONS.md` (`D-20260620-007`, `D-20260620-008`)
- `stages/30_BUILD_REPORT.md` v1.4
- `test/App.test.tsx`
- `src/App.tsx`
- `stages/reviews/t_0aba0765-final-remediation-review.md`
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
1. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && if [ -f graphify-out/graph.json ]; then graphify query 'D-20260620-007 dismiss payload proof build report accuracy App.test.tsx App.tsx vault_interest_handled status dismissed' ; else echo 'graphify graph missing'; fi`
   - Result: graph exists but returned only low-signal package/App nodes, so I used it as navigation aid only.
2. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && git rev-parse --verify HEAD && git status --porcelain=v1 | shasum -a 256`
   - Result: HEAD `03ebb0d889c0c6b1658044d3c17891094faab401`; tracked fingerprint `6d265c8823b17f11dbb1327c9e32cd39095fdd9f56b24c1f5df4ee812be45ba8` before and after verification.
3. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && npm test`
   - Result: `16` test files passed, `53` tests passed.
4. `cd '/Users/kangsungbae/Documents/무한칭찬앱' && npm run build`
   - Result: `tsc --noEmit && vite build` passed; production build emitted `dist/index.html`, `dist/assets/index-DZluZDm-.css`, `dist/assets/index-XiUGTPdw.js`.
5. Targeted repo scans in `src/App.tsx` and `test/App.test.tsx`
   - Result: the dismiss-path test now contains the exact payload assertion, and the source dismiss CTA still emits `vault_interest_handled` with `status: "dismissed"`.

## Acceptance-criteria verification

### 1) Exact dismissed payload proof exists and passes
PASS.

Evidence:
- `test/App.test.tsx:190-192`
  ```ts
  const dismissEvent = trackedEvents.find((e) => e.eventName === "vault_interest_handled");
  expect(dismissEvent).toBeDefined();
  expect(dismissEvent?.properties?.status).toBe("dismissed");
  ```
- The same test clicks the live `관심 없음` CTA immediately before those assertions and still keeps the ordered runtime sequence ending in `vault_interest_handled` (`test/App.test.tsx:180-189`).
- `npm test` passed with this assertion in place (`16` files / `53` tests).
- The source emit remains the dismissed branch in `src/App.tsx:255`:
  `announce("vault_interest_handled", { source: state.reopenSource, status: "dismissed" });`

Why this closes the B7 blocker:
- The prior B7 review failed because runtime evidence only proved event-name presence.
- A8 now proves the emitted payload branch itself (`status === "dismissed"`), so a regression to `registered` or missing status would fail CI.

### 2) `stages/30_BUILD_REPORT.md` v1.4 is accurate enough for the approved A8 scope and no longer overclaims unproven closure
PASS.

Evidence checked against the current repo state:
- `stages/30_BUILD_REPORT.md:13` says the dismiss CTA runtime test now explicitly asserts `vault_interest_handled.status === "dismissed"`.
  - Verified true by `test/App.test.tsx:190-192` and by green `npm test`.
- `stages/30_BUILD_REPORT.md:18-19` says A8 changed the test proof and refreshed the build report itself.
  - This matches the approved D-20260620-007 scope: one-time exact proof/report fix only.
- `stages/30_BUILD_REPORT.md:35-36` says tests/build pass.
  - Verified directly: `npm test` -> `16` files / `53` tests passed; `npm run build` passed cleanly.
- `stages/30_BUILD_REPORT.md:14-15` restates prior runtime emit-site and safety-split facts.
  - Spot-checked true in `src/App.tsx` via targeted searches (`rewrite_started`, `schedule_started`, `preview_viewed`, `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `checkin_completed`, `reopen_reason_tagged`, `message_blocked`, `message_kept`, `message_edited`, `message_skipped_today`, `vault_interest_viewed`, `vault_interest_clicked`, `vault_interest_handled`; plus `cautionKeywords` / `blockedKeywords`).

Non-blocking note:
- The report's evidence pointer says `src/App.tsx:251`; the current dismiss emit is at `src/App.tsx:255`. The evidence itself is correct and the approved closure does not depend on the exact line number, so this is not a blocker for B8.

### 3) CI checks are green
PASS.

- `npm test` -> `16` files passed / `53` tests passed.
- `npm run build` -> `tsc --noEmit && vite build` passed.

## Scope / exclusion check
- Verified scope stayed within D-20260620-007's exact fix intent: review evidence is confined to the dismiss payload proof and build-report accuracy.
- No new runtime/product-expansion requirement was needed to satisfy this review.
- The approved preserved exclusions remain unchanged by the evidence reviewed here.

## Final verdict
PASS.

D-20260620-007 asked for one exact closure: prove the dismiss branch payload in runtime test evidence and make the build report match that evidence. The current workspace does both. `test/App.test.tsx` now asserts `vault_interest_handled.properties.status === "dismissed"`, the test suite and build are green, and `stages/30_BUILD_REPORT.md` v1.4 no longer relies on the previously missing proof. B8 can pass and the next step can move to the CEO Release decision gate.

## Metadata
- artifact: `/Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_a8-dismiss-fix-review.md`
- head: `03ebb0d889c0c6b1658044d3c17891094faab401`
- tests:
  - `npm test` -> `16` files / `53` tests passed
  - `npm run build` -> passed
- diff_fingerprint: `6d265c8823b17f11dbb1327c9e32cd39095fdd9f56b24c1f5df4ee812be45ba8`

## knowledge_candidates
- maturity: candidate
  summary: Exact remediation-closure reviews for analytics branches should require a live runtime assertion of the branch payload (for example `status === "dismissed"`) plus a build report that avoids claiming more than the verified proof; line-number drift alone is non-blocking when the underlying evidence is correct.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_a8-dismiss-fix-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/index.md
