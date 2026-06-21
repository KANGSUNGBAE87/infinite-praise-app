# 칭찬해줘 알림형 MVP v0.1/v0.2 구현

Date: 2026-06-16
Actor: codex

## User Request

계획대로 서브에이전트를 활용해서 `칭찬해줘` 알림형 MVP v0.1을 구현하고, 바로 v0.2 범위까지 구현해달라고 요청했다.

## Stage

Implementation + Review + QA.

## Skills And Agents Used

- Superpowers `subagent-driven-development`: 서브에이전트 구현/리뷰 흐름 확인.
- Superpowers `test-driven-development`: 핵심 도메인/저장소/UI 동작을 테스트 먼저 추가 후 구현.
- Superpowers `requesting-code-review`: 구현 후 리뷰어/플랫폼 감사 에이전트 요청.
- Superpowers `receiving-code-review`: 리뷰 block 항목을 코드 기준으로 검증하고 수정.
- Superpowers `verification-before-completion`: 완료 전 테스트/빌드/브라우저 흐름 검증.
- Subagent `worker`: 메시지 템플릿 초안/검토 보조.
- Subagent `reviewer`: v0.2 계약 위반 항목 리뷰.
- Subagent `toss-compliance-auditor`: Apps in Toss/Google Play/platform boundary 리뷰.

## Decisions Made

- 기존 5버튼 즉시 음성 MVP는 보류하고, 알림형 자기 조율 메시지 앱으로 구현했다.
- 실제 알림 전송은 구현하지 않고, `NotificationAdapter`는 `preview_only` stub으로 유지했다.
- 로그인/결제/광고는 실제 SDK 없이 `AuthAdapter`, `PaymentAdapter`, `AdsAdapter` stub만 준비했다.
- 저장 경계는 `PlatformAdapters.storage` 뒤로 이동했다. `App`/`ReminderApp`에서 `window.localStorage` 직접 접근을 제거했다.
- `displayMode=private`는 홈/활성 목록에서 본문을 숨기고, 상세 화면에서만 원문을 보여준다.
- 영어 UI에서 built-in template을 저장하면 실제 reminder 문구도 영어로 저장되도록 했다.
- `10분 뒤 다시`와 `오늘은 건너뛰기`는 로컬 preview schedule 계산에 반영되도록 occurrence action을 소비한다.

## Files Changed

- `src/App.tsx`
  - locale shell과 platform adapter 생성만 담당하도록 정리.
- `src/platform/adapters.ts`
  - storage, analytics, notification adapter stub 추가 및 storage key-value seam 구현.
- `src/domain/reminders/schema.ts`
  - reminder, template, reaction, occurrence action 타입 추가.
- `src/domain/reminders/repository.ts`
  - reminder/reaction/occurrence action local repository와 malformed row validation 구현.
- `src/domain/reminders/schedule.ts`
  - today/next occurrence 계산, snooze/skip action 반영 구현.
- `src/domain/reminders/templates.ts`
  - message template 조회 유틸 구현.
- `src/data/message-templates.v0.1.json`
  - 칭찬/잔소리 템플릿 15개 추가.
- `src/features/reminder/*`
  - 홈, 생성, 상세 화면 구현.
- `src/i18n.ts`
  - 알림형 MVP copy, mode/repeat/display/template 번역 추가.
- `src/styles.css`
  - 알림형 홈/카드/폼/상세 UI 스타일 추가.
- `test/*`
  - reminder schema/repository/schedule/template/platform/App/i18n 테스트 추가 및 갱신.
- `ai/plans/implementation-plan.md`
  - v0.1/v0.2 구현 완료 상태와 검증 결과 반영.

## Verification

- `npm test`
  - 15 test files passed.
  - 57 tests passed.
- `npm run build`
  - TypeScript check passed.
  - Vite production build passed.
- Browser QA
  - in-app Browser: 홈 로드, 초기 생성/상세 흐름 일부 검증 성공.
  - in-app Browser 이후 tab attach가 불안정해져 headless Playwright로 대체 검증.
  - Headless Playwright checks passed:
    - private reminder home masking and detail original text.
    - English built-in template persists as English.
    - detail liked/snooze/skip status.
    - no console errors.
- Knowledge graph
  - `graphify update . --no-cluster` 실행 완료.
  - 출력: 1328 nodes, 38301 edges.
  - Understand-Anything refresh는 스킬 흐름이 `.understandignore` 검토 후 사용자 확인을 요구해 이번 자동 마무리에서는 실행하지 않았다.

## Review Results

초기 reviewer/toss audit는 `BLOCK`이었다.

- 영어 locale built-in template이 한국어로 저장됨.
- snooze/skip이 저장만 되고 schedule/home preview에 반영되지 않음.
- `displayMode=private`가 홈/활성 목록에서 본문을 숨기지 않음.
- storage adapter seam이 정의만 되고 실제 흐름에 연결되지 않음.
- repository validation이 element-level malformed row를 걸러내지 않음.

수정 후 조치:

- locale-aware template 저장 경로 수정.
- occurrence action을 schedule calculation에 반영.
- private display masking 적용.
- App/ReminderApp storage 경계를 adapter 뒤로 이동.
- repository malformed row guard와 legacy action revive 추가.
- 관련 테스트 추가 후 전체 테스트/빌드/브라우저 QA 통과.

수정 후 재리뷰:

- `reviewer`: PASS. 이전 block 5개 모두 해소 확인.
- `toss-compliance-auditor`: NEEDS_DOC_CHECK. 코드 block은 없고, 실제 출시 전 Apps in Toss/Google Play 문서와 콘솔 선언 확인 필요.

## Remaining Risks

- 실제 안정 알림은 아직 구현하지 않았다. Apps in Toss 알림 동의/스마트 발송 문서를 다시 확인한 뒤 v0.3 이상에서 구현해야 한다.
- 사용자 직접 입력 메시지는 안전 가드가 없다. shame/body/diagnosis 계열 입력 제한이나 안내는 후속 검토가 필요하다.
- 실제 로그인/결제/광고는 adapter stub 상태다. SDK 연결 시 Apps in Toss/Google Play별 adapter 구현과 backend entitlement verification이 필요하다.
- in-app Browser attach가 중간에 불안정했다. 앱 기능은 headless Playwright로 대체 검증했다.

## Next Steps

1. v0.3에서 실제 알림 후보를 정할지, 아니면 먼저 메시지 편집 UX/목록 관리 UX를 다듬을지 결정한다.
2. Apps in Toss 알림 동의/스마트 발송 공식 문서를 다시 확인한다.
3. 사용자 직접 입력 메시지의 안전 UX를 설계한다.
4. 실제 로그인/결제/광고는 adapter 구현 전까지 계속 stub으로 유지한다.

## Knowledge Promotion

- adapter 경계, preview-only 알림 판단, Apps in Toss 우선 출시 원칙은 프로젝트 플랫폼 문서 승격 후보.
- 이번 구현 세부 내용은 우선 프로젝트 로컬 `ai/plans/implementation-plan.md`와 이 세션로그에 기록한다.
