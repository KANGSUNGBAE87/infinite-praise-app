---
version: 1.0
status: final
updated: 2026-06-20
canonical: true
project: 칭찬해줘
topic: QA/Release Policy Synthesis — split functional QA 통합 정책 검토
input_decision: D-20260620-011
parent_functional_QA:
  - micro-1: t_c83121b1 (rewrite/D1 analytics PASS)
  - micro-2a: t_7c024308 (local-first/i18n PASS, 1 finding → P1 fix applied)
  - micro-2b: t_007f6e18 (preview notification/fake-door PASS)
p1_remediation:
  - decision: D-20260620-014 (APPROVE)
  - retest: t_d4973f17 (PASS)
basis_date: 2026-06-20 KST
git_head: 03ebb0d889c0c6b1658044d3c17891094faab401
policy_check_date: 2026-06-20 KST
---

# 칭찬해줘 QA/Release Policy Synthesis

## Context

D-20260620-011 APPROVE로 split QA chain (qa-functional → qa-policy → studio-ceo) 진입. qa-functional의 micro-1, micro-2a, micro-2b 모두 PASS를 반환했고, micro-2a의 P1 localStorage crash finding은 D-20260620-014로 수정 완료 및 retest PASS. 이 task는 functional evidence를 기반으로 Apps in Toss / Google Play 정책 경계를 read-only로 합성 검토한다.

- QA profile: qa-policy (read-only reviewer)
- 범위: 정책 합성 검토만. 제품 코드 수정 금지.
- 이 검토는 QA readiness 확인이며, 배포/store 승인을 의미하지 않는다.

## Environment

- Repository: /Users/kangsungbae/Documents/무한칭찬앱
- HEAD: `03ebb0d889c0c6b1658044d3c17891094faab401` (main)
- Node: v22.22.3 / vitest v4.1.8 / TypeScript 5.x + Vite v8.0.16
- Tests: 17 files / 70 tests passed
- Build: npm run build passed
- OS: macOS 26.2
- Date: 2026-06-20 KST
- 공식 정책 확인일: 2026-06-20 KST

---

## 1. Functional Evidence Synthesis

### 1.1 micro-1 — rewrite/D1 analytics (t_c83121b1)

| Checkpoint | Verdict | Key Evidence |
|------------|---------|-------------|
| rewrite_started single cardinality | PASS | App.tsx:125 single useEffect emit; test countEvent === 1 |
| caution-save message_cautioned + rewrite_saved | PASS | App.tsx:113 + 208 dual emit; test event sequence assertion |
| blocked rewrite no regression | PASS | App.tsx:108 message_blocked; save button disabled; no rewrite_saved leak |
| D1 reopen / manual return | PASS | Step 5→6 restored; vault_interest_handled.status === "dismissed" |
| excluded scope audit | PASS | 0 network/SDK/TTS/login/payment/ad matches in src/ |

16/53 tests passed, build passed. **PASS**.

### 1.2 micro-2a — local-first / i18n (t_7c024308)

| Checkpoint | Verdict | Key Evidence |
|------------|---------|-------------|
| i18n ko/en label coverage | PASS | 46 i18n keys, 61 ko + 61 en labels; all 6 screens rendered in both locales |
| local-first persistence / reload | PASS (1 finding) | state + locale survive reload; reopened step 5 forced elevation |
| excluded scope audit | PASS | 0 network/SDK/TTS/login/payment/ad matches |

17/70 tests passed. **PASS** with 1 CHANGES_REQUIRED finding: `App.tsx:47` JSON.parse without try/catch on corrupted localStorage.

> **Update**: This finding is **resolved**. D-20260620-014 approve; `normalizeStoredState()` with try/catch guard now at App.tsx:62; QA retest t_d4973f17 PASS (3 browser flows, 0 JS errors, 9 file hashes stable, 70 tests).

### 1.3 micro-2b — preview notification / fake-door (t_007f6e18)

| Checkpoint | Verdict | Key Evidence |
|------------|---------|-------------|
| Preview-only notification | PASS | scheduleReminder → preview_only; requestPermission → unsupported; 0 real SDK; 3× "미리보기 전용" surfaces |
| Fake-door interest handling | PASS | D1-only gating; dismiss + register both work; 0 price/payment/urgency copy; sanitized analytics |
| excluded scope audit | PASS | 0 network/SDK/TTS/login/payment/ad matches |

