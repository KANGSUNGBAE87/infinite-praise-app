# 05_MARKET_RESEARCH — 칭찬해줘

version: v1.1.0
status: proposal
updated: 2026-06-19 KST
researcher: market-researcher (A revision — challenge 반영 최종화)
evidence_basis: web search, store listings, monetization reports, blog/community signals
challenge_review: stages/reviews/market-validation-t_f8d0d7ae.md (t_6d3bfb3f, 2026-06-19)

## A. 결정 질문 (Decision Questions)

이 조사가 답할 질문:

1. **출시 여부**: 칭찬해줘의 현재 두 UX 방향(즉시음성 5버튼 vs 알림형 자기조율) 중 어떤 경로가 상품성·수익성·재방문성 근거가 더 강한가? 아니면 하이브리드가 더 나은가?
2. **플랫폼**: Apps in Toss 첫 출시가 유효한가? Google Play 이식성에 치명적 장애물은 없는가?
3. **수익화 방향**: 광고/IAP 중 어떤 경로가 1차 검증 대상인가? MVP에서 수익화를 포함해야 하는가?
4. **진행 여부**: GO / NARROW / VALIDATE_FIRST / STOP 중 어느 단계인가?

## B. 조사 범위와 한계

### B.1 조사 대상

- 지역/언어: 대한민국 (KST), 한국어 우선 + 글로벌 영어권 affirmation 앱 참고
- 기준일: 2026-06-19
- 플랫폼 후보: Apps in Toss, Google Play
- 조사 채널: Google Play Store listings, Apps in Toss 사례/블로그, 웹 검색(경쟁 앱, 리뷰, 수익화 리포트), 공식 개발자센터

### B.2 한계 명시

- Apps in Toss는 공개 top chart가 없음. 카테고리 랭킹·설치수·매출 데이터 확인 불가.
- Google Play에서 '한국어 자기확언/셀프칭찬 알림 앱'을 정확히 필터링할 수 없음. 카테고리 '건강/운동' 또는 '라이프스타일'에서 인접 앱을 대체재로 조사.
- Sensor Tower/Appfigures 등 민간 집계 데이터는 유료 wall 너머. ScreensDesign, AppBrain, AppRank 등 공개 집계에서 보조 데이터 확보.
- 실시간 DAU/D1/D7, 유료 전환율, 광고 ARPDAU는 칭찬해줘 프로젝트에서 아직 측정된 바 없음 → UNKNOWN.
- 조사 시점 Apps in Toss 비게임 미니앱 중 '자기확언/셀프리마인드' 카테고리 적합 사례 1건(괜찮아 버튼)만 확인. 다른 사례는 존재할 수 있으나 공개 검색으로는 발견되지 않음.

## C. Evidence Quality Framework

이 문서의 외부 주장은 아래 분류 체계를 따른다.

```text
source_id: 고유 식별자
claim: 주장 내용
classification: FACT | CLAIM | INFERENCE | UNKNOWN
evidence_tier: 1차_공식(공식 스토어 메타데이터, 공식 문서, 1차 재무공시) |
               2차_집계(민간 집계, 뉴스 기사, 블로그 리뷰) |
               개인_증언(사용자 리뷰, 커뮤니티 글) |
               추론(조사자의 논리적 추론) |
               미확인(확인되지 않은 주장)
what_this_proves: 이 증거가 입증하는 바
what_this_does_NOT_prove: 이 증거가 입증하지 못하는 바
source_owner: 출처 주체
url_or_document: URL 또는 문서 위치
published_or_updated: 게시/업데이트일
checked_at: 조사 확인일
region_and_scope: 지역과 범위
confidence: high | medium | low
```

**증거 역할 구분 (v1.1.0 추가)**:
이 문서는 아래 3가지 역할을 혼용하지 않는다.

| 역할 | 정의 | 예시 |
|------|------|------|
| **수요 증거 (demand proof)** | 칭찬해줘의 타깃 시장(한국어 사용자)에서 특정 기능·포지션에 대한 수요가 실제로 관찰됨 | 한국어 앱 리뷰에서 '칭찬 알림이 필요하다'는 직접 진술 |
| **카테고리 벤치마크 (category benchmark)** | 유사 카테고리의 다른 시장·언어권에서 관찰된 패턴. 방향성 신호일 뿐 한국 시장 수요를 입증하지 않음 | I am 앱의 글로벌 매출, 명상 앱의 구독 가격대 |
| **가설 보강 (hypothesis support)** | 논리적 추론 또는 간접 신호로 가설을 지지하나, 독립적 증거로는 불충분 | "알림이 습관 형성에 유리하다"는 행동경제학 일반론 |

## D. 경쟁 환경 (Competitive Landscape)

### D.1 직접 경쟁: 한국어 자기확언/셀프리마인드 알림 앱

**발견**: '칭찬해줘'가 제안하는 "내가 정한 시간에 내가 고른 말투의 한마디를 알림으로 받는다"는 정확한 포지션의 한국어 앱은 확인되지 않았다. 가장 가까운 대체재는 명상/마음챙김 앱의 알림 기능이거나, 영어 affirmation 앱의 한국어 지원 버전이다.

**대체재 비교표** (5개 대표 앱):

| # | 앱명 | 다운로드 | 평점 | 가격 모델 | 핵심 경험 | 칭찬해줘와의 차이 |
|---|---|---|---|---|---|---|
| 1 | 마보 (Mabo) | 10만+ (GP), 90만+ (누적) | 4.8★ | 구독 월 6,500원 | 전문가 가이드 명상, 수면, 챌린지 | 명상 중심. 사용자 주도 알림 커스터마이징 약함. '칭찬'이 아니라 '명상 가이드 청취'. |
| 2 | 코끼리 (Kokkiri) | 10만+ (GP) | 4.1★ | 구독 월 4,900원 | 혜민스님 명상, 수면유도 | 감성 명상 앱. '칭찬/잔소리' 모드 없음. 콘텐츠 업데이트 느림(리뷰 피드백). |
| 3 | 데이블룸 | 5만+ (GP) | 4.9★ | 부분유료(Premium) | 감사일기 + 확언 + 주간리포트 | 필기 중심. 알림형 자기조율보다 '기록과 회고'에 가까움. |
| 4 | I am (Monkey Taps) | 1,000만+ (전체) | 4.8★ | 구독 $30/년 (3일 무료체험) | 개인화 affirmations, 알림, 위젯 | 글로벌 서비스. 한국어 맞춤 콘텐츠 없음. AI 번역 수준에 가까움. |
| 5 | 괜찮아 버튼 (Apps in Toss) | 미확인 (토스 미니앱) | N/A | 무료 (광고/결제 없음) | 버튼 하나 클릭 → 귀여운 이미지+위로 메시지 | 극도로 단순. 알림·반복·커스터마이징 없음. 2일 심사 승인 사례. |

