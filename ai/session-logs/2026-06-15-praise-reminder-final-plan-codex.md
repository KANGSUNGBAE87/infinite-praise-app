# 칭찬해줘 알림형 MVP 최종 기획 정리

Date: 2026-06-15
Actor: codex

## User Request

사용자가 추가 작성한 `칭찬해줘 알림형 MVP 통합 기획안 v0.3`을 바탕으로, 기존 의견과 합쳐 최종적으로 어떤 방식으로 기획할지 검토하고 최종 기획안을 요청했다.

## Stage

Planning / product review.

## Skills and References

- Superpowers brainstorming 관점으로 모호한 제품 전환을 정리했다.
- gstack CEO/founder review 관점으로 상품성, 유지율, MVP 범위를 검토했다.
- 앱인토스 개발 표준과 개발 전 게이트를 확인해 비게임 앱, 플랫폼 어댑터, 정책 리스크 관점을 반영했다.

## Decisions

- v0.1은 기존 `5버튼 즉시 음성 재생`이 아니라 `알림형 자기 조율 메시지 앱`으로 전환한다.
- 앱명은 `칭찬해줘`를 유지한다.
- 내부 모드는 `칭찬`, `잔소리`, `직접 쓰기` 세 가지로 잡는다.
- v0.1은 음성, AI, 실시간 TTS, 결제, 광고, 계정, 서버를 제외한다.
- v0.1은 메시지 선택/수정, 시간 프리셋, 반복 설정, 알림 표시 방식, 활성 알림 목록, 오늘 받을 메시지, localStorage 저장, NotificationAdapter stub 중심으로 설계한다.
- 실제 안정 알림은 웹 단독으로 보장하기 어렵기 때문에 NotificationAdapter 뒤에서 앱 플랫폼 연동 단계에 완성한다.
- 의료/상담/치료 표현은 금지하고, `가벼운 자기 조율 알림 앱`으로 포지셔닝한다.

## Files Changed

- `ai/plans/product-plan.md`
  - 칭찬해줘 알림형 MVP 최종 기획안 v0.3 canonical 최신 문서로 작성.
- `ai/session-logs/2026-06-15-praise-reminder-final-plan-codex.md`
  - 이번 기획 검토와 결정사항 기록.

## Verification

- 문서 작성 작업이라 앱 빌드/테스트는 실행하지 않았다.
- `graphify update . --no-cluster` 실행 완료.
  - 마지막 실행 출력: 1165 nodes, 34580 edges.

## Remaining Risks

- 브라우저 기반 MVP만으로는 앱이 닫힌 뒤 정해진 시간에 알림을 안정적으로 보장하기 어렵다.
- 알림 권한 요청 UX와 실제 플랫폼 알림 연동은 v0.2 구현 전 별도 검토가 필요하다.
- `잔소리` 문구는 불쾌감/수치심 리스크가 있어 문구 검수 규칙을 계속 유지해야 한다.

## Next Steps

1. `ai/plans/implementation-plan.md`를 알림형 MVP 기준으로 재작성한다.
2. 기존 5버튼/오디오 UI에서 알림 생성 중심 UI로 구현 범위를 전환한다.
3. MessageTemplate, Reminder, NotificationAdapter stub을 코드 구조에 반영한다.
4. 디자인은 홈, 새 알림 만들기, 메시지 선택, 시간 선택, 저장 미리보기 순서로 적용한다.

## Knowledge Promotion

- 현재 결정은 프로젝트 로컬 `ai/plans/product-plan.md`와 `ai/session-logs/`에 보존했다.
- 반복 재사용 가능한 앱 플랫폼 결정이 더 굳어지면 `/Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/platform.md` 또는 제품 노트로 승격한다.