17/70 tests passed. **PASS** with 0 findings.

### 1.4 Synthesis verdict

두 functional QA 결과를 산술 평균하지 않는다. micro-2a의 유일한 finding(localStorage crash)은 D-20260620-014로 closure 완료. 모든 checkpoint가 PASS이며, 남은 이슈는 정책/P2 수준이다.

**Functional QA combined: 모든 승인 checkpoint PASS, 해소되지 않은 P0/P1 blocker 0건.**

---

## 2. Apps in Toss 정책 적합성

### 2.1 서비스 분류

- 유형: **비게임 생활형 앱** (self-coaching / 셀프 칭찬 메시지)
- Apps in Toss 비게임 출시 가이드 대상
- 의료·AI상담·채팅·커뮤니티·민감콘텐츠·중고거래·웹보드게임 모두 미해당
- 위로·컴포트 앱 통과 사례 존재 (apps-in-toss-platform.md §66, 괜찮아 버튼 2일 심사 승인)

### 2.2 서비스 오픈 정책

| 정책 영역 | 상태 | 근거 |
|-----------|------|------|
| 제한 서비스 (§1) | PASS | 가상자산, 도박, 금융상품, 투자자문, 의료 모두 미해당. src/ grep 0 match. |
| 확인 필요 카테고리 (§2) | PASS | 의료정보·쇼핑몰·교육 미해당. src/에서 AI/상담/치료/진단/mental health 0 match. |
| 미니앱 어뷰징 (§3) | PASS | 단일 workspace, 단일 앱, 동일 기능 반복 출시 없음. |
| 자사 앱 설치/외부 링크 (§4) | PASS | 0 external link, 0 install inducement. 모든 기능 토스 내 WebView 완결. |
| UI/UX 가이드 | PASS | Safe area/닫기/뒤로가기 로컬 화면 상태 처리. 진입 방해 팝업 없음. |

### 2.3 비게임 출시 가이드

- 광고 미사용 (ads adapter → disabled) → PASS
- IAP/결제 미사용 (payment adapter → false) → PASS
- 토스포인트 미사용 → PASS
- 로그인 미사용 (auth adapter → anonymous) → PASS
- 프로모션/스마트발송 미사용 → PASS

**Apps in Toss 비게임 출시 가이드 위반 0건.**

---

## 3. Google Play 정책 적합성

| 정책 영역 | 상태 | 비고 |
|-----------|------|------|
| Data Safety | **CONDITIONAL** | 로컬 전용 → "No data collected" 선언 가능. 단, Data Safety form + 개인정보처리방침 URL 준비는 store 제출 전 필수 (release gate §3). → P2 |
| Restricted permissions | PASS | 알림 preview-only, 위치/카메라/연락처/저장소 권한 미요청. |
| Impersonation / Deceptive Behavior | PASS | "치료" "진단" 주장 없음. copy는 "자기 조율" "셀프 칭찬" 톤. |
| Financial / Health claims | PASS | 건강·금융 주장 없음. |
| Target API level | N/A | 현재 web app, Android SDK 미사용. 추후 Android 포트 시 targetSdkVersion 34+ 필요. |
| Ads / IAP policy | PASS | 광고/IAP 미사용 → 미해당. |

**Google Play 게임 정책 미해당 (비게임 앱). Developer Program Policies 위반 0건.**

---

## 4. Local-First Privacy / Data Safety

### 4.1 현재 데이터 흐름

- `localStorage`: `praise-me:state` (사용자 입력 텍스트 포함), `praise-me:locale-v1`
- 네트워크 전송: **0건** (analytics.track() → `tracked: false`, fetch/axios/XMLHttpRequest 0 match)
- analyticsSanitizer: 11개 free-text 필드 제거 (text, rawText, freeText, praise, rewrite, message 등)
- 사용자 rewrite 입력은 safety classification(caution/blocked)만 emit, 원문은 analytics payload 미포함

### 4.2 평가

