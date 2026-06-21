# Session Log: 명대사/명언 QuotePack 리서치

Date: 2026-06-07
Actor/tool: codex

## User Request

`칭찬해줘`의 5개 버튼에 맞는 드라마, 영화, 명언, 명대사, 유명 짤/밈 후보를
카테고리별 5개씩 인터넷에서 찾아볼 수 있는지 물었다. 남녀노소가 들어도 멘탈이 케어되는 말을 원했다.

## Decisions Made

- 현재 단계는 discovery/spec로 분류했다.
- Superpowers brainstorming을 사용해 후보 선별 기준을 정했다.
- 카테고리는 `응원해줘!`, `진정시켜줘!`, `위로해줘!`, `괜찮다고 해줘!`, `잘했다고 해줘!`로 유지했다.
- 명대사/명언은 찾을 수 있지만, 출시용 앱에는 `rightsStatus`와 `riskLevel`을 반드시 둬야 한다고 판단했다.
- 25개 후보를 `QuotePack v0.1` 형태로 문서화했다.
- 이후 사용자는 배우/캐릭터 목소리 흉내와 실제 영화 음성 클립 탑재는 하지 않겠다고 명확히 했다.
- 이후 사용자는 앱명은 `멘탈 한마디`가 아니라 `칭찬해줘`, 버튼은 5개, 후보는 권장후보 25개라고 정정했다.

## Files Changed

- Added `ai/plans/2026-06-07-famous-lines-quote-pack-research.md`
- Added `ai/session-logs/2026-06-07-famous-lines-quote-pack-research.md`

## Verification / Sources

- AFI, IMDb, Know Your Meme, Imperial War Museums, Yonhap, Ajunews, Jobkorea, Daehannews, U.S. Copyright Office, ElevenLabs help docs를 참조했다.
- Instagram/커뮤니티의 직접 원문 대량 수집은 하지 않았다.

## Remaining Risks

- 영화/드라마 대사는 짧아도 저작권/상표/번역권 리스크가 있다.
- 배우/캐릭터 목소리 흉내와 실제 영화 음성 클립 탑재는 제외하기로 했으므로 음성권 리스크는 크게 낮아진다.
- 최종 탑재 전 `high risk` 후보를 라이선스 처리하거나, 같은 정서의 오리지널 문장으로 바꿔야 한다.

## Next Steps

- 사용자가 25개 후보 중 유지할 방향을 고른다.
- 그 다음 `quote-pack.v0.1.json`과 오디오 manifest 구조로 구현한다.
