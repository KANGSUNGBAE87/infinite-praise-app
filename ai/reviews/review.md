---
version: 0.1
canonical: true
status: current-review
updated: 2026-06-13
actor: codex-with-subagents
project: 무한칭찬앱
---

# 무한칭찬앱 Review

## 요약

읽기 전용으로 기획, 디자인, QA, 보안 리스크를 점검했다. 현재 구현은 React/Vite 단일 화면 앱이며, i18n과 플랫폼 adapter stub은 존재한다. 보안상 즉시 치명적인 secret 노출, XSS escape hatch, 클라이언트 API key 호출은 확인되지 않았다.

가장 큰 리스크는 제품 약속과 구현 상태의 간극이다. MVP 약속은 "3초 안에, 지금 필요한 한마디를, 좋은 목소리로 들려준다"인데, 현재 `audio-manifest.v0.1.json`의 25개 오디오가 전부 `missing`이라 앱은 텍스트 fallback만 제공한다. 또한 구현 파일 대부분과 `package-lock.json`이 아직 git에 추적되지 않아 릴리즈 전 정리가 필요하다.

## 범위와 한계

- 직접 파일 수정 없음.
- `AGENTS.md`/`CLAUDE.md`, Graphify, Understand-Anything 그래프, 계획/세션 로그, 핵심 소스, 테스트, 보안 표면을 확인했다.
- live UI 브라우저 QA는 완료하지 못했다. 임시 빌드 산출물은 생성했지만 로컬 정적 서버 bind가 sandbox 권한으로 막혔고, 권한 요청 중 사용자가 중단했다.
- 네트워크 설치는 수행하지 않았다.

## 실행/확인한 명령과 결과

| 명령/확인 | 결과 |
| --- | --- |
| `sed -n ... AGENTS.md`, `CLAUDE.md` | Graphify/UA 우선, Apps in Toss first, i18n/adapter 규칙 확인 |
| `graphify query "무한칭찬앱 architecture product design qa security app platform i18n adapters"` | `src/App.tsx`와 `App()` 중심의 앱 구조 확인 |
| `.understand-anything/knowledge-graph.json` 확인 | 845 nodes, 783 edges |
| `npm run typecheck` | 통과 |
| `npm run build -- --outDir /private/tmp/infinite-praise-app-audit-build` | 통과, gzip JS 67.23 kB |
| `npm test` | sandbox EPERM: Vite가 `node_modules/.vite-temp`에 임시 config 작성 실패 |
| `./node_modules/.bin/vitest run --configLoader runner` | 11 files, 32 tests passed |
| `npm audit --package-lock-only --audit-level=moderate --offline` | found 0 vulnerabilities |
| `npm ls --depth=0` | React 19, Vite 8, Vitest 4, Playwright 1.60 등 확인 |
| secret grep | 실제 secret 없음. `.env.example` placeholder와 문서 예시만 확인 |
| XSS/injection grep | `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function` 없음 |
| network/storage grep | 앱 런타임은 `new Audio`와 `localStorage`; 외부 `fetch`는 로컬 TTS CLI에만 있음 |
| CI/IaC 탐색 | GitHub Actions, Docker, Terraform 등 없음 |
| repo-local skill scan | Graphify skill만 존재. 의심 exfiltration/prompt override 패턴 없음 |

## Findings

### High

#### H1. 핵심 음성 MVP가 아직 텍스트 fallback 상태

- 근거:
  - `src/data/audio-manifest.v0.1.json`: 25개 asset 모두 `"status": "missing"`.
  - `src/App.tsx`: 오디오 path가 없으면 `playbackState`를 `fallback`으로 설정하고 `quote.audioMissing` 메시지를 표시한다.
- 영향:
  - "3초 안에 좋은 목소리로 듣기"라는 MVP 핵심 약속을 충족하지 못한다.
  - QA 기준으로는 기능이 동작해도 제품 경험은 아직 launch-ready가 아니다.
- 권장:
  - 25개 releasePack 항목 중 최소 각 카테고리 1개씩 총 5개라도 `approved` 오디오를 먼저 연결한다.
  - 이후 25개 전체 오디오 연결, 실제 모바일 재생/일시정지/오류 상태 QA를 진행한다.

#### H2. 구현 파일과 lockfile이 git에 추적되지 않음

