# 칭찬해줘 v0.4 상세 상품·재방문·디자인 통합 지시문

작성일: 2026-06-20  
대상: 현재 6-screen local-first 구현  
목적: 현재 기능 계약을 깨지 않으면서, 화면 배치·미적 완성도·상품성·재방문 동기를 강화한다.

---

## 0. 이 문서의 사용법

이 문서는 다음 세 가지 용도로 한 번에 사용한다.

1. **상품/UX 기획 기준**
2. **GPT Image 등 이미지 생성기의 화면 시안 생성 프롬프트**
3. **Codex/Hermes/개발 AI가 실제 앱에 디자인을 적용할 때 쓰는 작업 지시문**

첨부할 참고 이미지:

- `praise_me_mvp_1.png`: 재방문 홈
- `praise_me_mvp_2.png`: 오늘의 한 줄 선택
- `praise_me_mvp_3.png`: 다음 날 체크인

이미지는 픽셀 복제용 정답이 아니다. 다만 다음 항목은 강한 기준으로 사용한다.

- 정보 계층
- 카드 크기와 배치
- 라벤더 중심 팔레트
- 파스텔 감정 패널
- 넉넉한 여백
- 단일 화면의 핵심 행동 1개
- 차분한 2.5D 깊이감

---

# PART A. 제품 기획

## 1. 현재 제품 진단

현재 구현은 사용자가 한 줄을 고르고, 필요하면 수정하고, 시간을 저장해 미리보기를 확인하며, 다음 날 다시 열었을 때 체크인하는 6단계 로컬 MVP다.

현재 강점:

- 사용자가 길게 고민하지 않고 문장을 고를 수 있다.
- 직접 수정 기능으로 문장 소유감이 생긴다.
- 로컬 저장이라 개인정보와 운영비 부담이 작다.
- 한국어/영어와 안전 상태, 테스트 계약이 이미 존재한다.
- 실제 알림·AI·서버 없이 UX를 검증할 수 있다.

현재 약점:

1. 첫 세션이 미리보기에서 끝나 재방문 중심 홈이 약하다.
2. 다음 날 `유지/수정/건너뛰기`만으로는 감정적 보상이 약하다.
3. 사용자가 좋은 문장을 모으거나 축적했다는 느낌이 부족하다.
4. 화면이 기능 순서대로만 나열되면 “폼 작성 앱”처럼 보일 수 있다.
5. 수익화 슬롯이 너무 빠르면 신뢰를 쌓기 전 판매하는 인상을 줄 수 있다.

이번 개편의 핵심 질문:

> 오늘 한 줄을 고른 사용자가 내일 다시 왔을 때 무엇을 얻게 되는가?

---

## 2. 개편 후 한 줄 정의

`칭찬해줘`는 하루에 한 줄을 골라 나에게 남기고, 다음 날 그 말이 어땠는지 돌아보며 나만의 문장을 쌓는 자기편 루틴 앱이다.

핵심 약속:

> 하루 30초, 나를 덜 가혹하게 대하는 한 줄을 남긴다.

제품 포지션:

- 랜덤 명언 앱이 아니다.
- 정신건강 상담/치료 앱이 아니다.
- 복잡한 일기 앱이 아니다.
- 습관을 실패/성공으로 평가하는 강제 루틴 앱이 아니다.
- `고르기 → 내 말로 다듬기 → 저장하기 → 다음 날 돌아보기 → 보관하기`의 초경량 자기편 루틴 앱이다.

---

## 3. 상품성을 높이는 핵심 가치

### 3.1 즉시성

첫 사용자는 30~60초 안에 오늘의 한 줄을 저장할 수 있어야 한다.

### 3.2 소유감

추천 문장을 고르는 데서 끝나지 않고, 필요하면 자기 말로 수정하고 좋은 문장은 보관함에 남긴다.

### 3.3 부담 없는 재방문

연속 출석을 강요하지 않는다.

금지 표현:

- 3일 연속 성공
- 연속 기록이 끊겼어요
- 오늘도 실패했어요
- 아직 안 했어요

권장 표현:

- 이번 주 나를 챙긴 날 3번
- 오늘도 내 편이 되어볼까요?
- 지난 한 줄을 다시 만나보세요

### 3.4 감정적 보상

다음 날 사용자가 해야 하는 것은 평가가 아니라 반응이다.

- 도움됐어
- 그냥 그랬어
- 오늘은 바꿀래

`도움됐어`를 누른 문장은 보관함에 저장할 수 있게 하여 문장 축적을 재방문 보상으로 만든다.

---

