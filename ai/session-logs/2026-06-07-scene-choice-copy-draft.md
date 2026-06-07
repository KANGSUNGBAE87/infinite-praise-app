# Session Log: Scene Choice Copy Draft

Date: 2026-06-07
Actor/tool: codex

## User Request

Draft better user-selectable phrases that fit the product-facing name
`잘하고 있음`, because the current choices feel too weak and too much like
plain category selection.

## Decision

Move the first-screen choices from category labels to scene lines. Keep the old
situation/mood labels as internal tags, but show users phrases that feel like
recognizing a real moment from their day.

## Files Changed

- `ai/plans/2026-06-07-scene-choice-copy-draft.md`
- `ai/session-logs/2026-06-07-scene-choice-copy-draft.md`

## Notes

The strongest new candidate choices are:

- 오늘을 끝까지 데리고 왔어
- 작게라도 손을 댔어
- 쉬었지만 사라진 건 아니야
- 나를 놓치지 않았어
- 다시 돌아왔어

The next implementation should decide whether `다시 돌아왔어` becomes a new
internal situation (`returned`) or maps to the existing `started` situation.
