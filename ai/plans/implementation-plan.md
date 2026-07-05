---
version: 0.8.1
status: completion-audited-hard-constrained-ai-candidates
updated: 2026-07-05
canonical: true
project: 내편한마디
topic: AI candidate + notification implementation plan
---

# 칭찬해줘 알림형 MVP 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` for implementation task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not start v0.2 until v0.1 is green.

## Goal

`칭찬해줘`를 기존 reminder/voice MVP에서 승인된 6-screen praise/check-in flow로 전환한다. 1차 목표는 local-first, i18n, trust-safe analytics, 최소 platform boundary를 갖춘 구조로 바꾸는 것이며, 알림/광고/결제/로그인은 승인된 시점까지 구현하지 않는다.

## Implementation Result

2026-07-05 Codex 구현 기준으로 AI 후보 생성이 선택 조합 hard constraint 구조로 전환됐다.

- Screen 2 축은 `칭찬해줘`/`잔소리해줘` 모드별로 다른 라벨과 의미를 갖는다.
- 축 선택 UI는 가로 스크롤 chip 대신 요약 행 + 선택 시트로 바뀌었다.
- AI 요청은 `constraintBundle(mode, locale, situation, feeling, tone, intensity)`을 전송하고, 응답도 같은 bundle과 `expressionVariant` 5종을 요구한다.
- 후보 5개 차이는 tone 차이가 아니라 `짧은 한마디`, `행동 제안형`, `인정 후 제안형`, `알림용 한 줄`, `단호 정리형` 표현 방식 차이로 고정됐다.
- AI가 반환한 candidate id는 폐기하고 `ai-1..ai-5`로 재발급한다. 신고 endpoint와 DB constraint도 raw text smuggling을 막기 위해 candidate id allowlist를 적용한다.
- 신고 계약은 `style`에서 `expressionVariant`/`expression_variant`로 전환됐다. 서버/API도 `style` alias를 받지 않는다.
- Apps in Toss runtime에서는 공식 알림 동의/Smart Message 준비 전까지 알림을 preview-only로 처리한다.
- 직접 입력/최종 저장/보관함 문장이 이 기기의 localStorage에 남을 수 있다는 고지, 전체 삭제 버튼, 정적 `privacy.html`이 추가됐다.

2026-07-05 Codex 구현 기준으로 AI 후보 생성 경로가 Supabase Edge Function으로 전환됐다.

- `generate-candidates` Supabase Edge Function이 DeepSeek를 서버 측에서 호출한다.
- 앱 클라이언트는 `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`로 Supabase Function route만 호출하며 DeepSeek key를 보지 않는다.
- 로컬 Vite, GitHub Pages, Apps in Toss, Google Play는 같은 Supabase Function 경로를 사용할 수 있다.
- 기존 `/api/generate-candidates`는 legacy/server-route fallback으로 남아 있지만, public static hosting의 기본 경로는 Supabase Edge Function이다.
- 실제 Supabase smoke test에서 `공부안했어` 입력으로 AI 후보 5개 반환을 확인했다.
- `report-candidate` Supabase Edge Function과 report table은 준비됐다. 다만 현재 shared admin env에 service-role JWT가 비어 있어 report persistence는 `stored=false` 상태이며, service-role JWT 세팅 후 저장까지 활성화해야 한다.

2026-07-04 Codex 구현 기준으로 v0.6 AI three-mode + taxonomy + guardrail 범위가 완료됐다.

- Screen 2 is now `칭찬해줘 / 잔소리해줘 / 직접 쓸게`.
- `칭찬해줘`/`잔소리해줘`는 situation, feeling, tone, intensity, purpose metadata를 포함해 `/api/generate-candidates`를 호출한다.
- `직접 쓸게`는 AI 호출 없이 로컬 안전검사를 거쳐 선택 문구로 저장하고 바로 시간 설정으로 이동한다.
- AI 프록시가 없거나 실패하면 로컬 fallback 후보를 화면에 표시하지 않고, 연결 필요 안내만 보여준다.
- `src/data/message-templates.v0.1.json` template metadata는 taxonomy seed, 테스트, 향후 CMS 이관 기준으로 유지하되 현재 사용자-facing 후보 fallback으로 쓰지 않는다.
- Shared `messageSafety` handles pre-send masking, blocked/caution classification, and unsafe AI output rejection.
- `/api/generate-candidates` now targets `deepseek-v4-pro`, requests JSON output, rate-limits per client key, sends sanitized context only, and rejects crisis/medical/hate/violence/shaming output.
- Candidate reporting now has a server-ready `/api/report-candidate` route. It sends/stores metadata only; raw user context and raw candidate text are intentionally not persisted.
- Supabase-ready report table migration added at `supabase/migrations/20260704150000_praise_candidate_reports.sql`.
- GitHub Pages remains static hosting. In production, real DeepSeek/report persistence requires deploying the API routes through Supabase Edge Function, Vercel, Netlify, or Cloudflare Worker.