**분석**:
- 한국어 시장에서 '명상/마음챙김' 카테고리는 마보, 코끼리, 데이블룸이 분점. 모두 구독 모델 채택.
- '자기확언 알림'이라는 좁은 포지션은 공백. I am 앱의 글로벌 성공($300K-$600K/월 매출, 월 150K-300K 설치)은 **카테고리 벤치마크**로서 "affirmation notification 앱"이라는 상품 형태가 상업적으로 성립할 수 있음을 보여준다. 그러나 이는 글로벌 영어권 데이터이며, 한국어 사용자의 동일한 수요·알림 허용·유료 전환·반복 사용을 입증하지 않는다. (§E.4 한국 시장 검증 갭 참조)
- 칭찬해줘의 차별점은 '칭찬+잔소리+직접쓰기' 3모드와 '사용자 주도 시간 설정'이다. 경쟁 앱들은 콘텐츠 소비형(명상 듣기) 또는 기록형(일기)이며, 사용자가 자신에게 보내는 능동적 메시지 설정은 아니다.

### D.2 방어 가능성 (Defensibility)

- **모방 난이도: 낮음**. 알림+로컬메시지 구조는 기술적으로 진입장벽이 낮다. 마보, 데이블룸이 '확언 알림' 기능을 추가하는 것은 어렵지 않음.
- **차별화 가능성**: '잔소리' 모드는 경쟁 앱에 없는 독특한 포지션. 한국 문화에서 '잔소리'는 부정적 뉘앙스가 있으나, product plan의 "사람을 평가하지 않고 행동만 짚는" 원칙은 차별화된 UX로 발전 가능.
- **핵심 방어 수단**: 사용자 데이터(어떤 메시지를 언제 저장하고 유지하는지)와 카피 품질. 다만 첫 코호트 이전에는 데이터 자산이 존재하지 않음.

## E. Pain-Point & 수요 증거

### E.1 Pain 언어 증거

**SRC-01**: "I am" 앱 사용자 리뷰
- claim: "When doubting myself, a notification is a lifesaver. It brings me back to the present."
- classification: CLAIM (개인 증언)
- evidence_tier: 개인_증언
- 증거 역할: **카테고리 벤치마크** (v1.1.0 갱신)
- what_this_proves: 글로벌 영어권 사용자 중 일부에게 알림형 확언이 실시간 정서 조절에 도움됨
- what_this_does_NOT_prove: 한국어 사용자의 pain frequency, 한글 콘텐츠 수요, 한국 시장 재방문율. **이 리뷰는 한국 시장 수요 증거가 아니다.**
- source_owner: theiam.app (공식 랜딩페이지)
- url_or_document: https://theiam.app/
- published_or_updated: 2025-2026 (실시간)
- checked_at: 2026-06-19
- region_and_scope: 글로벌 (영어권 중심)
- confidence: medium

**SRC-02**: 마보 앱 리뷰 (Google Play)
- claim: "출퇴근길에 들어요... 다양한 환경과 상황에 맞는 명상 가이드가 많아서 만족"
- classification: CLAIM (개인 증언)
- evidence_tier: 개인_증언
- 증거 역할: **가설 보강** (v1.1.0 갱신)
- what_this_proves: 한국 사용자가 이동 중/틈새 시간에 정서 관리 콘텐츠를 소비함
- what_this_does_NOT_prove: 알림형 수요, 칭찬/잔소리 수요, 지불의사
- source_owner: Google Play Store (마보)
- url_or_document: https://play.google.com/store/apps/details?id=com.mabopractice.app
- published_or_updated: 2026 (리뷰)
- checked_at: 2026-06-19
- region_and_scope: 대한민국
- confidence: medium

**SRC-03**: 데이블룸 앱 리뷰 (Google Play)
- claim: "심리상담을 받고 있는 기분입니다. 바로 정기결제 했네요."
- classification: CLAIM (개인 증언)
- evidence_tier: 개인_증언
- 증거 역할: **가설 보강** (v1.1.0 갱신)
- what_this_proves: 한국 사용자 중 일부가 정서 관리 앱에 대해 유료 전환 의사가 존재함
- what_this_does_NOT_prove: 칭찬해줘의 구체적 기능에 대한 수요, ARPU. 데이블룸은 '기록형' 앱으로 칭찬해줘의 알림형 UX와 다름.
- source_owner: Google Play Store (데이블룸)
- url_or_document: https://play.google.com/store/apps/details?id=org.maysnow.gratitudediary
- published_or_updated: 2026-05-21
- checked_at: 2026-06-19
- region_and_scope: 대한민국
- confidence: medium

**SRC-04**: 코끼리 앱 리뷰
- claim: "자주 불안하고 우울한데 그때 그때 필요한 상황별 명상이 있어서 마음을 다시 평온하게 만드는 데 유용했어요"
- classification: CLAIM (개인 증언)
- evidence_tier: 개인_증언
- 증거 역할: **가설 보강**
- what_this_proves: 한국 사용자가 상황별/감정별 즉시성 있는 정서 콘텐츠를 원함
- what_this_does_NOT_prove: 칭찬해줘 카테고리에 대한 수요
- source_owner: Google Play Store (코끼리)
- url_or_document: https://play.google.com/store/apps/details?id=com.mindclass.android
- published_or_updated: 2019 (리뷰)
- checked_at: 2026-06-19
- region_and_scope: 대한민국
- confidence: low (오래된 리뷰)

### E.2 Pain 빈도·심각도 평가

- **Pain 유형**: 자기비판, 무기력, 미루기, 감정 기복, 자기 인정 부족
- **빈도 근거**: 직접 측정치 없음 (UNKNOWN). 2024 Adjust 리포트 기준, 건강/피트니스 앱의 median D1 retention은 24~30% 범위 — 일상적 사용을 시사하나 칭찬해줘 고유 지표는 아님.
- **심각도 근거**: 사용자 리뷰에서 '불안', '우울', '무기력' 표현이 반복적으로 등장하나, 이는 앱스토어에서 자기선택된 표본이다. 전체 인구의 pain severity로 일반화 불가.
- **기존 해결 방식**: 명상앱 이용(소비형), 감사일기(기록형), SNS/채팅(사회적 지지), 아무것도 안 함.

### E.3 전환 장벽

- **알림 피로**: 한국 사용자의 평균 알림 허용률은 높지 않다는 정성적 관찰은 있으나, 정량 데이터는 UNKNOWN.
- **습관 형성**: UCL 연구 기준 평균 66일. 앱 초기 이탈이 가장 큰 장벽.
- **경쟁 앱 전환 비용**: 마보/코끼리는 축적된 명상 일기·커뮤니티 데이터가 전환 장벽으로 작용.

### E.4 한국 시장 검증 갭 (v1.1.0 신설)

이 조사에서 확인된 **한국 시장 고유의 미검증 갭**은 다음과 같다. 아래 항목들은 모두 UNKNOWN이며 첫 코호트 측정 전까지는 가설로만 존재한다.