- 근거:
  - `git status --short`에서 `src/`, `test/`, `package.json`, `package-lock.json`, `AGENTS.md`, `CLAUDE.md`, `ai/reviews/` 등이 `??` 상태.
  - `package-lock.json`은 존재하지만 `git ls-files --error-unmatch package-lock.json` 기준 tracked가 아니다.
- 영향:
  - 현재 통과한 테스트/빌드 결과를 리뷰, PR, 릴리즈 기준으로 재현하기 어렵다.
  - 앱 repo에서 lockfile 미추적은 dependency supply-chain 재현성 리스크다.
- 권장:
  - 릴리즈 전 의도된 파일만 선별 staging한다.
  - `package-lock.json`을 반드시 추적한다.
  - generated graph/cache와 임시 산출물은 정책에 맞게 제외한다.

### Medium

#### M1. 최종 사용자 화면에 내부 플랫폼 준비 상태가 노출됨

- 근거:
  - `src/App.tsx` 하단 `platform-readiness` section이 로그인, 결제, 광고 준비 상태를 사용자에게 보여준다.
  - `src/i18n.ts`에도 `platform.auth`, `platform.payment`, `platform.ads` 문구가 사용자 copy로 들어 있다.
- 영향:
  - 감정적으로 "지금 필요한 한마디를 듣는 앱" 흐름 끝에 계정/결제/광고 개발 상태가 노출되어 몰입을 깬다.
  - 디자인 기획의 "계정/결제/광고 화면 제외" 방향과 어긋난다.
- 권장:
  - 플랫폼 준비 상태는 테스트와 문서에만 남기고 앱 UI에서는 제거한다.
  - 필요하면 dev-only flag나 hidden diagnostics로 분리한다.

#### M2. 언어 선택 버튼 터치 타깃이 작음

- 근거:
  - `src/styles.css`의 `.language-switcher button`은 `min-height: 32px`.
- 영향:
  - 모바일 앱 기준 권장 터치 타깃 44px에 못 미친다.
  - 언어 전환은 설정 성격이지만, 첫 화면 상단 컨트롤이라 오터치 가능성이 있다.
- 권장:
  - `min-height: 44px` 이상으로 올리고, 전체 switcher 높이도 모바일에서 안정적으로 확보한다.

#### M3. 최근 들은 한마디 localStorage에 삭제/초기화 UX가 없음

- 근거:
  - `src/App.tsx`는 `praise-me:last-heard-v1`에 최근 들은 항목을 저장한다.
  - UI에는 "마지막 들은 한마디" 표시만 있고 지우기 흐름은 없다.
- 영향:
  - 현재 저장 데이터는 앱 문장/카테고리뿐이라 민감도는 낮지만, 사용자의 감정 상태를 암시할 수 있다.
  - 공유 기기나 WebView 환경에서 사용자가 기록을 숨기거나 초기화할 방법이 없다.
- 권장:
  - 최근 기록 지우기 버튼을 추가하거나, 설정/long-press 등 가벼운 삭제 흐름을 둔다.
  - 향후 사용자 입력/개인화가 들어가면 보관 기간과 개인정보 안내를 명확히 한다.

#### M4. 플랫폼 adapter는 구조만 있고 production 기능은 stub

- 근거:
  - `src/platform/adapters.ts`의 auth/payment/ads는 모두 `status: "stub"`.
  - 결제 entitlement는 항상 `false`, 광고는 항상 disabled, auth는 anonymous만 반환한다.
- 영향:
  - MVP에서는 적절하지만, Apps in Toss/Google Play monetization 전에는 실제 SDK adapter와 백엔드 검증이 필요하다.
- 권장:
  - Toss login, Apps in Toss IAP, Google Billing, backend receipt verification을 별도 milestone으로 잡는다.
  - 제품 로직에 SDK import가 들어가지 않도록 현재 adapter 경계를 유지한다.

### Low / Notes

#### L1. referencePack에는 high-risk 명대사 후보가 있으나 releasePack에는 노출되지 않음

- 근거:
  - `quote-pack.v0.1.json`의 `releasePack` 25개는 모두 `riskLevel: low`.
  - `referencePack`에는 high-risk movie/drama quote 후보가 9개 있다.
- 영향:
  - 현재 앱 런타임은 `releasePack`만 사용하므로 즉시 출시 차단 리스크는 낮다.
