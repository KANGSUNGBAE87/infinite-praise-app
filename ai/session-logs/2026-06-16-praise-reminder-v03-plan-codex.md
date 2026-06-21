# 칭찬해줘 v0.3 구현 계획

Date: 2026-06-16
Actor: codex

## User Request

다음 단계 후보였던 1) 알림 관리 UX 보강, 2) 시간 설정 UX 개선, 3) 직접 쓰기 안전장치에 대해 상세 구현계획을 요청했다.

## Stage

Planning.

## Skills Used

- Superpowers `brainstorming`: 제품성 보강 범위와 구현 전 설계 관점 확인.
- Superpowers `writing-plans`: 파일 단위, 테스트 단위, 실행 순서 중심의 구현 계획 작성.

## Decisions

- v0.3은 실제 플랫폼 알림 구현 전 제품성 보강으로 정의한다.
- 실제 알림 권한 요청, 스마트 발송, 로그인, 결제, 광고, AI/API는 v0.3 범위에서 제외한다.
- 알림을 끄면 사라지는 것이 아니라 `꺼진 알림` 섹션에서 다시 켤 수 있게 한다.
- 시간 설정은 프리셋을 유지하면서 native `<input type="time">`을 추가한다.
- 직접 쓰기 안전장치는 AI 없이 로컬 rule 기반으로 시작한다.
- safety 상태는 `safe`, `caution`, `blocked`로 나누고, caution은 저장 가능, blocked는 저장 불가로 둔다.

## Files Changed

- `ai/plans/implementation-plan.md`
  - v0.3 Implementation Plan 섹션 추가.
  - version `0.4`, status `planned-v0.3`로 갱신.
- `ai/session-logs/2026-06-16-praise-reminder-v03-plan-codex.md`
  - 이번 계획 세션 기록.

## Verification

- 계획/문서 작업이므로 앱 테스트와 빌드는 실행하지 않았다.

## Next Steps

1. v0.3 구현을 시작한다면 `messageSafety`와 `time` domain tests부터 작성한다.
2. 이후 `ReminderScheduleFields`, `MessageSafetyNotice`를 만들고 create/detail/home 순서로 연결한다.
3. 구현 완료 후 `npm test`, `npm run build`, Playwright QA, reviewer/toss audit를 실행한다.

## Knowledge Promotion

- 아직 프로젝트 로컬 계획으로 충분하다.
- 직접 쓰기 safety rule이 안정화되면 `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/` 승격 후보로 검토한다.