## 4. 핵심 재방문 루프

### 첫날

1. 랜딩에서 앱 역할 확인
2. 지금 필요한 말의 결 선택
3. 추천 한 줄 선택
4. 필요하면 내 말로 수정
5. 확인할 시간 저장
6. 미리보기 확인
7. 오늘의 한 줄 홈으로 이동

### 다음 날

1. 홈 또는 체크인에서 어제의 한 줄 확인
2. `도움됐어 / 그냥 그랬어 / 오늘은 바꿀래` 선택
3. 도움된 문장은 보관함 저장
4. 이번 주 나를 챙긴 날 기록 갱신
5. 오늘의 한 줄 다시 선택

### 핵심 원칙

- 한 화면에는 주요 CTA가 하나만 있어야 한다.
- 보조 선택은 명확하지만 핵심 CTA보다 시각 무게가 낮아야 한다.
- 사용자를 평가하지 않는다.
- 수익화는 최소 5개 보관 또는 7일 사용 이후로 미룬다.

---

## 5. 감정 결 4개

초기 MVP는 다음 네 가지로 단순화한다.

1. **잘 버텼어**
   - 인정받고 싶은 날
   - 피치 패널
   - 아이콘: 체크 또는 작은 리본

2. **잠깐 쉬어**
   - 마음을 조금 내려놓고 싶은 날
   - 민트 패널
   - 아이콘: 잔잔한 눈 또는 구름

3. **다시 해보자**
   - 작게라도 움직이고 싶은 날
   - 옅은 옐로 패널
   - 아이콘: 대각선 상승 화살표

4. **괜찮아**
   - 실수한 나를 놓아주고 싶은 날
   - 라일락 패널
   - 아이콘: 작은 하트

처음에는 선택한 감정 결의 문장 3개를 보여주고, `다른 한 줄 더 보기`를 누르면 2개를 추가한다.

---

## 6. MVP 화면 구조

### 화면 1. 랜딩 / 대상 확인

목표:

- 앱의 쓰임을 5초 안에 이해시킨다.
- 상담 앱처럼 무겁게 보이지 않게 한다.

카피 예시:

- 브랜드: 칭찬해줘
- 헤드라인: 오늘을 조금 덜 가혹하게 마무리해볼까요?
- 설명: 하루에 한 줄만, 내 편이 되어보세요.
- CTA: 오늘의 한 줄 고르기

시각:

- 큰 웜 화이트 여백
- 우상단에 아주 옅은 라벤더 원형 블롭
- 하단에 피치색 유기형 블롭
- 장식은 2개 이하

### 화면 2. 감정 결 + 한 줄 선택

목표:

- 사용자가 필요 감정을 고르고, 한 줄을 빠르게 선택한다.

구성:

- 상단 뒤로가기
- 제목: 오늘의 한 줄
- 2단계 진행 패널: `1 마음 고르기 / 2 시간 정하기`
- 질문: 지금 어떤 말이 필요해요?
- 감정 칩 4개
- 추천 한 줄 카드 3개
- 내 말로 조금 다듬기
- 주 CTA: 이 한 줄로 할게요
- 텍스트 액션: 다른 한 줄 더 보기

### 화면 3. 내 말로 수정

목표:

- 문장 소유감 강화
- 안전 상태를 과하게 겁주지 않고 안내

구성:

- 선택 원문 미니 패널
- 큰 textarea 패널
- 글자 수
- safe/caution/blocked 상태 메시지
- 주 CTA: 이 문장으로 저장
- 보조 CTA: 원래 문장으로 돌아가기

### 화면 4. 시간 저장 + 미리보기

목표:

- 시간 입력이 설정 화면처럼 복잡해지지 않게 한다.
- 저장 후의 모습을 바로 보여준다.

구성:

- 네이티브 time input
- 프리뷰 알림 패널
- 실제 알림이 아니라 preview_only임을 과도하지 않게 표시
- 주 CTA: 저장하고 미리보기

### 화면 5. 재방문 홈

목표:

- 반복 사용자가 가장 많이 보는 중심 화면
- 현재 문장, 다음 확인 시간, 새 문장 선택, 보관함, 주간 기록을 한눈에 제공

구성:

- 브랜드명
- 헤드라인
- 이번 주 나를 챙긴 날 배지
- 오늘의 한 줄 히어로 패널
- 한 줄 바꾸기
- 감정 결 4개 패널
- 오늘의 한 줄 고르기 CTA
- 하단 내비게이션: 홈 / 보관함 / 설정

### 화면 6. 다음 날 체크인

목표:

