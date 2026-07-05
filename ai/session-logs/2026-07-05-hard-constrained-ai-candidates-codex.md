---
date: 2026-07-05
actor: codex
topic: hard-constrained-ai-candidates
---

# Hard-Constrained AI Candidates Implementation

## User Request

성배님이 `칭찬해줘`/`잔소리해줘`의 상황·감정·톤·강도 선택이 실제 AI 후보 5개에 반영되지 않는 문제를 지적했고, 서브에이전트와 Claude를 포함해 P0/P1/P2까지 구현하라고 요청했다.

## Decisions Made

- 후보 5개는 서로 다른 tone이 아니라 같은 선택 조합 안의 표현 방식 변형으로 고정했다.
- AI 계약은 `constraintBundle(mode, locale, situation, feeling, tone, intensity)` + `expressionVariant` 5종으로 바꿨다.
- `expressionVariant` 순서: `short_sentence`, `action_suggestion`, `ack_then_act`, `notification_short`, `firmer_line`.
- `칭찬해줘`와 `잔소리해줘`는 같은 내부 enum을 쓰되 UI 라벨과 서버 프롬프트 semantic label은 모드별로 다르게 제공한다.
- 가로 스크롤 chip UI는 요약 행 + 선택 시트로 교체했다.
- AI가 반환한 `candidate.id`는 raw text smuggling 위험이 있어 폐기하고 `ai-1..ai-5`로 재발급한다.
- 신고 payload는 `style` 대신 `expressionVariant`를 정식 계약으로 사용한다. DB는 `expression_variant` 컬럼을 사용한다. Completion audit 후 서버/API의 legacy `style` alias도 제거했다.
- Apps in Toss runtime에서는 공식 알림 동의와 Smart Message 서버 경로가 완성되기 전까지 실제 브라우저 알림 대신 preview-only로 저장한다.
- 직접 입력/최종 저장/보관함 문장이 localStorage에 남을 수 있다는 고지와 전체 삭제 경로를 추가했다.

## Subagents / External Review

- `code-mapper`: 기존 흐름이 `style` 5종을 후보 톤처럼 강제하고, 선택축은 prompt metadata에만 약하게 들어간다고 분석했다.
- `worker`: `api/generate-candidates.ts`와 `supabase/functions/generate-candidates/index.ts`를 새 prompt/normalizer 계약으로 수정했다.
- `reviewer`: report DB schema old enum, AI-supplied candidate id 저장 위험, report contract naming 문제를 blocker로 지적했다.
- `toss-compliance-auditor`: report persistence 미완성, local free-text privacy 고지 부족, Apps in Toss 알림 경계 불일치를 blocker로 지적했다.
- Claude diff review: axis sheet focus/ESC, mode별 semantic label 필요성, serverless rate limit 한계를 추가로 지적했다.

## Files Changed

- `src/core/messageGeneration.ts`: constraint bundle, expression variant validation, canonical AI ids.
- `src/App.tsx`: mode-specific axis picker, candidate variant labels, report payload, privacy/settings UI, Toss preview-only notification handling.
- `src/i18n.ts`: mode-specific axis labels, candidate variant labels, privacy/notification copy.
- `src/styles.css`: summary-row axis picker, bottom-sheet option grid, candidate variant styles.
- `src/platform/adapters.ts`: Apps in Toss runtime notification preview-only gate.
- `api/generate-candidates.ts`, `supabase/functions/generate-candidates/index.ts`: hard constraint prompt, semantic labels, canonical ids.
- `api/report-candidate.ts`, `supabase/functions/report-candidate/index.ts`: expressionVariant contract, candidateId allowlist, expression_variant persistence.
- `supabase/migrations/20260704150000_praise_candidate_reports.sql`: fresh schema updated to `expression_variant`.
- `supabase/migrations/20260705125000_praise_candidate_reports_expression_variant.sql`: corrective migration for existing old `style` schema.
- `src/data/message-templates.v0.1.json`: removed remaining legacy `style` fields from template seed data.
- `public/privacy.html`: static privacy policy page.
- Tests: `test/messageGeneration.test.ts`, `test/App.test.tsx`, `test/LocalFirstI18n.test.tsx`, `test/candidateReporting.test.ts`, `test/generateCandidatesApi.test.ts`.
- `ai/plans/implementation-plan.md`: latest implementation result and change log.