| # | 검증 갭 | 현재 상태 | 첫 코호트 측정 방법 |
|---|---------|----------|-------------------|
| GAP-01 | 한국 사용자가 '자기확언 알림'을 반복 사용할 의지 | UNKNOWN. 글로벌 I am 데이터는 영어권이며 한국 시장 수요 증거가 아님. | 알림 생성 완료율, D1 재방문율 |
| GAP-02 | 한국 사용자의 알림 권한 허용률 (특히 Apps in Toss WebView) | UNKNOWN. 한국 사용자의 평균 알림 opt-in rate에 대한 정량 데이터 없음. | 알림 권한 요청 화면 도달 → 허용 전환율 |
| GAP-03 | '칭찬+잔소리+직접쓰기' 중 어떤 모드가 선택·유지되는가 | UNKNOWN. 경쟁 앱 리뷰는 명상/기록 선호를 보여주나 칭찬해줘 고유 모드 선호는 아님. | 모드별 선택률, 모드 변경률, 모드별 D1 retention |
| GAP-04 | 한국 시장에서의 affirmation 앱 유료 전환 의사 | UNKNOWN. 데이블룸·마보의 구독 전환은 명상/일기 카테고리이며 칭찬 알림과는 제품 성격이 다름. | D1 복귀자 대상 fake-door premium CTA 클릭률 |
| GAP-05 | Apps in Toss 내 자연 발견 가능성 | UNKNOWN. 토스 내부 검색·추천 알고리즘 작동 방식 미공개. | 채널별 유입 attribution 측정 |

**중요**: 이 갭들은 Direction B(알림형) 코어가 "검증된 모델"임을 주장하는 근거로 사용될 수 없다. Direction B는 "유사 카테고리에서 가능성을 시사하는 아이디어" 수준이다. 한국어 1차 코호트 데이터가 확보된 후에야 방향성 검증이 완료된다.

## F. 두 UX 방향 비교 분석

### F.1 Direction A: 즉시음성 5버튼 UX (2026-06-13 design brief)

| 평가 항목 | 근거 및 판단 |
|---|---|
| 첫인상/온보딩 | 강력함. 버튼=즉시보상 연결이 직관적. 마보 리뷰에서도 '즉시성'에 대한 긍정적 언급 다수 (SRC-02). |
| 재방문 루프 | 약함. 버튼을 누르는 것 자체가 habit trigger가 되려면 외부 촉발(알림) 또는 내부 촉발(감정)이 필요한데, 둘 다 설계되어 있지 않음. |
| 콘텐츠 비용 | 높음. 25개 오디오 제작도 아직 완료되지 않음(H1 finding). 음성 품질 유지와 추가 콘텐츠 확장 비용이 지속 발생. |
| 수익화 적합성 | 중간. rewarded ad(한 번 더 듣기, 보너스 음성)는 자연스러우나, 핵심 경험(첫 청취)을 건드리면 안 됨. |
| 감정적 안전성 | 주의 필요. 사용자가 감정적으로 취약한 순간에 '소리'가 핵심 매체라 autoplay·볼륨·공공장소 이슈 있음. |
| Apps in Toss 적합성 | WebView autoplay 정책 제약 가능성. 공식 문서에서 명시적 확인 필요. |

### F.2 Direction B: 알림형 자기조율 UX (2026-06-15 product plan v0.3)

| 평가 항목 | 근거 및 판단 |
|---|---|
| 재방문 루프 | 가능성 있으나 **검증되지 않음** (v1.1.0 갱신). '내가 정한 시간'이라는 temporal anchor는 논리적으로 습관 형성에 유리하나, 알림 권한 획득 → 설정 완료 → 첫 수신 → 재방문의 각 단계가 실제로 연결되는지는 미측정. §J에서 퍼널 단계별로 분리 검증 필요. |
| 첫인상/온보딩 | Direction A보다 약함. 알림 설정까지 완료해야 첫 가치를 경험. 온보딩 이탈 위험. |
| 콘텐츠 비용 | 낮음. 텍스트 기반으로 시작해 v0.2 이후 고사용 메시지만 오디오화 가능. |
| 수익화 적합성 | 양호하나 **감정 앱 특수성 주의** (v1.1.0 갱신). rewarded ad(보너스 음성, 메시지 팩), interstitial(세션 완료 후), subscription(프리미엄 메시지 팩/분석) 순차적 확장 가능하나, 감정적 취약 순간에 광고·구독 CTA가 노출되면 core trust 훼손 리스크 있음. §H.4 참조. |
| 감정적 안전성 | 양호. 텍스트 기반, 사용자 주도 설정, private notification mode 존재. |
| Apps in Toss 적합성 | NotificationAdapter가 핵심. WebView 환경에서 안정적 로컬 알림 구현 가능성 확인 필요. |

### F.3 하이브리드 평가

**가장 강한 근거가 있는 하이브리드**: 알림형 코어 + 보상형 즉시오디오

- 알림으로 재방문 루프를 만들고, 알림 탭 후 진입한 상세 화면에서 '한 번 더 듣기'로 rewarded audio 제공.
- Direction B의 구현(v0.1+v0.2)을 기반으로, v0.3 이후 오디오를 rewarded ad 또는 premium feature로 추가.
- **근거**: 글로벌 "I am" 앱은 텍스트 알림 기반으로 월 $300K-$600K 매출을 올린 후 오디오 기능을 확장함. 단, 이는 **카테고리 벤치마크**로서 한국 시장 재현성을 보장하지 않는다. (v1.1.0 갱신)
- **위험**: Direction A의 즉시성(cold open → immediate audio comfort)은 약화됨. 하이브리드는 Direction B의 온보딩 이탈 문제를 그대로 물려받음.

### F.4 판단

**Direction B(알림형)를 코어로, 오디오를 secondary monetization lever로 권장한다.**

이유:
1. Direction A는 재방문 루프가 구조적으로 약하고, 오디오 제작 비용이 선투입되어 실패 시 손실이 큼.
2. Direction B는 알림 기반 affirmation 모델의 글로벌 **카테고리 벤치마크**(I am 앱)가 존재하나, 이는 한국 시장 수요 증거가 아니며 방향성 신호로만 사용한다. 한국 시장 검증은 첫 코호트로 별도 수행해야 한다. (v1.1.0 갱신)
3. Direction B는 이미 v0.1+v0.2가 구현되어 검증 가능한 상태. Direction A는 오디오 파일조차 missing.
4. 오디오는 v0.3+ 이후 rewarded ad / premium feature로 붙이는 하이브리드 경로가 가장 자본 효율적.

## G. 타깃 사용자 가설

### G.1 1차 타깃

