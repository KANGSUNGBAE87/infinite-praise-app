# [REVISION] 08_PRODUCT_PLAN.md — 칭찬해줘 Product Planning A

- revised_at: 2026-06-19 KST
- phase: Product Planning / A revision final candidate
- author: product-planner
- status: revised-final-candidate
- input_brief: 00_PROJECT_BRIEF.md
- approved_market_research: stages/05_MARKET_RESEARCH.md v1.1.0
- research_approval_decision_id: D-20260619-001
- challenge_review: stages/reviews/product-plan-validation.md
- scope_note: 이 문서는 Product Planning gate의 최종 후보안이다. UX 확정, 개발 승인, 출시 승인, 매출 확정을 뜻하지 않는다.

## 1. Revision summary

이번 revision은 validator challenge 3건을 모두 수용해, 첫 코호트를 `하나의 persona + 하나의 trigger + 하나의 primary mode`로 더 좁히고, D1 재방문 이유를 태깅 가능한 형태로 강화했다. 또한 채널 재현성과 monetization 신호를 분리해, 첫 코호트가 개인 네트워크나 가벼운 curiosity에 속지 않도록 판정 순서를 다시 고정했다. [owner_constraint: stages/reviews/product-plan-validation.md]

### 1.1 Challenge response
| challenge | status | revision result |
| --- | --- | --- |
| 타깃/트리거/모드가 아직 넓다 | accepted | 첫 코호트를 `자기 전 자기비판이 심한 20~30대 한국어 직장인` 1개 persona, `잠들기 전 3분` 1개 trigger, `큐레이션 칭찬` 1개 primary mode로 고정했다. `직접 쓰기`는 제거하지 않고 `내 말로 바꾸기` secondary path로 내렸다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 1; evidence_id: SRC-03; evidence_id: SRC-15] |
| 재방문 루프 이유가 약하다 | accepted | `어제 저장한 한 줄이 오늘도 맞는지`를 묻는 1-tap next-day check-in을 추가하고, reopen reason tagging을 필수 이벤트로 승격했다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 2; owner_constraint: stages/05_MARKET_RESEARCH.md KC-06] |
| monetization/acquisition이 아직 증명 전이다 | accepted | 채널별 `qualified recruit`와 `repeatable channel`을 분리 기록하고, fake-door는 D1 복귀자에게만 `개인 문구 보관함` 관심 신호 1개로 제한했다. 가격 노출과 실제 결제는 제외한다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 3; owner_constraint: stages/05_MARKET_RESEARCH.md §H.4] |

## 2. Planning frame and fixed constraints

### 2.1 Fixed inputs
- Direction B 알림형 코어를 유지하되, 첫 검증은 텍스트/알림/재방문 중심으로 간다. [owner_constraint: D-20260619-001 accepted_scope]
- 음성, TTS, 오디오 재생은 이번 MVP 핵심 범위에서 제외한다. [owner_constraint: 00_PROJECT_BRIEF.md 2026-06-19 21:38 KST; owner_constraint: 01_DECISIONS.md]
- 첫 코호트에서 광고, IAP, Toss points, 실결제는 제외한다. [owner_constraint: D-20260619-001 excluded_scope]
- 제품은 비게임 앱으로 유지하고 Apps in Toss first / Google Play compatibility 원칙을 지킨다. [owner_constraint: 00_PROJECT_BRIEF.md; owner_constraint: app-platform-standard.md]
- 로그인, 광고, 결제, 분석, 저장소는 플랫폼 어댑터 경계를 유지하고 ko 기본 / en selectable 구조를 깨지 않는다. [owner_constraint: app-platform-standard.md; owner_constraint: 지식저장소 projects/무한칭찬앱/platform.md]

### 2.2 Explicit missing-owner constraints
- 승인된 입력에는 예산과 전체 일정이 없다. 따라서 가장 짧은 검증 루프를 우선하고, 팀 규모·런치 날짜·매출 목표를 발명하지 않는다. [owner_constraint: 00_PROJECT_BRIEF.md]
- Owner는 Apps in Toss first를 명시했지만 acquisition channel과 가격은 정하지 않았다. 따라서 도달 채널과 monetization은 모두 실험 가설로만 다룬다. [owner_constraint: 00_PROJECT_BRIEF.md; owner_constraint: 01_DECISIONS.md]

