# 구현 계획: 비LLM 상황 x 감정 TTS MVP

작성일: 2026-06-06
상태: current
기준 스펙: `ai/plans/2026-06-06-situation-emotion-tts-spec.md`
기준 제품 브리프: `ai/plans/2026-06-07-product-brief-v0.1.md`

## 목표

앱인토스 MVP에서 사용자가 상황과 감정을 골라 직접 나를 칭찬하고, 앱이 로컬 템플릿과 작은 TTS로 즉시 반응하는 첫 버전을 만든다.

## 아키텍처

- UI: React Native + `@apps-in-toss/framework`
- 저장: `StorageAdapter` 경유 로컬 저장
- 칭찬 생성: 로컬 `PraiseCatalog` + `PraiseSelector`
- 음성: `TtsAdapter`
- 개인화: 로컬 규칙 엔진
- 백엔드/LLM: MVP 제외

## 데이터 모델 초안

```typescript
type PraiseSituation =
  | "endured"
  | "started"
  | "finished"
  | "rested"
  | "held_back"
  | "cared"
  | "brave";

type PraiseMood =
  | "tired"
  | "anxious"
  | "numb"
  | "proud"
  | "angry"
  | "guilty"
  | "calm"
  | "energize";

interface PraiseEvent {
  id: string;
  date: string;
  situation: PraiseSituation;
  mood: PraiseMood;
  messageId: string;
  message: string;
  depth: "short" | "normal" | "deep";
  source: "manual" | "reminder" | "focus_after" | "wake_after";
  reaction?: "saved" | "replayed" | "dismissed";
  voiceEnabled: boolean;
  createdAt: number;
}
```

## Task 0: 프로젝트 초기화 확인

- [ ] 앱인토스/React Native 프로젝트가 아직 없으면 생성한다.
- [ ] 기존 `ai/` 문서와 Graphify/Understand-Anything 설정을 유지한다.
- [ ] `AGENTS.md`와 `CLAUDE.md`가 있으면 새 MVP 방향을 반영한다.
- [ ] MVP 화면에 노출하지 않더라도 `AuthAdapter`, `PaymentAdapter`, `AdsAdapter`의 인터페이스 위치를 정한다.

## Task 1: 로컬 저장소와 도메인 타입

- [ ] `PraiseSituation`, `PraiseMood`, `PraiseEvent` 타입을 만든다.
- [ ] `PraiseDepth`, `PraiseSource`, `PraiseReaction` 타입을 만든다.
- [ ] `StorageAdapter` 인터페이스를 만든다.
- [ ] `savePraiseEvent`, `getPraiseEvents`, `getRecentPraiseEvents`를 구현한다.
- [ ] `updatePraiseReaction` 또는 동일 역할의 반응 저장 함수를 구현한다.
- [ ] 날짜/시간대 유틸을 순수 함수로 분리한다.
- [ ] 저장/로드 단위 테스트를 작성한다.

## Task 2: 칭찬 문장 카탈로그

- [ ] 상황 7개 x 감정/응원 톤 8개 조합을 정의한다.
- [x] 조합별 최소 3문장, 총 168개 이상 후보 문장을 만든다.
- [ ] 문장 후보에 `depth`를 부여한다. 기본은 `normal`, 짧은 문장은 `short`, 결과 화면의 `조금 더 듣기`용 문장은 `deep`으로 둔다.
- [ ] `돌아왔다` 상황은 MVP의 8번째 상황으로 추가하지 않고, `시작했다`, `끝냈다`, `참았다` 문장 예시 안에 흡수한다.
- [ ] `힘내자` 톤은 고에너지 응원을 허용하되, 다른 톤에는 과장된 응원이 랜덤 노출되지 않게 한다.
- [ ] 문장에는 설교, 과장, 치료적 단정, 타인 비교를 넣지 않는다.
- [ ] 메시지 ID를 안정적으로 부여한다.
- [ ] 최근 3회 반복 방지 테스트를 작성한다.

## Task 3: 로컬 칭찬 선택 엔진

