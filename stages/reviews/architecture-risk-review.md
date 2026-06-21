# Architecture Risk Review — 칭찬해줘 Architecture B

- project: 칭찬해줘
- review-target: stages/20_ARCH_FINAL.md v1.0.0
- review-date: 2026-06-19 KST
- reviewer: tech-risk (read-only)
- verdict: **CHANGES_REQUIRED**
- source-inputs: `01_DECISIONS.md`, `stages/20_ARCH_FINAL.md`, `stages/10_UX_FINAL.md`, `ai/plans/implementation-plan.md`, `src/platform/adapters.ts`, `src/domain/reminders/schema.ts`, `src/domain/reminders/repository.ts`, `src/App.tsx`, `src/i18n.ts`, 지식저장소 platform/policy docs

---

## Verdict: CHANGES_REQUIRED

3건의 주요 이슈가 발견되었다. 각 이슈는 Architecture 문서 수정 또는 Implementation Plan 재정비가 필요하다. 수정 후 재검토한다. 비용, 백엔드 가정, 알림 전략, 수익화 placement는 전반적으로 승인 범위와 일치한다.

---

## Issue 1: Free-text PII boundary undefined — CHANGES_REQUIRED

### 발견

승인된 UX(Screen 3. Rewrite Optional)는 사용자가 자유 텍스트로 칭찬 문구를 수정할 수 있다. Architecture의 event schema에는 `rewrite_saved`, `rewrite_started`, `rewrite_blocked`, `reopen_reason_tagged`가 정의되어 있으나, **사용자가 직접 입력한 텍스트가 analytics 이벤트에 포함되지 않아야 한다는 경계가 명시되지 않았다**.

### 근거

- `stages/10_UX_FINAL.md` §4 Screen 3: 사용자가 선택한 문장을 직접 수정하는 textarea를 제공한다. "한 줄 수정 입력", "짧게 바꾸기"가 주요 액션.
- `stages/20_ARCH_FINAL.md` §5.2: 이벤트 `rewrite_saved`의 properties가 정의되지 않음.
- `src/platform/adapters.ts` L70-75: `AnalyticsAdapter.track(eventName, properties?)`는 `Record<string, unknown>`를 받으며, PII 필터나 제한이 없다.
- 현재 `src/features/reminder/ReminderApp.tsx` L57은 `{ mode: reminder.mode }`만 전송하여 안전하지만, 이는 **기존 reminder flow** 기준이다. 새 Architecture의 Rewrite screen 구현 시 구현자가 `editedText` 전체를 properties로 보낼 위험이 열려 있다.
- `reopen_reason_tagged` 이벤트도 감정 상태 태그를 포함할 수 있어 동일한 위험.

### 영향

- 사용자가 입력한 자유 텍스트(감정 표현, 개인적 고백, 자책 문구 등)가 analytics로 전송되면 개인정보 유출 및 Apps in Toss 심사 거절 사유가 된다.
- 감정·자기위로 앱의 trust-safe boundary(`지식저장소/docs/tools/apps-in-toss-non-game-ads-points-monetization.md` §감정·자기위로 앱 신뢰 경계)를 위반할 수 있다.

### 대안

```
[권장] Architecture §5.2 Event schema에 아래 규칙을 추가한다:

1. rewrite_saved, rewrite_started, rewrite_blocked, reopen_reason_tagged
   이벤트의 properties에는 사용자 입력 텍스트(raw text)를 절대 포함하지 않는다.
   전송 가능 값: rewrite_state("none"|"edited"), safety_status("safe"|"caution"|"blocked"),
   reason_tag(사전 정의된 enum만), character_count.

2. AnalyticsAdapter.track() 호출 전, text-content 속성을 제거하는
   도메인 레이어 sanitizer를 둔다. src/domain/trust/ 모듈에
   analyticsSafeProperties() 함수로 구현.

3. reopen_reason_tagged의 reason_tag 값은 폐쇄형 enum으로 제한한다
   (예: "wanted_keep" | "wanted_edit" | "wanted_skip").
```

### 검증법

