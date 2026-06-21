# t_2525384d Narrow Remediation Review — 칭찬해줘

- Reviewer: dev-reviewer
- Date: 2026-06-20 KST
- Verdict: CHANGES_REQUIRED
- Scope reviewed: `01_DECISIONS.md` D-20260620-001 narrow remediation only (`D1 reopen path`, `analytics/event/source schema`, `safety rewrite classification/tests`)
- Runtime/browser QA: not in scope for this split card (`qa-functional` separate)

## Reviewed inputs
- `01_DECISIONS.md`
- `stages/10_UX_FINAL.md`
- `stages/20_ARCH_FINAL.md`
- `ai/plans/implementation-plan.md`
- `stages/reviews/t_ac702c7f-static-contract-review.md`
- `stages/30_BUILD_REPORT.md`
- `src/App.tsx`
- `src/core/analyticsSanitizer.ts`
- `src/i18n.ts`
- `test/App.test.tsx`
- `test/analyticsSanitizer.test.ts`
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
- Branch: `main`
- Pre-review tracked status: `ai/session-logs/README.md` modified; reviewed app files and this report file were already outside the tracked diff set.
- Pre-review fingerprint: `689ec49611f73c6b55d7cec3c9c2588d506696b7e3e87b97e8ad54d053ddf851`
- Post-verification fingerprint: `689ec49611f73c6b55d7cec3c9c2588d506696b7e3e87b97e8ad54d053ddf851`
- Result: review/test/build/report work did not add tracked diff.

## Commands / checks run
1. `graphify query 'D1 reopen path analytics event source schema safety rewrite classification App.tsx analyticsSanitizer tests build report'`
2. `git rev-parse HEAD && git branch --show-current`
3. `git status --short --untracked-files=no`
4. `git diff --binary --no-ext-diff HEAD | shasum -a 256 | cut -d' ' -f1`
5. `npm test`
   - Result: 16 test files passed, 53 tests passed
6. `npm run build`
   - Result: TypeScript check + Vite production build passed
7. Repo-wide source/test token searches for approved narrow events and reopen/source tokens
8. Direct source scan for excluded-scope SDK/network imports in active `src/`

## What passed
- D1 reopen restoration is now positively wired: persisted `sessionPhase: "reopened"` state is coerced to Step 5 and invalid legacy reopen token values collapse to `unknown` (`src/App.tsx:66-71`).
- Approved D1 return events are present in active wiring and exercised by runtime tests: `return_next_day`, `return_next_day_manual`, `checkin_prompt_viewed`, `checkin_completed`, `reopen_reason_tagged` (`src/App.tsx:127-132,242-244`; `test/App.test.tsx:103-112,138-145,171-189`).
- The sanitizer now enforces a closed allowlist and drops text-shaped keys entirely (`src/core/analyticsSanitizer.ts:1-34`; `test/analyticsSanitizer.test.ts:5-24`), which matches the Architecture privacy rule (`stages/20_ARCH_FINAL.md:242-247`).
- Reopen source schema now matches the approved `manual | notification | unknown` contract in state and i18n (`src/App.tsx:20,70,236-239`; `src/i18n.ts:45-47,108-110`).
- Excluded-scope preservation remains intact in the active product flow: `src/App.tsx` imports only i18n, sanitizer, and platform adapters (`src/App.tsx:1-4`); direct Apps in Toss SDK, AdMob, Billing, `fetch`, `axios`, `XMLHttpRequest`, and `sendBeacon` imports were not found in active `src/`.
- `npm test` and `npm run build` both pass on the reviewed tree.

## Blocking findings

### 1) Rewrite analytics wiring still drifts: `rewrite_started` is double-emitted, and caution-save loses `rewrite_saved`
Severity: High

Evidence:
- The approved minimum analytics/state contract expects a single rewrite entry event and an explicit save outcome (`stages/20_ARCH_FINAL.md:249-270,272-299`; `stages/10_UX_FINAL.md:196-199`).
- Active source emits `rewrite_started` in two different places for the same Step 2 → Step 3 transition:
  - effect-based transition emit: `src/App.tsx:124-126`
  - button click emit: `src/App.tsx:194`
- Active source also collapses the caution-save path into `message_cautioned` instead of preserving the save event:
  - caution classification emit: `src/App.tsx:111-113`
  - save button chooses `message_cautioned` instead of `rewrite_saved` when `rewriteMessage.safety === "caution"`: `src/App.tsx:208`
  - only non-caution save paths emit `rewrite_saved`: `src/App.tsx:208-209`
- Existing runtime tests assert token presence/order, but they do not guard against duplicate `rewrite_started` counts or prove that a cautionary-but-saveable rewrite still records `rewrite_saved` (`test/App.test.tsx:57-75,195-216,276-293`).

Why this fails the approved contract:
- D-20260620-001 kept the remediation scope exactly on analytics/event wiring and safety classification/tests (`01_DECISIONS.md:80-87`).
- A cautionary rewrite is still a successful save per the implementation acceptance (`ai/plans/implementation-plan.md:107-129`), so dropping `rewrite_saved` on that branch breaks the approved funnel semantics.
- Double-emitting `rewrite_started` inflates funnel metrics and means the runtime wiring is still not a stable, platform-neutral event contract.

Minimum fix:
- Emit `rewrite_started` at exactly one transition site for the Step 2 → Step 3 move.
- Keep `message_cautioned` as the safety signal, but also record `rewrite_saved` when the user actually saves a cautionary rewrite.
- Add runtime regressions that assert:
  1. `rewrite_started` count is exactly 1 for a normal entry into Step 3.
  2. A caution-save path remains saveable and records both the caution classification and the successful save outcome.

## Final verdict
CHANGES_REQUIRED.

The core D1 reopen repair, sanitizer key-drop, source-token cleanup, and excluded-scope preservation are now real and test/build backed. However, the narrow analytics/safety contract is still not fully closed because rewrite analytics wiring conflates safety classification with save outcome and double-counts Step 3 entry. This is inside the exact D-20260620-001 accepted scope, so the remediation cannot be approved yet.

## knowledge_candidates
- maturity: confirmed
  summary: In local-first funnel remediation, repo-wide token presence is not enough; review must also verify event cardinality and outcome semantics so a single user action does not emit duplicate funnel markers or lose the terminal success event.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_2525384d-narrow-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/
- maturity: confirmed
  summary: Safety classification and success analytics should be modeled as separate signals when cautionary user text is still saveable; otherwise save funnels undercount exactly the branch the UX intended to permit.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/t_2525384d-narrow-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md