- 권장:
  - `referencePack`이 제품 화면이나 생성 스크립트에 섞이지 않도록 테스트를 유지한다.
  - high-risk 후보는 권리 검수 전 기본 앱 번들에서 제외한다.

#### L2. TTS CLI는 env key 방식이며 앱 번들에는 직접 포함되지 않음

- 근거:
  - `scripts/tts/gemini-tts.mjs`는 `process.env.GEMINI_API_KEY`를 요구하고, `--dry-run`은 API key 없이 동작한다.
  - 앱 런타임 grep에서는 외부 fetch가 발견되지 않았다.
- 영향:
  - 현재 구조는 "앱 번들에 LLM/TTS API key 금지" 원칙을 대체로 지킨다.
- 권장:
  - 생성된 오디오와 API key가 git에 들어가지 않도록 `.gitignore`와 release 절차를 유지한다.
  - 실제 TTS 실행 로그에 API key 포함 URL이 남지 않도록 CI/터미널 공유 시 주의한다.

## QA 상태

현재 자동 검증 상태는 양호하다.

- typecheck 통과.
- build 통과.
- vitest 11 files, 32 tests 통과.
- 기본 `npm test`는 sandbox에서 Vite temp config 작성 권한 문제로 실패했지만, `vitest run --configLoader runner`로 통과했다.

남은 QA:

- 실제 모바일 viewport에서 첫 화면, 언어 전환, 긴 영어 문구, 최근 기록, fallback 상태 스크린샷 확인.
- 실제 오디오 파일 연결 후 재생/일시정지/재시도/오류 상태 확인.
- WebView/Apps in Toss 환경에서 autoplay 정책, audio path, localStorage 동작 확인.

## 디자인 리뷰

정적 기준으로 첫 화면 구조는 기획과 대체로 맞다.

좋은 점:

- 5개 요청형 CTA가 첫 화면의 중심이다.
- 버튼 크기와 메인 quote card는 모바일 앱 경험에 맞게 크다.
- warm/calm/self-care 톤이 일관된다.
- `releasePack`과 i18n 텍스트가 분리되어 있다.

보완점:

- 내부 플랫폼 준비 상태가 사용자 UI에 보인다. 감정 UX에서는 제거하는 편이 낫다.
- 언어 전환 버튼의 터치 타깃이 작다.
- 실제 오디오 연결 전이라 "재생 중" 상태의 시각 피드백은 검증하지 못했다.
- live screenshot 기반 디자인 평가는 아직 미완료다.

## 보안 리뷰

확인된 상태:

- 실제 secret 파일 없음.
- `.env`와 `.env.*`는 gitignore, `.env.example`만 허용.
- 클라이언트에서 LLM/TTS API key를 직접 사용하지 않음.
- `dangerouslySetInnerHTML`, `eval`, cookie 직접 접근 없음.
- dependency audit offline 기준 0 vulnerabilities.
- node_modules production/dev package install script 고위험 패턴은 확인되지 않음.
- CI/CD, Docker, IaC 표면 없음.

주의:

- 현재 보안 리뷰는 정적 1차 점검이다.
- production 배포 전에는 hosting headers, CSP, privacy policy, store compliance, receipt verification, backend entitlement를 별도로 검토해야 한다.

## 다음 단계 권장 순서

1. 의도된 구현/문서/lockfile을 git에 추적되도록 정리한다.
2. `platform-readiness` 사용자 UI를 제거하거나 dev-only로 분리한다.
3. 각 카테고리 최소 1개씩 오디오를 연결해 "실제 음성 MVP"를 만든다.
4. 모바일 live QA를 실행하고 스크린샷 기반 디자인 리뷰를 업데이트한다.
5. 오디오 25개 전체 연결 후 Apps in Toss WebView 기준 재생 정책을 확인한다.

## Change Log

| version | date | note |
| --- | --- | --- |
| 0.1 | 2026-06-13 | Codex subagent 읽기 전용 감사 초안. 기획/디자인/QA/보안 리스크 정리. |

## 보안 고지

이 문서는 AI-assisted 1차 보안 점검이다. production 시스템, 결제, 개인정보, store release 전에는 별도의 수동 보안 리뷰와 플랫폼 정책 검토가 필요하다.