| 항목 | 상태 | 설명 |
|------|------|------|
| PII leak 위험 (현재) | PASS | analytics disabled + sanitizer active → PII 외부 전송 0. |
| localStorage crash | **FIXED** | App.tsx:62 normalizeStoredState() with try/catch. D-20260620-014. |
| analytics enable guard | P2 | analytics enabled 시 sanitizer 활성화 보장 → Architecture 문서화 필요. |
| 개인정보처리방침 | P2 | URL, Data Safety form, 로컬 저장 고지 미준비. Store 제출 전 필수 (release gate §3). |
| free-text analytics guard | P2 | 입력 텍스트가 analytics payload에서 제외됨을 Architecture에 명시. |

**로컬 전용 앱이지만 release gate §3(PM-1)에 따라 네트워크 전송 없음을 이유로 privacy 고지와 Data Safety 확인을 생략할 수 없다.**

---

## 5. i18n Readiness

| 항목 | 상태 | 근거 |
|------|------|------|
| ko 기본 / en 선택 | PASS | localeOptions 배열, 언어 전환 버튼 동작. |
| 6-screen 모든 label | PASS | 46 i18n keys, 61 ko + 61 en labels. 모든 스크린 heading/button/paragraph 양쪽 렌더링 검증. |
| Unicode curly quotes | PASS | EN label의 \u2019(curly apostrophe) 정확 매칭 확인 (LocalFirstI18n.test.tsx). |
| locale persistence | PASS | reload 후 locale 복원, localStorage praise-me:locale-v1 유지. |
| stub 완성도 | PASS | 0 hard-coded user string; 모든 사용자-facing copy i18n.t() 경유. |

**i18n PASS. Google Play 스토어 제출 전 ko/en 스토어 문구·스크린샷 계획 필요 (release gate §4).**

---

## 6. Platform Adapter Boundaries

### 6.1 Adapter 상태

| Adapter | Status | 동작 |
|---------|--------|------|
| AuthAdapter | stub | getCurrentUser() → { status: "anonymous" } |
| PaymentAdapter | stub | hasEntitlement() → false |
| AdsAdapter | stub | showPlacement() → { shown: false, reason: "ads_disabled_in_mvp" } |
| StorageAdapter | stub → window.localStorage | loadLocale/saveLocale + getItem/setItem |
| AnalyticsAdapter | stub → no-op | track() → { tracked: false, reason: "analytics_disabled_in_mvp" } |
| NotificationAdapter | stub → preview_only | scheduleReminder() → { status: "preview_only" } |
| LocaleAdapter | stub → localStorage | ko 기본, en 선택 가능 |

### 6.2 Excluded scope audit

| 범주 | src/App.tsx matches | src/ 전역 matches |
|------|-------------------|-------------------|
| Backend/network (fetch/axios/XMLHttpRequest/sendBeacon) | 0 | 0 |
| Platform SDK (@apps-in-toss/admob/billing/notifee/firebase) | 0 | 0 (type constants only) |
| TTS/voice (ttsPrompt/voiceScript/TtsAdapter/VoicePlayback) | 0 | repo 존재, active import graph 밖 |
| Auth/login (login/Login/AuthAdapter/getCurrentUser) | 0 | 0 |
| Payment/IAP/ads (payment/IAP/AdMob/TossPoints/ads) | 0 | 0 |
| AI/counseling (AI/인공지능/상담/counsel/therapy/치료/진단) | 0 | 0 |
| Price/payment/discount copy | 0 | 0 |

Active App.tsx imports: react, i18n, analyticsSanitizer, platform/adapters only.

**모든 adapter는 stub 상태. 제외 범위 7개 영역 침투 0건. adapter boundary PASS.**

---

## 7. Preview-Only Notification

| 검증 항목 | 상태 | 근거 |
|-----------|------|------|
| scheduleReminder → preview_only | PASS | adapters.ts:67 hard-coded return |
| requestPermission → unsupported | PASS | no OS permission dialog |
| real notification SDK | PASS | 0 match for notifee/firebase/push anywhere in src/ |
| backend delivery | PASS | 0 fetch/network call accompanies scheduleReminder |
| user-facing 고지 | PASS | 3 surfaces (summary card + schedule screen + footer), 5 i18n keys |
| preview_only as design intent | PASS | NotificationCapability enum includes "preview_only" as first-class state |

