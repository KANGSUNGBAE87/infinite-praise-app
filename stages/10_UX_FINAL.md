# [REVISION] 10_UX_FINAL.md — 칭찬해줘 UX Flow A

- updated: 2026-06-19 KST
- phase: UX / A revision
- status: revision
- project: 칭찬해줘
- scope: Apps in Toss first / Google Play compatible / text + notification first / voice excluded from MVP core
- source inputs: `00_PROJECT_BRIEF.md`, `01_DECISIONS.md`, `stages/08_PRODUCT_PLAN.md`, `ai/plans/2026-06-13-praise-me-design-brief.md`, `지식저장소/projects/무한칭찬앱/platform.md`, `stages/reviews/ux-growth-review.md`

## 1. 핵심 사용자 / trigger / first value

### 핵심 사용자
자기 전 3분에 `오늘도 제대로 못했다`는 생각으로 잠들기 쉬운 20~30대 한국어 직장인.

### trigger moment
폰을 내려놓기 직전, 오늘을 너무 가혹하게 닫지 않고 싶을 때.

### first value
첫 가치는 사용자가 한 줄 칭찬을 저장한 직후, `내일 다시 확인할 한마디` preview를 보고 “이 앱은 나를 더 혼내는 앱이 아니라 내일의 나를 위해 한 줄을 남겨두는 앱”이라고 즉시 이해하는 순간이다.

## 2. UX 원칙

1. 첫 화면에서 목적이 바로 보인다.
2. 빈 화면 입력보다 큐레이션 선택을 먼저 준다.
3. first value 전에는 로그인, 결제, 광고, 복잡한 온보딩을 넣지 않는다.
4. 한국어를 기본으로 두되 영어 전환이 막히지 않게 한다.
5. 작은 화면과 긴 한국어 문구를 기본 조건으로 둔다.
6. 취약한 순간 직전/직후에 유료 CTA를 두지 않는다.
7. 앱을 닫았다가 다시 열어도 사용 흐름이 끊기지 않게 한다.
8. Apps in Toss와 Google Play 둘 다에서 깨지지 않는 공통 화면 구조를 쓴다.

## 3. 핵심 루프

1. 채널 태그가 있는 링크로 유입된다.
2. 짧은 target confirm에서 “지금 이 앱이 필요한 사람인지” 확인한다.
3. 큐레이션 칭찬 한 줄을 고른다.
4. 필요하면 `내 말로 바꾸기`로 짧게 수정한다.
5. 내일 다시 확인할 시간을 1개 저장한다.
6. 저장 직후 preview를 본다.
7. 다음날 열면 `어제의 한 줄이 오늘도 맞는지` 1-tap check-in을 한다.
8. 이후 `유지 / 내 말로 수정 / 오늘은 건너뛰기` 중 하나를 고른다.
9. D1 복귀자에게만 하단 fake-door CTA 1개를 조심스럽게 보여준다.

## 4. 화면 구성 요약

### Screen 1. Channel Landing / Target Confirm
목적: 유입이 맞는 사용자만 다음 단계로 보낸다.

핵심 구성:
- 짧은 헤드라인: “자기 전, 오늘을 덜 가혹하게 닫고 싶나요?”
- 보조 문구: “한 줄 칭찬을 고르고, 내일 다시 확인해요.”
- CTA 1: “맞아요, 들어볼게요”
- CTA 2: “지금은 아니에요”

데이터:
- channel source
- landing viewed
- target confirmed / rejected

상태:
- loading: very short skeleton only
- empty: 없음
- error: 네트워크 실패 시 짧은 retry 안내
- offline: landing copy와 예시 한 줄만 읽기 가능

### Screen 2. Praise Pick
목적: 빈 화면 진입 마찰 없이 primary action을 시작한다.

핵심 구성:
- 상단: 앱명 + 오늘의 한 줄 안내
- 3~5개의 큐레이션 칭찬 카드/칩
- 카드마다 짧은 설명 1줄
- CTA: 선택 후 다음으로

데이터:
- praise_selected
- selected category/pack