## 3. One-sentence product definition

### 3.1 Primary target
1차 타깃은 `오늘도 제대로 못했다`는 자기비난으로 잠들기 쉬운 20~30대 한국어 직장인이다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 1; evidence_id: SRC-08; evidence_id: SRC-15]

### 3.2 Trigger moment
앱을 여는 순간은 잠들기 전 3분, 폰을 내려놓기 직전에 오늘을 조금 덜 가혹하게 끝내고 싶을 때다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 1; owner_constraint: stages/05_MARKET_RESEARCH.md §G.1]

### 3.3 JTBD
사용자가 자기비난으로 하루를 닫지 않도록, 오늘 버틴 장면을 인정하는 한 줄을 오늘 밤 저장하고 내일 다시 확인하게 해달라. [owner_constraint: D-20260619-001 accepted_scope; owner_constraint: stages/05_MARKET_RESEARCH.md §F.4]

### 3.4 Core problem
현재 대안인 명상 앱, 기록형 앱, 범용 알람/메모는 각각 너무 길고, 너무 많이 써야 하고, 너무 건조해서 자기비난 순간에 바로 다시 열 도구가 되지 못한다. [evidence_id: SRC-02; evidence_id: SRC-03; evidence_id: SRC-04]

## 4. Value proposition and positioning

### 4.1 Value proposition
`칭찬해줘`는 마음관리 콘텐츠를 소비하는 앱이 아니라, 자기 전 자기비난이 올라오는 사용자가 `짧은 칭찬 한 줄을 고르고`, 필요하면 `내 말로 조금 바꾸고`, `내일 다시 확인할 시간 하나를 남기는` 경량 자기조율 앱이다. [owner_constraint: D-20260619-001 accepted_scope; evidence_id: SRC-15]

### 4.2 Positioning against alternatives
- 명상 앱 대비: 긴 청취 대신 `한 줄 선택 + 내일 확인`에 집중한다. [evidence_id: SRC-02; evidence_id: SRC-04]
- 기록형 앱 대비: 빈 화면 장문 입력이 아니라 `큐레이션 칭찬`으로 시작해 진입 마찰을 줄인다. [evidence_id: SRC-03; owner_constraint: stages/reviews/product-plan-validation.md Issue 1]
- 범용 알람/메모 대비: 일정 알림이 아니라 `오늘의 자기비난을 덜 가혹하게 끝내는 말`의 질을 푼다. [owner_constraint: stages/05_MARKET_RESEARCH.md §D.1]
- 즉시음성 위로 앱 대비: 첫 코호트에서는 오디오 제작비와 autoplay 리스크 없이 텍스트 재방문 루프를 먼저 검증한다. [owner_constraint: 00_PROJECT_BRIEF.md audio 제외; owner_constraint: ai/reviews/review.md]

### 4.3 What this product is not
- 치료/상담/진단 앱이 아니다. [owner_constraint: stages/05_MARKET_RESEARCH.md §K.2]
- 생산성 점수화, 습관 감시, 자기비난 강화 앱이 아니다. [owner_constraint: 지식저장소 projects/무한칭찬앱/context.md]
- 포인트/보상형 앱이 아니다. [owner_constraint: stages/05_MARKET_RESEARCH.md §H.4; owner_constraint: apps-in-toss-non-game-ads-points-monetization.md]

## 5. First validation platform and release path

### 5.1 First validation platform
첫 검증 플랫폼은 `Apps in Toss-compatible private mini-app MVP`다. 공개 스토어 노출이 아니라 direct recruit 링크로 들어오는 제한 코호트 검증부터 시작한다. [owner_constraint: 00_PROJECT_BRIEF.md Apps in Toss first; owner_constraint: app-platform-standard.md]

