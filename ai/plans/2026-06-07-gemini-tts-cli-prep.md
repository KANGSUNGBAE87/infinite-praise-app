# 준비 노트: Gemini TTS CLI

작성일: 2026-06-07
단계: implementation prep
상태: ready

## 목표

최종 문장이 아직 확정되지 않았더라도, 어떤 문장이든 상황/감정 맥락을 붙여
부드러운 음성 파일로 테스트할 수 있는 CLI를 준비한다.

## 왜 Gemini TTS 후보인가

Gemini API는 TTS preview 모델을 제공하며, 텍스트와 함께 음성 전달 지시를 줄 수
있다. 따라서 단순 브라우저 TTS보다 "지침", "죄책감", "힘내자" 같은 톤 차이를
프롬프트로 전달하기 좋다.

현재 CLI 기본값:

- model: `gemini-2.5-flash-preview-tts`
- voice: `Kore`
- output: WAV wrapper over returned PCM audio

모델명과 voice는 CLI 옵션으로 바꿀 수 있다.

## 사용법

API 호출 없이 요청만 확인:

```bash
npm run tts:dry-run -- \
  --text "쉰 게 빠진 건 아니야. 돌아올 자리를 만든 거야." \
  --situation rested \
  --mood guilty
```

실제 WAV 생성:

```bash
GEMINI_API_KEY=... npm run tts:gemini -- \
  --text "쉰 게 빠진 건 아니야. 돌아올 자리를 만든 거야." \
  --situation rested \
  --mood guilty \
  --out ai/tts-previews/rested-guilty.wav
```

voice/model 변경:

```bash
GEMINI_API_KEY=... npm run tts:gemini -- \
  --text "무서웠는데 했잖아. 오늘은 그걸 크게 가져가자." \
  --situation brave \
  --mood energize \
  --voice Kore \
  --model gemini-2.5-flash-preview-tts \
  --out ai/tts-previews/brave-energize.wav
```

## 설계

- `src/core/ttsPrompt.ts`: 앱 도메인에서 상황/감정별 전달 방향을 만든다.
- `scripts/tts/gemini-tts.mjs`: Node CLI. 빌드 없이 dry-run과 실제 생성을 지원한다.
- `.env.example`: 필요한 환경변수 이름만 남긴다.
- `.gitignore`: `.env*`와 생성 오디오 `ai/tts-previews/`를 제외한다.

## 안전 기준

- 최종 문장은 CLI 인자로 넣는다. CLI가 문장을 새로 만들지 않는다.
- API key는 앱 번들, git, 문서에 넣지 않는다.
- 생성된 음성 파일은 프리뷰 산출물로 보고 기본 git 추적에서 제외한다.
- 실제 앱 탑재 전에는 플랫폼 `TtsAdapter`를 통해 provider를 숨긴다.

## 남은 선택지

- Gemini TTS를 계속 쓸지, Google Cloud Text-to-Speech 또는 다른 고품질 provider를
  쓸지는 실제 음성 샘플 비교 후 결정한다.
- 현재 CLI는 단일 문장 파일 생성 준비다. 대량 후보를 한 번에 렌더링하려면
  batch manifest(`jsonl` 또는 `csv`) 입력을 추가한다.