2026-06-26 Codex 구현 기준으로 v0.5 AI candidate + browser notification 범위가 완료됐다.

- Active app title/copy: `내편한마디` / `A Word for Me`.
- Screen 2 is now `칭찬해줘 / 잔소리해줘`: situation input -> AI candidate generation -> label/report/select.
- `MessageGenerationAdapter` calls `/api/generate-candidates`; if unavailable, it returns no candidates and the UI shows an AI connection notice.
- `/api/generate-candidates` is a server-only DeepSeek proxy path using `DEEPSEEK_API_KEY`, JSON output, and no client-exposed key.
- `NotificationAdapter` now uses the browser Notification API when available and permission is granted; unsupported/denied environments fall back to app preview with clear notice.
- Screen 4 now stores `scheduleTimes[]`, lets the user add/edit/remove multiple notification times, and schedules one browser notification attempt per saved time.
- Generation context and candidate drafts are sanitized out of localStorage; final selected/edited user line remains stored as app state.
- Apps in Toss Smart Message remains a separate server/mTLS/template-review path and is not implemented client-side.

2026-06-16 Codex 구현 기준으로 v0.1 + v0.2 범위가 완료됐다.

- 기존 v0.1/v0.2 reminder plan은 reference only로 남기고, 구현 기준은 새 6-screen Architecture로 이동한다.
- 개발 순서: Cut 1(레거시 reminder shell 제거) → Cut 2(6-screen shell + domain model) → Cut 3(i18n/trust-safe analytics/storage) → Cut 4(future platform trust).
- 실제 Apps in Toss/Google Play SDK, 광고, 결제, 로그인, 서버는 승인 전까지 제외된다.
- 검증은 unit test + browser QA + plan/architecture alignment check로 수행한다.

## Architecture-aligned Implementation Plan

Goal: 승인된 6-screen praise/check-in flow를 구현 가능한 최소 구조로 바꾼다. local-first 저장, ko/en i18n, trust-safe analytics, and future platform boundaries만 남기고 기존 reminder/voice 중심 구조를 제거한다.

### Scope

Do now:

- Replace reminder-centric shell with the 6 approved screens: Landing, Praise Pick, Rewrite, Schedule, Check-in, Result Slot.
- Move product rules into domain/session, domain/praise, domain/checkin, domain/schedule, domain/trust, and locale boundaries.
- Keep only local-first storage, locale selection, analytics event contracts, and preview-only notification capability.

Do not now:

- Real Toss/Google login, ads, IAP, or payment.
- Toss Smart Message delivery, mTLS server implementation, or backend scheduling.
- Client-side AI provider calls or unlabelled AI output.
- Platform-specific SDK imports in product/domain code.

### Files

- Create `src/domain/session/`, `src/domain/praise/`, `src/domain/checkin/`, `src/domain/schedule/`, `src/domain/trust/`, `src/domain/locale/`
- Create `src/features/LandingScreen.tsx`, `PraisePickScreen.tsx`, `RewriteScreen.tsx`, `ScheduleScreen.tsx`, `CheckinScreen.tsx`, `ResultSlotScreen.tsx`
- Modify `src/platform/` to keep only MVP-used boundaries (storage, analytics, notification capability, locale helper)
- Modify `src/i18n.ts` or split into locale-owned modules when the screen copy moves
- Modify tests to cover state transitions, trust-safe analytics sanitization, and locale coverage

### Task 1: 알림 관리 UX

Acceptance criteria:

- 홈에서 활성 알림과 꺼진 알림이 구분된다.
- 알림을 끄면 오늘 받을 한마디에서 제외되고, 꺼진 알림 영역에서 다시 켤 수 있다.
- 상세 화면에서 알림 삭제가 가능하다.
- 상세 화면에서 문구, 시간, 반복, 표시 방식을 한 번에 수정할 수 있다.

Tests:

- `test/App.test.tsx`
  - reminder 생성 후 상세에서 끄기 -> 활성 목록에서 빠지고 꺼진 목록에 표시.
  - 꺼진 알림 다시 켜기 -> 활성 목록과 오늘 카드에 복귀.
  - 상세에서 삭제 -> 목록에서 제거.
  - 상세에서 시간 변경 -> summary와 today occurrence가 변경 시간으로 갱신.

