# 세션 로그: Gemini TTS CLI 준비

작성일: 2026-06-07
actor/tool: codex

## 사용자 요청

- 최종 문장이 아직 정해지지 않았으므로, 어떤 문장이 선택되더라도 부드럽게 읽어주는 TTS 도구를 CLI로 준비.
- Gemini가 좋은 후보인지 검토하고, 실제 앱 결합 전 준비만 요청.

## 결정

- 앱 런타임에 provider를 바로 붙이지 않고, 먼저 Node CLI로 임의 문장을 WAV 프리뷰로 뽑을 수 있게 한다.
- `GEMINI_API_KEY`가 없을 때도 `--dry-run`으로 요청 프롬프트와 모델/voice 설정을 확인할 수 있게 한다.
- 문장은 CLI가 생성하지 않는다. 최종 선택된 문장을 그대로 읽도록 prompt에 명시한다.
- API key와 생성 음성 파일은 git에 남기지 않는다.

## 변경 파일

- `src/core/ttsPrompt.ts`
- `scripts/tts/gemini-tts.mjs`
- `test/ttsPrompt.test.ts`
- `test/geminiTtsCli.test.ts`
- `package.json`
- `package-lock.json`
- `.gitignore`
- `.env.example`
- `ai/plans/2026-06-07-gemini-tts-cli-prep.md`

## 검증

- RED: `npm test -- test/ttsPrompt.test.ts test/geminiTtsCli.test.ts`
- GREEN: `npm test -- test/ttsPrompt.test.ts test/geminiTtsCli.test.ts`
- 전체 검증:
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
  - `npm audit --audit-level=critical`
- CLI dry-run:
  - `npm run tts:dry-run -- --text "쉰 게 빠진 건 아니야. 돌아올 자리를 만든 거야." --situation rested --mood guilty`

## 남은 위험

- 실제 Gemini API 호출은 `GEMINI_API_KEY`가 없어서 수행하지 않았다.
- Gemini TTS preview 모델/voice 이름은 provider 문서 변화에 따라 바뀔 수 있다.
- 실제 앱 적용 전에는 `TtsAdapter`로 provider를 숨기고, generated audio 파일 관리 정책을 정해야 한다.

## 지식저장소 승격

- 외부 TTS provider는 앱 도메인 로직에 직접 붙이지 않고 CLI/adapter로 분리한다는 원칙을 프로젝트 컨텍스트에 반영할 후보.