### 5.2 Why this platform first
1. Owner가 Apps in Toss first를 명시했다. [owner_constraint: 00_PROJECT_BRIEF.md]
2. 비게임 앱의 기본 첫 공개 경로가 Apps in Toss다. [owner_constraint: app-platform-standard.md]
3. 지금 가장 큰 불확실성은 패키징보다 `reach`, `setup completion`, `D1 reopen`이다. 제한 코호트 mini-app이면 이 3가지를 충분히 측정할 수 있다. [owner_constraint: stages/05_MARKET_RESEARCH.md §M.2]
4. 기존 구현은 i18n과 adapter 경계를 이미 갖고 있어 Apps in Toss-compatible 검증면으로 진입하기 쉽다. [owner_constraint: ai/plans/implementation-plan.md]

### 5.3 Release path
1. Stage 0: 채널 태깅된 direct recruit로 reach gate를 검증한다. [owner_constraint: app-market-validation.md Pre-build reach gate]
2. Stage 1: private mini-app MVP로 `칭찬 선택 → 시간 저장 → preview`까지의 setup completion을 본다. [owner_constraint: stages/05_MARKET_RESEARCH.md §J.1~J.2]
3. Stage 2: next-day check-in과 reopen reason tagging으로 D1 반복 이유를 검증한다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 2]
4. Stage 3: 위 지표 통과 시에만 실제 notification delivery pilot을 붙인다. [owner_constraint: stages/05_MARKET_RESEARCH.md §J.1; §L]
5. Stage 4: 위 단계 통과 후에만 Apps in Toss 공개 심사 검토를 연다. [owner_constraint: D-20260619-001 open_risk]
6. Google Play는 search-led demand 또는 Apps in Toss channel mismatch가 확인될 때만 별도 branch로 검토한다. [owner_constraint: 00_PROJECT_BRIEF.md]

## 6. First cohort lock

### 6.1 Persona lock
- 대표 persona: 자기 전 스스로를 몰아붙이기 쉬운 20~30대 한국어 직장인 [owner_constraint: stages/reviews/product-plan-validation.md Issue 1]
- 제외 persona: 프리랜서 일반군, 출근 직전 불안 완화군, 낮 슬럼프 일반군, 학생군 [owner_constraint: smallest validation loop]

### 6.2 Trigger lock
- 첫 trigger는 `잠들기 전 3분` 하나만 본다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 1]
- 오후 슬럼프/출근 직전은 첫 코호트 통과 후 vNext trigger 후보로 남긴다. [owner_constraint: stages/05_MARKET_RESEARCH.md §G.1]

### 6.3 Primary mode lock
- 첫 primary mode는 `큐레이션 칭찬`이다. 사용자는 빈 화면에서 시작하지 않는다. [evidence_id: SRC-03; owner_constraint: stages/reviews/product-plan-validation.md Issue 1]
- `직접 쓰기`는 유지하되 first-entry mode가 아니라 `내 말로 바꾸기` secondary path로 둔다. 즉, 선택한 칭찬을 짧게 수정해 자기 말투 수요를 본다. [owner_constraint: D-20260619-001 accepted_scope]
- blank-state freeform 작성은 첫 코호트 필수가 아니다. [owner_constraint: smallest validation loop]

## 7. First value, core loop, and retention thesis

### 7.1 First value
첫 가치는 사용자가 자기 전 한 줄 칭찬을 저장한 직후 `내일 다시 확인할 한마디` preview를 보고, 이 앱이 나를 더 혼내는 앱이 아니라 내일의 나를 위해 한 줄을 남겨두는 앱임을 이해하는 순간이다. [owner_constraint: ai/plans/2026-06-13-praise-me-design-brief.md immediate understanding; owner_constraint: 00_PROJECT_BRIEF.md audio 제외]

