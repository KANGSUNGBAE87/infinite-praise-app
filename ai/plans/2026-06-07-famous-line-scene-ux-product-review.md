# 기획 리뷰: 명대사 기반 Scene-First 선택 UX

작성일: 2026-06-07
단계: discovery / product review
상태: draft

## 사용자 문제 제기

- AI는 쓰지 않는다.
- 사용자가 별도 파일로 문장/음성 후보를 준비할 수 있다.
- 현재 `버텼다 -> 지침` 같은 선택지는 직관적으로 와닿지 않는다.
- 사용자의 감정/상황에 맞는 문장을 받을 수 있되, 가능하면 한국드라마,
  미국드라마, 영화 명대사면 좋겠다.

## 결론

가능하다. 다만 제품을 "상황 x 감정 칭찬 생성기"로 만들면 계속 허접해진다.
제품의 진짜 형태는 다음에 가깝다.

> 오늘 내 장면에 어울리는 한 줄을 찾아주는 앱

상황/감정은 사라지는 것이 아니라 내부 매칭 태그가 된다. 사용자가 보는 선택지는
`버텼다`, `지침` 같은 분류명이 아니라 사용자가 실제로 자기 안에서 말하는
장면 문장이어야 한다.

## 명대사 사용 가능성

### 가능 조건

명대사 텍스트와 실제 음성을 앱에 넣으려면 다음 중 하나가 필요하다.

- 사용자가 직접 권리를 확보한 파일
- 퍼블릭 도메인 또는 명시적으로 이용 가능한 라이선스
- 권리자와 계약된 quote/audio pack
- 앱에는 대사/음성을 넣지 않고, 공식 외부 링크나 사용자의 개인 로컬 파일로만 연결

### 위험 조건

다음은 앱 출시 기준으로 위험하다.

- 드라마/영화 대사를 인터넷에서 긁어와 앱에 탑재
- 배우 음성을 클립으로 잘라 앱에서 재생
- 유명 배우 목소리처럼 들리게 합성
- 출처를 적으면 괜찮다고 보고 상업 앱에 넣는 방식

U.S. Copyright Office의 fair use 안내도 인용/샘플 사용은 맥락과 목적에 따라
판단되고, 의심스러우면 허락을 받으라고 설명한다. 특히 영화/드라마는 창작성이
높은 저작물이고, 앱에서 감정 콘텐츠로 재생하는 것은 비평/보도/교육과 다르다.

## 제품 판단

명대사 자체가 핵심이 아니라 "내 장면과 맞는 대사라는 느낌"이 핵심이다.

유명 대사는 강력하지만 공급이 제한되고, 권리 이슈가 크고, 사용자 장면과 맞지
않으면 오히려 팬서비스처럼 느껴진다. 반대로 오리지널 문장만 쓰면 안전하지만
명대사 감각이 약할 수 있다.

따라서 제품은 두 층으로 나눠야 한다.

### Layer 1: Scene Line Mode

- 앱 기본 모드.
- 저작권 리스크 없는 오리지널 문장.
- 드라마/영화식 구조를 사용하지만 실제 대사는 복제하지 않는다.
- 출시 가능한 MVP.

### Layer 2: Licensed Quote Pack Mode

- 사용자가 준비한 별도 파일 또는 권리 확보된 콘텐츠.
- 실제 작품명, 대사, 음성 파일을 매칭한다.
- 앱 내부에서는 라이선스/권리 상태가 확인된 항목만 노출한다.

## 왜 현재 선택지가 허접한가

현재 선택지는 사용자의 심리 언어가 아니라 분류 체계다.

사용자는 보통 이렇게 생각하지 않는다.

- "나는 지금 `버텼다` 상태이고 감정은 `지침`이다."
- "나는 `참았다` 상황이며 톤은 `화남`이다."

실제로는 이렇게 느낀다.

- "오늘 진짜 아무것도 못 한 것 같다."
- "쉬었는데 죄책감이 든다."
- "화낼 뻔했는데 겨우 삼켰다."
- "시작은 했는데 너무 초라하다."
- "끝냈는데 이상하게 허전하다."

따라서 선택 UI의 언어가 바뀌어야 한다.

## 권장 UX

### 1단계: 오늘의 장면

홈에서 사용자는 추상 카테고리가 아니라 장면 카드를 고른다.

추천 기본 카드:

- 아무것도 못 한 것 같은 하루
- 쉬었는데 죄책감 드는 날
- 화낼 뻔했는데 삼킨 순간
- 불안한데 손댄 순간
- 끝냈는데도 허전한 날
- 밥/물/씻기만 겨우 챙긴 날
- 무서웠는데 그냥 해본 순간

각 카드는 내부적으로 `situation`, `mood`, `sceneNeed` 태그를 가진다.

예:

```json
{
  "id": "rested-guilty-return-place",
  "label": "쉬었는데 죄책감 드는 날",
  "situation": "rested",
  "moods": ["guilty", "tired"],
  "sceneNeeds": ["permission", "release_blame"],
  "intensity": "low"
}
```

### 2단계: 지금 필요한 말

장면을 고른 뒤 사용자는 감정명을 고르는 대신 "듣고 싶은 말의 역할"을 고른다.

추천 선택지:

- 그거 봤어
- 그만해도 돼
- 네 잘못만은 아니야
- 내일로 넘겨도 돼
- 크게 말해줘