- 사용자가 어제 문장을 평가받는 느낌 없이 반응하게 한다.

구성:

- 질문: 어제의 한 줄, 오늘은 어땠어요?
- 어제의 한 줄 패널
- 반응 패널 3개
  - 도움됐어
  - 그냥 그랬어
  - 오늘은 바꿀래
- 이번 주 나를 챙긴 기록 패널
- 오늘의 한 줄 고르기 CTA

### 보관함

이번 디자인 MVP에서는 진입점과 목록 기본형만 만든다.

- 저장된 문장 개수
- 문장 카드 목록
- 오늘의 한 줄로 다시 사용
- 삭제
- 정렬/검색/공유/동기화/결제는 제외

---

# PART B. 디자인 시스템

## 7. 디자인 콘셉트

### 핵심 키워드

- 따뜻한 생활 앱
- 조용한 자신감
- 프리미엄이지만 친근함
- 다정하지만 유치하지 않음
- 가벼운 2.5D 촉감
- 넉넉한 여백
- 한 문장 집중

### 하지 말아야 할 방향

- 어린이용 캐릭터 앱
- 하트와 반짝이가 가득한 화면
- 강한 네온색
- 유리처럼 과도하게 투명한 glassmorphism
- 안쪽 그림자가 과한 neumorphism
- 기본 Bootstrap/HTML 폼
- 상담·병원·명상 앱처럼 무거운 청록/남색 화면
- 지나치게 입체적인 3D 캐릭터나 오브젝트

---

## 8. 색상 토큰

### 기본

- `--pm-bg`: `#FBF8F6`  
  앱 전체 배경. 순백보다 따뜻한 웜 화이트.

- `--pm-surface`: `#FFFFFF`  
  일반 패널과 카드.

- `--pm-surface-soft`: `#F6F1EF`  
  비활성 영역, 설정 패널, 미리보기 배경.

- `--pm-text-primary`: `#292632`  
  거의 검정에 가까운 따뜻한 차콜.

- `--pm-text-secondary`: `#817B88`  
  설명과 보조 카피.

- `--pm-text-tertiary`: `#ABA5AF`

### 브랜드 퍼플

- `--pm-primary`: `#7161E8`
- `--pm-primary-strong`: `#5D4CD8`
- `--pm-primary-soft`: `#E9E4FF`
- `--pm-primary-soft-2`: `#F2EEFF`

### 감정 패널

- 피치: `#FFE2D3`
- 민트: `#DDF3EA`
- 옐로: `#FFF0B8`
- 라일락: `#E7E0FF`

### 상태

- 성공/도움됨: `#DDF3EA`
- 주의: `#FFF1CC`
- 차단: `#FFE1E3`
- 오류 텍스트: `#B34B58`

### 배경 장식

- 라벤더 블롭: `rgba(113, 97, 232, 0.10)`
- 피치 블롭: `rgba(255, 190, 160, 0.14)`

색상 사용 비율:

- 70% 웜 화이트/화이트
- 20% 브랜드 퍼플
- 10% 감정 파스텔

한 화면에서 감정 파스텔 4개가 모두 보일 수는 있지만, 대형 면적은 히어로 퍼플 한 곳만 사용한다.

---

## 9. 3D/깊이감 기준

이 앱의 3D는 **강한 3D 오브젝트가 아니라 부드러운 2.5D elevation**으로 만든다.

### 레이어 체계

#### Layer 0 — 배경

- 웜 화이트 단색
- 매우 옅은 유기형 블롭 최대 2개
- 블롭은 콘텐츠 뒤에 있고 터치 요소처럼 보이면 안 됨

#### Layer 1 — 평면 정보 패널

- 진행 표시, 네비게이션, 섹션 배경
- 그림자 없음 또는 아주 약함

#### Layer 2 — 일반 카드

- 흰색 surface
- radius 22~24px
- border `1px solid rgba(55, 45, 80, 0.04)`
- shadow `0 10px 30px rgba(45, 37, 70, 0.07)`

#### Layer 3 — 핵심 히어로 패널

- 라벤더 그라데이션
- radius 28~32px
- shadow `0 18px 45px rgba(82, 66, 190, 0.20)`
- 상단 좌측에 아주 약한 내부 하이라이트
- 카드가 배경에서 8~12px 떠 있는 것처럼 보이게 함

### 히어로 그라데이션

```css
background: linear-gradient(145deg, #7B69EE 0%, #6657DE 100%);
```

### 히어로 내부 하이라이트

```css
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.18),
  0 18px 45px rgba(82,66,190,0.20);
```

### 버튼 입체감

기본:

```css
box-shadow: 0 10px 24px rgba(63,54,100,0.14);
transform: translateY(0);
```

누름:

```css
transform: translateY(2px) scale(0.995);
box-shadow: 0 5px 12px rgba(63,54,100,0.12);
```

### 감정 타일 입체감

- 파스텔 배경
- 그림자는 거의 없음
- 위쪽에 `rgba(255,255,255,0.45)` 하이라이트 1px
- 선택 시 퍼플 outline 2px, 타일 전체를 진하게 만들지 않음

### 금지

- 검은 그림자
- 20% 이상 불투명 그림자
- 강한 반사광
- 메탈/유리 재질
- 3D 캐릭터
- 버튼마다 서로 다른 그림자 방향

---

## 10. 패널 시스템

### P1. 히어로 한 줄 패널

용도:

- 홈의 오늘의 한 줄

규격:

- width: container 100%
- min-height: 210~240px
- padding: 28~32px
- radius: 30px
- background: primary gradient
- quote: 흰색, 26~30px, 700
- 보조 카피: 흰색 72~78% opacity
- 우하단에 흰색 pill 버튼

### P2. 감정 선택 패널

용도:

- 2x2 선택

규격:

- 2열 grid
- gap 14~16px
- min-height 116~132px
- radius 22px
- padding 18~20px
- 상단에 42px 흰색 아이콘 캡슐
- 제목 18px/700
- 설명 13~14px/400

### P3. 추천 문장 선택 패널

기본:

- white
- radius 24px
- padding 24px
- min-height 150px
- quote 22px/700/1.45
- description 14px/400
- shadow layer 2

선택:

- border 2px primary
- shadow `0 12px 34px rgba(98,79,210,0.12)`
- 우상단 36px 원형 check badge
- 배경은 흰색 유지

### P4. 체크인 액션 패널

세 카드 모두 같은 크기와 기본 위계.

- 도움됐어: mint tint
- 그냥 그랬어: white
- 오늘은 바꿀래: peach tint
- 높이 84~96px
- radius 20~22px
- 좌측 44px 아이콘 캡슐
- 제목 18px/700
- 설명 13px/400

주의: 첫 카드만 과도하게 주 CTA처럼 보이면 안 된다. 사용자가 감정적으로 솔직한 선택을 할 수 있어야 한다.

### P5. 주간 기록 패널

- white
- radius 24px
- padding 24px
- 제목 17px/700
- 요일 점 7개
- 완료 점: primary 원 + 흰 check
- 미완료 점: `#ECE8E5`
- streak 불꽃, 빨간 숫자, 실패 표시는 금지

### P6. 편집 패널

- 원문 미리보기: primary-soft background
- textarea: white, radius 20px, border 1px
- focus: primary border + 3px soft ring
- caution: yellow panel
- blocked: pink panel

### P7. 하단 내비게이션 패널

- fixed/sticky bottom
- white 96~98% opacity
- top border `rgba(40,35,50,0.06)`
- safe-area padding 포함
- 아이콘 24px
- 활성: primary
- 비활성: `#AAA4AD`
- 라벨 12~13px

---

## 11. 타이포그래피

권장 폰트:

- Pretendard Variable 또는 SUIT Variable이 프로젝트에 이미 있으면 사용
- 없다면 시스템 sans-serif 유지
- 원격 폰트 네트워크 의존성을 새로 만들지 않는다.

스케일:

- Display XL: 34px / 1.25 / 750
- Display L: 30px / 1.3 / 750
- Screen title: 24px / 1.35 / 700
- Section title: 20px / 1.4 / 700
- Quote hero: 28px / 1.45 / 700
- Quote card: 22px / 1.45 / 700
- Body: 16px / 1.55 / 400
- Secondary: 14px / 1.5 / 400
- Label: 13px / 1.4 / 600
- Button: 17px / 1.4 / 700

규칙:

- 헤드라인은 최대 2줄
- 카드 문장은 최대 3줄 권장
- 한국어 단어 단위 줄바꿈을 우선
- 본문 색상은 순검정 금지
- 중앙 정렬은 제목/진행 표시 외 최소화

---

## 12. 여백·그리드·반응형

모바일 기준:

- 360x740
- 390x844

컨테이너:

- 좌우 20px 기본
- 390 이상은 24px 허용
- 최대 콘텐츠 폭 480px
- 데스크톱/PWA에서는 중앙 정렬

간격 토큰:

- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

주요 적용:

- 섹션 간 40~48px
- 카드 간 14~16px
- 제목과 설명 8~12px
- 설명과 첫 인터랙션 24~32px
- CTA 상단 24~32px