- **페르소나**: 20~30대 직장인/프리랜서
- **Pain**: '오늘 버텼다는 인정을 받고 싶다', '미루는 일을 시작해야 한다', '자기비판이 심해질 때 멈추고 싶다'
- **사용 맥락**: 출근 전(아침 루틴), 오후 슬럼프, 자기 전
- **발견 채널 가설**: Apps in Toss 내 노출, 자기계발/명상 커뮤니티, 인스타그램/스레드 감정 콘텐츠

### G.2 Pain 빈도 가설 (측정 필요)

- **주 3~5회 이상** 특정 감정(무기력, 자기비판, 미루기)을 인지하는 사용자
- 이 빈도는 가설이며, 첫 코호트에서 검증 필요

## H. 수익화 평가

### H.1 수익화 모델 후보

| 모델 | 칭찬해줘 적용 예시 | 근거 | 리스크 |
|---|---|---|---|
| Subscription | 월간 프리미엄: 무제한 알림, 음성팩, 분석 리포트 | 마보(월 6,500원), I am(연 $30)이 입증한 모델 (**카테고리 벤치마크**) | 첫 코호트는 무료 코어 검증이 우선. 유료 전환율 UNKNOWN. 감정 앱에서 구독 CTA의 trust 민감도는 §H.4 참조. |
| Rewarded Ad | '한 번 더 듣기'(보너스 음성), '메시지 팩 열기' | 비게임 수익화 원칙과 정합. rewarded → 앱내재화 → promotion 경로 | 감정 취약 순간에 광고 노출 리스크. UX 경계 설계 필요. **핵심 위로 순간에는 절대 배치 금지** (§H.4). |
| Interstitial Ad | 세션 완료 후(알림 읽기 후 홈 복귀 전) | 비게임 원칙: 작업 완료 경계에만. 하루 1회 cap | 첫 세션에는 광고 배제해야 함 (비게임 수익화 원칙 §첫코호트제한). 감정 입력 직후 배치 금지. |
| IAP (메시지 팩) | 테마별 프리미엄 메시지 팩 (ex: 직장인 위로팩, 아침 루틴팩) | 데이블룸 Premium 모델 참고 | 사용자 제작 콘텐츠 선호 시 팩 판매 매력 감소. |

### H.2 수익화 수치 (예측 아님, 조건부 예시)

**중요**: 아래는 실제 DAU·ad opt-in·전환율이 모두 UNKNOWN인 상태에서의 조건부 추정이다. 수익 예측으로 오인하지 말 것.

```text
가정:
- DAU 1,000명 (검증 전 임의 가정)
- rewarded ad opt-in rate 10% (보수적)
- rewarded eCPM $6 (한국 Android, Q4 2024 기준 중간값, Appodeal 리포트)
- rewarded impressions per DAU: 1회
→ 일 광고수익 ≈ 1,000 × 10% × $6/1,000 × 1 = $0.60/일 → $18/월

- interstitial 1일 1회, DAU 1,000명, eCPM $3
→ 일 광고수익 ≈ $3 → $90/월

이 수치는 DAU가 수천 명 이상이고 ad opt-in이 확인된 후에야 유의미하다.
현재 칭찬해줘의 DAU는 0이며, 첫 코호트에서 광고를 노출하지 않을 예정이므로
수익화 가정은 모두 UNKNOWN으로 분류한다.
```

### H.3 수익화 순서 (비게임 원칙 적용)

비게임 수익화 원칙(`docs/tools/apps-in-toss-non-game-ads-points-monetization.md`)에 따라:

1. **포인트/광고 없이 핵심 반복 루프 검증** ← 현재 단계
2. 앱 내 재화와 부가가치(저장, 공유, 음성)
3. rewarded 광고를 선택형 부가가치에
4. 제한적 interstitial을 작업 완료 경계에
5. 광고 수익·retention 확인 후 소액 Toss points (holdout test)
6. 친구 초대 보상은 가장 마지막

**첫 코호트 제한**: DAU·ad opt-in·paid intent 모두 UNKNOWN이므로, 첫 코호트에서는 monetization CTA를 숨기고, D1 복귀 사용자에게만 단일 fake-door premium/diagnostics CTA 노출.

### H.4 감정 앱의 수익화 신뢰 경계 (v1.1.0 신설)

감정 위로·자기확언 앱은 일반 비게임 앱보다 수익화에 대한 사용자 trust 민감도가 높다. 광고·구독 CTA가 "나를 달래는 순간"과 가까워지면 상업적 의도가 제품 경험을 훼손할 수 있다. 아래 원칙은 monetization 가능성보다 trust 보호를 우선한다.

**Trust-Safe Monetization Boundary**:

| 구분 | 허용 | 금지 |
|------|------|------|
| **위치** | 결과 화면 하단 (D1 복귀자만), 저장/꾸미기 부가기능, 세션 완료 후 홈 복귀 전 | 감정 입력 직후, 메시지 수신 직후, 취약 감정 표현 중, 첫 세션 중 |
| **CTA 표현** | "더 알아보기", "프리미엄 기능 보기", "한 번 더 듣기" | "지금 결제하면", "오늘만 할인", "○○님을 위한 혜택" |
| **타이밍** | 핵심 가치 전달 확인 후 (result_scrolled_to_bottom 등 engagement signal 확보) | 첫 알림 수신 전, 감정 선택 직후, 메시지 확인 전 |
| **광고 유형** | rewarded (사용자 명시적 선택 시), interstitial (세션 완료 경계, 하루 1회 cap) | banner (홈 상단·감정 선택 화면), app_open, rewarded를 핵심 가치 교환 조건으로 사용 |

**첫 코호트 규칙 (강화)**:
- 광고·구독 CTA는 첫 세션에서 **완전히 숨긴다** (visibility: none, not just disabled).
- D1 복귀 확인 사용자에게만 Result 화면 가장 하단에 단일 fake-door premium CTA 노출. 핵심 결과(메시지, 요약) 위에 배치할 수 없다.
- D7 retention과 repeat use가 확인되기 전까지 실제 광고·결제·Toss points 도입은 보류한다.
- 유료화 판단은 최소 D7 retention과 주 3회 이상 repeat use가 확인된 이후로 미룬다.

Source: 비게임 수익화 원칙 §UNKNOWN 첫코호트제한, §민감카테고리주의, §무한칭찬앱 항목; challenge review t_6d3bfb3f Issue 3.

## I. 플랫폼 적합성

### I.1 Apps in Toss 적합성

| 평가 항목 | 판단 | 근거 |
|---|---|---|
| 정책 리스크 | Low | 비게임 생활형 앱. 의료/상담/진단 효과 주장 없음. AI 채팅·금융·사행성·미성년자 대상 아님. |
| 기술 적합성 | Medium | React Native + WebView 모두 가능. 핵심 리스크는 로컬 알림(NotificationAdapter)의 WebView 내 안정성. |
| 출시 사례 | 존재 | '괜찮아 버튼' — 단순 위로 앱이 2일 심사 승인. 칭찬해줘보다 기능이 단순하나, 감정 위로 앱 카테고리 통과 가능성 시사. |
| 수익화 제약 | 관리 가능 | 광고/IAP 적용 시 사업자등록 필요. 첫 코호트는 수익화 없이 진행. |
| 발견 가능성 | UNKNOWN | 토스 내부 검색·추천 알고리즘 작동 방식 미공개. |