### 7.2 Core loop
1. 채널 태그가 있는 링크로 들어온다. [owner_constraint: app-market-validation.md Pre-build reach gate]
2. `오늘 자기 전 자기비판이 올라올 때 한 줄이 필요한 사람인가`를 짧게 확인한다. [owner_constraint: target purity]
3. 큐레이션 칭찬 한 줄을 고른다. [evidence_id: SRC-03]
4. 원하면 `내 말로 바꾸기`로 짧게 수정한다. [owner_constraint: D-20260619-001 accepted_scope]
5. 내일 다시 확인할 시간 1개를 저장한다. [owner_constraint: stages/05_MARKET_RESEARCH.md §J.1]
6. 저장 직후 preview를 본다. [owner_constraint: ai/plans/implementation-plan.md preview_only]
7. 다음날 다시 열면 `어제의 한 줄이 오늘도 맞는지` 1-tap check-in을 한다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 2]
8. 이후 `유지`, `내 말로 수정`, `오늘은 건너뛰기` 중 하나를 고른다. [owner_constraint: ai/plans/implementation-plan.md v0.2 result actions]

### 7.3 Retention thesis
MVP의 재방문 이유는 단순 재노출이 아니라 `어제 저장한 한 줄이 오늘의 나에게도 맞는지 확인해야 하는 미완료 상태`다. 따라서 D1 실험에서는 reopen 자체보다 `check-in completion`과 `reopen reason`을 함께 본다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 2; owner_constraint: stages/05_MARKET_RESEARCH.md KC-06]

## 8. MVP must-have scope

| must-have | why required now | linked hypothesis / need | evidence / constraint | acceptance signal |
| --- | --- | --- | --- | --- |
| 채널 태깅된 landing + target confirm | 타깃 purity와 채널 재현성을 분리해서 봐야 한다 | personal network noise를 줄인다 | [owner_constraint: app-market-validation.md Pre-build reach gate; owner_constraint: stages/reviews/product-plan-validation.md Issue 3] | `channel_attributed`, `target_confirmed`, `target_rejected` 기록 |
| `큐레이션 칭찬` 단일 primary flow | 빈 화면 진입 마찰을 줄여야 한다 | 첫 코호트는 one primary mode로 좁혀야 신호가 선명하다 | [evidence_id: SRC-03; owner_constraint: stages/reviews/product-plan-validation.md Issue 1] | `praise_selected` 발생 |
| `내 말로 바꾸기` secondary path | 직접쓰기 수요를 완전히 버리지 않고도 primary mode를 좁힌다 | 선택된 문장을 자기 말투로 바꾸고 싶은 수요를 본다 | [owner_constraint: D-20260619-001 accepted_scope] | `rewrite_started`, `rewrite_saved` 발생 |
| 시간 1개 저장 | 알림형 코어의 최소 단위를 검증해야 한다 | one-slot으로도 반복 이유가 생기는지 본다 | [owner_constraint: stages/05_MARKET_RESEARCH.md §J.1~J.2] | `reminder_created` 발생 |
| 저장 직후 preview card | 실제 알림 전에도 first value를 전달해야 한다 | setup 이탈을 줄인다 | [owner_constraint: ai/plans/2026-06-13-praise-me-design-brief.md] | `preview_viewed` 발생 |
| next-day 1-tap check-in | D1 재방문 이유를 강화하고 태깅해야 한다 | notification-first와 curiosity reopen을 분리한다 | [owner_constraint: stages/reviews/product-plan-validation.md Issue 2] | `checkin_prompt_viewed`, `checkin_completed` 발생 |
| `유지 / 내 말로 수정 / 오늘은 건너뛰기` | 문구 적합성과 피로도를 알아야 한다 | repeat-use 이유를 행동으로 본다 | [owner_constraint: ai/plans/implementation-plan.md v0.2 result actions] | `message_kept`, `message_edited`, `message_skipped_today` 발생 |
| 로컬 rule 기반 safety check | 감정 앱 trust boundary를 지켜야 한다 | 자기비난/자해/치료 오인 문구를 막아야 한다 | [owner_constraint: ai/plans/implementation-plan.md Task 3; owner_constraint: stages/05_MARKET_RESEARCH.md §K.2] | `message_cautioned`, `message_blocked` 기록 |
| reopen reason tagging | 왜 다시 열었는지 증거를 남겨야 한다 | notification, manual reopen, edit intent를 분리한다 | [owner_constraint: stages/reviews/product-plan-validation.md Issue 2] | `reopen_reason_tagged` 발생 |
| ko 기본 / en selectable 유지 | 플랫폼 표준을 깨지 않는다 | 이후 Google Play 확장 비용을 낮춘다 | [owner_constraint: app-platform-standard.md] | locale 전환 가능 |
| Notification / Storage / Analytics / Locale adapter 경계 | Apps in Toss와 Google Play portability를 지켜야 한다 | 초기 검증이 플랫폼 종속 구현을 강제하지 않는다 | [owner_constraint: app-platform-standard.md; owner_constraint: 지식저장소 projects/무한칭찬앱/platform.md] | 제품 로직에서 raw SDK 의존 없음 |

