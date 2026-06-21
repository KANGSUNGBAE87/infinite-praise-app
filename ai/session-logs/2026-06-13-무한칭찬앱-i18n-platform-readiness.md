# 무한칭찬앱 i18n/platform readiness

Date: 2026-06-13
Actor/tool: codex

## User Request

- 한국어/영어를 선택할 수 있게 하고, 나중에 다른 언어를 추가할 수 있는 구조를 준비한다.
- 로그인, 결제/IAP, 광고를 Apps in Toss와 Google Play 모두로 옮길 수 있게 미리 준비한다.

## Decisions

- 한국어 기본/영어 선택 i18n 레이어를 새로 추가하고, 기존 auth/payment/ads MVP adapter 준비 상태를 화면과 테스트로 확인했다.
- Apps in Toss first because it is non-game, while preserving Google Play compatibility.
- SDK 직접 연동은 이번 단계에서 하지 않고 adapter seam과 MVP stub/test를 먼저 둔다.

## Files Changed

- i18n/locale source and UI language selector files.
- platform adapter interfaces/stubs for auth, payment/IAP, and ads where missing.
- tests for locale support and platform adapter readiness.
- ai/plans/implementation-plan.md updated as the canonical latest implementation note.

## Verification

- npm test: 11 files, 32 tests passed
- npm run build: passed

## Remaining Risks

- 영어 화면 문구와 텍스트 칭찬은 제공되지만, 현재 오디오 에셋은 한국어 중심이라 영어 음성팩은 별도 제작이 필요하다.
- Store receipt verification and paid entitlement activation still require backend implementation before production monetization.

## Knowledge Promotion

- Reusable global rule already exists in 지식저장소 app platform/i18n standard.
- Project-specific platform note updated in 지식저장소/projects/무한칭찬앱/platform.md.