- `src/domain/trust/` 테스트에서 `analyticsSafeProperties({ editedText: "...", ... })` 호출 시 `editedText` 필드가 제거되는지 확인.
- 이벤트 전송 경로에서 stringified payload에 사용자 입력 텍스트가 포함되지 않는지 `grep` 검증.

---

## Issue 2: Overengineered adapter layer for zero-platform MVP — CHANGES_REQUIRED

### 발견

Architecture §2.2, §4.3, §13은 6개 adapter interface와 `src/platform/toss/`, `src/platform/google/` 디렉토리를 정의하고 있다. 그러나 CEO 승인 범위(D-20260619-002, D-20260619-003)는 **음성, AI, 로그인, 광고, IAP, 실결제를 명시적으로 제외**했다. MVP는 local storage + i18n 외에 플랫폼 의존 기능이 하나도 없다.

### 근거

- `01_DECISIONS.md` D-20260619-002 `excluded_scope`: "음성/TTS, AI상담, 광고/IAP/실결제/Toss points, 공개출시·수익성 단정, dev-builder 시작"
- `01_DECISIONS.md` D-20260619-003 `excluded_scope`: 동일하게 광고/IAP/실결제/Toss points 제외
- `stages/20_ARCH_FINAL.md` §2.3: "A feature that is not approved now should not appear as a faux abstraction" — 자기 원칙과 충돌.
- `src/platform/adapters.ts` L12-16: `AuthAdapter` interface + `plannedProviders` (apps_in_toss, google_play)
- `src/platform/adapters.ts` L18: `EntitlementId = "premium_monthly" | "remove_ads" | "advanced_receipts"` — 승인되지 않은 유료 기능 타입.
- `src/platform/adapters.ts` L26: `AdPlacementId = "praise_result"` — 감정 핵심 경계에 광고 placement를 미리 정의. trust-safe boundary 위반.
- `stages/20_ARCH_FINAL.md` §4.4: "backend/ receipt verification, entitlement, abuse/rate-limit, LLM proxy later" — 승인된 MVP에 backend는 불필요.
- `stages/20_ARCH_FINAL.md` §10 Cut 3 "Platform readiness" — platform SDK 연동 시점을 "after Owner approves Development"로 잡고 있으나, adapter interface 자체가 이미 과잉 추상화.

### 영향

- 구현 속도 저하: adapter interface 유지보수 비용, 불필요한 타입 정의, stub 테스트 부담.
- 승인되지 않은 기능이 "거의 준비된 것처럼" 보여 Product Plan 경계를 흐림.
- `AdPlacementId = "praise_result"`가 코드에 남아 있으면, 추후 실수로 광고가 감정 핵심 경계에 노출될 위험.

### 대안

```
[권장] MVP 범위에 맞게 adapter layer를 축소:

1. 삭제 대상:
   - AuthAdapter, PaymentAdapter, AdsAdapter interface 및 타입
   - EntitlementId, AdPlacementId, AuthProviderId 타입
   - backend/ 디렉토리 및 Section 4.4 전체를 "future note"로 격하

2. 유지 대상 (MVP에 실제 사용되는 것만):
   - StorageAdapter (localStorage wrapping)
   - AnalyticsAdapter (stub, 이벤트 계약만 유지)
   - NotificationAdapter (capability detection만, scheduleReminder는 no-op)
   - LocaleAdapter/locale source helper

3. src/platform/toss/와 src/platform/google/은
   빈 README만 두거나 삭제 — 실제 구현 시점에 생성.

4. AdPlacementId 제거. 광고 placement 정의는
   광고 승인 이후 별도 spec으로 추가.
```

### 검증법

- `grep -r "EntitlementId\|AdPlacementId\|AuthAdapter\|PaymentAdapter\|AdsAdapter" src/` 결과 0건.
- `npm test` 전체 통과 (제거된 adapter 참조가 없어야 함).
- Architecture §4.3에서 MVP policy 표의 유지/삭제 결정이 반영되었는지 확인.

---

## Issue 3: Implementation plan-architecture mismatch — CHANGES_REQUIRED

### 발견