## 9. Explicit non-goals

| non-goal | why cut now | evidence / constraint |
| --- | --- | --- |
| blank-screen 직접쓰기 first-entry | 첫 코호트 신호를 흐리고 friction을 높인다 | [owner_constraint: stages/reviews/product-plan-validation.md Issue 1; evidence_id: SRC-03] |
| `잔소리` 모드 first cohort | trust risk와 카피 검수 범위를 넓힌다 | [owner_constraint: D-20260619-001 accepted_scope narrowing] |
| 음성 / TTS / 오디오 재생 | Owner가 핵심 범위에서 제외했다 | [owner_constraint: 00_PROJECT_BRIEF.md 2026-06-19 21:38 KST] |
| AI 문장 생성 / AI 상담 / 치료성 표현 | 정책/신뢰 리스크가 크다 | [owner_constraint: stages/05_MARKET_RESEARCH.md §K.2] |
| 로그인 / 계정 / 동기화 | 첫 가설은 setup completion과 D1 반복이다 | [owner_constraint: 00_PROJECT_BRIEF.md] |
| 광고 / IAP / Toss points / 실결제 | 첫 코호트에서는 완전 배제한다 | [owner_constraint: D-20260619-001 excluded_scope; owner_constraint: stages/05_MARKET_RESEARCH.md §H.4] |
| fake urgency 가격표 / paywall / discount copy | D1 전 monetization은 trust를 해친다 | [owner_constraint: apps-in-toss-non-game-ads-points-monetization.md] |
| 다중 알림 슬롯 / 보관함 실구현 / 커뮤니티 | first value와 첫 반복 검증 전에 과하다 | [owner_constraint: smallest validation loop] |
| 공개 스토어 출시 약속 | reach/setup/D1 통과 전에는 이르다 | [owner_constraint: stages/05_MARKET_RESEARCH.md §L] |

## 10. Monetization hypothesis and vNext roadmap

### 10.1 Core monetization rule
핵심 경험인 `칭찬 선택 → 시간 저장 → preview → next-day check-in`은 무료다. 첫 세션에서 돈이나 광고가 first value를 가로막으면 안 된다. [owner_constraint: stages/05_MARKET_RESEARCH.md §H.4; owner_constraint: apps-in-toss-non-game-ads-points-monetization.md]

### 10.2 First monetization hypothesis
첫 monetization 가설은 `반복 사용자가 마음에 든 한 줄을 모아두는 개인 문구 보관함에 관심을 보이는가`다. 시간대별 팩이나 광고보다, 이미 효과를 본 문구를 다시 찾고 싶은 욕구가 감정 앱의 자연스러운 확장에 더 가깝다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 3; evidence_id: SRC-06; evidence_id: SRC-07]

### 10.3 First allowed monetization probe
첫 코호트에서 허용하는 유일한 유료 신호는 D1 복귀자에게만 결과 하단에 노출되는 single fake-door CTA `마음에 든 한 줄 보관함 보기`다. 가격, 결제, 할인, 구독 기간은 보여주지 않는다. [owner_constraint: stages/05_MARKET_RESEARCH.md §H.4; owner_constraint: stages/reviews/product-plan-validation.md Issue 3]