세로 공간이 좁은 360x740에서는:

- 큰 장식 블롭 축소
- 히어로 패널 min-height 축소
- 하단 CTA와 내비게이션이 겹치지 않게 bottom padding 확보

---

## 13. 아이콘과 장식

아이콘 스타일:

- 2px rounded stroke
- 선 끝 둥글게
- 한 화면에서 한 스타일만 사용
- 감정 타일 아이콘은 흰 pill/rounded-square 배경 안에 배치

장식:

- 하트는 브랜드의 보조 아이콘으로만 사용
- 반짝이는 최대 1~2개
- 배경 블롭은 콘텐츠를 침범하지 않음
- 삽화 없이도 완성되는 UI를 우선

---

## 14. 모션

모션은 짧고 조용하게.

- 카드 선택: 160ms ease-out, scale 1 → 0.99 → 1
- 체크 badge: 180ms spring 느낌
- 화면 진입: opacity + translateY 8px, 220ms
- 히어로 문장 교체: crossfade 180ms
- 버튼 누름: translateY 2px
- reduced-motion 환경에서는 translate/scale 제거

금지:

- confetti
- 과한 bounce
- 감정 선택 때 화면 흔들림
- 긴 로딩 애니메이션

---

# PART C. 이미지 생성 지시문

## 15. 모든 이미지에 공통으로 먼저 넣을 스타일 프롬프트

```text
Create a consistent high-fidelity mobile UI design system for a Korean app named “칭찬해줘 (Praise Me)”.

The product is a lightweight self-kindness routine app: the user chooses one supportive sentence for today, optionally rewrites it in their own words, and returns the next day to reflect on whether it helped.

Visual direction:
- premium Korean lifestyle app
- warm, calm, emotionally supportive
- clear Toss-like hierarchy and generous whitespace
- not a medical or therapy app
- not childish, not overly cute
- soft 2.5D depth, not full 3D illustration
- tactile elevated cards with restrained shadows
- warm off-white background #FBF8F6
- primary lavender #7161E8
- deep lavender #5D4CD8
- charcoal text #292632
- secondary text #817B88
- pastel peach #FFE2D3
- pastel mint #DDF3EA
- pastel yellow #FFF0B8
- pastel lilac #E7E0FF

Depth and materials:
- hero card uses a subtle lavender gradient from #7B69EE to #6657DE
- soft top-left highlight and bottom-right shadow
- standard cards are white with 22–24px corner radius and soft elevation
- hero card radius 30px
- no glassmorphism, no metallic materials, no glossy 3D objects
- no cartoon mascots

Typography:
- clean Korean sans-serif similar to Pretendard
- bold, confident headlines
- large readable quote text
- natural Korean line breaks

Layout:
- vertical smartphone app screen, 390x844 ratio
- 20–24px horizontal margins
- one clear primary action per screen
- accessible touch targets at least 52–56px high

Generate a standalone app screen only, not a phone mockup, not a collage, no hands, no surrounding devices.
Render all Korean text accurately.
```

---

## 16. 이미지 1 — 재방문 홈

```text
[먼저 공통 스타일 프롬프트 전체 삽입]

Design screen 1: returning-user home dashboard.

Exact content and hierarchy:
- top small brand label: “칭찬해줘” in lavender
- large two-line headline: “오늘도 나를 너무 몰아붙이지 말아요”
- supporting text: “하루에 한 줄만, 내 편이 되어보세요.”
- small white pill badge with a tiny lavender heart icon: “이번 주 나를 챙긴 날 3번”

Main hero panel:
- large elevated lavender gradient card
- label pill: “오늘의 한 줄”
- quote: “오늘 버틴 것만으로도 충분히 잘했어.”
- supporting line: “오늘 밤 9:30에 다시 만나요”
- white rounded pill button on the lower right: “한 줄 바꾸기”
- quote should be the visual focal point

Below the hero:
- section title: “지금 내게 필요한 말”
- caption: “느낌을 고르면 한 줄을 바로 추천해요.”
- 2x2 pastel tactile panels:
  1. peach: “잘 버텼어” / “오늘을 인정받고 싶을 때”
  2. mint: “잠깐 쉬어” / “마음을 조금 내려놓고 싶을 때”
  3. yellow: “다시 해보자” / “작게라도 움직이고 싶을 때”
  4. lilac: “괜찮아” / “실수한 나를 놓아주고 싶을 때”
- each panel has a small white rounded icon capsule

Primary CTA:
- full-width dark charcoal button
- label: “오늘의 한 줄 고르기”

Bottom navigation:
- 홈 active in lavender
- 보관함 inactive
- 설정 inactive

Background decoration:
- one pale lavender circular blob in the top-right
- one pale peach organic blob partially behind the hero
- decorations remain subtle and do not reduce readability

Keep the design emotionally warm, premium, simple, and realistically implementable in CSS.
```

