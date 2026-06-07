# 고도화 계획: 선택 폼에서 장면형 자기인정 앱으로

작성일: 2026-06-07
단계: review / discovery / planning
상태: draft

## 판단 요약

현재 구현은 기능적으로는 동작하지만, 제품 감각은 아직 얕다. 문제는 LLM 부재보다
UI와 상호작용이 "상황 선택 -> 감정 선택" 폼처럼 보인다는 점이다.

오픈 LLM은 MVP의 해답이 아니다. 지금 LLM을 붙이면 허접한 선택 UI 위에 더 긴
문장만 얹힐 가능성이 크다. 먼저 사용자가 "선택지를 고른다"가 아니라 "내 장면을
알아본다"는 감각을 만들어야 한다.

## 현재 구현 확인

확인 파일:

- `src/App.tsx`
- `src/styles.css`
- `src/core/praiseCatalog.ts`
- `src/core/praiseSelector.ts`
- `src/core/deepPraise.ts`
- `src/core/voiceScript.ts`
- `ai/plans/2026-06-07-market-research-habit-focus-apps.md`
- `ai/plans/2026-06-07-drama-dialogue-praise-research.md`
- `ai/plans/2026-06-07-product-brief-v0.1.md`

검증:

- `npm test`: 9 files, 27 tests passed.
- `npm run build`: passed.
- Playwright screenshots:
  - `ai/session-logs/2026-06-07-ui-review-desktop.png`
  - `ai/session-logs/2026-06-07-ui-review-result.png`
  - `ai/session-logs/2026-06-07-ui-review-mobile.png`

## 왜 허접하게 느껴지는가

1. **첫 화면이 장면이 아니라 폼이다.**
   - "오늘의 상황"과 "듣고 싶은 톤"이 numbered form처럼 보인다.
   - 사용자는 위로받는 게 아니라 설문지를 채우는 느낌을 받는다.

2. **선택지가 너무 평면적이다.**
   - 7개 상황, 8개 감정이 모두 같은 카드로 노출된다.
   - 오늘의 맥락을 앱이 먼저 잡아주는 추천/장면화가 없다.

3. **결과가 감정적 보상 순간이 아니다.**
   - 칭찬 결과가 오른쪽 카드에 표시될 뿐, 화면 전체가 "들어주는 장면"으로
     바뀌지 않는다.
   - 음성 재생, 쉼, 다시 듣기, 저장이 하나의 작은 의식처럼 느껴지지 않는다.

4. **자기인정 영수증이 너무 빨리 노출된다.**
   - 기록이 없을 때 빈 카드가 오른쪽에 계속 보인다.
   - 저장 전 결과에서 `오늘 나를 알아본 횟수 0회`로 보여 감각이 어긋난다.

5. **카피 엔진이 아직 scene line 구조가 아니다.**
   - 드라마/영화식 조사 노트는 `sceneNeed`, `voiceBeat`, `hiddenMeaning` 구조를
     제안했지만 구현은 아직 상황/감정 템플릿 조합 중심이다.

6. **브라우저 기본 TTS는 차별점이 되기 어렵다.**
   - `voiceScript`로 속도/피치/쉼을 조절하지만, 브라우저 음성 품질 한계가 크다.
   - Gemini TTS CLI는 준비되어 있으나 앱 경험에 아직 연결되지 않았다.

## LLM 필요성 판단

### 지금은 필요 없다

LLM이 해결하는 것은 "문장 다양성"이지, "앱이 허접하게 느껴지는 이유" 전체가
아니다. 현재 문제의 1순위는 UX 구조다.

### LLM 없이 먼저 해야 할 것

- 선택지 전체 노출을 줄이고 추천 장면을 먼저 보여준다.
- 결과 화면을 full-screen 또는 stage 형태로 바꾼다.
- 카피 엔진을 `praise catalog`에서 `scene line catalog`로 바꾼다.
- TTS를 브라우저 기본 음성이 아니라 샘플 음성 파일/고품질 TTS 후보로 비교한다.
- 사용자 반응(`saved`, `replayed`, `dismissed`)으로 로컬 추천을 고도화한다.

### LLM을 쓸 수 있는 시점

LLM은 V1.1/V2에서 다음 용도에만 제한적으로 검토한다.

- 월간 회고 편지
- 사용자가 직접 남긴 짧은 메모를 바탕으로 한 개인화 문장 변주
- 긴 사용 이력에서 "요즘 반복되는 장면" 요약

오픈 LLM 또는 온디바이스 LLM은 앱인토스 MVP에는 우선순위가 낮다. 독립 앱 V2에서
검토하는 편이 맞다.