- [ ] `PraiseSelector`를 구현한다.
- [ ] 입력: 상황, 감정, 현재 시간, 최근 기록.
- [ ] 출력: `messageId`, `message`, 선택 이유.
- [ ] 시간대/요일/최근 반복에 따른 가중치를 적용한다.
- [ ] `saved`, `replayed` 반응이 많은 문장군은 가중치를 올리고, `dismissed`가 많은 문장군은 가중치를 낮춘다.
- [ ] `source` 기본값은 MVP에서 `manual`로 둔다. `focus_after`, `wake_after`는 V2 후보로 남긴다.
- [ ] LLM 없이도 리포트에 쓸 수 있도록 선택 이유를 기록한다.

## Task 4: TTS 어댑터

- [ ] `TtsAdapter` 인터페이스를 만든다.
- [ ] 1차 구현은 플랫폼 기본 TTS를 사용한다.
- [ ] 앱인토스에서 기본 TTS가 불가능하면 번들 오디오 fallback 계획을 적용한다.
- [ ] 음성 켜기/끄기 설정을 저장한다.
- [ ] 긴 문장은 재생 전에 1-2문장으로 제한한다.

## Task 5: 메인 칭찬 화면

- [ ] 첫 화면에 상황 버튼 7개를 배치한다.
- [ ] 상황 선택 후 감정/응원 톤 8개를 선택하게 한다.
- [ ] 칭찬 문장, TTS, 저장을 한 흐름으로 연결한다.
- [ ] 칭찬 결과 화면에 `다시 듣기`, `저장`, `조금 더 듣기`를 제공한다.
- [ ] `다시 듣기`는 `replayed`, `저장`은 `saved`, 거부/넘김 액션이 생기면 `dismissed`로 기록한다.
- [ ] `조금 더 듣기`는 `deep` 문장을 보조 액션으로 제공하되 첫 2탭 흐름을 방해하지 않는다.
- [ ] 칭찬 완료 후 최근 선택과 "오늘 나를 알아본 횟수"를 보여준다.
- [ ] 첫 화면에서 칭찬 반응까지 2탭 이내를 지킨다.

## Task 6: 기록 히스토리와 자기인정 영수증

- [ ] 최근 칭찬 기록 목록을 만든다.
- [ ] 주간 상황/감정 집계를 만든다.
- [ ] 월간 상황/감정 집계를 만든다.
- [ ] 리포트 문장은 실제 로컬 기록만 사용한다.
- [ ] 리포트는 "성과 분석"이 아니라 "자기인정 영수증" 톤으로 작성한다.
- [ ] 점수, 순위, 생산성 평가처럼 보이는 표현을 피한다.
- [ ] 자기인정 영수증은 서브 메뉴에 둔다.

## Task 7: 비LLM 개인화

- [ ] 시간대별 톤 규칙을 적용한다.
- [ ] 최근 7일 반복 패턴을 반영한다.
- [ ] 자주 선택한 감정에는 문장 다양성을 우선 배정한다.
- [ ] 저장/다시듣기/거부 반응을 가중치 신호로 저장한다.

## Task 8: QA

- [ ] 오프라인에서 칭찬/음성/저장이 되는지 확인한다.
- [ ] 같은 문장이 3회 연속 나오지 않는지 확인한다.
- [ ] 상황 x 감정/응원 톤 56개 조합이 모두 메시지를 반환하는지 확인한다.
- [ ] 음성 끄기 상태에서 TTS가 재생되지 않는지 확인한다.
- [ ] 리포트가 없는 기록을 날조하지 않는지 확인한다.

## 예상 일정

| Task | 내용 | 예상 |
| --- | --- | --- |
| 0 | 프로젝트 초기화 확인 | 1시간 |
| 1 | 저장소/타입 | 2시간 |
| 2 | 문장 카탈로그 | 3시간 |
| 3 | 선택 엔진 | 2시간 |
| 4 | TTS 어댑터 | 2-3시간 |
| 5 | 메인 화면 | 3-4시간 |
| 6 | 히스토리/자기인정 영수증 | 3시간 |
| 7 | 개인화 규칙 | 2시간 |
| 8 | QA | 2시간 |
| 합계 | | 19-22시간 |

## 수용 기준