이 선택지는 내부적으로 다음 태그가 된다.

- `witness`
- `permission`
- `release_blame`
- `continuity`
- `rally`

### 3단계: 작품 감성

이 단계는 필수가 아니라 필터 또는 설정으로 둔다.

- 한국드라마식: 조용하고 관계 중심
- 미국드라마식: 직접적이고 명료한 지지
- 영화식: 짧고 상징적인 한 줄
- 스포츠영화식: rally 전용
- 담백한 현실톤: 과장 없는 일상 대사

MVP에서는 홈에 노출하지 말고, 결과 화면의 "다른 감성" 버튼으로 숨기는 편이 좋다.

## 권장 데이터 파일 구조

사용자가 별도 파일을 준비한다면 CSV보다 JSONL이 낫다. 한 줄이 한 후보가 되기
때문에 추가/검수/비활성화가 쉽다.

```json
{
  "id": "licensed-quote-001",
  "enabled": true,
  "mode": "licensed_quote",
  "language": "ko",
  "sourceType": "k_drama",
  "sourceTitle": "작품명",
  "sourceSeason": "1",
  "sourceEpisode": "3",
  "quoteText": "권리 확보된 대사 또는 사용자 개인 파일의 문장",
  "audioPath": "assets/quotes/licensed-quote-001.wav",
  "rightsStatus": "licensed",
  "rightsNote": "권리 확인 메모",
  "situationTags": ["rested"],
  "moodTags": ["guilty", "tired"],
  "sceneNeedTags": ["permission", "release_blame"],
  "styleTags": ["k_drama", "quiet", "warm"],
  "intensity": 2,
  "spoilerLevel": "none",
  "triggerTags": [],
  "displayAttribution": "작품명 S1E3"
}
```

오리지널 문장도 같은 구조를 쓴다.

```json
{
  "id": "original-rested-guilty-001",
  "enabled": true,
  "mode": "original_scene_line",
  "language": "ko",
  "quoteText": "쉰 게 빠진 건 아니야. 돌아올 자리를 만든 거야.",
  "audioPath": "assets/original/rested-guilty-001.wav",
  "rightsStatus": "owned",
  "situationTags": ["rested"],
  "moodTags": ["guilty"],
  "sceneNeedTags": ["permission"],
  "styleTags": ["k_drama", "quiet"],
  "intensity": 1
}
```

## 매칭 알고리즘

AI 없이 충분히 가능하다.

1. 사용자가 장면 카드를 선택한다.
2. 장면 카드가 내부 태그를 만든다.
3. 사용자가 필요한 말의 역할을 선택한다.
4. quote/scene line 파일에서 다음 조건으로 필터링한다.
   - `enabled: true`
   - `rightsStatus`가 `owned`, `licensed`, `public_domain`, `user_local`
   - 언어 일치
   - sceneNeed 일치
5. 점수 계산:
   - sceneNeed 일치: +40
   - situation 일치: +25
   - mood 일치: +20
   - style 선호 일치: +10
   - intensity 근접: +5
   - 최근 3회 노출: -100
   - 저장/다시듣기 반응: +5
6. 최고 점수 후보를 재생한다.
7. 동점이면 최근 덜 나온 후보를 고른다.

## 화면 구조 제안

### 첫 화면

제목:

> 오늘은 어떤 장면이었어?

카드 3개만 먼저 보여준다.

- 아무것도 못 한 것 같은 하루
- 쉬었는데 죄책감 드는 날
- 불안한데 손댄 순간

아래에 `다른 장면 보기` 버튼을 둔다.

### 두 번째 화면

제목:

> 지금 어떤 말이 필요해?

선택지:

- 봐줬으면
- 그만해도 된다고
- 내 잘못만은 아니라고
- 내일로 넘겨도 된다고
- 크게 말해줬으면

### 결과 화면

full-screen voice stage가 좋다. 사이드 카드 형태는 감정 몰입이 약하다.

표시:

- 한 줄 대사
- 작품명/모드 표시
- 재생 버튼
- 다시 듣기
- 다른 감성
- 저장

## 판단

이 제품이 사용자를 강하게 붙잡으려면 선택지는 분류표가 아니라 "자기 장면을
찾는 경험"이어야 한다.

`버텼다 -> 지침`은 개발자/기획자가 만든 taxonomy다. `쉬었는데 죄책감 드는 날
-> 그만해도 돼`는 사용자가 자기 마음으로 이해하는 언어다.

명대사 파일은 강력한 differentiator가 될 수 있지만, 권리 상태가 확인된 것만
사용해야 한다. 권리 확보 전에는 오리지널 scene line으로 같은 감각을 구현하는
것이 MVP에 맞다.

## 다음 구현 제안

1. 현재 상황/감정 버튼 UI를 `scene card -> needed line role` 구조로 바꾼다.
2. 기존 `PraiseSituation`, `PraiseMood`는 내부 태그로 유지한다.
3. 새 `SceneCard`, `SceneNeed`, `SceneLineCandidate` 타입을 만든다.
4. 사용자가 준비할 JSONL 파일 스키마와 샘플 파일을 만든다.
5. 실제 명대사/음성은 `rightsStatus`가 안전한 후보만 노출한다.
6. 파일이 없으면 오리지널 scene line catalog로 fallback한다.