Implementation notes:

- `Reminder.enabled`를 그대로 사용한다.
- 삭제는 `repository.deleteReminder(id)`를 사용한다.
- 홈에서 꺼진 알림을 아예 숨기면 다시 켤 수 없으므로 `disabled reminders` 섹션을 둔다.
- 삭제는 한 번 더 누르는 confirm state로 처리한다. 별도 modal은 v0.3에서 만들지 않는다.

### Task 2: 시간 설정 UX

Acceptance criteria:

- 기존 프리셋 버튼은 유지한다.
- 직접 시간 입력 `<input type="time">`을 추가한다.
- 프리셋을 누르면 직접 시간 입력값도 같이 바뀐다.
- 직접 시간을 바꾸면 프리셋 선택은 해제되거나 custom 상태로 표시된다.
- invalid time은 저장 버튼을 비활성화한다.

Tests:

- `test/reminderTime.test.ts`
  - `09:05`, `23:59` valid.
  - `24:00`, `9:5`, `abc` invalid.
- `test/App.test.tsx`
  - create에서 직접 시간 `15:45` 저장 -> summary `매일 · 15:45`.
  - detail에서 `09:10`으로 수정 -> home summary와 today card 갱신.

Implementation notes:

- `scheduledTime` 저장 포맷은 계속 `HH:mm`.
- native time input을 우선 사용한다. 커스텀 wheel picker는 v0.3에서 제외한다.
- Apps in Toss/모바일에서 native input UX가 부족하면 v0.4에서 별도 time picker를 검토한다.

### Task 3: 직접 쓰기 안전장치

Acceptance criteria:

- 직접 쓰기 또는 상세 수정에서 문구를 입력하면 로컬 rule 기반으로 상태를 보여준다.
- `safe`: 별도 경고 없음.
- `caution`: 저장은 가능하지만 부드러운 안내와 대체 문장 예시를 보여준다.
- `blocked`: 저장 버튼을 비활성화하고, 앱 목적에 맞지 않는 문구라고 안내한다.
- 기본 칭찬/잔소리 템플릿은 safety check를 통과해야 한다.

Initial rule set:

- `caution`: 자기비난, 수치심, 인격 평가, 외모/몸무게 압박, 과도한 죄책감 표현.
- `blocked`: 자해/죽음 지시, 폭력 지시, 혐오 표현, 의학적 진단/치료처럼 보이는 문구.

Tests:

- `test/reminderSafety.test.ts`
  - `폰 내려. 지금은 네가 정한 시간이다.` -> safe.
  - `넌 왜 맨날 이러냐.` -> caution.
  - `너는 한심해.` -> caution.
  - `죽어.` -> blocked.
  - release template 전체가 blocked가 아님.
- `test/App.test.tsx`
  - blocked 직접 문구는 저장 불가.
  - caution 직접 문구는 안내 표시 후 저장 가능.

Implementation notes:

- 직접 쓰기 safety check는 로컬 rule을 우선한다. AI 후보도 같은 blocked/caution 원칙을 통과해야 한다.
- 사용자를 혼내는 copy가 아니라 “이 문구가 나를 너무 몰아붙일 수 있어요” 톤으로 간다.
- 앱이 상담/치료처럼 보이지 않게 긴급/의학적 표현은 최소화한다.

### Execution Order

1. `messageSafety`와 `time` domain tests를 먼저 추가한다.
2. `ReminderScheduleFields`를 만들고 create 화면에만 먼저 연결한다.
3. create 직접 시간 + safety test를 통과시킨다.
4. detail 화면에 schedule fields를 연결해 전체 수정 기능을 확장한다.
5. home에 활성/꺼진 알림 구분과 quick toggle을 추가한다.
6. delete confirm을 detail에 추가한다.
7. 전체 `npm test`, `npm run build`.
8. Browser/Playwright QA: create -> edit time -> disable -> enable -> delete -> safety blocked/caution.
9. reviewer + toss-compliance-auditor 재리뷰.
10. session log와 graphify update.

## Architecture

현재 `src/App.tsx`가 UI, 상태, 오디오, localStorage, 플랫폼 표시를 모두 담당한다. v0.1 구현의 첫 목표는 `domain/reminders`, `features/reminder`, `platform adapters`로 책임을 나누고, 제품 로직이 Apps in Toss/Google Play/브라우저 Notification SDK에 직접 의존하지 않게 만드는 것이다.

