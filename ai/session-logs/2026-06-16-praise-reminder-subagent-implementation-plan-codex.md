# 칭찬해줘 v0.1/v0.2 서브에이전트 구현 계획

Date: 2026-06-16
Actor: codex

## User Request

`칭찬해줘` 알림형 MVP에서 v0.1을 구현하고 바로 v0.2를 구현하고 싶지만, 그 전에 서브에이전트를 활용해서 구현할 수 있을지 계획을 먼저 요청했다.

## Stage

Planning.

## Skills And Agents Used

- Superpowers `writing-plans`: 구현 전 계획 문서 작성 기준 확인.
- Superpowers `subagent-driven-development`: 작업 단위별 구현/리뷰 흐름 확인.
- Superpowers `dispatching-parallel-agents`: 병렬 가능한 범위와 충돌 위험 확인.
- Subagent `code-mapper`: 현재 코드 영향 범위와 파일 분해안 조사.
- Subagent `planner`: v0.1/v0.2 완료 기준과 작업 분해 제안.
- Subagent `toss-compliance-auditor`: Apps in Toss/Google Play, 로그인/결제/광고/알림 adapter 준비 위험 점검.

## Decisions

- 서브에이전트 사용은 가능하되, 같은 파일을 동시에 수정하는 병렬 구현은 피한다.
- v0.1은 로컬 저장 기반 알림 설계 MVP로 구현한다.
- v0.2는 상세/반응/스누즈/건너뛰기/알림 capability UX로 확장한다.
- 실제 안정 플랫폼 알림, 로그인, 결제, 광고, 서버, 음성 재생은 v0.1/v0.2 완료 기준에서 제외한다.
- `AuthAdapter`, `PaymentAdapter`, `AdsAdapter` 외에 `StorageAdapter`, `AnalyticsAdapter`, `NotificationAdapter`를 구현 계획의 필수 경계로 추가한다.
- `App.tsx`는 feature/domain/platform 경계로 분리한다.

## Files Changed

- `ai/plans/implementation-plan.md`
  - 알림형 MVP v0.1 + v0.2 연속 구현 canonical 계획으로 갱신.
- `ai/session-logs/2026-06-16-praise-reminder-subagent-implementation-plan-codex.md`
  - 이번 계획 수립과 subagent 결과 요약 기록.

## Verification

- 계획/문서 작업이라 앱 빌드와 테스트는 실행하지 않았다.
- `graphify update . --no-cluster` 실행 완료.
  - 마지막 실행 출력: 1216 nodes, 36896 edges.

## Remaining Risks

- v0.2 실제 알림은 Apps in Toss 스마트 발송/알림 동의/Android 권한 문서 재확인 전에는 들어가면 안 된다.
- `잔소리` 문구는 수치심/모욕으로 보이지 않도록 데이터 테스트와 리뷰가 필요하다.
- 기존 오디오 MVP 테스트는 알림형 MVP로 바꾸며 대폭 갱신이 필요하다.

## Next Steps

1. v0.1 Milestone A부터 TDD로 구현한다.
2. v0.1 완료 후 테스트/빌드/브라우저 QA를 통과시키고 session log를 남긴다.
3. v0.1 green 이후 v0.2 Milestone C를 구현한다.
4. v0.2 완료 후 reviewer와 toss compliance auditor를 실행한다.

## Knowledge Promotion

- 현재는 프로젝트 로컬 구현 계획으로 충분하다.
- 실제 v0.1/v0.2 구현 완료 후, adapter 경계와 알림 플랫폼 판단은 `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/platform.md` 승격 후보로 남긴다.