### 10.4 Placement rule
- CTA는 첫 세션에서 완전히 숨긴다. [owner_constraint: stages/05_MARKET_RESEARCH.md §H.4]
- CTA는 check-in과 메시지 확인 이후, 화면 가장 하단에서만 보인다. [owner_constraint: stages/05_MARKET_RESEARCH.md §H.4]
- 감정 입력 직후, 저장 직후, 취약 문구 확인 직전에는 광고/유료 CTA를 두지 않는다. [owner_constraint: KC-05; owner_constraint: apps-in-toss-non-game-ads-points-monetization.md]

### 10.5 vNext roadmap after MVP gates
- vNext-R1 retention: bedtime cohort가 통과하면 `내 말로 바꾸기`를 더 앞세우거나 second trigger 1개(예: 출근 직전)를 별도 코호트로 확장한다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 1]
- vNext-R2 product depth: 보관함, 두 번째 시간 슬롯, 시간대별 큐레이션 팩은 D1/D7과 repeat use 신호 뒤에 검토한다. [owner_constraint: stages/05_MARKET_RESEARCH.md §H.3]
- vNext-M1 monetization: fake-door interest가 있으면 `보관함`부터 실제 유료 후보로 검토한다. 광고는 그 다음이다. [owner_constraint: stages/05_MARKET_RESEARCH.md §H.4]
- vNext-M2 audio: 오디오는 retention과 paid interest가 확인된 뒤 premium or optional add-on으로만 재검토한다. [owner_constraint: 00_PROJECT_BRIEF.md audio 제외]

## 11. Validation plan and success metrics

### 11.1 Experiment 0 — reach gate
- 기간: 7일
- 목표: 같은 메시지 구조로 실제 타깃 3~5명 모집 가능성 확인 [owner_constraint: app-market-validation.md Pre-build reach gate]
- 통과 기준:
  - `qualified_recruits >= 3`
  - `repeatable_channel_count >= 1`
  - 채널별 recruit source가 기록된다
- 실패 기준:
  - 7일 내 3명 미만 모집
  - 타깃이 아닌 일반 curiosity 유입이 대부분
  - 개인 네트워크 1회성 모집 외 재현 채널 없음

### 11.2 Experiment 1 — setup completion + immediate value
- 실행 조건: reach gate 통과
- 방법: `큐레이션 칭찬 → 시간 저장 → preview`까지 유도
- 통과 기준:
  - `reminder_created_rate >= 30%` among qualified entrants [owner_constraint: stages/05_MARKET_RESEARCH.md §J.2]
  - `preview_viewed_rate >= 80%` among creators
  - `rewrite_saved_users >= 1` is directional plus, not hard gate
- 실패 기준:
  - `reminder_created_rate < 30%` → notification-first core를 유지하지 않고 더 짧은 home ritual로 narrow/pivot 검토 [owner_constraint: stages/05_MARKET_RESEARCH.md §J.5]

### 11.3 Experiment 2 — D1 reopen + check-in reason
- 실행 조건: Experiment 1 통과
- 방법: 다음날 reopen 시 1-tap check-in을 제시하고 reopen reason을 태깅
- 통과 기준:
  - `return_next_day_users >= 1`
  - `checkin_completed_users >= 1`
  - `reopen_reason_tagged_rate >= 80%` among reopeners
- directional plus:
  - `return_next_day_rate >= 20%` is encouraging but not a launch promise [owner_constraint: stages/05_MARKET_RESEARCH.md §J.4]
- 실패 기준:
  - `return_next_day_users = 0` → 반복 사용 가설 중단 또는 trigger 재설계
  - reopen은 있으나 `checkin_completed_users = 0` → curiosity reopen 가능성이 높으므로 retention thesis 재검토

### 11.4 Experiment 3 — actual notification delivery pilot
- 실행 조건: Experiment 2 통과
- 방법: 소규모 actual notification path를 붙여 received/opened를 측정
- 통과 기준:
  - `notification_received_users >= 1`
  - `notification_opened_users >= 1` or clear manual-confirm evidence
