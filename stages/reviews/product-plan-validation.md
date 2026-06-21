# [CHALLENGE] Product Planning B — 칭찬해줘

- verdict: VALIDATE_FIRST
- date: 2026-06-19 KST
- project: 칭찬해줘
- reviewed_artifact: `stages/08_PRODUCT_PLAN.md`
- basis: `00_PROJECT_BRIEF.md`, `01_DECISIONS.md`, `stages/05_MARKET_RESEARCH.md`, `docs/workflows/app-market-validation.md`, `docs/workflows/app-platform-standard.md`, `docs/tools/apps-in-toss-platform.md`, `docs/workflows/apps-in-toss-development-gate.md`

## 결론
계획은 방향이 꽤 잘 좁혀졌고, Apps in Toss 우선/Google Play 호환, 텍스트 미리보기 우선, 음성 제외, 광고·IAP 후순위 분리가 잘 반영됐다. 다만 아직은 “누구에게, 어떤 순간에, 어떤 반복 이유로”가 충분히 검증된 상태가 아니고, monetization·알림 재방문·채널 획득이 모두 가설 수준이라 개발 확정 전에 짧은 검증이 더 필요하다.

## 핵심 이슈 3개

### 1) JTBD는 선명하지만 타깃/트리거가 아직 넓다
- 반증/누락 근거
  - `20~30대 한국어 사용자`, `직장인·프리랜서`, `자기 전/오후 슬럼프/출근 직전`이 모두 들어가 있어 초기 코호트가 넓다.
  - `칭찬받기`와 `직접 쓰기` 2모드를 모두 포함하면서도, 어느 쪽이 먼저 반복을 만드는지 아직 증명되지 않았다.
- 영향
  - 메시지/채널/온보딩이 넓어져 reach gate와 setup completion 해석이 흐려질 수 있다.
- 최소 수정/검증
  - 첫 코호트는 `하나의 순간 + 하나의 대표 persona + 하나의 primary mode`로 더 좁혀서 검증한다.
  - 예: “자기 전 자기비판이 심한 직장인” 또는 “출근 직전 불안을 낮추려는 프리랜서” 중 하나만 먼저 본다.
- CEO 결정 항목
  - 첫 검증 persona와 primary mode를 하나로 고정할지 결정.

### 2) 재방문 루프는 설계됐지만 실제 반복 이유가 아직 약하다
- 반증/누락 근거
  - 핵심 retention thesis는 `내가 남긴 한 줄이 나중의 나에게 다시 온다`인데, 이것만으로 D1 재방문을 설명하기엔 약하다.
  - `return_next_day_users >= 1`은 방향성 지표로는 좋지만, 왜 다시 열었는지의 행동 근거가 아직 부족하다.
- 영향
  - 저장/미리보기까지는 되더라도, 다음날 자연 재방문이 안 나오면 notification-first 가설 전체가 흔들릴 수 있다.
- 최소 수정/검증
  - 실제 알림 전 단계에서 `다음날 다시 열 이유`를 1개 더 만든다. 예: 어제 저장한 문구의 변화 요약, 짧은 체크인, 미완성 상태 표시 중 하나.
  - D1 실험에서는 reopen 사유를 반드시 태깅한다.
- CEO 결정 항목
  - 재방문 장치를 “저장한 한 줄의 재노출”만으로 둘지, “짧은 체크인/상태 변화”를 추가할지 결정.

### 3) Monetization과 acquisition은 아직 증명 전이다
- 반증/누락 근거
  - 광고/IAP를 빼는 것은 맞지만, 그 대신 누가 들어올지와 누가 돈을 낼지는 아직 UNKNOWN이다.
  - `premium_interest_clicked >= 1` 같은 fake-door 신호는 가능하지만, 실제 가격/패키지에 대한 지불의사 근거는 아니다.
  - reach gate도 3~5명 모집이라는 소규모 기준이라, 제품력보다 개인 네트워크 효과를 측정할 위험이 있다.
- 영향
  - 개발 우선순위가 좋아 보여도, 실제로는 채널이 없거나 유료 전환이 약해 사업성이 닫힐 수 있다.
- 최소 수정/검증
  - 모집 채널별로 `반복 모집 가능성`과 `채널 재현성`을 분리 기록한다.
  - fake-door는 D1 복귀자에게만 유지하고, 가격은 숨긴 채 “보관함/시간대별 팩” 중 하나에 대한 관심만 본다.
- CEO 결정 항목
  - 초기 채널을 직접 모집 중심으로 둘지, 외부 유입 채널을 별도 실험으로 먼저 열지 결정.

## 판정 요약
- PASS는 아님: 아직 채널/반복/지불의사 중 핵심 불확실성이 남아 있다.
- STOP도 아님: 계획은 충분히 작고, 정책/플랫폼/구현 방향은 무리하지 않게 좁혀졌다.
- 따라서 `VALIDATE_FIRST`가 적절하다.

## 최소 검증 순서
1. reach gate: 같은 메시지 구조로 타깃 3~5명 모집 가능성 확인
2. setup completion: 칭찬받기 vs 직접 쓰기 중 덜 막히는 흐름 확인
3. D1 reopen: 실제로 다시 열 이유가 생기는지 확인
4. fake-door: D1 복귀자에게만 제한된 유료 관심 확인

## knowledge_candidates
- maturity: confirmed
  summary: 비게임 Apps in Toss 미니앱은 광고/IAP를 먼저 넣기보다 reach gate, setup completion, D1 reopen을 먼저 통과해야 한다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/product-plan-validation.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/app-market-validation.md
- maturity: provisional
  summary: 자기비판 완화형 알림 앱은 첫 코호트를 하나의 대표 persona와 하나의 primary mode로 더 좁혀야 채널/리텐션 신호 해석이 선명해진다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/product-plan-validation.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/projects/무한칭찬앱/context.md
- maturity: provisional
  summary: D1 재방문 실험은 단순 재노출보다 reopen 사유 태깅이 있어야 notification-first 가설과 홈 리추얼 가설을 분리해 읽을 수 있다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/product-plan-validation.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/app-market-validation.md
