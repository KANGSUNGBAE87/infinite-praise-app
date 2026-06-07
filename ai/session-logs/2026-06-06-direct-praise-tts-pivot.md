# Session Log: Direct Praise TTS Pivot

Date: 2026-06-06
Actor/tool: codex

## User Request

Review the existing plan, question whether LLM is necessary, and pivot the
product toward direct self-praise buttons. The user confirmed that praise should
combine situation and emotion, and that voice should start as a small TTS layer.

## Decisions

- MVP center changed from LLM-generated evidence praise to user-driven direct
  praise.
- Main flow is situation selection plus emotion tone selection.
- Initial situations: endured, started, finished, rested, held back, cared,
  brave.
- Initial moods: tired, anxious, numb, proud, angry, guilty, calm.
- Evidence-based praise/reporting is a submenu, not the main product loop.
- MVP excludes LLM, backend proxy, API keys, HealthKit, Health Connect, and
  Screen Time.
- Voice starts with a small TTS approach through `TtsAdapter`; fallback is a
  small bundled audio set if platform TTS is blocked.
- Personalization starts with local rules and app-internal history, not LLM.

## Files Changed

- `ai/plans/2026-06-06-product-spec.md`
- `ai/plans/2026-06-06-implementation-plan.md`
- `ai/plans/README.md`
- `ai/plans/2026-06-06-situation-emotion-tts-spec.md`
- `ai/plans/2026-06-06-non-llm-tts-implementation-plan.md`
- `ai/session-logs/2026-06-06-direct-praise-tts-pivot.md`
- `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/context.md`
- `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/platform.md`

## Verification

- Located the existing product spec and implementation plan.
- Confirmed the previous plan was LLM/Claude Haiku centered.
- Replaced the active planning direction with a non-LLM, local TTS MVP.
- Refreshed the project graph structurally with
  `/Users/kangsungbae/.codex/bin/graphify update . --no-cluster`.

## Remaining Risks

- Apps in Toss runtime support for direct platform TTS must be verified during
  implementation.
- If direct TTS is blocked, the MVP should use bundled short audio clips.
- The praise catalog needs careful writing so repeated praise does not feel
  generic.

## Next Steps

1. Review the new spec with the user.
2. Scaffold the Apps in Toss React Native project if not already present.
3. Implement storage, praise catalog, selector, TTS adapter, and main flow.

## Knowledge Promotion

Project-specific context was promoted to
`/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/context.md`.