- 사용자는 2탭 안에 칭찬을 받을 수 있다.
- LLM/API/백엔드 없이 MVP가 동작한다.
- 모든 기록은 로컬에 저장된다.
- 작은 TTS 또는 번들 오디오 fallback으로 음성이 나온다.
- 다시 듣기/저장/조금 더 듣기가 결과 화면에서 동작한다.
- 자기인정 영수증은 서브 메뉴에서만 제공된다.
- 자기인정 영수증은 실제 선택 기록만 사용한다.

## 구현 진행 기록

### 2026-06-07 코어 1차

완료:

- TypeScript/Vitest scaffold.
- 인메모리 `PraiseRepository`.
- `PraiseSelector`의 상황/톤/depth 매칭, 최근 3회 반복 방지, 반응 기반 가중치.
- `defaultPraiseCatalog`의 7개 상황 x 8개 감정/응원 톤 normal-depth 기본 coverage.
- `createPraiseReceipt`의 자기인정 영수증 문장 생성.
- MVP no-op `AuthAdapter`, `PaymentAdapter`, `AdsAdapter`.

남음:

- 앱인토스/React Native 화면 scaffold.
- 실제 플랫폼 `StorageAdapter`.
- 조합별 최소 2문장, `short`/`deep` 문장 확장.
- TTS adapter와 번들 오디오 fallback.
- UI, i18n 화면 연결, QA.

### 2026-06-07 웹 UI 1차

완료:

- Vite + React 웹 앱 scaffold.
- 상황 선택 화면.
- 감정/응원 톤 선택 화면.
- `힘내자` 톤 포함.
- 칭찬 결과 카드.
- 브라우저 SpeechSynthesis 기반 임시 TTS.
- 음성 켜기/끄기.
- `다시 듣기`, `저장`, `조금 더 듣기`.
- 자기인정 영수증 패널.
- 데스크톱/모바일 Playwright QA.

남음:

- 실제 저장소 adapter 연결.
- Apps in Toss / React Native scaffold 이식.
- 플랫폼 `TtsAdapter`.
- `short`/`deep` 카피 카탈로그 확장.
- i18n UI 연결.

### 2026-06-07 칭찬 카피 반복성 수정

완료:

- 같은 상황/톤 조합에 normal-depth 후보를 3개씩 배치해 총 168개 문장 후보로 확장.
- 단일 문장틀(`분명히 의미가 있어`) 반복을 제거하고 상황별 의미 조각, 감정별 반응 조각을 섞는 구조로 변경.
- 저장하지 않은 칭찬도 프리뷰 히스토리에 남겨 같은 톤을 다시 눌렀을 때 최근 문장을 피하도록 수정.
- 카탈로그 중복 방지, 보일러플레이트 방지, 반복 클릭 회귀 테스트 추가.
- 데스크톱/모바일 브라우저에서 반복 클릭과 문장 카드 폭을 확인.

남음:

- `short`/`deep` 후보를 정식 카탈로그로 분리.
- 사용자 반응(`saved`, `replayed`, `dismissed`) 기반 카피 계열 개인화 고도화.

### 2026-06-07 음성/카피 품질 수정

완료:

- normal-depth 카피를 생성문처럼 보이는 `OO한 것은 의미 있다` 구조에서, 실제 말로 읽기 쉬운 짧은 호흡 문장으로 재작성.
- `작아 보일 수 있지만`, `좋은 장면`, `분명히 의미` 같은 허접하게 들리는 generic 표현을 회귀 테스트로 차단.
- `조금 더 듣기`를 generic 문장 하나에서 상황/톤 기반 deep praise로 변경.
- 브라우저 TTS를 단일 긴 문장 낭독에서 `VoiceScript` 기반 세그먼트 큐로 변경.
- 감정/응원 톤별 음성 속도, 피치, 볼륨, pause 값을 분리.
- 가능한 경우 한국어 로컬 voice를 우선 선택하도록 변경.

남음:

- 브라우저 기본 TTS의 음질 자체는 한계가 있으므로, 앱인토스/React Native 이식 단계에서 플랫폼 `TtsAdapter`와 번들 오디오 또는 고품질 TTS provider 비교가 필요하다.
- 실제 사용자 피드백 기반으로 `허접하게 들리는 표현` 금지 목록과 선호 문장군을 계속 보강한다.