v0.5는 브라우저 Notification API가 있고 권한이 허용된 환경에서 실제 알림 예약을 시도한다. 다만 웹 브라우저만으로 모바일 백그라운드 알림을 안정 보장하지 않으므로, 실패/거부/미지원 상태에서는 앱 안 preview fallback을 유지한다. Apps in Toss Smart Message와 Android/Google Play 수준의 안정 알림은 별도 플랫폼/서버 어댑터에서 완성한다.

## Tech Stack

- React 19
- TypeScript
- Vite
- Vitest
- Testing Library
- localStorage
- Project platform adapters: Apps in Toss first, Google Play compatible

---

## Current State

- `src/App.tsx`는 오디오 MVP 중심 단일 화면이다.
- `src/i18n.ts`는 한국어/영어 전환을 지원하지만 오디오 카테고리/문구 구조에 묶여 있다.
- `src/platform/adapters.ts`에는 `AuthAdapter`, `PaymentAdapter`, `AdsAdapter` stub만 있다.
- `src/data/quote-pack.v0.1.json`, `src/data/audio-manifest.v0.1.json`은 유지하되 v0.1 핵심 흐름에서는 보류한다.
- 현재 테스트는 오디오 MVP 문구와 동작을 기준으로 작성되어 있어 v0.1에서 대폭 갱신해야 한다.

## Subagent Strategy

서브에이전트는 사용할 수 있다. 다만 같은 파일을 동시에 수정하는 병렬 구현은 피한다.

권장 운영:

1. `code-mapper`: 구현 전/중 영향 범위 확인, 파일 분해안 점검.
2. `docs-researcher`: v0.2 착수 직전 Apps in Toss 스마트 발송/알림 동의/Android 권한 공식 문서 재확인.
3. `worker`: disjoint write set이 분명한 작업만 맡긴다.
4. `reviewer`: v0.1, v0.2 각각 완료 후 spec compliance와 adapter boundary 리뷰.
5. `toss-compliance-auditor`: v0.1/v0.2 QA 직후 Apps in Toss/Google Play/i18n/정책 리스크 점검.
6. `i18n-extractor`: 구현 후 사용자 노출 문구가 locale 레이어 밖에 남았는지 점검.

병렬 가능:

- reminder 도메인 타입/저장소 테스트 설계
- 메시지 템플릿 데이터 초안
- i18n copy key 정리
- 공식 문서 재확인
- QA 체크리스트 작성

순차 필수:

- `App.tsx` 구조 분리
- v0.1 UI 통합
- v0.2 상세/반응 상태 통합
- 최종 테스트/빌드/브라우저 QA

## Version Gates

### v0.1 완료 기준

- 홈에 `오늘 받을 한마디`와 `활성 알림 목록`이 보인다.
- 새 알림 만들기에서 `칭찬`, `잔소리`, `직접 쓰기`를 선택할 수 있다.
- 템플릿 선택, 메시지 수정, 시간 프리셋, 반복, 알림 표시 방식을 저장할 수 있다.
- 저장 데이터가 새로고침 후 복원된다.
- `NotificationAdapter` stub이 있고, 웹 MVP에서는 안정 알림이 보장되지 않는다는 UX가 있다.
- `StorageAdapter`, `AnalyticsAdapter`, `NotificationAdapter` 경계가 추가된다.
- 로그인/결제/광고는 stub만 유지한다.
- 한국어/영어 전환 시 새 화면 문구가 모두 locale을 탄다.
- `npm test`, `npm run build`가 통과한다.

### v0.2 완료 기준

- 홈/오늘 카드에서 메시지 상세로 진입할 수 있다.
- `좋았어`, `별로야`, `수정하기`, `스누즈`, `오늘은 건너뛰기`가 동작한다.
- 반응/스누즈/건너뛰기 결과가 로컬에 저장된다.
- `NotificationAdapter`가 권한/지원 여부/capability 상태를 표현한다.
- 권한 거부/미지원/미리보기 전용 상태가 UX에 표시된다.
- 사용률 높은 메시지를 나중에 음성화할 수 있는 데이터 flag만 준비한다.
- 실제 앱이 닫힌 뒤 보장되는 플랫폼 알림은 v0.2 완료 기준에 넣지 않는다.

## Explicit Non-Goals

- 실제 Apps in Toss 푸시/스마트 발송 연동
- 실제 Android/iOS 로컬 알림 보장
- 앱 시작 직후 알림 권한 요청
- 로그인 실구현
- 결제/IAP 실구현
- 광고 SDK 삽입
- 서버 동기화
- 런타임 TTS
- ElevenLabs API 호출
- 실제 음성 재생 기능 재도입
- 치료/상담/진단/정신건강 효과 표현