## Verification

- `npm test -- test/messageGeneration.test.ts test/App.test.tsx`: passed during P0.
- `npm test -- test/messageGeneration.test.ts test/candidateReporting.test.ts`: passed after report hardening.
- `npm test -- test/App.test.tsx test/generateCandidatesApi.test.ts`: passed after axis sheet and prompt label work.
- `npm run typecheck`: passed.
- `npm test`: 20 files, 85 tests passed after completion-audit cleanup.
- `npm run build`: passed.
- `git diff --check -- src api supabase public test ai/plans/implementation-plan.md ai/session-logs/2026-07-05-hard-constrained-ai-candidates-codex.md`: passed.
- `/Users/kangsungbae/.codex/bin/graphify update . --no-cluster`: passed, graph rebuilt with 2992 nodes and 261329 edges.
- Browser QA on `http://127.0.0.1:5176/infinite-praise-app/`:
  - 320x720, 430x900, 1024x900 all showed 5 candidates.
  - Axis dialog opened and closed with Escape.
  - Candidate labels rendered as expression variants.
  - Settings privacy section and `/infinite-praise-app/privacy.html` link worked.
  - No console errors.
  - No horizontal overflow: scroll width matched viewport at all tested sizes.

## Remaining Risks

- Supabase remote DB migration and report `stored=true` insert were not applied/tested in this turn.
- Apps in Toss real push still requires official notification agreement, Smart Message template review, server mTLS call path, and policy review.
- Current Edge/local rate limit is in-memory and not persistent across serverless instances.
- Public deployment has not been redeployed in this turn.

## Continuation Audit

2026-07-05 goal continuation re-checked the current tree against the requested P0/P1/P2 scope. One residual mismatch was found: old `style` fields still existed in template seed data and report handlers accepted `style` as a legacy alias. Codex removed those remnants, renamed the UI label class to `candidate-variant`, and added test coverage that style-only report payloads are rejected.

## Stage Checklists

### P0 Hard Constraint Candidate Contract

- [x] Client creates and sends `constraintBundle(mode, locale, situation, feeling, tone, intensity)`.
- [x] Server prompt treats selected axes as hard constraints.
- [x] AI response must return the same `constraintBundle`.
- [x] Five candidates use expression variants in fixed order, not tone/style differences.
- [x] Client rejects style-only or mismatched candidates.
- [x] AI candidate IDs are reissued as `ai-1..ai-5`.

### P1 Mode-Specific Selection UX

- [x] `칭찬해줘` and `잔소리해줘` use mode-specific situation/feeling/tone/intensity labels.
- [x] Horizontal option scroll is replaced by summary rows plus a selection sheet.
- [x] Candidate cards label expression variants: short, action suggestion, acknowledge-then-act, notification, firmer line.
- [x] Axis picker has focus movement and Escape close behavior.
- [x] User generation context is not persisted to localStorage.

### P2 Subagent/Claude Findings And Guardrails

- [x] Subagent and Claude review findings were synthesized into the P2 scope.
- [x] Report payload uses `expressionVariant`; style-only report payloads are rejected.
- [x] Report persistence stores metadata only and rejects candidate-id text smuggling.
- [x] Local storage/privacy notices, static privacy page, and clear-local-data action are present.
- [x] Apps in Toss runtime keeps notifications preview-only until official Smart Message work is ready.
- [x] Tests, build, scoped whitespace check, and Graphify refresh passed.

## Knowledge Promotion

- No new global rule needed. This is project-specific implementation knowledge.
