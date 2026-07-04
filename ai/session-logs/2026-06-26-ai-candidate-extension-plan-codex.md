---
date: 2026-06-26
actor: codex
topic: AI 후보 선택형 확장 최종 추가기획안
---

# Session Log

## User Request

첨부 문서 전체를 분석하고, 서브에이전트를 활용해서 더 좋은 방법이 있을지까지 생각한 뒤 최종 추가기획안을 달라는 요청.

## Context Checked

- `GOAL.md`
- `PLAN.md`
- `STATUS.md`
- `ai/plans/product-plan.md`
- `src/platform/adapters.ts`
- `src/data/message-templates.v0.1.json`
- `src/core/analyticsSanitizer.ts`
- 첨부 문서 `/Users/kangsungbae/.codex/attachments/2906b046-eb5f-4cc7-9381-f7382c66447b/pasted-text.txt`

## Subagents Used

- `planner`: MVP slicing and priority review
- `market-ux-researcher`: naming, UX, target clarity review
- `code-mapper`: current code impact and file-boundary mapping
- `toss-compliance-auditor`: Apps in Toss, Google Play, AI, notification, privacy gate review

## Decisions

- 기존 앱은 폐기하지 않는다.
- `칭찬해줘` 공개명은 단기 유지한다.
- `한마디 해줘` / `One Line for Me`는 v0.6 이후 리브랜딩 후보로 둔다.
- 첨부안의 AI-first 순서는 조정한다.
- 우선순위는 `비AI 모드 확장 -> 보관함 강화 -> 선택형 AI 후보 -> 실제 알림`이다.
- 실제 알림 전까지 UI는 `저장`, `미리보기`, `다시 보기`로 표현한다.
- AI 도입 시 서버 프록시, 고지, 라벨, 신고, 안전 차단, 개인정보/Data Safety 재검토를 필수로 둔다.

## Files Changed

- Added `ai/plans/2026-06-26-ai-candidate-extension-final-plan.md`
- Added `ai/session-logs/2026-06-26-ai-candidate-extension-plan-codex.md`

## Verification

- Read-only planning session plus documentation update.
- No application code changed in this session.
- Tests were not run because the changes are documentation-only.

## Remaining Risks

- Apps in Toss에서 AI 한줄 생성이 일반 생성형 AI인지 AI 상담 인접 기능인지 구현 전 공식 확인 필요.
- Smart Message에서 사용자 자유입력/AI 원문을 알림 본문에 사용할 수 있는 범위 확인 필요.
- 실제 AI/알림/로그인/분석 SDK가 붙는 순간 개인정보처리방침과 Google Play Data Safety를 실제 바이너리 기준으로 재작성해야 한다.

## Next Steps

1. Owner가 추가기획안을 승인하면 v0.5a 구현계획을 별도 작성한다.
2. v0.5a 구현은 AI 없이 모드 선택과 nag 템플릿 연결부터 시작한다.
3. v0.6 AI 베타 전 공식 정책 원문을 다시 확인한다.

## Knowledge Promotion

Project-local plan and session log were written. Cross-project promotion is not needed yet; this is specific to `칭찬해줘`.
