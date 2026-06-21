# Session Log: 칭찬해줘/잔소리해줘 알림형 피벗 초안

Date: 2026-06-15
Actor/tool: codex

## User Request

사용자가 `무한칭찬앱` 기획을 `칭찬해줘`와 `잔소리해줘` 두 축으로 바꾸고,
커스터마이징 메시지, 시간 설정, 알림 발송 중심으로 가는 방향에 대한 기획 초안을 요청했다.
지스택과 슈퍼파워스 활용을 요청했다.

## Stage

`discovery + planning`

## Context Checked

- Superpowers `brainstorming` skill
- gstack `plan-ceo-review` skill
- Graphify query for current MVP/product structure
- `ai/plans/2026-06-13-praise-me-product-planning-review.md`
- `ai/plans/2026-06-08-praise-me-mvp-spec.md`
- `ai/plans/2026-06-07-instant-one-line-mvp-plan.md`
- `src/platform/adapters.ts`
- `ai/session-logs/2026-06-13-pairtune-rollback-platform-stubs.md`

## Decisions

- 이번 방향은 음성-first MVP보다 반복 사용 검증이 빠를 수 있다.
- 핵심 약속은 `내가 정한 시간에, 내가 고른 톤으로, 지금 필요한 말을 받아본다`로 잡는다.
- v0.1은 음성보다 메시지/시간 설정/알림 구조를 우선한다.
- `칭찬해줘`, `잔소리해줘`, `내가 쓸게` 세 흐름으로 나눈다.
- 실제 알림 구현은 platform adapter로 분리한다.
- 자동 음성 재생, AI 생성, 실시간 TTS, 계정, 결제, 광고 노출은 v0.1에서 제외한다.

## Files Changed

- `ai/plans/2026-06-15-praise-nag-reminder-pivot-draft.md`
- `ai/session-logs/2026-06-15-praise-nag-reminder-pivot-draft.md`

## Verification

- Planning-only session. No code or tests changed.
- `graphify update . --no-cluster`: passed. `graphify-out/graph.json` updated with 1122 nodes and 31247 edges.

## Remaining Risks

- `칭찬해줘`라는 이름이 `잔소리해줘` 모드를 품기에는 장기적으로 좁을 수 있다.
- 잔소리 문구는 비난/수치심을 만들지 않도록 강도와 문구 가이드가 필요하다.
- 실제 알림은 플랫폼별 권한/정책/스케줄링 제약 확인이 필요하다.

## Next Steps

1. 앱명을 유지할지, 상위 이름을 새로 잡을지 결정한다.
2. `칭찬/잔소리/직접 쓰기` v0.1 범위를 확정한다.
3. 시간 설정 UX를 와이어프레임으로 정리한다.
4. NotificationAdapter spec을 implementation plan으로 구체화한다.