### I.2 Google Play 이식성

| 평가 항목 | 판단 | 근거 |
|---|---|---|
| 플랫폼 어댑터 | 준비됨 | AuthAdapter, PaymentAdapter, AdsAdapter, StorageAdapter, NotificationAdapter 구조 존재 (implementation plan). |
| 로컬 알림 | Android 가능 | Android Notification API로 구현 가능. Apps in Toss보다 안정적. |
| 경쟁 환경 | 포화 직전 | '건강/운동' 카테고리 내 meditation/affirmation 앱 다수. ASO 차별화 필요. |
| 수익화 | AdMob 가능 | Google Play 빌드에서 AdMob rewarded/interstitial 적용 가능. eCPM은 한국 Android 기준 $3-$6 (Q4 2024). |
| 정책 리스크 | Low | Google Play Developer Program Policies 위반 요소 없음. |

### I.3 플랫폼 판단

**Apps in Toss 우선 → Google Play 확장** 경로 유효. 다만 첫 코호트 검증은 토스 미니앱보다 빠른 WebView 직접 배포로 시작해 acquisition channel을 먼저 측정하는 것이 비용 효율적 (app-market-validation.md §Pre-build reach gate).

## J. 재방문성 (Revisit Loop) — v1.1.0 개정: 퍼널 단계 분리

### J.1 재방문 루프 퍼널 (Funnel Stages)

재방문 루프는 단일 메커니즘이 아니라 아래 4단계 퍼널이다. 각 단계는 독립적인 이탈 지점이며, 상위 단계가 무너지면 하위 단계는 의미가 없다.

```text
[Stage 1: 노출·획득 (Acquisition)]
  → 타깃 사용자에게 앱 노출 → 설치/진입
  → KPI: reach gate 달성 (7일 내 타깃 3명 모집)
  → 이탈 요인: 채널 불일치, 타깃 메시지 약함

[Stage 2: 온보딩 완주 (Onboarding Completion)]
  → 모드 선택 → 메시지 선택 → 시간 설정 → 알림 권한 허용 → 알림 저장
  → KPI: 알림 생성 완료율 (노출 사용자 중 첫 알림을 실제로 설정한 비율)
  → 이탈 요인: friction(3단계), 알림 권한 거부, 가치 인지 부족
  → **이 단계가 1차 병목이다.** 완주율이 낮으면 알림의 재방문 효과를 논할 수 없다.

[Stage 3: 첫 알림 수신 (First Notification Received)]
  → 설정된 시간에 알림 발송 → 사용자 디바이스에 실제 도달 → 사용자 인지
  → KPI: 알림 도달률, 알림 클릭률
  → 이탈 요인: OS 알림 채널 미설정, 방해금지 모드, WebView 알림 불안정성

[Stage 4: D1 재방문 (Day-1 Return)]
  → 알림 클릭 → 앱 진입 → 오늘의 메시지 확인 → reaction → 다음 알림 확인
  → KPI: D1 복귀율, D7 retention, 활성 알림 유지율, 알림 수정률
  → 이탈 요인: 메시지 불만족, 반복 피로, 알림 무시 습관화
```

### J.2 측정 우선순위

재방문성을 검증할 때 **퍼널 상단이 하단보다 먼저다**. Stage 2(온보딩 완주율)가 충분히 확보되지 않으면 Stage 3~4의 측정은 무의미하다.

**측정 순서**:
1. **Stage 2 우선**: 알림 생성 완료율이 30% 미만이면 → 알림형 코어 가설이 기각된 것으로 보고, 홈 리추얼/수동 진입형으로 pivot 검토.
2. **Stage 2 통과 후 Stage 3~4 측정**: 완주율이 기준 이상일 때만 D1/D7 retention 측정.

### J.3 루프 강도 평가

- **장점 (논리적)**: 사용자가 직접 시간을 설정하므로 notification permission이 확보되면 루프가 자동화됨. "오늘 받을 한마디" 화면이 next-appointment preview 역할.
- **약점 (미검증)**: 첫 알림 생성까지의 friction(모드 선택 → 메시지 선택 → 시간 설정 → 저장). 온보딩 완료율이 1차 병목. **알림형이 좋은지보다 알림 설정을 끝내는 사용자가 얼마나 되는지가 먼저다.**
- **비교 (카테고리 벤치마크)**: "I am" 앱은 25단계 온보딩 퀴즈로 개인화된 첫 affirmation을 제공하여 retention을 높임. 칭찬해줘는 3단계(모드·메시지·시간)로 더 짧으나, 첫 알림 수신까지 시간 간격이 있음. **I am의 온보딩 완주율·D1 데이터는 공개되지 않았으며 한국 시장에 투영할 수 없다.**

### J.4 D1/D7 가설 (측정 필요)

- **D1 복귀율 가설**: 첫 알림 수신 후 앱 재방문율 20-30% (Adjust median D1 기준). **이 수치는 외부 벤치마크일 뿐 칭찬해줘의 예측치가 아니다.**
- **핵심 지표**: 알림 생성 완료율, D1 복귀율, 활성 알림 유지율, 알림 수정률
- 이 수치는 모두 UNKNOWN이며 첫 코호트에서 측정 필요

### J.5 알림형 코어 기각 조건 (v1.1.0 신설)

알림 생성 완료율이 유의미하게 낮을 경우(예: 30% 미만), 알림형을 코어로 고정하지 않고 아래 대안을 검토한다:

- **홈 리추얼형**: 사용자가 수동으로 앱을 열어 오늘의 메시지를 확인. 알림은 보조 채널로만 유지.
- **위젯/락스크린형**: 홈 화면 위젯 또는 락스크린에 당일 메시지 표시. 알림 권한 없이 노출.

## K. 정책·규제 리스크

### K.1 Apps in Toss 금지/제한 카테고리 체크

| 위험 카테고리 | 해당 여부 | 근거 |
|---|---|---|
| 의료/건강 진단·치료 | 해당 없음 | product plan §3에서 의료·상담·진단 효과 주장 금지 명시. |
| AI 채팅/상담 | 해당 없음 | MVP에 LLM/AI 상담 없음. |
| 금융·투자·가상자산 | 해당 없음 | - |
| 사행성/베팅 | 해당 없음 | - |
| 미성년자 대상 유해 | 해당 없음 | 콘텐츠 등급 만 3세 이상 적합. |
| 자사 앱 설치 유도 | 해당 없음 | 외부 링크 기능 없음. |

### K.2 감정/정신건강 민감 카테고리 주의

비게임 수익화 원칙 §민감카테고리주의에 따라:

- **감정/상담 앱으로 오인되지 않도록** 앱 설명과 카피에서 '치료', '상담', '진단', '우울 개선' 표현 금지 (product plan §3에 이미 반영).
- **자해/위기 대응**: MVP에서 자해·폭력 문구는 로컬 rule 기반 safety check로 차단 (implementation plan v0.3 Task 3).
- **광고 배치 제한**: 감정 취약 순간에 interstitial/rewarded 광고 금지 (비게임 원칙 §무한칭찬앱 항목). §H.4의 trust-safe boundary를 적용한다.

### K.3 Google Play Families 정책

칭찬해줘는 아동 대상 앱이 아니며, Families 프로그램 신청 대상 아님. 콘텐츠 등급 만 3세 이상 적합.

## L. 조기 중단 기준 (v1.1.0 갱신)

MVP build 이전에 다음 조건 중 하나라도 충족되면 STOP 또는 NARROW:

1. **7일 reach gate 실패**: 실제 타깃 사용자 3명 이상 모집 불가 (app-market-validation.md §Pre-build reach gate).
2. **알림 생성 완료율 30% 미만** (v1.1.0 상향): 대다수 사용자가 첫 알림조차 만들지 않음. 이 경우 알림형 코어 가설이 기각된 것으로 보고, §J.5의 대안(pivot)을 검토한다. (기존: "D1 복귀율 0%"에서 변경 — 퍼널 상단 우선 원칙 반영)
3. **Stage 2 통과 + D1 복귀율 0%**: 알림 생성 완료율이 30% 이상이나 첫 알림 수신 이후 24시간 내 앱 재방문 0건.
4. **Apps in Toss 심사 거부**: 정책 사유로 승인 불가 판정.

## M. Stage Recommendation

```
판단: VALIDATE_FIRST
```

### M.1 근거 요약

**GO 쪽 근거 (진행 가능성)**:

1. 글로벌 affirmation notification 앱 "I am"이 월 $300K-$600K 매출로 **카테고리 벤치마크** 제공 — "affirmation notification 앱"이라는 상품 형태가 상업적으로 성립 가능함을 시사. 단, 이는 한국 시장 수요 증거가 아니며 방향성 신호로만 사용. (v1.1.0 갱신)
2. 한국어 시장에서 '칭찬+잔소리 자기조율 알림' 포지션 공백 확인. 직접 경쟁자 부재.
3. Apps in Toss 비게임 심사 통과 사례(괜찮아 버튼) 존재.
4. Direction B(알림형) v0.1+v0.2가 이미 구현되어 있고, 57 tests pass, build pass 상태.
5. 수익화 원칙에 따라 첫 코호트는 광고/IAP 없이 핵심 루프 검증 가능.

**보류 쪽 근거 (아직 약한 지점)**:

1. 한국 사용자의 '자기확언 알림' 습관 형성 의지와 retention은 완전히 UNKNOWN. 글로벌 I am 앱 데이터는 영어권이며, 한국 시장에 투영할 수 없다. (§E.4 GAP-01, GAP-02)
2. 알림 권한 획득률 — 특히 Apps in Toss WebView 환경에서의 opt-in rate — 미검증. **알림 설정 완료율(Stage 2)이 전체 재방문 루프의 1차 병목이다.** (§J.1)
3. 사용자 획득 채널 미확인. Apps in Toss 내 발견 가능성은 토스 알고리즘 의존적.
4. DAU, D1, D7, 유료 전환율, ad opt-in rate 모두 0이며 첫 코호트 측정 필요.
5. 수익화 시 ARPU와 paid intent는 완전히 UNKNOWN. 감정 앱 특성상 monetization이 core trust를 훼손할 위험 존재. (§H.4)

### M.2 VALIDATE_FIRST로 진행하기 위한 조건

칭찬해줘가 Product Planning 단계로 넘어가기 전에 검증해야 할 항목:

1. **Pre-build reach gate** (app-market-validation.md §Pre-build reach gate): 7일 이내 타깃 사용자 3명 이상 모집. 모집 채널과 메시지 재현성 확인.
2. **퍼널 Stage 2 검증 (최우선)** (v1.1.0 갱신): WebView 또는 경량 배포로 실제 사용자에게 v0.1+v0.2 노출. **알림 생성 완료율** 측정. Stage 2가 30% 미만이면 알림형 코어를 재검토하고 §J.5의 대안으로 pivot.
3. **Stage 2 통과 시 Stage 3~4 검증** (v1.1.0 갱신): 알림 도달률, D1 복귀율, 활성 알림 유지율 측정.
4. **UX 선호도**: 칭찬/잔소리/직접쓰기 중 어떤 모드가 선택되고 유지되는지 데이터 확보.
5. **수익화 신호 (trust-safe)** (v1.1.0 갱신): D1 복귀 사용자에게만 Result 화면 가장 하단에 단일 fake-door premium CTA 노출. **핵심 결과 위에 CTA를 배치하지 않는다.** 유료화 판단은 D7 retention과 repeat use 확인 후로 미룬다. 광고·결제·Toss points는 첫 코호트에서 완전 배제.
6. **Apps in Toss 심사 pre-check**: 공식 정책 문서와 괜찮아 버튼 사례를 참고해 칭찬해줘가 정책 위반 소지가 없는지 재확인.

### M.3 권장 좁히기 (NARROW)

현재 두 UX 방향 중 **Direction B(알림형)로 먼저 검증**할 것을 권장한다.

- Direction A(즉시음성)는 오디오 제작 병목과 재방문 루프 설계 미비로 첫 코호트에 부적합.
- Direction A는 Direction B의 retention이 확인된 이후 v0.3+ premium audio feature로 재도입. **Direction A를 완전히 폐기하지 않는다.** (v1.1.0 갱신)
- **NARROW 대상**: 첫 검증은 '칭찬' 모드 1개 + '직접 쓰기'로 최소화. 잔소리 모드와 음성은 D1 복귀 확인 후 추가.

## N. Source Ledger (전체 증거 일람)

