# 칭찬해줘 v0.1 오디오 파일 위치

이 폴더에는 `audio-manifest.v0.1.json`의 25개 로컬 오디오 파일을 둔다.

권장 파일명:

- `encourage-001.mp3`
- `encourage-002.mp3`
- `encourage-003.mp3`
- `encourage-004.mp3`
- `encourage-005.mp3`
- `calm-001.mp3`
- `calm-002.mp3`
- `calm-003.mp3`
- `calm-004.mp3`
- `calm-005.mp3`
- `comfort-001.mp3`
- `comfort-002.mp3`
- `comfort-003.mp3`
- `comfort-004.mp3`
- `comfort-005.mp3`
- `reassure-001.mp3`
- `reassure-002.mp3`
- `reassure-003.mp3`
- `reassure-004.mp3`
- `reassure-005.mp3`
- `recognize-001.mp3`
- `recognize-002.mp3`
- `recognize-003.mp3`
- `recognize-004.mp3`
- `recognize-005.mp3`

오디오 파일을 추가한 뒤에는 `src/data/audio-manifest.v0.1.json`에서 해당 항목의
`status`를 `approved`로 바꾸면 앱이 `/assets/audio/v0.1/{id}.mp3`를 재생한다.

## 제작 순서

처음부터 25개를 전부 만들기보다 대표 5개를 먼저 붙여 5버튼 즉시 재생 경험을 검증한다.

- `encourage-001.mp3`
- `calm-001.mp3`
- `comfort-001.mp3`
- `reassure-001.mp3`
- `recognize-003.mp3`

방향이 좋으면 나머지 20개를 생성한다.

## Manifest 메타데이터

ElevenLabs 등 외부 TTS 도구는 사전 제작용으로만 사용하고, 앱 런타임에서는 API를 호출하지 않는다.
출시용 파일은 상업 사용 가능 조건을 충족하는 파일만 사용한다.

가능하면 각 asset에 아래 값을 남긴다.

- `fileName`
- `voiceId`
- `model`
- `generatedAt`
- `durationMs`
- `status`