**Preview-only notification은 MVP design intent로 명시. real notification 전환 시 별도 정책 검토 필요 (P2 tracking).**

---

## 8. Fake-Door Interest Slot (Trust-Safe)

| 제약 | 상태 | 근거 |
|------|------|------|
| D1 return only | PASS | sessionPhase === "reopened" gate; 첫 세션에서 절대 노출 안 됨 |
| dismissible | PASS | "관심 없음" → interestAction: "dismissed" + vault_interest_handled |
| re-registerable | PASS | "관심 등록" → interestAction: "registered" + vault_interest_clicked + vault_interest_handled |
| no price/payment/discount copy | PASS | result.notice: "가격, 결제, 할인 문구는 보여주지 않아요." grep 0 match |
| no urgency/scarcity | PASS | 카운트다운, 타이머, "오늘만" 등 0 match |
| sanitized analytics | PASS | 11개 free-text 필드 제거; step 6 payload는 structured keys only |
| no dead-end | PASS | dismiss/register 모두 state 업데이트 후 안정적 UI 상태 유지 |
| state persistence | PASS | interestAction localStorage 유지, reload 후 복원 |

**Fake-door trust-safe 제약 8개 모두 준수. dark-pattern 분류 위험 없음. Apps in Toss 광고/프로모션 정책과 충돌 없음. PASS.**

---

## 9. UI/UX Release Gate Risks

| 리스크 | 상태 | 설명 |
|--------|------|------|
| 진입 방해 팝업 | PASS | 첫 화면에서 광고/팝업 없음. |
| 뒤로가기/종료 방해 | PASS | 모든 화면에서 뒤로/다음/닫기 예측 가능. |
| Safe Area 충돌 | **미검증** | Toss sandbox/실제 앱인토스 환경에서 Safe Area 테스트 미실시 → P3. |
| CTA 모호성 | PASS | 각 화면의 버튼/레이블이 다음 행동을 명확히 설명. |
| 광고·콘텐츠 오인 배치 | PASS | 광고 미사용. fake-door에 "미리보기 전용" + "가격 미표시" 명시. |
| 해상도 대응 | **미검증** | 다양한 해상도/기기 테스트 미실시 → P3. |

---

## 10. Store Submission Hard Gates

### 10.1 Apps in Toss 제출 전 필수

| Gate | 상태 | 분류 |
|------|------|------|
| 샌드박스 테스트 | **미실시** | Owner-gated (Console 조작 필요) |
| 토스앱 테스트 (최소 1회) | **미실시** | Owner-gated |
| 비게임 출시 체크리스트 확인 | **미실시** | Owner-gated |
| UI/UX 가이드 최종 확인 | CONDITIONAL | P3 Safe Area/해상도 검증 후 |
| 사업자 등록 | **불필요** | login/ads/IAP 미사용으로 해당 없음 |
| 개인정보처리방침 | P2 | Owner-gated: URL hosting + Console 등록 |

### 10.2 Google Play 제출 전 필수

| Gate | 상태 | 분류 |
|------|------|------|
| Data Safety form | P2 | Owner/Console-gated |
| 개인정보처리방침 URL | P2 | Owner-gated |
| 스토어 문구 (ko/en) | P3 | repo-complete 가능 (i18n keys 기반) |
| 스크린샷 (ko/en) | P3 | Owner-gated |
| Android targetSdkVersion 34+ | N/A | 현재 web app, Android 포트 시점에 적용 |

### 10.3 Owner/Console/manual action 분류

| 항목 | 분류 | 설명 |
|------|------|------|
| 개인정보처리방침 URL 준비 | Owner-gated | 문서 초안은 repo에서 준비 가능, 최종 URL hosting·Console 등록은 Owner |
| Data Safety form 작성 | Owner/Console-gated | Google Play Console에서 직접 작성 |
| Toss sandbox 테스트 | Owner/Console-gated | Console에서 샌드박스 앱 등록 후 테스트 |
| 토스앱 테스트 | Owner/Console-gated | QR/테스트 스킴으로 실제 토스앱 검증 |
| 스토어 문구 (ko/en) | repo-complete | i18n keys에서 추출 가능, Owner 최종 승인 |
| 스크린샷 | Owner-gated | 실제 기기 캡처 필요 |
| 사업자 등록 | N/A | 현재 불필요 |
| legacy cleanup | repo-complete | builder가 수행 가능 |
| analytics guard 문서화 | repo-complete | Architecture 문서 업데이트 |