상태:
- loading: 카드 스켈레톤
- empty: 콘텐츠가 없으면 기본 3문장 fallback
- error: 로딩 실패 시 기본 팩으로 자동 전환
- disabled: 특정 문구가 safety rule에 걸리면 비활성

### Screen 3. Rewrite Optional
목적: 직접쓰기 수요를 버리지 않되 primary mode를 흐리지 않는다.

핵심 구성:
- 선택한 문장 미리보기
- 한 줄 수정 입력
- “짧게 바꾸기” 도움 문구
- CTA: “저장하기”
- 보조 CTA: “이대로 저장”

데이터:
- rewrite_started
- rewrite_saved
- message_cautioned / message_blocked

상태:
- loading: 없음
- empty: 원문만 보여줌
- error: 저장 실패 시 재시도
- disabled: 위험 문구는 block, 이유는 짧게 설명

### Screen 4. Time Save + Preview
목적: 알림형 코어의 최소 단위를 저장하고 first value를 전달한다.

핵심 구성:
- 시간 1개 선택
- 반복 여부는 MVP에서 고정값 또는 최소 옵션만
- 저장 즉시 preview card
- preview copy는 “내일의 나에게 남기는 한 줄”처럼 짧고 분명하게

데이터:
- schedule_started
- reminder_created
- preview_viewed

상태:
- loading: 시간 피커 스켈레톤
- empty: 기본 추천 시간 제시
- error: 저장 실패 시 retry
- offline: 저장 불가 시 임시 preview만 보여주고 복귀 유도

### Screen 5. Next-day Check-in
목적: D1 복귀 이유를 실제 행동으로 확인한다.

핵심 구성:
- “어제의 한 줄, 오늘도 맞나요?”
- 3개 버튼: `유지`, `내 말로 수정`, `오늘은 건너뛰기`
- 이유 태그는 check-in 직후에 바로 붙인다.
- notification이 없어도 홈/landing에서 `어제 저장한 한 줄 다시 보기`로 수동 재진입 가능하다.

데이터:
- return_next_day(source)
- return_next_day_manual
- checkin_prompt_viewed
- checkin_completed
- reopen_reason_tagged
- message_kept / message_edited / message_skipped_today

상태:
- loading: 없음
- empty: 복귀 메시지 없음
- error: 체크인 저장 실패 시 재시도
- disabled: check-in이 아직 아닌 날에는 이전 상태만 표시

### Screen 6. Result / Trust-safe Monetization Slot
목적: 반복 사용자를 방해하지 않으면서 후속 관심만 탐색한다.

핵심 구성:
- check-in 결과 요약
- 매우 작은 하단 placeholder CTA 1개
- 카피 예: `마음에 든 한 줄 보관함 보기`
- 클릭 후 dismissible 안내 카드 + 관심 등록(선택) 흐름
- 가격/할인/결제 문구 없음

데이터:
- vault_interest_viewed
- vault_interest_clicked
- vault_interest_handled(dismissed | registered | ignored)

상태:
- first session: hidden
- D1 return: visible at bottom only
- error: 해당 없음

## 5. 첫 사용 흐름 상세

### 5.1 진입
- 사용자는 채널 태그가 있는 링크로 들어온다.
- 즉시 product intent를 설명하는 1문장만 보여준다.
- 앱은 “누구를 위한 앱인지”를 먼저 확인한다.

### 5.2 선택
- 빈 입력을 강요하지 않고 큐레이션 칭찬을 먼저 보여준다.
- 사용자가 문장 톤을 바꾸고 싶을 때만 `내 말로 바꾸기`를 연다.

### 5.3 저장
- 시간 1개만 저장한다.
- 저장 직후 preview로 first value를 준다.
- 이 시점까지는 광고/유료 CTA를 보여주지 않는다.

### 5.4 복귀
- 다음날 열리면 1-tap check-in이 먼저 나온다.
- notification delivery가 실패해도 홈/landing에서 수동 재진입할 수 있다.
- 복귀 이유를 태그로 남겨 notification reopen과 curiosity reopen을 분리한다.

## 6. 상태표