| source_id | classification | 증거 역할 | claim 요약 | source_owner | confidence |
|---|---|---|---|---|---|
| SRC-01 | CLAIM | 카테고리 벤치마크 | I am 앱 사용자가 "notification is a lifesaver"라고 언급 (영어권) | theiam.app | medium |
| SRC-02 | CLAIM | 가설 보강 | 마보 사용자가 출퇴근 시간에 정서 관리 콘텐츠 소비 | Google Play 리뷰 | medium |
| SRC-03 | CLAIM | 가설 보강 | 데이블룸 사용자가 "심리상담 받는 기분"으로 정기결제 (기록형 앱) | Google Play 리뷰 | medium |
| SRC-04 | CLAIM | 가설 보강 | 코끼리 사용자가 불안·우울 시 명상이 도움된다고 언급 | Google Play 리뷰 | low |
| SRC-05 | FACT | 카테고리 벤치마크 | I am 앱 월 매출 $300K-$600K, 월 설치 150K-300K, 10M+ 다운로드, 연 $30 구독 (**글로벌 영어권. 한국 시장 수요 증거 아님**) | ScreensDesign / SensorTower / AppBrain | high |
| SRC-06 | FACT | 카테고리 벤치마크 | 마보 앱 Google Play 10만+ 다운로드, 4.8★, 월 ~6,500원 구독 | Google Play Store | high |
| SRC-07 | FACT | 카테고리 벤치마크 | 코끼리 앱 Google Play 10만+ 다운로드, 4.1★, 월 ~4,900원 구독 | Google Play Store | high |
| SRC-08 | FACT | 수요 증거 (한국) | 데이블룸 Google Play 5만+ 다운로드, 4.9★, Premium 구독 제공 | Google Play Store | high |
| SRC-09 | FACT | 수요 증거 (한국) | 괜찮아 버튼 Apps in Toss 2일 심사 승인, 무료·광고 없음 | 개인 블로그 (mdtodev.tistory.com) | medium |
| SRC-10 | FACT | 카테고리 벤치마크 | Spiritual Wellness Apps Market $4.84B by 2030, CAGR 14.6% (글로벌) | ResearchAndMarkets (BusinessWire) | medium |
| SRC-11 | FACT | 카테고리 벤치마크 | 글로벌 앱 median D1 retention 25.3%, D30 5.7% (Adjust). **칭찬해줘 예측치 아님** | BusinessOfApps / Adjust | high |
| SRC-12 | FACT | 카테고리 벤치마크 | Utility apps ARPDAU $0.02-$0.06, top $0.08-$0.12 | AdReact | medium |
| SRC-13 | FACT | 카테고리 벤치마크 | 한국 Android Rewarded Video eCPM 중간값 ~$6, Interstitial ~$3 (Q4 2024) | Appodeal eCPM Report Q4 2024 | medium |
| SRC-14 | FACT | 가설 보강 | 구독형 affirmation 앱 habit formation 평균 66일 (UCL 연구) | Selfpause / UCL | medium |
| SRC-15 | INFERENCE | 추론 | 한국어 자기확언 알림 앱 포지션 공백 | 조사자 추론 (D.1) | medium |

## O. Knowledge Candidates

아래 지식은 향후 시장 조사에서 재사용 가능하다. maturity 판단 후 suggested_owner_file로 승격 검토.

| # | maturity | summary | evidence_path | suggested_owner_file |
|---|---|---|---|---|
| KC-01 | candidate | 글로벌 affirmation notification 앱(I am)의 구독형 수익화 모델과 온보딩 패턴(25단계 퀴즈 → paywall)은 한국어 시장 벤치마크로 참고 가능하나, 한국 시장 수요 증거로는 별도 코호트 검증이 필요하다. | §D.1, §H.1, §E.4, SRC-05 | docs/workflows/app-market-validation.md (affirmation 앱 addendum) |
| KC-02 | candidate | Apps in Toss 감정위로 미니앱(괜찮아 버튼)의 2일 심사 승인 사례는 비게임 비수익화 위로 앱의 정책 통과 가능성 근거 | §I.1, SRC-09 | docs/tools/apps-in-toss-platform.md (사례 섹션) |
| KC-03 | candidate | 한국 명상/마음챙김 앱 시장의 구독 가격대: 월 4,900원~6,500원. 칭찬해줘의 향후 premium pricing reference (**카테고리 벤치마크**) | §D.1, SRC-06, SRC-07 | projects/무한칭찬앱/platform.md |
| KC-04 | candidate | 비게임 앱 첫 코호트 monetization 제한 패턴 (ISMSP 프로젝트에서 확립) | §H.3 | docs/tools/apps-in-toss-non-game-ads-points-monetization.md (이미 반영됨) |
| KC-05 | candidate | 감정/자기위로 앱은 알림·구독·광고의 수익화 가능성보다 trust 훼손 리스크를 먼저 검증해야 한다. 광고·CTA는 핵심 위로 순간과 완전히 분리한다. (v1.1.0 신설) | §H.4, challenge review t_6d3bfb3f Issue 3 | docs/tools/apps-in-toss-non-game-ads-points-monetization.md |
| KC-06 | candidate | 알림형 유틸리티는 노출, 알림 설정 완료, 첫 알림 수신, 다음날 재방문을 분리해 측정해야 재방문 루프를 검증할 수 있다. 퍼널 상단(온보딩 완주율)이 하단(D1)보다 우선이다. (v1.1.0 신설) | §J.1, §J.2, challenge review t_6d3bfb3f Issue 2 | docs/workflows/app-market-validation.md |

## P. Change Log

| version | date | note |
|---|---|---|
| 1.1.0 | 2026-06-19 | Market Research A revision — challenge review(t_6d3bfb3f) 반영. §C 증거 역할 구분(수요증거/벤치마크/가설보강) 신설. §D.1 I am 사례를 벤치마크로 격하. §E.1 증거 역할 태그 추가. §E.4 한국 시장 검증 갭 신설(5개 GAP). §F.2/F.3 벤치마크 한계 명시. §F.4 이유 #2 갱신. §H.4 감정 앱 수익화 신뢰 경계 신설. §J 재방문 루프 퍼널 4단계 분리 및 측정 우선순위·기각 조건 신설. §L 조기 중단 기준 갱신(Stage 2 우선). §M.1 근거 갱신(카테고리 벤치마크 명시). §M.2 검증 조건 퍼널 단계별로 재구성. §N Source Ledger에 증거 역할 컬럼 추가. §O KC-05, KC-06 신설. §Q Challenge Response Log 신설. |
| 1.0.0 | 2026-06-19 | Market Research A 초안. 경쟁 환경 5개 앱 비교, pain-point 4개 증거, 두 UX 방향 비교, 수익화 평가, 플랫폼 적합성, stage recommendation VALIDATE_FIRST. |

## Q. Challenge Response Log (v1.1.0 신설)

아래는 market-validator(t_6d3bfb3f)의 challenge review 3개 이슈에 대한 point-by-point 대응이다.

### Q.1 Challenge 1: 글로벌 성공 사례(I am)를 한국 시장 수요 증거처럼 쓰는 overfitting