`ai/plans/implementation-plan.md`는 v0.3 reminder 관리 기능(toggle, delete, custom time, message safety)을 기술하고 있으나, `stages/20_ARCH_FINAL.md`는 기존 reminder 모델을 **6-screen praise/check-in flow로 완전히 교체**하는 것을 목표로 한다. Architecture §3.2가 이 gap을 인지하고 있지만, implementation plan은 업데이트되지 않았다.

### 근거

- `ai/plans/implementation-plan.md` L6-7: "알림형 자기 조율 메시지 앱", v0.3 "알림 관리 UX: 활성/꺼진 알림 구분, 켜기/끄기, 삭제"
- `ai/plans/implementation-plan.md` L28: "Goal: 실제 플랫폼 알림을 붙이기 전에..."
- `stages/20_ARCH_FINAL.md` §3.2: "The current implementation still reflects an older reminder/voice-oriented MVP." — gap 인지.
- `stages/20_ARCH_FINAL.md` §10 Cut 1: "Replace reminder/voice-oriented shell with approved 6-screen shell."
- 하지만 implementation-plan.md의 파일 계획(`ReminderHome`, `ReminderCreate`, `ReminderDetail`, `ReminderApp`)은 여전히 reminder 도메인 기준.
- Architecture가 정의한 새 도메인(`session/`, `praise/`, `checkin/`, `schedule/`, `interest/`, `trust/`, `locale/`)과 화면(`LandingScreen`, `PraisePickScreen`, `RewriteScreen`, `ScheduleScreen`, `CheckinScreen`, `ResultSlotScreen`)에 대한 구현 계획이 없다.

### 영향

- 개발자가 implementation plan을 따라 구현하면 새 Architecture가 아닌 기존 reminder 모델을 보강하게 됨.
- Architecture 승인 후 구현 단계에서 방향 충돌 발생.
- Cut 1 "Architecture refactor only"의 구체적 파일/테스트 계획이 누락.

### 대안

```
[권장] architecture-risk-review.md와 동시에 implementation plan 갱신:

1. ai/plans/implementation-plan.md를 v0.4로 업데이트하고,
   frontmatter의 scope를 "6-screen praise/check-in migration"으로 변경.

2. Architecture §10 Development cut plan을 기준으로
   Cut 1의 구체적 파일 목록과 테스트 계획을 implementation plan에 반영:
   - 삭제/교체: ReminderHome, ReminderCreate, ReminderDetail → 새 화면 6개
   - 신규: src/domain/session/, praise/, checkin/, schedule/, interest/, trust/
   - 유지/수정: adapters.ts (축소), i18n.ts (praise-first copy로 교체)

3. Cut 1 완료 기준: npm test 통과, 기존 reminder 도메인 import가
   src/ 하위에서 완전히 제거됨.
```

### 검증법

- `grep -r "ReminderHome\|ReminderCreate\|ReminderDetail" src/` 결과 0건 (Cut 1 이후).
- `grep -r "from.*domain/reminders" src/` 결과 0건.
- 새 6개 screen 파일이 존재하고 각각 테스트 파일이 있음.
- `ai/plans/implementation-plan.md`의 version이 v0.4로 갱신되고 scope가 6-screen migration으로 변경됨.

---

## 영역별 평가 요약

| 영역 | 평가 | 근거 |
|------|------|------|
| **비용** | PASS | AI/API/backend 호출 없음. localStorage only. analytics stub. |
| **보안** | PASS (주의) | API key·store secret 불포함 명시 (§9). Client-side entitlement 금지 (§6.2). 단, localStorage 평문 저장은 MVP 허용 범위. |
| **개인정보** | CHANGES_REQUIRED | Issue 1: free-text PII boundary 미정의. |
| **과설계** | CHANGES_REQUIRED | Issue 2: zero-platform MVP에 6개 adapter interface + backend boundary. |
| **Apps in Toss 차단** | NARROW | fake-door placement는 §4 (D1 return only, Result 하단)로 올바름. `AdPlacementId = "praise_result"` 타입 제거 필요. 앱 분류(민감 카테고리)는 Development Gate에서 확인할 사항. |
| **Google Play 차단** | PASS | Google Play compatibility 경계 유지, SDK 직접 의존 없음. |
| **알림 위험** | PASS | "preview only" 명시, notification 실패 시 manual re-entry fallback 설계 완료. Actual notification delivery는 backend 필요 — Architecture가 정확히 인지 (§4.4). |
| **수익화 위험** | PASS | D1 복귀자 only, 가격/할인/결제 문구 없음, trust-safe boundary 준수. 첫 코호트 광고·결제 배제. |
| **백엔드 가정** | PASS | MVP에 backend 불필요 명시 (§4.4). Receipt verification은 server-side only (§6.2). |
| **코드베이스 마이그레이션** | CHANGES_REQUIRED | Issue 3: implementation plan이 old reminder model 기준. |