| 화면 | loading | empty | error | offline | success | disabled |
| --- | --- | --- | --- | --- | --- | --- |
| Landing | skeleton 2~3줄 | 없음 | retry banner | 핵심 카피만 읽기 | target confirm CTA 활성 | 없음 |
| Praise Pick | 카드 skeleton | 기본 fallback pack | 자동 재시도 + 기본 pack | 마지막 성공 pack만 표시 | praise_selected | safety rule로 일부 카드 비활성 |
| Rewrite | 없음 | 원문만 노출 | 재시도 | 로컬 draft 유지 | rewrite_saved | 위험 문구 차단 |
| Time Save | 피커 skeleton | 추천 시간 1개 제시 | 저장 재시도 | preview-only 임시 보기 | reminder_created | 이미 저장된 시간은 수정 CTA로 변경 |
| Check-in | 없음 | 복귀 메시지 없음 | 재전송 | 이전 기록 읽기만 가능 | checkin_completed | 아직 복귀일이 아니면 비활성 |
| Monetization slot | 없음 | first session hidden | 없음 | 없음 | D1 return only | first session hidden |

## 7. 문구 가이드

### 허용 톤
- 다정함
- 인정
- 가벼운 재시작
- 저압력 자기조율

### 금지 톤
- 치료/상담/진단처럼 보이는 표현
- 수치심 유발
- `오늘만 할인`
- `지금 결제`
- 죄책감 유도

### 추천 마이크로카피 예시
- “오늘을 덜 가혹하게 닫아볼까요?”
- “한 줄만 고르면 충분해요.”
- “내일 다시 볼 수 있게 남겨둘게요.”
- “어제의 한 줄, 오늘도 맞나요?”
- “보관함 보기”
- “곧 준비할게요”

## 8. 접근성 / 모바일 규칙

- 모든 CTA는 엄지 도달이 쉬운 크기로 둔다.
- 버튼과 카드의 터치 영역은 충분히 크게 잡는다.
- 한국어 긴 문장은 2줄 이상 깨져도 핵심 의미가 유지되도록 쓴다.
- 색만으로 상태를 구분하지 않고 텍스트 상태 라벨을 함께 둔다.
- 작은 화면에서 하단 CTA가 안전 영역과 겹치지 않게 한다.
- 화면 전환은 빠르되, 상태 변경이 읽히는 최소 시간은 확보한다.

## 9. 로그인 / 권한 / 복귀

### 로그인
- first value 전에는 필수 아님.
- later stage에서 계정 동기화나 entitlement가 필요해질 때만 도입한다.

### 알림 권한
- 첫 세션에서는 강제 요청하지 않는다.
- 사용자가 시간을 저장한 뒤, next-day check-in의 의미를 이해한 다음에 설명형 요청을 검토한다.

### 복귀
- 앱 재실행 시 마지막 상태를 복원한다.
- 저장 직후, check-in 직전, safety block 후 복귀해도 이전 입력이 날아가지 않게 한다.

## 10. 이벤트

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
- `return_next_day_manual`
- `checkin_prompt_viewed`
- `checkin_completed`
- `reopen_reason_tagged`
- `message_kept`
- `message_edited`
- `message_skipped_today`
- `vault_interest_viewed`
- `vault_interest_clicked`
- `vault_interest_handled`

## 11. 제외 범위

이번 UX A에서 제외한다.

- 음성 / TTS / 오디오 재생
- AI 상담 / 생성형 문장 자동작성
- 광고 / 실결제 / IAP
- 가입 강제 / 프로필 편집 / 소셜 공유
- 커뮤니티 / 랭킹 / 점수화
- 복잡한 멀티 알림 슬롯
- 공개 스토어 확정 문구
- paywall / 가격 카드 / 할인 배너

## 12. 미확정 가정

1. Apps in Toss 첫 검증은 private mini-app 형태로 진행한다.
2. 첫 코호트는 bedtime 자기비판이 높은 직장인으로 잠근다.
3. D1 복귀자에게만 monetization 관심 신호를 노출한다.
4. English locale은 구조적으로 지원하되, 첫 검증 카피는 Korean 중심이다.
5. 알림 delivery pilot은 check-in 신호가 충분히 나온 뒤 붙인다.

## 13. Challenge response