- 실패 기준:
  - delivery가 플랫폼 의존적으로 불안정하면 public release를 열지 않고 preview/manual reopen validation만 유지 [owner_constraint: stages/05_MARKET_RESEARCH.md §L]

### 11.5 Experiment 4 — trust-safe paid-interest probe
- 실행 조건: D1 복귀자 존재
- 방법: result/check-in 하단에 `마음에 든 한 줄 보관함 보기` fake-door CTA 노출
- directional plus:
  - `vault_interest_clicked >= 1`
- directional fail:
  - `vault_interest_clicked = 0`이면 monetization build 우선순위를 낮추고 free core 반복성에 집중 [owner_constraint: stages/05_MARKET_RESEARCH.md §H.4]

### 11.6 Minimum analytics events
- `landing_viewed`
- `channel_attributed`
- `target_confirmed`
- `target_rejected`
- `praise_selected`
- `rewrite_started`
- `rewrite_saved`
- `message_cautioned`
- `message_blocked`
- `schedule_started`
- `reminder_created`
- `preview_viewed`
- `return_next_day`
- `checkin_prompt_viewed`
- `checkin_completed`
- `reopen_reason_tagged`
- `message_kept`
- `message_edited`
- `message_skipped_today`
- `notification_received`
- `notification_opened`
- `vault_interest_viewed`
- `vault_interest_clicked`

## 12. Kill / narrow / pivot criteria

1. 7일 내 `qualified_recruits < 3`이면 build 확장을 멈추고 acquisition problem으로 되돌린다. [owner_constraint: app-market-validation.md Pre-build reach gate]
2. `reminder_created_rate < 30%`이면 bedtime notification-first core를 그대로 밀지 않는다. [owner_constraint: stages/05_MARKET_RESEARCH.md §J.2; §J.5]
3. `return_next_day_users = 0`이면 반복 사용 가설 실패로 본다. [owner_constraint: stages/05_MARKET_RESEARCH.md §L]
4. reopen은 있으나 `checkin_completed_users = 0`이면 curiosity reopen 가능성이 높으므로 `next-day check-in` 설계 또는 trigger 자체를 다시 본다. [owner_constraint: stages/reviews/product-plan-validation.md Issue 2]
5. `rewrite`에서 caution/block 비율이 과도하게 높으면 first cohort는 `큐레이션 칭찬 only`로 더 줄인다. [owner_constraint: ai/plans/implementation-plan.md Task 3]
6. `vault_interest_clicked = 0`이면 유료 build를 서두르지 않고 free retention을 우선한다. [owner_constraint: stages/05_MARKET_RESEARCH.md §H.4]
7. actual notification delivery가 Apps in Toss에서 불안정하면 public release를 미루고 private validation만 유지한다. [owner_constraint: stages/05_MARKET_RESEARCH.md §L]

## 13. UX handoff package

### 13.1 Approved target to design for
- 한국어 사용자
- 20~30대 직장인
- 자기 전 자기비판이 심한 상황
- 첫 세션의 primary job은 `한 줄 칭찬 저장` [owner_constraint: stages/reviews/product-plan-validation.md Issue 1]

### 13.2 Core flows to design
1. 채널 태깅 landing + target confirm [owner_constraint: app-market-validation.md]
2. 큐레이션 칭찬 선택 [evidence_id: SRC-03]
3. `내 말로 바꾸기` secondary edit [owner_constraint: D-20260619-001 accepted_scope]
4. 시간 1개 저장 + preview [owner_constraint: stages/05_MARKET_RESEARCH.md §J.2]
5. next-day 1-tap check-in [owner_constraint: stages/reviews/product-plan-validation.md Issue 2]
6. `유지 / 수정 / 오늘은 건너뛰기` [owner_constraint: ai/plans/implementation-plan.md]
7. D1 복귀자 하단 fake-door CTA slot 1개 [owner_constraint: stages/05_MARKET_RESEARCH.md §H.4]