---

## NARROW: 경미하지만 기록할 사항

### N1. `AdPlacementId = "praise_result"` 제거 필요

`src/platform/adapters.ts` L26에 정의된 `AdPlacementId = "praise_result" | "receipt_screen"`에서 `"praise_result"`는 감정 핵심 경계에 광고를 위치시키는 의미로 해석된다. trust-safe boundary 문서에 따라 "감정 입력 직후, 메시지 수신 직후" 광고는 금지된다. Issue 2의 adapter 축소와 함께 제거 권장.

### N2. `customText` localStorage 평문 저장

`src/domain/reminders/schema.ts`의 `Reminder.customText`와 `Reminder.editedText`는 사용자 작성 감정 텍스트를 localStorage에 암호화 없이 저장한다. 로컬 전용 MVP에서는 허용 가능하나, 향후 백엔드 동기화 도입 시 반드시 전송 구간 암호화와 저장 시 암호화 필요. Architecture §6.3의 deletion flow에 "사용자별 텍스트 삭제"가 포함되어야 한다.

### N3. `vault_interest_handled`의 관심 등록 정보 수집 최소화

`stages/10_UX_FINAL.md` §14 remaining_risk: "관심 등록 flow의 구체 입력 항목(이메일 등)은 아직 비워 두었으므로, 실제 정보 수집 범위는 다음 단계에서 최소화 기준으로 확정해야 한다." 이메일 수집은 PII이므로, Architecture §9에 "interest signal flow에서는 이메일/PII를 수집하지 않고, dismissible 안내 카드 + 1-tap `관심 있어요` 클릭만으로 signal을 측정한다"고 명시할 것.

---

## CEO 결정 필요 항목

아래 3건은 Architecture 수정 방향에 대한 Owner 결정이 필요하다.

1. **Free-text PII 경계**: `rewrite_saved` 등 이벤트에서 사용자 입력 텍스트를 제외하는 규칙을 Architecture에 명시한다. (권장: 예)
2. **Adapter 축소 범위**: MVP에서 AuthAdapter, PaymentAdapter, AdsAdapter, EntitlementId, AdPlacementId를 삭제하고 StorageAdapter + NotificationAdapter(capability only)만 남긴다. (권장: 예)
3. **Implementation plan 갱신 시점**: Architecture 수정과 동시에 implementation plan을 6-screen migration 기준으로 갱신한다. (권장: 예)

---

## 허용 위험

아래 항목은 현재 Architecture 상태에서 허용 가능한 위험으로 판단한다.

- Notification이 preview-only인 상태에서 D1 체크인을 수동 재진입에만 의존하는 구조: Architecture §8.1, UX §5.4에 manual fallback이 설계되어 있으므로 MVP 검증에 충분.
- Local-first에서 서버 동기화가 없는 상태의 데이터 유실 위험: MVP 검증 범위 내에서는 치명적이지 않으며, Architecture §6.1에 저장 대상이 명시됨.
- `locale_changed` 이벤트의 잠재적 식별성: 앱 성격상 locale 전환 빈도가 극히 낮으므로 실질적 위험은 미미.

---

## Change Log

- 2026-06-19: initial Architecture B risk review completed. Verdict CHANGES_REQUIRED with 3 issues + 3 narrow findings.
