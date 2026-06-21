---
version: 1.0
status: final
updated: 2026-06-20
canonical: false
project: 칭찬해줘
topic: QA/Release Policy B — read-only policy synthesis after split functional recovery
input_decision: D-20260620-011
parents:
  - micro-1: t_c83121b1 (rewrite/D1 analytics PASS)
  - micro-2a: t_7c024308 (local-first/i18n PASS, 1 finding)
  - micro-2b: t_007f6e18 (preview notification/fake-door PASS)
basis_date: 2026-06-20 KST
git_head: 03ebb0d889c0c6b1658044d3c17891094faab401
---

# QA/Release Policy B — 칭찬해줘 정책 합성 검토

## Context

D-20260620-011 APPROVE로 QA/Release chain 진입. qa-functional의 split recovery micro-QA 3건(micro-1, micro-2a, micro-2b)이 모두 PASS를 반환했다. 이 task는 그 functional evidence를 기반으로 Apps in Toss / Google Play 정책 경계를 read-only로 합성 검토한다.

- QA profile: qa-policy (read-only reviewer)
- 범위: 정책 합성 검토만. 제품 코드 수정 금지.
- 출시/store 승인 아님: 이 검토는 QA readiness 확인, 배포 승인은 별도 release gate에서.

## Environment

- Repository: /Users/kangsungbae/Documents/무한칭찬앱
- HEAD: `03ebb0d889c0c6b1658044d3c17891094faab401` (main)
- Node: v22.22.3
- Test runner: vitest v4.1.8 (70 tests passed)
- Build: TypeScript 5.x + Vite v8.0.16 (passed)
- OS: macOS 26.2
- Date: 2026-06-20 KST
- 공식 정책 확인일: 2026-06-20 KST
  - [서비스 오픈 정책](https://developers-apps-in-toss.toss.im/intro/guide.md)
  - [서비스별 주의사항](https://developers-apps-in-toss.toss.im/intro/caution.md)
  - [비게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-nongame.md)
  - [UI/UX 가이드](https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md)
  - [자사 앱 설치/외부 링크 가이드](https://developers-apps-in-toss.toss.im/checklist/miniapp-external-link.md)
  - [앱인토스 배포 전 게이트](https://developers-apps-in-toss.toss.im/development/deploy.md)
  - Google Play Developer Program Policies (https://play.google/developer-content-policy)
  - Google Play Data Safety prerequisites for local-first apps (`/Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-release-gate.md` §3, PM-1)

---

## 1. 승인된 제외 범위 보존 검증 (Acceptance Criteria #1)

D-20260620-011의 excluded scope 기준으로 7개 영역을 functional evidence와 대조했다.

| # | 제외 범위 | Functional evidence | Policy risk | Verdict |
|---|-----------|-------------------|-------------|---------|
| 1 | Backend/network | 3개 micro 모두 0 fetch/axios/XMLHttpRequest/sendBeacon/@apps-in-toss match. analytics.track() → `tracked: false`. | Apps in Toss가 로컬 전용 미니앱을 금지하지 않음. Google Play는 network 전송 없으면 Data Safety "no data collected" 선언 가능. | **PASS** |
| 2 | Payment/ad/login | 모든 adapter stub (auth→anonymous, payment→false, ads→disabled). App.tsx 0 match 모든 결제/광고/로그인 패턴. | 비게임 앱에서 광고/IAP 미사용은 정책 위반 아님. MVP에서 선택적 기능 미구현은 허용됨. | **PASS** |
| 3 | AI/counseling | src/ 전역 rg 스캔: AI, 인공지능, 상담, counsel, therapy, 치료, 진단, diagnosis, 우울, 불안, 공황, 정신건강, mental health, 심리, psychology — 0 matches. 제품 copy는 "자기 조율" "셀프 칭찬" 톤만 유지. | 서비스 오픈 정책 §2 (의료/AI상담) 위반 없음. "칭찬"은 의료/상담 주장이 아님. 위로·컴포트 앱 통과 사례 존재 (apps-in-toss-platform.md §66). | **PASS** |
| 4 | Real notification delivery | scheduleReminder() → `preview_only`, requestPermission → `unsupported`. 0 real push/notification SDK import. 3개 화면에 "미리보기 전용" 표시. | 알림 preview-only는 접근 권한 미요청 상태로 Apps in Toss/Google Play permission policy 위반 없음. 사용자에게 명시적 고지 완료. | **PASS** |
| 5 | Direct platform SDK | App.tsx imports: react, i18n, analyticsSanitizer, platform/adapters only. 0 matches for @apps-in-toss/framework, admob, google-signin, billing-library, notifee, firebase in src/. | 앱인토스 SDK 미사용은 위반 아님. WebView 방식 가능. | **PASS** |
| 6 | Restricted content | src/ rg 스캔: 가상자산, 도박, gambling, 금융상품, 투자, 의료, medical, 처방, prescription — 0 matches. | 서비스 오픈 정책 §1 위반 없음. | **PASS** |
| 7 | Price/payment/discount copy | src/ rg 스캔: price, payment, discount, 결제, 할인, paywall, 유료, 구독 — 0 matches. Fake-door `result.notice`: "가격, 결제, 할인 문구는 보여주지 않아요." | Trust-safe constraint 유지. 앱인토스 광고/프로모션 금지 패턴 미해당. | **PASS** |

**Verdict**: D-20260620-011의 excluded scope 7개 영역 모두 보존. 침투 없음.

---

## 2. 서비스 분류 및 정책 적합성

### 2.1 서비스 유형

- 칭찬해줘는 **비게임 생활형 앱** (self-coaching / 셀프 칭찬 메시지)
- Apps in Toss 비게임 출시 가이드 대상
- 의료·AI상담·채팅·커뮤니티·민감콘텐츠·중고거래·웹보드게임 모두 미해당

### 2.2 서비스 오픈 정책 적합성

| 정책 영역 | 칭찬해줘 상태 |
|-----------|-------------|
| 제한 서비스 (§1) | 미해당 — 가상자산, 도박, 금융상품, 투자자문, 의료 모두 아님 |
| 확인 필요 카테고리 (§2) | 미해당 — 의료정보 조회·쇼핑몰·교육 아님 |
| 미니앱 어뷰징 (§3) | 미해당 — 동일 기능 반복 출시 없음, 단일 workspace에 단일 앱 |
| 자사 앱 설치/외부 링크 (§4) | **PASS** — 0 external link, 0 install inducement. 모든 기능 토스 내 WebView에서 완결 |
| UI/UX 가이드 | **PASS** — safe area/닫기/뒤로가기 모두 로컬 화면 상태로 처리. 진입 방해 팝업 없음. |

### 2.3 Google Play 정책 적합성

| 정책 영역 | 칭찬해줘 상태 |
|-----------|-------------|
| Data Safety | **조건부** — 로컬 전용 앱이므로 `"No data collected"` 선언 가능. 단, Data Safety form 작성과 개인정보처리방침 URL 준비는 store 제출 전 필수 (release gate §3, PM-1). 현재 준비되지 않음 → P2. |
| Restricted permissions | **PASS** — permission 미요청 (알림 preview-only). 위치/카메라/연락처/저장소 권한 없음. |
| Impersonation / Deceptive Behavior | **PASS** — "치료" "진단" 주장 없음. 제품 copy는 "자기 조율" "셀프 칭찬"으로 제한. |
| Financial / Health claims | **PASS** — 건강·금융 주장 없음. |
| Target API level | 현재 web app, Android SDK 미사용 → N/A for QA. 추후 Android 포트 시 targetSdkVersion 34+ 필요. |

---

## 3. 기능별 정책 위험 평가

### 3.1 Preview-only notification

- scheduleReminder() → `{ status: "preview_only" }` (hard-coded, no backend)
- requestPermission() → `"unsupported"` (no OS permission dialog)
- 사용자 고지: 3개 화면 + i18n 5개 key로 "미리보기 전용" 명시
- **Policy**: 위험 없음. 실제 푸시/알림 권한 미사용이므로 Apps in Toss permission 정책 위반 없음. preview-only 상태는 MVP design intent로 명시되어 있어, 추후 real notification 전환 시 별도 정책 검토 필요. **P2** (기록).

### 3.2 Fake-door interest slot (step 6, D1 return only)

- step 6은 `sessionPhase === "reopened"` 조건으로만 노출 (첫 세션에서 절대 보이지 않음)
- "관심 없음" / "관심 등록" 이진 선택, 두 액션 모두 dismissible + re-registerable
- 0 price/payment/discount copy (`result.notice`로 명시적 고지)
- Analytics sanitized (11개 free-text 키 제거)
- **Policy**: 위험 없음. Fake-door는 monetization이 아니라 interest signal 수집일 뿐이며, 신뢰 보존 제약(no price, no urgency, dismissible)을 모두 준수. Apps in Toss 광고/프로모션 정책과 충돌 없음. **PASS**.

### 3.3 Analytics / Privacy boundary

- analytics.track() → `{ tracked: false, reason: "analytics_disabled_in_mvp" }`
- analyticsSanitizer가 11개 free-text 필드를 제거 (text, rawText, freeText, praise, rewrite, message 등)
- 사용자 rewrite 입력은 safety classification(caution/blocked)만 emit, 원문 텍스트는 analytics payload에 포함 안 됨
- localStorage에 저장되는 state에는 사용자 입력 텍스트 포함
- **Policy**: 현재 MVP 단계에서는 analytics disabled이므로 PII leak 위험 없음. 단, analytics enabled 시 sanitizer가 반드시 활성화되어야 함. localStorage free-text 존재는 개인정보처리방침에 "로컬 저장, 외부 전송 없음" 고지 필요 (release gate §3). **P2** (store 제출 전).

### 3.4 Local-first data persistence

- localStorage 기반 state/locale 저장 (praise-me:state, praise-me:locale-v1)
- reload 시 state 복원 정상 (micro-2a 검증)
- 손상된 localStorage에서 JSON.parse crash (micro-2a finding #1)
- **Policy P1**: local-first 앱의 persistence integrity는 신뢰성 정책 사안. 손상된 데이터에서 복구 실패 → 사용자 경험 손실. **CHANGES_REQUIRED** (builder remediation, not policy blocker for this QA). Store 제출 전 fix 필요.

### 3.5 Legacy code presence

- `src/core/ttsPrompt.ts`, `src/core/voiceScript.ts` — repo에 존재하나 active import graph 밖
- `src/features/reminder/` — active flow에서 제외
- legacy test files 통과하지만 excluded scope 기능 테스트
- **Policy**: 현재 active flow에서 미사용이므로 policy risk 없음. 단, store 제출 전 번들에서 제외하거나 명시적 dead-code audit 필요. **P3** (기록).

---

## 4. Risk Classification Summary

| Risk ID | Severity | Area | Description | Required Action | Blocker for QA? |
|---------|----------|------|-------------|-----------------|-----------------|
| **P1** | High (builder) | LocalStorage | `App.tsx:47` JSON.parse without try/catch → crash on corrupted state | Builder remediation: try/catch pattern, graceful fallback | **No** (builder-facing, not policy blocker) |
| **P2** | Medium (privacy) | Data Safety / Privacy | 개인정보처리방침 URL, Data Safety form, local storage 고지 미준비 | Store 제출 전 준비 (release gate §3). QA readiness 문서화 완료. | **No** (release gate item, not QA gate) |
| **P2** | Medium (safety) | Analytics sanitizer | analytics enabled 시 sanitizer 활성화 보장 필요 | Architecture에 analytics-enabled guard 문서화 | **No** (현재 disabled) |
| **P2** | Low (tracking) | Preview notification | preview_only가 design intent임을 문서화 | 향후 real notification 전환 시 별도 정책 검토 필요 명시 | **No** (기록) |
| **P3** | Low (cleanup) | Legacy code | TTS/voice/reminder 파일이 repo에 존재하나 미사용 | Store 제출 전 cleanup 또는 dead-code audit | **No** (기록) |

---

## 5. Final Verdict

**PASS_CONDITIONAL**

D-20260620-011 approved scope의 모든 excluded boundary가 보존되어 있다. 기능 증거(micro-1, micro-2a, micro-2b)에서 backend/network push, payment/ad/login, AI/counseling, real notification delivery, direct platform SDK의 침투가 0건이다.

**Conditional items (QA readiness → PASS 가능, store 제출 전 해소 필요):**

1. **P1 — LocalStorage crash fix**: `App.tsx:47`의 `JSON.parse(saved)`에 try/catch 패턴 추가. builder remediation 필요. QA readiness 통과 가능 (찾은 버그, not blocker).
2. **P2 — Privacy/Data Safety 준비**: 개인정보처리방침 URL, Google Play Data Safety form, 앱 내 로컬 저장/미전송 고지 (release gate §3). QA 단계에서는 "준비 필요"로 기록하고, release gate에서 확인.
3. **P2 — Analytics guard**: analytics enable 전 sanitizer 활성화가 Architecture에 명시되어야 함.

**Store submission은 아직 not ready**: P1 fix, P2 privacy items, 공식 release gate 재실행 전까지 제출 불가 (acceptance criteria #2에 따라 QA readiness only).

---

## 6. Accepted Evidence

| Source | Evidence | Verdict |
|--------|----------|---------|
| `stages/40_QA_FUNCTIONAL_MICRO1.md` | rewrite/D1 analytics 5 checkpoints PASS. excluded scope audit clean. | Accepted |
| `stages/40_QA_FUNCTIONAL_MICRO2A_LOCAL_I18N.md` v1.1 | local-first persistence + i18n PASS. 1 known finding (corrupted localStorage). excluded scope clean. | Accepted |
| `stages/40_QA_FUNCTIONAL_MICRO2B_PREVIEW_INTEREST.md` | preview notification/fake-door 3 checkpoints PASS. 0 findings. excluded scope clean. | Accepted |
| `src/platform/adapters.ts` | All adapters stub. auth→anonymous, payment→false, ads→disabled, analytics→tracked:false, notifications→preview_only | Accepted |
| `src/i18n.ts` | 61 ko + 61 en labels. 5개 "미리보기 전용" 관련 key. 0 AI/counseling/medical copy. | Accepted |
| `src/App.tsx` active import graph | react + i18n + analyticsSanitizer + platform/adapters only | Accepted |
| `01_DECISIONS.md` D-20260620-011 | approved scope: rewrite analytics remediation, exclusions preserved | Accepted |
| Apps in Toss 공식 정책 (2026-06-20 재확인) | 서비스 오픈 정책, 비게임 출시 가이드, UI/UX 가이드 위반 없음 | Accepted |
| Google Play Developer Program Policies (2026-06-20 재확인) | Data Safety mandatory, restricted permissions none, no deceptive claims | Accepted |

---

## 7. Open Risks (future gates)

| Risk | Owner | Gate |
|------|-------|------|
| localStorage crash fix 미적용 상태로 store 제출 불가 | builder | release gate §3 |
| 개인정보처리방침 URL, Data Safety form 미준비 | PM/Owner | release gate §3 |
| preview_only → real notification 전환 시 permission/정책 재검토 필요 | PM + policy reviewer | notification milestone |
| Analytics enabled 시 sanitizer guard 필요 | builder + architecture | analytics milestone |
| Legacy TTS/voice/reminder 파일 cleanup | builder | store packaging |

---

## 8. knowledge_candidates

- maturity: provisional
  summary: Policy QA for local-first Apps in Toss mini-apps should verify 7 excluded boundaries (backend/network, payment/ad/login, AI/counseling, real notification, direct SDK, restricted content, price/payment copy) against functional evidence, not just developer declaration. 0-match grep across active src/ for each category + runtime adapter behavior confirmation is the minimum standard.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/50_QA_POLICY_AFTER_RECOVERY.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/

- maturity: provisional
  summary: Preview-only notification policy QA must distinguish between "preview_only as MVP design intent" and "stub-to-be-replaced". The former requires explicit user-facing copy in all surfaces and adapter behavior that returns preview_only without attempting real delivery; the latter may silently enable delivery at a later date without policy re-review. QA artifact must record which case applies.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/src/platform/adapters.ts:67 (scheduleReminder returns preview_only)
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md

- maturity: provisional
  summary: Fake-door trust-safe policy QA must verify not only the absence of price/payment/discount copy, but also D1-only gating, dismissible+re-registerable binary action, sanitized analytics (no free-text in interest payload), and no dead-end state. All 5 constraints must hold to avoid dark-pattern classification.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/40_QA_FUNCTIONAL_MICRO2B_PREVIEW_INTEREST.md §Checkpoint 2
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/

- maturity: provisional
  summary: Release gate §3의 localStorage-only privacy 규칙 — 네트워크 전송이 없다는 사실만으로 privacy 고지와 Data Safety 확인을 생략하지 않는다. local-first 앱도 Google Play는 Data Safety section 완성을 mandatory로 요구하며, 개인정보처리방침 URL과 앱 내 로컬 저장/미전송 고지를 준비해야 한다. Source: release-gate.md PM-1 (2026-06-20).
  evidence_path: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-release-gate.md:51-52
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-release-gate.md