## 고도화 방향

### 1. 홈을 "선택 폼"에서 "오늘의 장면"으로 바꾼다

현재:

```text
오늘의 상황 -> 듣고 싶은 톤 -> 결과
```

개선:

```text
오늘 어떤 장면이었어?
추천 장면 3개 + 다른 장면 보기
```

예시 추천 장면:

- 하루를 끝까지 데리고 왔어
- 쉬었는데 마음이 불편했어
- 폰 보다가 다시 돌아왔어

상황/감정은 내부 태그가 되고, 사용자는 더 장면적인 문장을 먼저 본다.

### 2. 감정 선택을 두 번째 설문이 아니라 톤 조절로 낮춘다

현재는 상황 선택 후 감정 8개가 다시 큰 격자로 나온다. 개선안은 결과 직전에 작은
tone chips로 바꾼다.

예:

- 낮게
- 단단하게
- 다정하게
- 크게 말해줘

기존 감정 태그는 내부적으로 유지하되, UI에는 사용자가 듣고 싶은 전달 방식으로
보이게 한다.

### 3. 결과 화면을 full-screen voice stage로 만든다

결과는 오른쪽 카드가 아니라 화면 전체의 순간이어야 한다.

구성:

- 큰 한 문장
- 음성 재생 상태
- 짧은 pause/breath
- `다시 듣기`
- `저장`
- `조금 더 듣기`
- `오늘은 여기까지`

이 화면에서 선택 버튼들은 뒤로 물러나야 한다.

### 4. `조금 더 듣기`를 20초 칭찬 루틴으로 바꾼다

단순 추가 문장이 아니라 3단계 루틴으로 만든다.

1. 장면 증언: "오늘을 끝까지 데리고 온 거, 아무 일 아닌 척 넘기지 말자."
2. 허락: "오늘은 더 밀지 않아도 돼."
3. 닫는 말: "여기서는 못한 것부터 말하지 않아도 돼."

루티너리의 음성 안내 감각을 가져오되 행동 지시가 아니라 자기인정 의식으로 바꾼다.

### 5. 자기인정 영수증을 나중에 열리는 보상으로 둔다

빈 영수증을 항상 노출하지 않는다.

개선:

- 저장 후 "오늘의 영수증 보기"로 열기
- 3회 이상 기록 후 7일 카드 노출
- 빈 상태는 "아직 없어"보다 "첫 장면을 남기면 여기 모아둘게" 정도로 낮은 압력

### 6. 카피 구조를 scene line catalog로 바꾼다

`praiseCatalog.ts`를 다음 구조로 개정한다.

```typescript
interface SceneLineCandidate {
  id: string;
  situation: PraiseSituation;
  mood: PraiseMood;
  sceneNeed:
    | "witness"
    | "permission"
    | "continuity"
    | "release_blame"
    | "dignify_emotion"
    | "ordinary_care"
    | "subtext";
  surfaceLine: string;
  hiddenMeaning: string;
  voiceBeat: "whisper" | "steady" | "warm" | "firm" | "rally";
  pauseAfterMs: number;
}
```

기본 문장은 "칭찬"보다 "증언"을 우선한다.

### 7. TTS는 브라우저 기본에서 샘플 음성 비교로 이동한다

현재 브라우저 TTS는 프로토타입용으로만 본다.

다음 단계:

- 상위 10개 장면 문장을 고른다.
- Gemini TTS CLI로 WAV 샘플을 만든다.
- 브라우저 TTS와 직접 비교한다.
- 앱에는 `TtsAdapter` 뒤로 provider를 숨긴다.

## 구현 우선순위

1. `scene line catalog`로 카피 엔진 개정.
2. 홈을 추천 장면 3개 + 다른 장면 보기 구조로 개편.
3. 결과를 full-screen voice stage로 개편.
4. 저장 후 영수증을 보상형으로 표시.
5. `조금 더 듣기`를 20초 루틴으로 개편.
6. 상위 10개 장면에 대해 고품질 TTS 샘플 비교.
7. 그 뒤에도 반복감이 남으면 LLM 문장 변주를 V1.1로 검토.

## 결론

오픈 LLM을 붙이는 게 첫 해답은 아니다. 지금 필요한 것은 더 똑똑한 문장 생성기가
아니라 더 좋은 장면 설계다.

다음 구현은 "선택지를 고르는 앱"에서 "내 하루의 한 장면을 조용히 알아봐주는 앱"으로
바꾸는 쪽이어야 한다.
