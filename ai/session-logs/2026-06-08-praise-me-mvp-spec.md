# Session Log: 칭찬해줘 MVP 기획 계속

Date: 2026-06-08
Actor/tool: codex

## User Request

사용자는 배우/캐릭터 목소리 흉내와 실제 영화 음성 클립은 쓰지 않는다는 기준을 확정했고,
그 기준으로 Superpowers와 gstack을 활용해 기획을 계속 시작해 달라고 요청했다.
이후 앱명은 `멘탈 한마디`가 아니라 `칭찬해줘`가 맞고, 버튼은 5개, 후보는 권장후보 25개라고 정정했다.

## Stage

`spec/planning`

## Skills / Frames Used

- Superpowers brainstorming: 구현 전 기획 기준을 먼저 고정하는 방식으로 사용했다.
- gstack plan-ceo-review: `SELECTIVE EXPANSION + HOLD SCOPE`로 판단했다.

## Decisions Made

- 앱명은 `칭찬해줘`로 정정했다.
- `멘탈 한마디`는 앱명이 아니라 기획 과정의 방향성/카테고리 프레임 후보로 남겼다.
- MVP의 핵심 약속은 "3초 안에 지금 필요한 한마디를 좋은 목소리로 들려준다"로 정의했다.
- 버튼은 요청형 카피 5개로 유지했다.
  - `응원해줘!`
  - `진정시켜줘!`
  - `위로해줘!`
  - `괜찮다고 해줘!`
  - `잘했다고 해줘!`
- 명대사/명언/밈 텍스트는 핵심 콘텐츠로 보되, 오디오는 중립 생성 음성이나 라이선스 음성으로 새로 만든다.
- 실제 영화/드라마 음성 클립, 배우/캐릭터 목소리 흉내, 장면 재현은 제외한다.
- 구현 전 기준 문서로 `ai/plans/2026-06-08-praise-me-mvp-spec.md`를 추가했다.
- 버튼은 5개로 확정하고, QuotePack은 권장후보 25개를 출발점으로 삼는다.

## Files Changed

- Added `ai/plans/2026-06-08-praise-me-mvp-spec.md`
- Added `ai/session-logs/2026-06-08-praise-me-mvp-spec.md`

## Verification

- 기존 `QuotePack v0.1` 리서치 문서와 카테고리 리서치 문서를 읽고 새 기획안과 충돌이 없도록 정리했다.
- 공유 컨텍스트의 최신 결정과 일치하도록 작성했다.

## Remaining Risks

- 최종 25문장은 아직 확정되지 않았다.
- ElevenLabs 음성 파일은 아직 준비되지 않았다.
- 영화/드라마 대사 텍스트 사용 시 저작권/상표/번역권 리스크는 여전히 개별 검토가 필요하다.
- 현재 앱 구현은 아직 새 5버튼/QuotePack 구조로 바뀌지 않았다.

## Next Steps

- 사용자가 v0.2 기획안을 승인하거나 수정한다.
- 승인 후 구현 계획으로 넘어간다.
- 구현 계획에서는 QuotePack manifest, AudioPlayer, ReminderAdapter, UI 5버튼 개편을 다룬다.

## Knowledge Promotion

공유 컨텍스트에는 `칭찬해줘` v0.2 기획안 포인터와 핵심 약속을 반영했다.
다만 문서 상태는 `approval-needed`이므로, 사용자 승인 후 Graphify refresh를 진행하는 것이 좋다.