---

## 11. Controlled Web/PWA vs Store Release 분리

release gate §"Controlled web/PWA 검증과 스토어 출시 분리"에 따라:

| 검증 단계 | Verdict | 조건 |
|-----------|---------|------|
| **Web/PWA local validation** | **PASS** | Functional QA 모든 checkpoint PASS, P1 fix 적용, build/test green, browser smoke 0 errors, excluded scope intact. 개발자 로컬 환경 + Vite serve에서 검증 완료. |
| **Apps in Toss store release** | **NOT READY** | P2 privacy items (개인정보처리방침, Data Safety) + release gate §3, §4 미실시. |
| **Google Play store release** | **NOT READY** | Data Safety form + 개인정보처리방침 URL + release gate 재실행 필요. |

---

## 12. Risk Matrix

### 12.1 Current risks

| ID | Severity | Area | Description | Status | Action |
|----|----------|------|-------------|--------|--------|
| ~~P1~~ | ~~High~~ | LocalStorage | ~~App.tsx:47 JSON.parse crash on corrupted state~~ | **FIXED** (D-20260620-014) | normalizeStoredState() with try/catch. Retest PASS. |
| P2 | Medium | Privacy/Data Safety | 개인정보처리방침 URL, Data Safety form, 로컬 저장 고지 미준비 | Open → release gate §3 | Owner/Console-gated: URL hosting + form 작성 |
| P2 | Medium | Analytics | analytics enabled 시 sanitizer guard 문서화 필요 | Open → Architecture | repo-complete: Architecture 문서에 analytics-enabled guard 명시 |
| P2 | Low | Preview notification | preview_only → real notification 전환 시 재검토 필요 | Tracked | 향후 notification milestone에서 정책 re-check |
| P3 | Low | Legacy code | TTS/voice/reminder 파일 repo 잔존 | Tracked | repo-complete: store packaging 전 cleanup |
| P3 | Low | UI/UX | Safe Area/해상도 Toss sandbox 미검증 | Tracked | Owner-gated: sandbox test 시점에 검증 |
| P3 | Low | Store listing | ko/en 스토어 문구·스크린샷 미준비 | Tracked | repo-complete + Owner-gated |

### 12.2 P0/P1 blocker summary

**P0: 0건, P1: 0건** (기존 P1은 D-20260620-014로 closure 완료)

---

## 13. Final Verdict

**PASS** (for local/prototype QA readiness)

D-20260620-011 approved scope 내에서:

- Functional QA micro-1, micro-2a, micro-2b 모든 checkpoint PASS
- P1 localStorage crash fix 적용 및 retest PASS (D-20260620-014)
- 7개 excluded scope 영역 침투 0건
- Apps in Toss 비게임 정책 위반 0건
- Google Play Developer Program Policies 위반 0건
- Platform adapter boundary intact (all stubs)
- i18n ko/en 완전, preview-only notification + fake-door trust-safe 제약 모두 준수

**Store submission은 별도 hard gate.** Controlled web/PWA validation은 PASS, Apps in Toss / Google Play store release는 P2 privacy/Data Safety items + release gate 재실행 전까지 NOT READY.

### Release Readiness Matrix

| Dimension | Verdict | Blocker |
|-----------|---------|---------|
| Functional QA (rewrite/D1 analytics) | PASS | — |
| Functional QA (local-first/i18n) | PASS | P1 resolved |
| Functional QA (preview/fake-door) | PASS | — |
| Apps in Toss policy | PASS | — |
| Google Play policy | CONDITIONAL | P2 Data Safety form |
| Local-first privacy | CONDITIONAL | P2 개인정보처리방침 |
| Platform adapter boundaries | PASS | — |
| i18n readiness | PASS | — |
| Preview notification limits | PASS | — |
| Fake-door trust-safe | PASS | — |
| UI/UX release gate | CONDITIONAL | P3 Safe Area/해상도 미검증 |
| Web/PWA local validation | PASS | — |
| Apps in Toss store release | NOT READY | P2 + release gate |
| Google Play store release | NOT READY | P2 + release gate |