---

## 17. 이미지 2 — 한 줄 선택

```text
[먼저 공통 스타일 프롬프트 전체 삽입]

Design screen 2: choosing today’s supportive sentence.

Top:
- back arrow
- centered title: “오늘의 한 줄”
- segmented progress panel:
  - left active lavender: “1 마음 고르기”
  - right inactive white: “2 시간 정하기”

Main heading:
- “지금 어떤 말이 필요해요?”
- caption: “하나를 고르면 비슷한 결의 한 줄을 보여드려요.”

Emotion chips in one row:
- “잘 버텼어” selected, peach background with lavender 2px outline
- “잠깐 쉬어” mint
- “다시 해보자” yellow
- “괜찮아” lilac

Section title: “추천 한 줄”

Three elevated quote panels:
1. selected panel with white background, lavender 2px border, lavender circular check badge:
   “오늘 버틴 것만으로도 충분히 잘했어.”
   small caption: “오늘의 너를 먼저 인정해주는 말”
2. regular white card:
   “아무도 몰라도, 네가 해낸 건 사라지지 않아.”
   caption: “조용하지만 단단한 인정”
3. regular white card:
   “여기까지 온 것도 이미 대단한 일이야.”
   caption: “지친 날에 어울리는 한 줄”

Actions:
- soft lavender secondary panel button: “내 말로 조금 다듬기”
- full-width primary lavender button: “이 한 줄로 할게요”
- bottom text action: “다른 한 줄 더 보기”

Use soft 2.5D card elevation. Do not make the selected card purple-filled; preserve white background and show selection with outline and check badge.
```

---

## 18. 이미지 3 — 다음 날 체크인

```text
[먼저 공통 스타일 프롬프트 전체 삽입]

Design screen 3: next-day emotional check-in.

Top:
- brand label “칭찬해줘” in lavender
- top-right white pill: “보관함 4”

Main heading:
- “어제의 한 줄, 오늘은 어땠어요?”
- caption: “정답은 없어요. 지금 느낌에 가까운 걸 골라주세요.”

Yesterday quote panel:
- large elevated white card
- lavender soft pill: “어제의 한 줄”
- quote: “오늘 버틴 것만으로도 충분히 잘했어.”
- caption: “어젯밤 9:30에 저장했어요”

Three equal-weight reaction panels:
1. mint tint, heart icon:
   title “도움됐어”
   caption “이 한 줄을 보관함에 넣을게요”
2. white, minus icon:
   title “그냥 그랬어”
   caption “내일은 다른 결의 말을 골라볼게요”
3. peach tint, refresh icon:
   title “오늘은 바꿀래”
   caption “지금 필요한 말로 새로 고를 수 있어요”

Weekly care panel:
- section title “나를 챙긴 기록”
- white rounded card
- text “이번 주 3번, 내 편이 되어줬어요”
- seven day dots labeled 월 화 수 목 금 토 일
- first three dots lavender with white checks
- remaining dots warm light gray
- no flame icon, no streak pressure, no failure color

Primary CTA:
- full-width dark charcoal button: “오늘의 한 줄 고르기”

Bottom navigation:
- 홈 active
- 보관함 inactive
- 설정 inactive

The screen should feel comforting and honest, not gamified or judgmental.
```

---

## 19. 이미지 생성 네거티브 프롬프트

```text
Avoid:
- phone hardware frame or hand holding phone
- collage or multiple screens in one image
- English placeholder text
- broken Korean characters
- excessive heart icons or sparkles
- cartoon mascots, chibi characters, 3D characters
- glossy plastic, metallic surfaces, glassmorphism
- heavy neumorphism and large dark shadows
- neon colors
- medical, hospital, meditation, therapy imagery
- dense settings screens
- tiny text
- more than one primary CTA
- Bootstrap, Material default component look
- dark mode
```

---

# PART D. 개발 AI에 전달할 최종 통합 지시문

아래 블록을 참고 이미지 3장과 함께 Codex/Hermes에 그대로 전달한다.

