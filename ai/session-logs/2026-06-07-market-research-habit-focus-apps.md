# Session Log: Market Research for Habit and Focus Apps

Date: 2026-06-07
Actor/tool: codex

## User Request

Compare Challengers, MyRoutine, Routinery, Alarmy, Turning, and Lock In/LockOn-type apps against the current `무한칭찬앱` plan. Analyze strengths, weaknesses, and ways to improve implementation based on those apps. Use gstack and Superpowers skills if available.

## Stage

`discovery / spec`

## Skills / Workflow

- Used Superpowers `brainstorming` as the product-idea structuring layer.
- Used gstack `office-hours` lens for demand reality, status quo, narrow wedge, and future-fit analysis.
- Used project Graphify query before broad manual project reading because `graphify-out/graph.json` exists.

## Decisions

- Keep the current non-LLM, local TTS MVP direction.
- Do not compete directly as a full routine planner, app blocker, alarm app, or money-staked challenge app.
- Position `무한칭찬앱` as a low-friction self-recognition layer after hidden effort, routine failure, focus attempts, or emotionally hard days.
- Borrow competitor mechanisms only after translating them into a non-punitive praise model.

## Files Changed

- `ai/plans/2026-06-07-market-research-habit-focus-apps.md`
- `ai/session-logs/2026-06-07-market-research-habit-focus-apps.md`
- `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/market-research.md`

## Verification / Sources

- Checked current project graph with `graphify query`.
- Read current product spec and implementation plan.
- Checked public App Store, Google Play, and official/press pages for the comparison apps.
- Ran project Graphify structural refresh: `graphify update . --no-cluster`.
- Ran shared knowledge-store Graphify structural refresh: `graphify update . --no-cluster`.

## Remaining Risks

- `Turning`, `Lock In`, and app-blocking competitors depend on platform APIs that Apps in Toss MVP may not support.
- `Challengers` public positioning has shifted toward shopping/payback, so older habit-challenge press should be treated as historical context.
- This is market/product planning, not user interview evidence.

## Next Steps

1. Update the implementation plan with `depth`, `reaction`, and "praise receipt" additions if approved.
2. Expand the praise catalog to include phone/focus recovery examples without adding app-locking features.

## Knowledge Store Promotion

Promoted a concise project-level market research note to `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/market-research.md`.