### accepted
- return_next_day를 notification/manual/unknown source로 분리 측정한다.
- check-in 이유 태그는 check-in 직후에 완료되도록 옮겼다.
- notification delivery 실패 시에도 홈/landing에서 수동 재진입할 수 있게 했다.
- fake-door CTA 클릭 후에는 dismissible 안내와 관심 등록 흐름을 둬 dead-end를 막았다.

### rejected_with_reason
- `return_next_day`를 source 없이 aggregate로 두는 안은 거절했다. D1 통과/실패가 delivery 안정성에 오염되므로 Experiment 2 판단에 부적합하다.
- Screen 5를 notification-only로 유지하는 안은 거절했다. private mini-app 환경에서는 delivery 실패가 곧 UX 실패처럼 보일 수 있어 manual fallback이 필요하다.
- 보관함 CTA를 클릭 후 아무 화면 없이 끝내는 안은 거절했다. 감정 앱에서는 dead-end가 trust risk이므로 최소한의 안내와 선택지를 줘야 한다.

### changed_sections_only
- Screen 5 데이터/상태/흐름: source 파라미터, manual fallback, reason tagging timing 수정
- Screen 6 데이터/흐름: `vault_interest_handled` 추가, dismissible 안내 + 선택적 등록 흐름 추가
- 이벤트 목록: `return_next_day_manual`, `vault_interest_handled` 추가
- 문구 가이드: `곧 준비할게요` 추가
- 첫 사용 흐름: notification 실패 시 manual re-entry 명시

### remaining_risk
- notification/manual source 분리 로깅이 구현 초기에 빠지면 D1 해석이 다시 흔들릴 수 있다.
- 관심 등록 flow의 구체 입력 항목(이메일 등)은 아직 비워 두었으므로, 실제 정보 수집 범위는 다음 단계에서 최소화 기준으로 확정해야 한다.
- D1 이후 monetization slot이 너무 빨리 보인다는 인상이 생기면 visible 조건을 더 늦춰야 할 수 있다.

## 14. Architecture handoff for implementation

### app flows
1. Landing/target confirm
2. Praise pick
3. Optional rewrite
4. Time save + preview
5. Next-day check-in with manual re-entry fallback
6. Result + trust-safe monetization slot

### data needed
- channel source
- target confirm decision
- selected praise pack / selected item
- optional rewrite draft and save result
- reminder time and reminder save result
- next-day return source: `notification | manual | unknown`
- check-in decision and reason tag
- vault CTA click + handling result

### adapter touchpoints
- notification adapter: delivery state and open source
- locale adapter: `ko` / `en` copy selection
- storage adapter: saved draft, reminder time, return state
- analytics adapter: event emission with source/handling params
- platform adapter: Apps in Toss / Google Play variants keep the same UX contract

### platform / policy constraints
- first value 전에 login, ads, IAP, or hard permission prompts 금지
- Apps in Toss and Google Play에서 공통으로 동작하는 구조를 유지
- user-visible strings는 locale adapter를 통해 주입
- paid entitlement or store-specific logic는 UX 화면에 직접 노출하지 않음

### out-of-scope UX
- voice / TTS
- AI 상담형 대화
- social/community/share loops
- scoreboards / ranking
- explicit pricing / paywall surfaces
- multi-step onboarding before first value

## 15. Knowledge candidates

- maturity: confirmed
  summary: 감정/자기조율 앱의 D1 return_next_day 측정은 notification-open과 manual-open을 source 파라미터로 분리해야 infrastructure noise와 실제 반복 의도를 구분할 수 있다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/ux-growth-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/app-market-validation.md
- maturity: confirmed
  summary: notification-first 루프의 첫 검증에서는 notification delivery가 불안정할 수 있으므로, 수동 재진입 경로를 설계 단계부터 포함해야 infrastructure failure를 product failure로 오판하지 않는다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/ux-growth-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md
- maturity: confirmed
  summary: 감정 앱의 fake-door monetization CTA는 post-click dead-end가 없도록 dismissible 안내 또는 관심 등록 flow를 함께 설계해야 trust 훼손을 방지하고 의미 있는 monetization signal을 얻을 수 있다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/ux-growth-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-non-game-ads-points-monetization.md