## Open Product Decisions

구현 기본값은 아래로 고정한다.

- `오늘 받을 한마디`: 지금 이후 가장 가까운 예정 메시지로 본다.
- `displayMode=private`: 알림 미리보기에는 메시지 본문을 숨기고 앱 안 상세에서만 보여주는 의미로 둔다.
- `스누즈`: v0.2 기본값은 10분.
- `오늘은 건너뛰기`: 해당 reminder의 다음 1회 occurrence만 건너뛴다.
- 기존 오디오 MVP localStorage key는 마이그레이션하지 않고 새 key를 쓴다.

---

## File Plan

### Create

- `src/domain/reminders/schema.ts`
  - `MessageMode`, `NagIntensity`, `NotificationDisplayMode`, `RepeatRule`, `MessageTemplate`, `Reminder`, `ReminderReaction`, `ReminderOccurrence` 타입.
- `src/domain/reminders/templates.ts`
  - `message-templates.v0.1.json`을 타입 안전하게 로드하고 mode별로 조회.
- `src/domain/reminders/schedule.ts`
  - 오늘 받을 메시지, 다음 occurrence, 스누즈, 건너뛰기 계산.
- `src/domain/reminders/repository.ts`
  - reminder 저장소 인터페이스와 localStorage 구현.
- `src/data/message-templates.v0.1.json`
  - 칭찬/잔소리 기본 메시지 템플릿. 직접 쓰기는 데이터가 아니라 사용자 입력.
- `src/features/reminder/ReminderApp.tsx`
  - reminder feature 최상위 상태 orchestration.
- `src/features/reminder/ReminderHome.tsx`
  - 오늘 받을 한마디, 활성 알림 목록, 새 알림 CTA.
- `src/features/reminder/ReminderCreate.tsx`
  - 모드 선택, 템플릿 선택/수정, 시간, 반복, 표시 방식, 저장 미리보기.
- `src/features/reminder/ReminderDetail.tsx`
  - v0.2 상세, 반응, 수정, 스누즈, 건너뛰기.
- `src/features/reminder/reminderViewModel.ts`
  - UI에 필요한 label, next occurrence, display status 계산.
- `test/reminderSchema.test.ts`
- `test/reminderRepository.test.ts`
- `test/reminderSchedule.test.ts`
- `test/reminderTemplates.test.ts`
- `test/reminderFlow.test.tsx`

### Modify

- `src/App.tsx`
  - locale/platform shell만 남기고 reminder feature를 렌더링.
- `src/i18n.ts`
  - 알림형 앱 copy, mode copy, form copy, permission copy, reaction copy 추가.
- `src/platform/adapters.ts`
  - `StorageAdapter`, `AnalyticsAdapter`, `NotificationAdapter` 추가.
- `src/styles.css`
  - 홈, 알림 카드, create form, 상세, 반응, 권한 상태 UI 스타일.
- `test/App.test.tsx`
  - 오디오 MVP 기준 테스트를 알림형 홈 기준으로 갱신.
- `test/i18n.test.ts`
  - 새 copy key와 reminder template 번역 검증.
- `test/platformAdapters.test.ts`
  - 새 adapters stub 검증.

### Keep But Deprioritize

- `src/data/quote-pack.v0.1.json`
- `src/data/audio-manifest.v0.1.json`
- `src/core/ttsPrompt.ts`
- `src/core/voiceScript.ts`

이 파일들은 v0.1에서 삭제하지 않는다. 오디오/음성화 검토용 레거시 자산으로 보류한다.

---

## Milestone A: v0.1 Foundation

### Task A1: Reminder Domain Schema

**Files:**
- Create: `src/domain/reminders/schema.ts`
- Test: `test/reminderSchema.test.ts`

- [ ] Define core reminder types.

