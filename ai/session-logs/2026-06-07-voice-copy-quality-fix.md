# 세션 로그: 음성/카피 품질 수정

작성일: 2026-06-07
actor/tool: codex

## 사용자 요청

- 앱 음성이 너무 허접하게 들리고 문구도 너무 허접하다는 피드백.

## 결정

- 카피는 화면용 문장보다 음성으로 읽었을 때 자연스러운 짧은 호흡을 우선한다.
- `OO한 것은 의미 있다`처럼 단어만 바꾼 생성문 구조를 줄인다.
- `조금 더 듣기`는 상황과 톤을 반영하는 deep praise로 바꾼다.
- 브라우저 기본 TTS는 음질 한계가 있으므로, 현재 MVP에서는 voice script로 속도/피치/쉼을 다듬고 이후 플랫폼 TTS 어댑터에서 음질을 개선한다.

## 변경 파일

- `src/core/praiseCatalog.ts`
- `src/core/deepPraise.ts`
- `src/core/voiceScript.ts`
- `src/App.tsx`
- `test/praiseCatalog.test.ts`
- `test/App.test.tsx`
- `test/voiceScript.test.ts`
- `ai/plans/2026-06-06-non-llm-tts-implementation-plan.md`

## 검증

- RED: `npm test -- test/praiseCatalog.test.ts test/App.test.tsx test/voiceScript.test.ts`
  - generic 카피 표현 감지
  - noun-phrase 템플릿 과다 사용 감지
  - generic deep praise 감지
  - 미구현 voice script 감지
- GREEN: `npm test -- test/praiseCatalog.test.ts test/App.test.tsx test/voiceScript.test.ts`
- 전체 검증:
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
  - `npm audit --audit-level=critical`
- 브라우저 QA:
  - `http://127.0.0.1:5173/`에서 `쉬었다 -> 죄책감 -> 조금 더 듣기` 흐름 확인
  - weak/generic copy 금지 표현이 노출되지 않는지 확인
  - 모바일 390x844 뷰포트에서 deep praise가 결과 카드 폭을 넘지 않는지 확인

## 남은 위험

- 브라우저 SpeechSynthesis 음질 자체는 플랫폼/브라우저 voice에 좌우된다.
- 실제 앱 전환 시 `TtsAdapter`를 분리해 번들 오디오, 플랫폼 TTS, 외부 고품질 TTS provider를 비교해야 한다.
- 카피 품질은 테스트만으로 충분히 보장할 수 없으므로 실제 사용 피드백을 통해 금지 표현과 선호 문장군을 축적해야 한다.

## 지식저장소 승격

- `무한칭찬앱`의 제품 기준으로 "칭찬 카피는 음성으로 읽히는 짧은 호흡이어야 한다"를 프로젝트 컨텍스트에 반영할 후보.
