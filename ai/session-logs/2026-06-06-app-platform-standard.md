# Session Log: App Platform Standard

Date: 2026-06-06
Actor/tool: codex

## User Request

Apply the rule that app projects should be built for Apps in Toss first while
keeping Google Play Store portability, with login, ads, and in-app purchase
planned from the beginning.

## Decisions

- `무한칭찬앱` follows the shared standard in
  `/Users/kangsungbae/Documents/지식저장소/docs/workflows/app-platform-standard.md`.
- React Native with `@apps-in-toss/framework` remains the best portability path
  from the current plan.
- Backend proxy remains required for LLM calls, rate limiting, purchase
  verification, and entitlement state.
- Auth, ads, IAP, storage, and LLM transport should stay behind adapters.

## Files Changed

- `AGENTS.md`
- `CLAUDE.md`
- `.graphifyignore`
- `.understand-anything/config.json`
- `ai/README.md`
- `ai/plans/README.md`
- `ai/session-logs/README.md`
- `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/context.md`
- `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/platform.md`

## Verification

- Confirmed `AGENTS.md` and `CLAUDE.md` match.
- Ran project Graphify structural refresh with
  `/Users/kangsungbae/.codex/bin/graphify update . --no-cluster`.

## Knowledge Promotion

Promoted to shared knowledge store as confirmed app-development policy.