---

## 14. Accepted Evidence

| Source | Evidence | Verdict |
|--------|----------|---------|
| `stages/40_QA_FUNCTIONAL_MICRO1.md` | rewrite/D1 analytics 5 checkpoints PASS | Accepted |
| `stages/40_QA_FUNCTIONAL_MICRO2A_LOCAL_I18N.md` v1.1 | local-first/i18n PASS, excluded scope clean | Accepted |
| `stages/40_QA_FUNCTIONAL_MICRO2B_PREVIEW_INTEREST.md` | preview/fake-door 3 checkpoints PASS, 0 findings | Accepted |
| `stages/40_QA_FUNCTIONAL_LOCALSTORAGE_RETEST.md` | P1 fix retest PASS, 3 browser flows 0 errors | Accepted |
| `stages/30_BUILD_REPORT.md` v1.7 | normalizeStoredState, 17/70 tests, build pass | Accepted |
| `stages/reviews/t_0416e644-rewrite-analytics-remediation-review.md` | dev-reviewer PASS for rewrite analytics | Accepted |
| `stages/reviews/t_b512118f-localstorage-fallback-review.md` | dev-reviewer PASS for localStorage fix | Accepted |
| `01_DECISIONS.md` D-20260620-011, D-20260620-013, D-20260620-014 | approved scope + P1 closure | Accepted |
| `src/App.tsx` lines 62-93 | normalizeStoredState() with try/catch confirmed | Accepted |
| `src/platform/adapters.ts` | all adapters stub, preview_only first-class enum | Accepted |
| `src/i18n.ts` | 61 ko + 61 en labels, 0 AI/counseling/medical copy | Accepted |
| Apps in Toss 공식 정책 (2026-06-20 재확인) | 서비스 오픈 정책·비게임 가이드·UI/UX 가이드 위반 없음 | Accepted |
| Google Play Developer Program Policies (2026-06-20 재확인) | Data Safety mandatory 외 위반 없음 | Accepted |

---

## 15. knowledge_candidates

- maturity: provisional
  summary: Policy synthesis for local-first Apps in Toss non-game mini-apps should verify 7 excluded boundaries (backend/network, payment/ad/login, AI/counseling, real notification, direct SDK, restricted content, price/payment copy) against functional grep evidence + adapter behavior confirmation. P1 code-defect closure requires both dev-reviewer PASS and functional retest PASS before policy synthesis can remove it from risk matrix.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/42_QA_POLICY.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/

- maturity: provisional
  summary: Store submission hard gates and web/PWA validation must be separated in policy artifacts. Web/PWA local validation can reach PASS while store release remains NOT READY. Owner/Console-gated actions (privacy URL, Data Safety form, sandbox test) should be classified as repo-complete vs Owner-gated vs hard gate for upload.
  evidence_path: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-release-gate.md §"Controlled web/PWA 검증과 스토어 출시 분리"
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-release-gate.md

- maturity: provisional
  summary: Preview-only notification policy QA must distinguish "preview_only as MVP design intent" from "stub-to-be-replaced." The adapter capability enum should include preview_only as a first-class state, and the policy artifact must record which case applies so real-notification conversion triggers mandatory re-review.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/src/platform/adapters.ts:5 (NotificationCapability)
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md

- maturity: provisional
  summary: Fake-door trust-safe constraints for non-game companion apps require 8 simultaneous checks — D1-only gating, dismissible, re-registerable, no price/payment/discount copy, no urgency/scarcity language, sanitized analytics (no free-text in interest payload), no dead-end state, and interest-action state persistence across reload. All 8 must hold to avoid dark-pattern classification under Apps in Toss ad/promotion policy.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/42_QA_POLICY.md §8
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/testing/

- maturity: provisional
  summary: Release gate §3 localStorage-only privacy rule — network 전송 없음만으로 privacy 고지와 Data Safety 확인을 생략할 수 없다. local-first 앱도 Google Play는 Data Safety section 완성을 mandatory로 요구하며, 개인정보처리방침 URL과 앱 내 로컬 저장/미전송 고지를 준비해야 한다. (Prior promoted to release-gate.md PM-1; reaffirmed here.)
  evidence_path: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-release-gate.md:51-52
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-release-gate.md
