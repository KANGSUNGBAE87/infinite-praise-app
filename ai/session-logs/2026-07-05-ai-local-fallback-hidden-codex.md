---
date: 2026-07-05
actor: codex
topic: AI local fallback candidate removal
---

# AI local fallback candidate removal

## User Request

- 로컬 저장/템플릿 후보가 AI 후보 화면에 뜨지 않게 변경.

## Decisions

- `/api/generate-candidates`가 없거나 실패하면 로컬 fallback 후보 5개를 사용자에게 보여주지 않는다.
- AI 실패/미연결 상태는 `ai.unavailable` 안내만 표시한다.
- `message-templates.v0.1.json`은 현재 UI fallback이 아니라 taxonomy seed, 테스트, 향후 CMS 이관 기준으로 유지한다.

## Files Changed

- `src/core/messageGeneration.ts`
- `src/App.tsx`
- `src/i18n.ts`
- `test/messageGeneration.test.ts`
- `test/LocalFirstI18n.test.tsx`
- `ai/plans/product-plan.md`
- `ai/plans/implementation-plan.md`
- `ai/plans/design-plan.md`

## Verification

- Red tests first:
  - `npm test -- --run test/messageGeneration.test.ts` failed because network fallback still returned `decision: ok`.
  - `npm test -- --run test/LocalFirstI18n.test.tsx` failed because `기본 후보` cards still rendered.
- Green targeted tests:
  - `npm test -- --run test/messageGeneration.test.ts`
  - `npm test -- --run test/LocalFirstI18n.test.tsx`
- Full verification:
  - `npm test -- --run` -> 19 files / 77 tests passed.
  - `npm run build` -> TypeScript and Vite production build passed.
  - Browser check at `http://127.0.0.1:5174/infinite-praise-app/` -> AI proxy unavailable path showed 0 candidate cards, no `기본 후보`, and only the AI connection notice.
  - Browser console error check -> no errors.
  - `graphify update . --no-cluster` -> graph updated.

## Remaining Risks

- GitHub Pages and plain Vite still cannot run `/api/generate-candidates`; AI candidates require a real server proxy or serverless dev runner.
- The internal template catalog remains in code for future CMS/content use, but it is no longer exposed as generated candidates when AI is unavailable.

## Knowledge Promotion

- Project-local canonical plans were updated. No separate global knowledge promotion needed.