### 13.3 Monetization surfaces to design now
- D1 복귀자 result/check-in 화면 하단의 작은 placeholder 영역 1개만 설계한다. [owner_constraint: stages/05_MARKET_RESEARCH.md §H.4]
- 카피는 `보관함 보기`, `더 알아보기` 같은 저압력 표현만 허용한다. [owner_constraint: apps-in-toss-non-game-ads-points-monetization.md]

### 13.4 Monetization surfaces to NOT design now
- paywall
- 가격 카드
- 할인 배너
- rewarded/interstitial/banner placements
- Toss points / 적립 / 보상 홈
- 실제 결제 플로우 [owner_constraint: D-20260619-001 excluded_scope]

### 13.5 Revisit triggers for UX/product re-open
- reach gate 실패 → acquisition message와 qualification부터 다시 본다. [owner_constraint: app-market-validation.md]
- setup completion < 30% → 시간 저장과 primary CTA 마찰을 줄이는 방향으로 narrow. [owner_constraint: stages/05_MARKET_RESEARCH.md §J.2]
- D1 reopen 0 → notification-first보다 home ritual or trigger 변경을 검토. [owner_constraint: stages/05_MARKET_RESEARCH.md §J.5]
- rewrite safety 문제 과다 → freeform 요소를 더 줄이고 큐레이션 비중을 올린다. [owner_constraint: ai/plans/implementation-plan.md]

### 13.6 Copy and policy boundaries
- 금지 표현: 치료, 상담, 진단, 우울 개선, 불안 개선, 전문가 케어 [owner_constraint: stages/05_MARKET_RESEARCH.md §K.2]
- 금지 톤: 수치심, 인격 평가, 죄책감 유도, `오늘만 할인`, `지금 결제` [owner_constraint: apps-in-toss-non-game-ads-points-monetization.md]
- 허용 톤: 다정함, 인정, 가벼운 재시작, 저압력 자기조율 [evidence_id: SRC-02; evidence_id: SRC-03]
- 감정 취약 순간 직전/직후에는 광고·유료 CTA를 두지 않는다. [owner_constraint: KC-05]

## 14. Knowledge candidates

- maturity: confirmed
  summary: 자기확언/감정완화형 알림 앱은 첫 코호트를 `하나의 persona + 하나의 trigger + 하나의 primary mode`로 잠가야 setup completion과 retention 신호 해석이 선명해진다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/08_PRODUCT_PLAN.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/app-market-validation.md
- maturity: confirmed
  summary: 감정 앱의 D1 검증은 단순 reopen 수보다 `next-day check-in completion`과 `reopen reason tagging`을 함께 봐야 curiosity reopen과 실제 반복 이유를 분리할 수 있다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/08_PRODUCT_PLAN.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/app-market-validation.md
- maturity: provisional
  summary: 감정 위로 앱의 첫 monetization probe는 D1 복귀자 하단의 단일 fake-door CTA 1개로 제한하고, paywall/광고/가격 노출은 D7과 repeat-use 신호 이후로 미뤄야 trust 훼손을 줄일 수 있다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/08_PRODUCT_PLAN.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-non-game-ads-points-monetization.md

## 15. Final recommendation for Product Planning gate

- Keep: Apps in Toss-first private validation, bedtime self-criticism cohort, 큐레이션 칭찬 primary flow, secondary rewrite, preview-first first value, next-day check-in, trust-safe fake-door only monetization probe, ko/en + adapter portability.
- Cut: 음성/TTS, 잔소리 first cohort, blank-screen direct-write first-entry, 광고/IAP/실결제, AI generated copy, 공개 출시 약속, broad multi-persona targeting.
- Recommend: APPROVE_WITH_CHANGES only if `reach gate -> setup completion -> D1 reopen + check-in -> notification pilot -> paid-interest probe` 순서가 하드 게이트로 유지될 때. [owner_constraint: stages/reviews/product-plan-validation.md]
- Do not claim yet: 한국 수요 검증 완료, D7 retention 입증, monetization viability, public launch readiness. [owner_constraint: D-20260619-001 open_risk]
