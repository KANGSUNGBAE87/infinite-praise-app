# Session Log: 칭찬해줘 UX/ElevenLabs 오디오 제작 원칙 검토

Date: 2026-06-13
Actor/tool: codex

## User Request

사용자가 추가 UX 의견을 반영해 검토해 달라고 요청했다.

핵심 요청:

- v0.1 메인 UX는 `5개 버튼 -> 3초 안에 좋은 목소리로 한마디 재생`으로 유지한다.
- 상위 버튼 탭 후 다음 페이지에서 5개 오디오를 직접 고르는 방식은 메인 흐름에 넣지 않는다.
- `이 카테고리 전체 보기`는 25개 오디오 연결 후 v0.2 후보로 검토한다.
- ElevenLabs는 런타임 API가 아니라 사전 생성 로컬 오디오 제작 도구로만 사용한다.
- `audioManifest`에 `voiceId`, `model`, `generatedAt`, `fileName`, `durationMs`, `status`를 기록할 수 있게 한다.

## Stage

`planning + UX review`

## Context Checked

- Superpowers `brainstorming` skill
- gstack `plan-design-review` skill
- `ai/plans/2026-06-13-praise-me-design-brief.md`
- `ai/plans/2026-06-13-praise-me-product-planning-review.md`
- `ai/plans/2026-06-13-local-audio-script-final.md`
- `src/App.tsx`
- `src/data/audio-manifest.v0.1.json`
- `test/quotePackData.test.ts`

## External References Checked

- ElevenLabs publishing generated content help article
- ElevenLabs safety page

## Decisions

- v0.1 메인 흐름은 홈 5버튼 즉시 랜덤 재생으로 유지한다.
- 현재 한마디 카드는 홈 안에서 갱신한다.
- `다시 듣기`와 `다른 한마디`는 유지한다.
- `이 카테고리 전체 보기`는 v0.1 필수가 아니라 v0.2 후보로 기록한다.
- 대표 5개 오디오를 먼저 생성해 버튼별 즉시 재생 경험을 검증한다.
- 방향이 좋으면 나머지 20개 오디오를 만든다.
- ElevenLabs API key와 런타임 API 호출은 앱에 넣지 않는다.
- 출시용 오디오는 상업 사용 가능 조건을 충족하는 파일만 사용한다.
- 배우/캐릭터/유명인 성대모사는 하지 않는다.

## Files Changed

- `src/App.tsx`
- `src/data/audio-manifest.v0.1.json`
- `test/quotePackData.test.ts`
- `ai/plans/2026-06-13-praise-me-design-brief.md`
- `ai/plans/2026-06-13-praise-me-product-planning-review.md`
- `ai/plans/2026-06-13-local-audio-script-final.md`
- `public/assets/audio/v0.1/README.md`
- `ai/session-logs/2026-06-13-ux-elevenlabs-review.md`

## Verification

- `npm run typecheck`: passed.
- `npm test`: passed. 10 files, 29 tests.
- `npm run build`: passed.
- `graphify update . --no-cluster`: passed. `graphify-out/graph.json` updated with 991 nodes and 23162 edges.

## Remaining Risks

- 실제 오디오 파일이 아직 없어서 정상 재생 상태는 미검증이다.
- ElevenLabs 파일의 상업 사용 가능 여부는 생성 시점의 계정 플랜과 서비스 조건 확인이 필요하다.
- 대표 5개 오디오를 들어보기 전에는 목소리 톤과 문장 호흡이 맞는지 확정할 수 없다.

## Next Steps

1. 대표 5개 MP3를 `public/assets/audio/v0.1/`에 추가한다.
2. 해당 asset의 `status`를 `approved`로 바꾸고 가능한 메타데이터를 기록한다.
3. 5버튼 즉시 재생 QA를 진행한다.
4. 방향이 좋으면 나머지 20개를 제작한다.
5. 이후 `이 카테고리 전체 보기`를 v0.2 후보로 다시 평가한다.