- **판단**: ACCEPT
- **변경 섹션**: §C (증거 역할 구분 신설), §D.1 (분석 문단 — I am 사례를 '카테고리 벤치마크'로 격하), §E.1 (각 SRC에 증거 역할 태그 추가), §E.4 (한국 시장 검증 갭 5개 GAP 신설), §F.2 (Direction B 재방문 루프 평가 '검증되지 않음'으로 갱신), §F.3 (하이브리드 근거에 벤치마크 한계 명시), §F.4 (이유 #2 '카테고리 벤치마크'로 격하), §M.1 (GO 근거 #1을 벤치마크로 명시), §N (Source Ledger에 '증거 역할' 컬럼 추가 및 SRC-01, SRC-05, SRC-11 등에 벤치마크/가설보강 태그 부여)
- **잔존 리스크**: 한국어 1차 코호트 데이터가 확보되기 전까지는 Direction B가 '검증된 모델'이 아니라 '가능성 있는 아이디어' 수준이다. 첫 코호트에서 GAP-01~GAP-05를 측정하기 전까지 이 리스크는 해소되지 않는다.

### Q.2 Challenge 2: 재방문 루프가 '기능'과 '채널'로 분리 검증되지 않음

- **판단**: ACCEPT
- **변경 섹션**: §J (전면 개정 — J.1 퍼널 4단계 분리, J.2 측정 우선순위에 'Stage 2 우선' 원칙 신설, J.3 루프 강도 평가에 '약점(미검증)' 갱신, J.4 D1 가설에 벤치마크 한계 명시, J.5 알림형 코어 기각 조건 신설), §L (조기 중단 기준 — '알림 생성 완료율 30% 미만'을 1순위로 상향하고 §J.5의 pivot 대안 연계), §M.2 (검증 조건을 퍼널 Stage 2 → Stage 3~4 순서로 재구성)
- **잔존 리스크**: 알림 완주율이 30% 미만으로 나오면 알림형 코어 자체를 재검토해야 한다. 이 경우 홈 리추얼/위젯형으로의 pivot이 필요하며, Product Planning 단계로 넘어가기 전에 대안 UX 검증이 추가로 필요하다.

### Q.3 Challenge 3: 수익화는 가능성보다 trust 훼손 리스크가 더 큰 상태

- **판단**: ACCEPT
- **변경 섹션**: §H.4 (감정 앱 수익화 신뢰 경계 신설 — 허용/금지 매트릭스, 첫 코호트 규칙 강화, 유료화 판단 시점을 D7 retention 이후로 명시), §H.1 (각 수익화 모델의 리스크 컬럼 업데이트), §M.2 (수익화 신호 검증 조건을 trust-safe 원칙으로 갱신 — premium CTA 위치를 Result 화면 최하단으로 제한, 광고·결제·Toss points 첫 코호트 완전 배제)
- **잔존 리스크**: 감정 앱에서 '어디까지가 safe boundary인가'는 사용자별로 민감도가 다르다. 첫 코호트의 fake-door CTA 클릭률만으로는 실제 유료화 시의 trust 훼손을 예측할 수 없다. D7 retention + repeat use 확인 후 실제 광고/결제를 도입할 때 별도의 trust impact 측정이 필요하다.

### Q.4 CEO decision items 반영

Challenge review의 4개 CEO decision items에 대한 본 문서의 대응:

1. **한국 타깃 1차 코호트 모집 채널 결정** → §M.2 항목 1 (Pre-build reach gate), §G.1 (발견 채널 가설)에서 다룸. 구체적 채널 선정은 Product Planning 단계에서 확정.
2. **알림형 코어의 반복 사용 검증 (완주율·D1)** → §J.1~J.2 (퍼널 분리 및 측정 우선순위), §M.2 항목 2~3에서 다룸.
3. **수익화 초기 배제 및 trust 검증 우선** → §H.4 (trust-safe boundary), §M.2 항목 5에서 다룸.
4. **Direction A 폐기 금지, B 검증 후 premium audio로 재평가** → §M.3 (NARROW 문단)에 "Direction A를 완전히 폐기하지 않는다" 명시.

---

## Product Planning Handoff (CEO 승인 시 전달 항목)

아래는 CEO가 VALIDATE_FIRST를 승인하고 Product Planning 단계로 진행할 경우 전달해야 할 항목이다. Product Planning 담당자는 이 항목들을 기반으로 product plan을 작성하되, 스스로 판단할 권한을 갖는다.

### 전달 항목

1. **타깃 세그먼트 가설** (§G)
   - 1차: 20~30대 직장인/프리랜서, 주 3~5회 자기비판·무기력·미루기 인지
   - 사용 맥락: 출근 전(아침 루틴), 오후 슬럼프, 자기 전
   - → Product Planning에서 페르소나 구체화, 모집 채널·메시지 설계

2. **핵심 UX 방향** (§F.4, §M.3)
   - Direction B(알림형 자기조율)를 코어로 검증 시작
   - MVP 모드: '칭찬' + '직접 쓰기' (잔소리·음성은 D1 복귀 확인 후 추가)
   - Direction A(즉시음성)는 폐기하지 않고, B 검증 완료 후 v0.3+ premium audio로 재도입 검토

3. **재방문 루프 검증 구조** (§J)
   - 4단계 퍼널로 측정: 노출 → 온보딩 완주(Stage 2 최우선) → 첫 알림 수신 → D1 재방문
   - Stage 2(알림 생성 완료율)가 30% 미만이면 알림형 코어 재검토, §J.5 대안(홈 리추얼/위젯형)으로 pivot

4. **수익화 가드레일** (§H.4)
   - 첫 코호트: 광고·결제·Toss points 완전 배제. monetization CTA 숨김.
   - D1 복귀 사용자에게만 Result 화면 가장 하단에 fake-door premium CTA 1회 노출
   - 실제 유료화 판단 시점: D7 retention + 주 3회 이상 repeat use 확인 후
   - Trust-Safe Boundary 준수: 핵심 위로 순간(감정 입력·메시지 수신 직후)에 광고·CTA 배치 금지

5. **재방문 메커니즘 재검토 조건** (§J.5, §L)
   - 알림 생성 완료율 30% 미만 → 알림형 코어 기각, §J.5 대안 검토
   - Stage 2 통과 + D1 복귀율 0% → 재방문 루프 가설 falsified

6. **조기 중단 기준** (§L)
   - 4개 조건 중 하나라도 충족 시 STOP 또는 NARROW (상세 §L 참조)

7. **제외 주장 (Product Planning이 전제하지 말아야 할 것)**
   - ❌ "I am 앱의 글로벌 성공이 한국 시장 성공을 보장한다" → 카테고리 벤치마크일 뿐
   - ❌ "알림형 코어가 검증된 재방문 모델이다" → Stage 2~4 측정 전까지 미검증
   - ❌ "수익화 순서대로 진행하면 trust 문제는 자동 해결된다" → 감정 앱 특수성 고려한 별도 trust 측정 필요
   - ❌ "Direction A는 실패한 방향이다" → 검증되지 않았을 뿐이며, B 검증 후 재평가 대상

8. **근거 경로**
   - 본 문서: `stages/05_MARKET_RESEARCH.md` (v1.1.0)
   - Challenge review: `stages/reviews/market-validation-t_f8d0d7ae.md`
   - 수익화 원칙: `docs/tools/apps-in-toss-non-game-ads-points-monetization.md`
   - 시장 검증 워크플로: `docs/workflows/app-market-validation.md`
