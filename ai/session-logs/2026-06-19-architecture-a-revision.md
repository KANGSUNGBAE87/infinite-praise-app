---
version: 1.0
status: complete
updated: 2026-06-19
canonical: false
project: 칭찬해줘
phase: architecture-revision
---

# 2026-06-19 Architecture A revision

## User request
Revise `stages/20_ARCH_FINAL.md` after the risk review so the final architecture handoff is development-ready.

## Decisions
- Kept the approved 6-screen praise/check-in flow as the product center.
- Reduced the MVP platform boundary to only what the current build actually needs: local storage, analytics event contract, notification capability detection, and locale helper.
- Added an explicit PII guardrail: user-entered free text must not enter analytics payloads.
- Kept backend, auth, ads, payment, and real notification delivery as future-only boundaries.
- Updated the implementation plan to match the 6-screen migration rather than the older reminder/voice plan.

## Files changed
- `/Users/kangsungbae/Documents/무한칭찬앱/stages/20_ARCH_FINAL.md`
- `/Users/kangsungbae/Documents/무한칭찬앱/ai/plans/implementation-plan.md`
- `/Users/kangsungbae/Documents/무한칭찬앱/ai/session-logs/2026-06-19-architecture-a-revision.md`

## Verification
- Reviewed the architecture risk review and updated the architecture doc to address all three CHANGES_REQUIRED issues.
- Ran `graphify update . --no-cluster` successfully.

## Risks
- Future implementation must keep the sanitizer in the domain layer so free-text never reaches analytics.
- Platform-specific features should not be reintroduced before an approved product need exists.

## Knowledge-store promotion status
- Reusable lessons were encoded as `knowledge_candidates` in `stages/20_ARCH_FINAL.md`.
- No separate knowledge-store promotion was needed in this run.