```ts
export type MessageMode = "praise" | "nag" | "custom";
export type NagIntensity = "soft" | "direct";
export type NotificationDisplayMode = "fullText" | "private";
export type RepeatRule = "daily" | "weekday" | "weekend" | "customDays";

export interface MessageTemplate {
  id: string;
  mode: Exclude<MessageMode, "custom">;
  intensity?: NagIntensity;
  displayText: string;
  notificationText: string;
  tags: string[];
  status: "release" | "draft";
  voiceCandidate?: boolean;
}

export interface Reminder {
  id: string;
  mode: MessageMode;
  messageTemplateId?: string;
  customText?: string;
  editedText: string;
  scheduledTime: string;
  repeatRule: RepeatRule;
  customDays?: number[];
  displayMode: NotificationDisplayMode;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] Add tests for valid modes, repeat rules, and display modes.
- [ ] Run: `npm test -- test/reminderSchema.test.ts`

### Task A2: Message Template Data

**Files:**
- Create: `src/data/message-templates.v0.1.json`
- Create: `src/domain/reminders/templates.ts`
- Test: `test/reminderTemplates.test.ts`

- [ ] Add release templates for `praise` and `nag`.
- [ ] Include `soft` and `direct` nag intensity only.
- [ ] Exclude `strong` nag.
- [ ] Add test that every template has `id`, `mode`, `displayText`, `notificationText`, `tags`, `status`.
- [ ] Add test that nag templates never contain banned shame phrases:
  - `한심`
  - `의지`
  - `망한다`
  - `살 빼`
  - `왜 맨날`
- [ ] Run: `npm test -- test/reminderTemplates.test.ts`

### Task A3: Storage And Repository

**Files:**
- Create: `src/domain/reminders/repository.ts`
- Test: `test/reminderRepository.test.ts`

- [ ] Add storage keys under `praise-me:reminders:v1`.
- [ ] Implement `loadReminders`, `saveReminder`, `deleteReminder`, `updateReminder`.
- [ ] Preserve old audio MVP storage keys without migration.
- [ ] Handle invalid JSON by returning an empty list.
- [ ] Run: `npm test -- test/reminderRepository.test.ts`

### Task A4: Minimal Platform Boundaries

**Files:**
- Modify: `src/platform/adapters.ts`
- Test: `test/platformAdapters.test.ts`

- [ ] Keep only `StorageAdapter`, `AnalyticsAdapter`, `NotificationAdapter`, and locale helper used by the MVP.
- [ ] Remove auth/payment/ads interfaces and any entitlement/ad placement types from the MVP surface.
- [ ] Make `NotificationAdapter` capability-only; schedule stays preview-only until a future approved release.

```ts
export type NotificationPermissionStatus = "granted" | "denied" | "prompt" | "unsupported";
export type NotificationScheduleStatus = "scheduled" | "preview_only" | "blocked";
```

- [ ] Add tests for all new adapter statuses.
- [ ] Run: `npm test -- test/platformAdapters.test.ts`

### Task A5: Schedule Rules

**Files:**
- Create: `src/domain/reminders/schedule.ts`
- Test: `test/reminderSchedule.test.ts`

- [ ] Implement `getNextOccurrence`.
- [ ] Implement `getTodaysUpcomingReminders`.
- [ ] Use "closest upcoming today" as the meaning of `오늘 받을 한마디`.
- [ ] Add v0.2-ready helpers for snooze and skip, but do not expose UI yet.
- [ ] Run: `npm test -- test/reminderSchedule.test.ts`

---

## Milestone B: v0.1 Feature Complete

### Task B1: 6-screen App Shell Refactor

**Files:**
- Modify: `src/App.tsx`
- Create: new screen modules under `src/features/`
- Modify: `src/i18n.ts`
- Test: `test/App.test.tsx`

- [ ] Remove reminder/voice shell from the primary UI.
- [ ] Keep locale switcher.
- [ ] Render the approved 6-screen flow.
- [ ] Update subtitle/copy so it describes the praise/check-in product, not delivery guarantees.
- [ ] Run: `npm test -- test/App.test.tsx`

### Task B2: Landing and Praise Pick Screens

**Files:**
- Create: `src/features/reminder/ReminderHome.tsx`
- Create: `src/features/reminder/reminderViewModel.ts`
- Modify: `src/styles.css`
- Test: `test/reminderFlow.test.tsx`

- [ ] Show `오늘 받을 한마디`.
- [ ] Show active reminder list.
- [ ] Show empty state when no reminders exist.
- [ ] Add primary CTA `새 한마디 알림 만들기`.
- [ ] Run: `npm test -- test/reminderFlow.test.tsx`

### Task B3: Rewrite and Schedule Screens

**Files:**
- Create: `src/features/reminder/ReminderCreate.tsx`
- Modify: `src/features/reminder/ReminderApp.tsx`
- Modify: `src/i18n.ts`
- Modify: `src/styles.css`
- Test: `test/reminderFlow.test.tsx`

- [ ] Add mode selection: `칭찬`, `잔소리`, `직접 쓰기`.
- [ ] Add template selection for praise/nag.
- [ ] Add custom text input for direct write.
- [ ] Add editable message textarea after template selection.
- [ ] Add time presets:
  - 아침 시작
  - 점심 전
  - 오후 늘어질 때
  - 퇴근 전
  - 자기 전
- [ ] Add repeat options:
  - 매일
  - 평일
  - 주말
  - 요일 직접 선택
- [ ] Add display mode:
  - 메시지 그대로 표시
  - 앱에서만 보기
- [ ] Show save preview.
- [ ] Save reminder to repository.
- [ ] Run: `npm test -- test/reminderFlow.test.tsx`

### Task B4: Locale and Trust Guardrails

**Files:**
- Modify: `src/i18n.ts`
- Modify: `src/data/message-templates.v0.1.json`
- Test: `test/i18n.test.ts`, `test/reminderTemplates.test.ts`

- [ ] Route all user-facing text through i18n except user custom text.
- [ ] Ensure copy does not say:
  - 치료
  - 상담
  - 진단
  - 우울 개선
  - 불안 개선
  - 정신건강 치료
- [ ] Ensure v0.1 copy says saved reminder is a preview/local MVP when real delivery is unsupported.
- [ ] Run: `npm test -- test/i18n.test.ts test/reminderTemplates.test.ts`

### Task B5: Architecture Verification

**Files:**
- Modify: `ai/session-logs/<date>-praise-reminder-v01-implementation-codex.md`

- [ ] Run: `npm test`
- [ ] Run: `npm run build`
- [ ] Start dev server.
- [ ] Browser QA:
  - initial empty home
  - create praise reminder
  - create nag reminder
  - create custom reminder
  - reload and verify persistence
  - switch Korean/English
  - verify no audio controls appear in primary v0.1 flow
- [ ] Run `graphify update . --no-cluster`
- [ ] Write session log.

---

## Milestone C: v0.2 Interaction Loop

### Task C1: Detail And Reaction Schema

**Files:**
- Modify: `src/domain/reminders/schema.ts`
- Modify: `src/domain/reminders/repository.ts`
- Test: `test/reminderRepository.test.ts`

- [ ] Add `ReminderReaction`.
- [ ] Add `ReminderOccurrenceAction`.
- [ ] Store `liked`, `disliked`, `snoozed`, `skipped`, `editedFromDetail`.
- [ ] Keep data local.
- [ ] Run: `npm test -- test/reminderRepository.test.ts`

### Task C2: Reminder Detail Screen

**Files:**
- Create: `src/features/reminder/ReminderDetail.tsx`
- Modify: `src/features/reminder/ReminderApp.tsx`
- Modify: `src/styles.css`
- Test: `test/reminderFlow.test.tsx`

- [ ] Open detail from today card and active list item.
- [ ] Show message, mode, time, repeat, display mode.
- [ ] Add actions:
  - 좋았어
  - 별로야
  - 수정하기
  - 10분 뒤 다시
  - 오늘은 건너뛰기
- [ ] Run: `npm test -- test/reminderFlow.test.tsx`

### Task C3: Snooze And Skip Rules

**Files:**
- Modify: `src/domain/reminders/schedule.ts`
- Test: `test/reminderSchedule.test.ts`

- [ ] Snooze default: 10 minutes.
- [ ] Skip rule: skip only the next occurrence of that reminder.
- [ ] Ensure skip and snooze do not disable the reminder permanently.
- [ ] Run: `npm test -- test/reminderSchedule.test.ts`

### Task C4: Capability-Aware Notification Adapter

**Files:**
- Modify: `src/platform/adapters.ts`
- Modify: `src/features/reminder/ReminderCreate.tsx`
- Modify: `src/i18n.ts`
- Test: `test/platformAdapters.test.ts`, `test/reminderFlow.test.tsx`

- [ ] Add capability state:
  - `unsupported`
  - `preview_only`
  - `permission_required`
  - `ready`
- [ ] Add permission explainer UI.
- [ ] Do not request permission on app start.
- [ ] For web MVP, do not claim closed-app delivery.
- [ ] Run: `npm test -- test/platformAdapters.test.ts test/reminderFlow.test.tsx`

### Task C5: Voice Candidate Data Only

**Files:**
- Modify: `src/domain/reminders/schema.ts`
- Modify: `src/data/message-templates.v0.1.json`
- Test: `test/reminderTemplates.test.ts`

- [ ] Add `voiceCandidate` flag for templates that receive positive reactions.
- [ ] Do not reintroduce audio playback UI.
- [ ] Do not call TTS APIs.
- [ ] Run: `npm test -- test/reminderTemplates.test.ts`

### Task C6: v0.2 Verification

**Files:**
- Modify: `ai/session-logs/<date>-praise-reminder-v02-implementation-codex.md`

- [ ] Run: `npm test`
- [ ] Run: `npm run build`
- [ ] Browser QA:
  - open detail
  - like/dislike
  - edit from detail
  - snooze
  - skip next occurrence
  - permission unsupported/preview-only UI
  - reload persistence
  - Korean/English copy
- [ ] Dispatch `reviewer` for final diff review.
- [ ] Dispatch `toss-compliance-auditor` for Apps in Toss/Google Play/i18n/policy risk.
- [ ] Run `graphify update . --no-cluster`
- [ ] Write session log.

---

## Recommended Execution Order

1. Execute Milestone A completely.
2. Execute Milestone B completely.
3. Freeze v0.1 when tests/build/browser QA pass.
4. Record v0.1 session log.
5. Execute Milestone C.
6. Freeze v0.2 when tests/build/browser QA pass.
7. Run reviewer and toss compliance audit.
8. Record v0.2 session log.

## Subagent Execution Map

### v0.1

- Main Codex:
  - A1, A3, A4, A5
  - B1, B2, B3
  - integration and final verification
- Possible worker:
  - A2 template data only, if write scope is limited to `src/data/message-templates.v0.1.json` and `test/reminderTemplates.test.ts`.
- Reviewer:
  - after B5.
- Toss compliance auditor:
  - after B5.
- i18n extractor:
  - after B4 or B5.

### v0.2

- Main Codex:
  - C1, C2, C3, C4
- Possible worker:
  - C5 voice candidate data only.
- Docs researcher:
  - before C4, official docs check for Apps in Toss smart message/notification consent and Android notification permission.
- Reviewer:
  - after C6.
- Toss compliance auditor:
  - after C6.

## Commands

Use these after each milestone:

```bash
npm test
npm run build
graphify update . --no-cluster
```

Use dev server for browser QA:

```bash
npm run dev -- --port 5174
```

## Risks

- `App.tsx` refactor can break the current app surface if done too late.
- `잔소리` copy can become shaming if templates are not tested and reviewed.
- v0.1 can accidentally overpromise real notification delivery.
- `localStorage` direct access can leak beyond platform boundaries if not contained early.
- v0.2 actual notification work may require official Apps in Toss/Android document refresh before safe implementation.

## Change Log

| Version | Date | Notes |
| --- | --- | --- |
| 0.8.0 | 2026-07-05 | Converted AI candidates to hard-constrained `constraintBundle` + `expressionVariant` contract, added mode-specific axis picker UI, report schema hardening, canonical candidate IDs, privacy/local-storage notice, Toss preview-only notification gate, and browser overflow QA. |
| 0.8.1 | 2026-07-05 | Completion-audit cleanup: removed remaining legacy `style` template fields and report alias, renamed candidate label CSS to `candidate-variant`, and added style-only report rejection coverage. |
| 0.7.2 | 2026-07-05 | Switched app AI generation to Supabase Edge Function default path, deployed `generate-candidates`/`report-candidate`, confirmed real AI 5-candidate smoke, and superseded the temporary Mac-local AI env standard. |
| 0.7.1 | 2026-07-05 | Removed user-facing local fallback candidates when the AI proxy is unavailable; UI now shows an AI connection notice with no generated cards. |
| 0.7.0 | 2026-07-04 | Added praise/nag/custom three-mode UI, message taxonomy metadata, local template catalog seed, shared safety/masking, DeepSeek V4 Pro server proxy parameters, metadata-only candidate reporting endpoint, Supabase report migration, and updated tests/build. |
| 0.6.1 | 2026-06-26 | Added multi-time notification scheduling. `AppState` now keeps `scheduleTimes[]` with legacy `scheduleTime` migration; schedule screen uses a custom add/edit sheet and schedules every saved time. |
| 0.6 | 2026-06-26 | AI candidate mode, DeepSeek server proxy boundary, AI labels/reporting, browser Notification API scheduling attempt, privacy-safe state persistence, and updated tests/build/browser QA completed. |
| 0.5 | 2026-06-19 | 6-screen Architecture A/B alignment, trust-safe analytics boundary, and minimal platform boundary updated. |
| 0.3 | 2026-06-16 | v0.1/v0.2 구현 완료 상태 반영. storage adapter 경계, private 마스킹, locale template 저장, snooze/skip preview 반영 검증 완료. |
| 0.2 | 2026-06-16 | 알림형 MVP v0.1 + v0.2 연속 구현 계획, subagent 분업, adapter 경계, version gates 반영. |
| 0.1 | 2026-06-13 | 한국어/영어 선택 i18n과 로그인/결제/광고 adapter 준비 상태를 반영. |
