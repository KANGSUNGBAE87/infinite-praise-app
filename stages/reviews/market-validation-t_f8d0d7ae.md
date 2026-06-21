# 칭찬해줘 Market Research B Challenge

- task: t_6d3bfb3f
- parent: t_f8d0d7ae
- date: 2026-06-19 KST
- verdict: VALIDATE_FIRST
- scope: market research / research challenge

## Verdict

VALIDATE_FIRST.
방향성은 살아 있지만, 지금 문서의 핵심 결론은 한국 시장에서의 재방문 루프, 알림 권한/획득 채널, 수익화 적합성에 대한 직접 증거가 아직 부족한 상태에서 글로벌 성공 사례를 과도하게 끌어온 점이 크다.

## Top 3 issue themes

### 1) 글로벌 성공 사례를 한국 시장 수요 증거처럼 쓰는 overfitting

문서의 가장 강한 근거는 I am 앱의 글로벌 매출/설치와 affirmation notification 패턴인데, 이것은 한국어 시장의 동일한 수요를 직접 증명하지 않는다.

- 반증/누락 근거
  - I am의 월 매출·설치 수는 FACT일 수 있어도, 한국어 사용자에게서 같은 메시지 구조가 반복 사용될지, 알림 허용이 확보될지, 유료 전환이 재현될지는 UNKNOWN이다.
  - 한국 대체재 리뷰는 명상/감정관리의 존재를 보여주지만, "칭찬+잔소리+직접쓰기" 포지션의 반복 사용 의지를 직접 보여주지 않는다.
  - 상위 앱의 구독 가격대는 참고값이지, 이 제품의 지불의사를 증명하지 않는다.

- 영향
  - Direction B가 "검증된 상업 모델"처럼 읽히지만, 실제로는 "유사 카테고리에서 가능성 있는 아이디어" 수준이다.
  - 수익화와 시장 적합성 결론이 과하게 낙관적으로 보일 수 있다.

- 최소 수정/검증
  - 한국어 1차 코호트 3~5명을 모집해 알림 생성 완료율, D1 복귀율, 메시지 수정률을 먼저 본다.
  - 글로벌 I am 사례는 벤치마크로만 유지하고, 한국 데이터가 들어오기 전에는 수요 증거가 아니라 가설 보강으로 격하한다.

### 2) 재방문 루프가 "기능"과 "채널"로 분리 검증되지 않음

문서는 알림형 코어가 재방문 루프를 만든다고 주장하지만, 알림 권한 획득·표시·클릭 이후 복귀가 실제로 연결되는지 분리되어 있지 않다.

- 반증/누락 근거
  - "내가 정한 시간"이라는 temporal anchor는 논리적으로 좋지만, 알림 opt-in, notification fatigue, 첫 알림 생성 friction이 병목이라는 점이 더 중요하다.
  - Apps in Toss 환경에서 알림이 얼마나 안정적으로 잡히는지, 또는 사용자가 어떤 순간에 설정을 끝내는지는 아직 측정되지 않았다.
  - 알림형이 좋은지보다 "알림 설정을 끝내는 사용자가 얼마나 되느냐"가 먼저다.

- 영향
  - 재방문성을 강하게 주장하지만 실제로는 퍼널 상단에서 무너질 수 있다.
  - Direction A보다 낫다는 비교는 가능해도, "반복 사용 앱"으로 충분하다고 말하기엔 이르다.

- 최소 수정/검증
  - 채널을 분리해서 측정한다: 노출 → 알림 설정 완료 → 첫 알림 수신 → 다음날 재방문.
  - 첫 검증은 알림 기능 자체보다 reach gate와 onboarding completion을 우선 KPI로 둔다.
  - 만약 알림 완주율이 낮으면, 코어를 알림형으로 고정하기보다 홈 리추얼/수동 진입형으로 좁힌다.

### 3) 수익화는 가능성보다 trust 훼손 리스크가 더 큰 상태

문서는 rewarded / interstitial / subscription 순차 확장을 제안하지만, 이 제품은 감정적 취약 순간과 맞닿을 가능성이 있어 monetization이 core trust를 깰 수 있다.

- 반증/누락 근거
  - 비게임 수익화 원칙은 첫 코호트 monetization CTA 숨김을 요구한다. 이 문서는 이를 따르지만, 감정 위로/자기확언 앱에서는 광고와 구독 CTA가 단순히 늦게 나온다고 trust 문제가 자동으로 해결되지 않는다.
  - 광고/보상/구독이 "나를 달래는 순간"과 가까워지면 사용자는 상업적 의도를 더 민감하게 느낄 수 있다.
  - 광고 수익 가정은 DAU, ad opt-in, eCPM이 모두 측정되기 전까지는 조건부 예시에 불과하다.

- 영향
  - 수익화 모델이 제품의 장점이 아니라 이탈 요인이 될 위험이 있다.
  - 첫 코호트에서는 monetization 논의가 앞서가면 안 된다.

- 최소 수정/검증
  - 첫 코호트는 완전 무수익화로 두고, premium CTA는 D1 복귀자에게만 fake-door로 제한한다.
  - 광고는 결과 후 저장/꾸미기 같은 비핵심 부가가치에서만 테스트한다.
  - 실제 유료화 판단은 D7 retention과 repeat use가 확인된 뒤로 미룬다.

## Evidence quality notes

- 비교적 강한 점
  - 경쟁 앱 비교, 정책 리스크 분류, Apps in Toss/Google Play 이식성 판단은 구조가 좋다.
  - "수익화는 UNKNOWN"으로 분리한 부분은 과장 방지에 유리하다.

- 약한 점
  - SRC-05 같은 글로벌 성공 사례는 방향성 신호로는 유효하지만, 한국 시장 수요/전환의 직접 증거는 아니다.
  - D1 20~30% 같은 수치는 외부 벤치마크이지, 이 앱의 성과 예측치로 쓰기엔 과하다.
  - "발견 가능성 UNKNOWN"을 인정했지만, acquisition channel 실험이 아직 부족하다.

## CEO decision items

1. 한국 타깃 1차 코호트 모집 채널을 먼저 정할 것.
2. 알림형 코어가 실제로 반복 사용을 만드는지, 완주율과 D1으로 확인할 것.
3. 수익화는 초기에는 제외하고 trust를 먼저 검증할 것.
4. Direction A(즉시음성)는 완전히 폐기하지 말고, B 검증 후 premium audio로 재평가할 것.

## Knowledge candidates

- maturity: candidate
  summary: 글로벌 affirmation notification 앱(I am)의 성공은 벤치마크로 유용하지만, 한국어 시장 수요 증거로는 별도 코호트 검증이 필요하다.
  evidence_path: stages/reviews/market-validation-t_f8d0d7ae.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/app-market-validation.md

- maturity: candidate
  summary: 감정/자기위로 앱은 알림·구독·광고의 수익화 가능성보다 trust 훼손 리스크를 먼저 검증해야 한다.
  evidence_path: stages/reviews/market-validation-t_f8d0d7ae.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-non-game-ads-points-monetization.md

- maturity: candidate
  summary: 알림형 유틸리티는 노출, 알림 설정 완료, 첫 알림 수신, 다음날 재방문을 분리해 측정해야 재방문 루프를 검증할 수 있다.
  evidence_path: stages/reviews/market-validation-t_f8d0d7ae.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/app-market-validation.md