```text
“칭찬해줘(Praise Me)” 현재 구현을 기반으로 상품성과 재방문율을 높이는 v0.4 디자인 MVP를 적용해줘.

첨부한 3개 이미지는 픽셀 단위 복제용이 아니라 정보 계층, 공간감, 색상, 패널 체계, 2.5D 깊이감과 전체 미적 방향을 전달하는 기준 시안이다. 현재 프로젝트의 코드 구조, 접근성, i18n, localStorage, 테스트 계약에 맞게 해석해서 구현하되, 시안의 디자인 언어는 임의로 단순화하지 마.

## 작업 전 확인

반드시 먼저 읽어:
1. AGENTS.md
2. CLAUDE.md
3. 00_PROJECT_BRIEF.md
4. 01_DECISIONS.md
5. stages/20_ARCH_FINAL.md
6. stages/12_UI_DESIGN.md
7. stages/30_BUILD_REPORT.md
8. 최신 구현 이관 문서

기준선 확보:
- npm test
- npm run build

## 제품 목표

이 앱을 랜덤 문구 앱이나 단순 폼 작성 앱처럼 보이게 하지 말고,
“하루 한 줄을 골라 나에게 남기고, 다음 날 그 말이 어땠는지 돌아보며 나만의 문장을 쌓는 자기편 루틴 앱”으로 보여줘.

핵심 약속:
- 하루 30초, 나를 덜 가혹하게 대하는 한 줄을 남긴다.

핵심 재방문 루프:
- 오늘의 결 선택
- 문장 선택
- 선택적 수정
- 시간 저장/미리보기
- 오늘의 한 줄 홈
- 다음 날 체크인
- 도움된 문장 보관
- 오늘 문장 다시 선택

## 주요 UX 변경

1. 첫 세션 저장 후 단순히 멈추지 말고 성공 상태 또는 오늘의 한 줄 홈을 보여줘.
2. 재방문 사용자는 홈에서 오늘의 한 줄, 확인 시간, 감정 결 4개, 이번 주 나를 챙긴 날, 보관함을 이해할 수 있어야 해.
3. D1 체크인을 기존 `유지/수정/건너뛰기`의 기능적 표현보다 다음 정서적 표현으로 바꿔줘.
   - 도움됐어
   - 그냥 그랬어
   - 오늘은 바꿀래
4. 도움됐어 문장을 로컬 보관함에 저장할 수 있는 최소 구조를 제공해줘.
5. 강제 streak 대신 “이번 주 나를 챙긴 날 N번” 표현을 써.
6. 기존 D1 수익화 관심 슬롯은 이번 단계에서 우선순위를 낮추거나 제거하고, 보관함과 재방문 보상을 앞세워.

## 감정 결

- 잘 버텼어: 피치
- 잠깐 쉬어: 민트
- 다시 해보자: 옅은 옐로
- 괜찮아: 라일락

처음에는 선택 결의 추천 문장 3개만 보여주고, 다른 한 줄 더 보기 시 2개 추가.

## 디자인 시스템

### 색상
- bg: #FBF8F6
- surface: #FFFFFF
- surfaceSoft: #F6F1EF
- textPrimary: #292632
- textSecondary: #817B88
- primary: #7161E8
- primaryStrong: #5D4CD8
- primarySoft: #E9E4FF
- peach: #FFE2D3
- mint: #DDF3EA
- yellow: #FFF0B8
- lilac: #E7E0FF

### 깊이감
강한 3D가 아니라 soft 2.5D elevation을 사용해.
- 일반 카드: radius 22~24px, 0 10px 30px rgba(45,37,70,.07)
- 히어로: radius 30px, lavender gradient, 0 18px 45px rgba(82,66,190,.20)
- selected card: 흰 배경 유지 + primary 2px outline + check badge
- 감정 타일: 파스텔 면 + 아주 약한 상단 하이라이트
- 검은 그림자, glassmorphism, 과한 neumorphism, glossy 3D 금지

### 패널
- hero quote panel
- 2x2 emotion panels
- elevated quote choice panels
- equal-weight check-in action panels
- weekly care panel
- fixed bottom navigation

### 레이아웃
- 360x740, 390x844 우선
- 좌우 margin 20~24px
- 섹션 간 40~48px
- 카드 간 14~16px
- 한 화면 primary CTA 1개
- safe area 확보

### 타이포
- 기존 폰트 유지. 이미 번들된 Pretendard/SUIT이 있으면 사용하고 원격 폰트는 추가하지 마.
- 화면 헤드라인 30~34px, 700~750
- 섹션 제목 20px, 700
- 히어로 문장 28px, 700
- 카드 문장 22px, 700
- 본문 16px
- 버튼 17px, 700

### 인터랙션
- CTA min-height 56px
- secondary 52px
- press translateY 2px
- 카드 선택 160ms
- 화면 진입 220ms
- reduced-motion 지원

## 화면별 구현

### 재방문 홈
- 첨부 이미지 1의 계층을 따른다.
- 히어로 문장 패널이 가장 높은 시각 우선순위.
- 이번 주 나를 챙긴 날 배지는 streak처럼 보이지 않게.
- 감정 결 4개는 2x2.
- 하단 홈/보관함/설정 내비게이션.

### 한 줄 선택
- 첨부 이미지 2를 따른다.
- 진행 표시, 감정 칩, 문장 카드 3개.
- 선택 카드는 흰 배경 + 퍼플 outline/check.
- 내 말로 다듬기는 secondary.
- 이 한 줄로 할게요가 primary.

### 다음 날 체크인
- 첨부 이미지 3을 따른다.
- 어제의 한 줄을 큰 white panel로 보여준다.
- 세 반응 패널은 같은 시각 무게를 유지.
- 도움됐어만 민트, 오늘은 바꿀래는 피치, 그냥 그랬어는 white.
- 주간 기록은 부담 없는 7개 점.

### Rewrite / Time Preview
- 기존 행동 계약 유지.
- 새 패널/색상/타입 체계로 통일.
- safety safe/caution/blocked 상태를 색과 아이콘으로 명확히 하되, 사용자에게 수치심을 주지 않는 카피 사용.

## 반드시 보존

- 현재 ko/en i18n와 English title “Praise Me”
- localStorage corrupted-state fallback
- sessionPhase reopened 계약
- safetyState safe/caution/blocked 계약
- 자유 입력 원문 analytics 전송 금지
- analytics sanitizer closed allowlist
- platform adapter 경계
- 기존 semantic button class 원칙과 raw/default button 금지
- 기존 테스트가 검증하는 핵심 행동

## 이번 단계에서 금지

- 실제 notification SDK
- 음성/TTS/audio
- AI 생성/상담
- 로그인
- 광고/IAP/결제/Toss points
- 백엔드/네트워크 전송
- 레거시 reminder 도메인을 live App에 연결
- 관련 없는 리팩터링
- 디자인 시안을 무시한 임의 배치

## 품질 게이트

1. 구현 전 이미지 3장을 분석하고 디자인 토큰/패널/계층을 요약해.
2. 구현 후 360x740과 390x844에서 실제 화면 캡처를 생성해.
3. 다음을 시안과 비교해:
   - 제목과 히어로 우선순위
   - 좌우 여백
   - 카드 높이/반경
   - CTA 위치와 크기
   - 파스텔 면적
   - 그림자 강도
   - 하단 nav와 safe area
4. 기본 HTML/개발자 도구 같은 느낌이 남으면 한 번 더 디자인 패스를 수행해.
5. npm test와 npm run build를 모두 통과시켜.

## 결과 보고

- 변경 파일 목록
- 화면별 디자인 의도
- 사용한 디자인 토큰
- 패널 컴포넌트 목록
- 기존 행동 계약 유지/변경 사항
- 360x740, 390x844 시각 검증 결과
- 테스트/build 결과
- 다음 단계 추천
- 기존 세션로그 형식으로 “칭찬해줘 v0.4 상품성·재방문 디자인 MVP” 기록
- Graphify 갱신
```

