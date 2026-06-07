# Session Log: UI Product Review

Date: 2026-06-07
Actor/tool: codex

## User Request

Review the current implementation and planning because the app feels weaker than
the user's intent. Assess whether the current UI is too much like simple
selection and whether an open LLM is the only way to improve it.

## Stage

`review / discovery / planning`

## What Was Checked

- `graphify query` for current implementation, market research, and LLM need.
- Current implementation files under `src/`.
- Current product brief and market research documents.
- Drama/dialogue praise research document.
- TTS CLI preparation.
- Browser screenshots of the current app.

## Verification

- `npm test`: 9 files, 27 tests passed.
- `npm run build`: passed.
- Local Vite server ran at `http://127.0.0.1:5175/`.
- Playwright screenshots created:
  - `ai/session-logs/2026-06-07-ui-review-desktop.png`
  - `ai/session-logs/2026-06-07-ui-review-result.png`
  - `ai/session-logs/2026-06-07-ui-review-mobile.png`
- Refreshed the project graph structurally with
  `/Users/kangsungbae/.codex/bin/graphify update . --no-cluster`.

## Findings

- The implementation works, but the product experience is still too form-like.
- The first screen exposes all situation and mood choices instead of creating a
  scene.
- The result card is not emotionally strong enough because it sits beside the
  form instead of becoming a full voice moment.
- The receipt card is visible too early and the empty state weakens the first
  impression.
- The copy engine has improved, but it has not yet adopted the `sceneNeed` /
  `voiceBeat` structure from the drama/dialogue research.
- Open LLM is not the first answer. UX and scene design should be upgraded
  before adding LLM-generated text.

## Files Changed

- `ai/plans/2026-06-07-ui-product-upgrade-plan.md`
- `ai/session-logs/2026-06-07-ui-product-review.md`
- `ai/session-logs/2026-06-07-ui-review-desktop.png`
- `ai/session-logs/2026-06-07-ui-review-result.png`
- `ai/session-logs/2026-06-07-ui-review-mobile.png`
- `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/context.md`

## Next Step

Implement the upgrade plan in this order:

1. `scene line catalog`.
2. Scene-first home.
3. Full-screen voice stage result.
4. Reward-style receipt.
5. 20-second `조금 더 듣기` routine.
6. TTS sample comparison.

## Knowledge Promotion

Promoted project-specific UX direction to
`/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/context.md`.