---

# PART E. 최종 QA 체크리스트

## 제품

- [ ] 앱이 랜덤 명언 앱보다 자기편 루틴 앱처럼 보이는가?
- [ ] 첫 저장 후 다시 올 이유가 명확한가?
- [ ] 체크인이 평가나 실패처럼 느껴지지 않는가?
- [ ] 보관함이 문장 소유감을 만드는가?

## 디자인

- [ ] 한 화면 primary CTA가 하나인가?
- [ ] 히어로 패널이 가장 먼저 보이는가?
- [ ] 일반 카드와 히어로의 깊이 단계가 구분되는가?
- [ ] 그림자가 과하지 않은가?
- [ ] 파스텔 네 색이 장난감처럼 보이지 않는가?
- [ ] 360px 폭에서도 제목과 버튼이 깨지지 않는가?
- [ ] 하단 nav가 CTA를 가리지 않는가?

## 기술

- [ ] ko/en 카피 누락이 없는가?
- [ ] localStorage 복구 테스트가 유지되는가?
- [ ] free text가 analytics payload에 들어가지 않는가?
- [ ] notification이 preview_only 상태를 유지하는가?
- [ ] 새로운 네트워크/SDK 의존성이 없는가?
- [ ] npm test 통과
- [ ] npm run build 통과
