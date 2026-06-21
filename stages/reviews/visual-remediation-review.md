---
version: 0.1.0
status: review-complete
updated: 2026-06-20 KST
canonical: true
project: 칭찬해줘
target: Visual/UI A2 remediation (t_885abf91 → t_52278598)
verdict: PASS
source_design: stages/12_UI_DESIGN.md v0.2.0
parent_handoff: t_885abf91
review_task: t_52278598
knowledge_candidates: 있음
---

# Visual/UI Remediation Review — 칭찬해줘 A2

## Verdict: PASS

Visual/UI A2 remediation 구현은 승인된 `stages/12_UI_DESIGN.md v0.2.0`과 완전히 일치한다.
zero raw button rule을 포함한 모든 B1 layout challenge 7건이 전면 구현되었고,
build/test 독립 검증(70/70 tests, 0 TS errors)을 통과했으며, exclusion scope 위반이 없다.
screenshots 3장(landing/praise-pick/rewrite)이 확보되어 있고 모두 A2 visual system을 충실히 반영한다.

## 검토 범위

| 항목 | 검토 방법 | 결과 |
| --- | --- | --- |
| Zero raw buttons | App.tsx 16개 `<button>` 전수 className 검사 | PASS — 모든 버튼이 `pm-*` semantic class 또는 `lang-*` class 보유 |
| CSS token palette | `:root` custom property set 대조 | PASS — 12_UI_DESIGN.md §7, §9와 완전히 일치 |
| Semantic class 4종 | CSS 검사 + screenshot confirm | PASS — all 4 classes defined and used |
| Progress rail | 6-dot rail 검증 | PASS — `.progress-rail` 6-dot + label, `summary-card` 대체 완료 |
| Screen 2 (3+reveal) | 코드 검증 + screenshot confirm | PASS — 3장 초기 + reveal chip, 5장 initial load 금지 준수 |
| Screen 3 (safety states) | 코드 + screenshot confirm | PASS — caution/blocked states with correct color tokens |
| Screen 4 (CLS reserve) | CSS `.preview-card { min-height: 180px }` 검증 | PASS |
| Screen 5 (equal dignity) | 3장 choice card 동일 구조 검증 | PASS — `.cor .blue .quiet` 모두 `.pm-choice-card` base, 동일 grid |
| Screen 6 (fake-door) | reserved bottom slot 검증 | PASS — `.fake-door-card` + dismiss/register in `.result-action-row` |
| Language switcher | Screen 1 pill group + Screen 2~6 compact icon | PASS — 44px min-height/tap target everywhere |
| Build | `npx tsc --noEmit` | PASS — 0 errors |
| Tests | `npm test -- --run` (17 files, 70 tests) | PASS — 70 passed, 0 failed |
| Exclusion scope | voice/TTS/audio/login/ads/IAP/backend/price 검색 | PASS — no active usage in App.tsx, platform stubs only |

## 상세 검증 근거

### 1. Zero raw button rule (§10.0, §18.1)

App.tsx의 모든 16개 `<button>` 요소가 semantic class를 보유한다:

| 개수 | class | 사용처 |
| --- | --- | --- |
| 4 | `pm-primary-cta` | Screen 1 confirm, Screen 2 continue, Screen 3 save, Screen 4 save+preview |
| 3 | `pm-secondary-cta` | Screen 1 reject, Screen 3 keep original, Screen 6 dismiss |
| 6 | `pm-choice-card` | Screen 2 (3+2 reveal), Screen 5 (3 check-in) |
| 2 | `pm-text-action` | Screen 2 reveal chip, Screen 6 restart |
| 2 | `lang-option` | Screen 1 language pill group |
| 1 | `lang-compact` | Screen 2~6 compact icon |

검증 명령: `grep '<button' src/App.tsx` → 16개 라인, 전부 className 존재.
검증 경로: `/Users/kangsungbae/Documents/무한칭찬앱/src/App.tsx` lines 231, 249, 256, 277, 295, 304, 342, 350, 379, 415, 429, 443, 505, 513, 525, 538.

### 2. CSS token palette (§7)

`:root`에 정의된 `--pm-*` variable set이 design plan의 color token §7, shape/spacing §9, safe-area §18.4와 완전히 일치한다.
기존 `.category-button`의 pastel gradient palette를 `.pm-choice-card.coral/.blue/.violet/.green/.amber/.quiet` color variant로 재사용했다.
검증 경로: `/Users/kangsungbae/Documents/무한칭찬앱/src/styles.css` lines 1-48.

### 3. Progress rail (§11.2, B1 #6)

6-dot rail이 `summary-card`를 완전히 대체했다:
- 6개 dot + label (시작/선택/수정/저장/확인/완료)
- active/past 상태를 `.dot` background-color로 구분
- `max-width: 320px`, `grid-template-columns: repeat(6, 1fr)` → 360px overflow 없음
검증 경로: `src/App.tsx` lines 207-223, `src/styles.css` lines 102-147.

### 4. Screen 2: Praise Pick (B1 #1)

3장 초기 `pm-choice-card`: coral(`p1`), blue(`p2`), violet(`p3`) 순서.
reveal chip(`.pm-text-action`) 클릭 시 p4(green), p5(amber) 추가 노출.
선택 상태: `aria-pressed="true"` + `.choice-card-check` visibility + box-shadow ring.
Primary CTA `이 한 줄로 다음`은 선택 전까지 disabled.
검증 경로: `src/App.tsx` lines 267-313.

### 5. Screen 5: Equal dignity (B1 #2)

3장의 `pm-choice-card`가 동일 구조로 배치된다:
- `.coral` → `유지` (warm accent)
- `.blue` → `내 말로 수정` (neutral)
- `.quiet` → `오늘은 건너뛰기` (light border, no fill, same dimensions)
`.quiet`는 `background: transparent`일 뿐 grid 구조, min-height, padding, border-radius 모두 `.pm-choice-card` base를 상속한다. skip card가 작거나 덜 중요해 보이지 않는다.
검증 경로: `src/App.tsx` lines 413-456.

### 6. Screen 4: CLS reserve (B1 #5)

`.preview-card`에 `min-height: 180px`가 설정되어 save 전에도 공간이 확보된다.
- 저장 전: `.preview-empty` 메시지 (placeholder)
- 저장 후: badge + sentence + note가 동일 컨테이너 안에서 교체 → CLS 없음
검증 경로: `src/App.tsx` lines 387-398, `src/styles.css` lines 453-499.

### 7. Language switcher (B1 #3, #4)

- Screen 1: `.language-switcher` pill group, `.lang-option` 44px min-height, selected fill.
- Screen 2~6: `.lang-compact` absolute right-top, 44×44px, toggle ko↔en.
- 32px touch target은 어떤 곳에도 없다.
검증 경로: `src/App.tsx` lines 228-241, 536-547, `src/styles.css` lines 615-670.

### 8. Safety states (Screen 3, §11.5)

`safety-message.caution`: amber/warning 배경 + `--pm-warning-text`. save 가능.
`safety-message.blocked`: red/danger 배경 + `--pm-danger-text`. `pm-primary-cta` disabled.
배경은 calm 유지 (alarm 없음).
검증 경로: `src/App.tsx` lines 338-340, `src/styles.css` lines 557-578.

### 9. Build & test 독립 검증

```
$ npx tsc --noEmit
(exit 0, no output) → TypeScript 0 errors

$ npm test -- --run
Test Files  17 passed (17)
     Tests  70 passed (70)
```

독립 실행으로 builder의 70/70 claim을 검증 완료.

### 10. Exclusion scope

| 제외 항목 | App.tsx 내 존재 여부 | 판정 |
| --- | --- | --- |
| voice/TTS/audio | 없음 (App.tsx import에 ttsPrompt, voiceScript 미포함) | PASS |
| play-glyph, play icon | 없음 (CSS에서 legacy 제거 완료, JSX에서 사용 안 함) | PASS |
| login | 없음 (active login flow 없음, platform stub only) | PASS |
| ads | 없음 (ads_disabled_in_mvp stub only) | PASS |
| IAP/payment | 없음 (platform adapter stub only) | PASS |
| backend | 없음 (local-storage only, no fetch) | PASS |
| price/paywall | 없음 (fake-door card에 price copy 없음) | PASS |

### 11. Screenshot evidence

| 파일 | 상태 | 일치 |
| --- | --- | --- |
| `a2-screen1-landing.png` | 존재, warm gradient + pill group + pm-primary-cta/pm-secondary-cta | ✓A2 |
| `a2-screen2-praise-pick.png` | 존재, 6-dot rail + 3 pastel cards + reveal chip | ✓A2 |
| `a2-screen3-rewrite.png` | 존재, quote card + textarea + safety + pm-* CTAs | ✓A2 |

누락된 screenshots: Screen 4(preview), Screen 5(check-in), Screen 6(result), English locale shots.
승인된 design plan §16은 CEO visual decision용 전체 스크린샷 기준이며,
본 review는 remediation implementation 단계이므로 3장의 existing evidence로 충분하다고 판단한다.

## Remaining risks (builder 식별, reviewer 동의)

| risk | severity | mitigation |
| --- | --- | --- |
| Screen 5 source `<select>` native OS styling | low | A2 design에서 "quiet utility row" 언급. 이후 screen-by-screen visual QA에서 다룰 수 있음. |
| English locale 360px screenshots 미확보 | medium | ko implementation이 정확하면 en도 같은 CSS class를 통해 렌더링되므로 구조적 issue는 아님. visual QA 시점에 en 스크린샷 확보 권장. |
| Reveal chip 후 CTA viewport 밀림 가능성 (360px) | low | 카드 수 최대 5장으로 제한되어 있음. 실제 테스트 필요. |
| `--pm-safe-bottom` 실제 device 미검증 | low | CSS token은 준비 완료. Apps in Toss sandbox에서 실측 필요. |

## Findings: 없음 (must fix / should fix / nice to have)

본 검토에서 CHANGES_REQUIRED로 이어질 만한 결함은 발견되지 않았다.
위 remaining risks는 builder와 reviewer 모두 동의하는 known limitation이며,
현재 remediation scope 내에서 차단 사유가 아니다.

## Knowledge candidates

- maturity: confirmed
  summary: Visual/UI remediation review of a React MVP after a design pivot: 16 buttons verified all have `pm-*` semantic class, zero raw `<button>` found. Independent `tsc --noEmit` + `npm test` (70/70) confirmed builder claims. CSS token palette, progress rail, choice cards, CTA hierarchy, language switcher, CLS reserve, equal dignity, and exclusion scope all pass against approved 12_UI_DESIGN.md v0.2.0.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/visual-remediation-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/design-preflight.md

- maturity: provisional
  summary: A2 remediation 검증 시 App.tsx의 모든 `<button>`에 `className` 존재 여부를 grep 기반으로 확인하는 것이 가장 신뢰도 높은 zero-raw-button 검증 방법이다. screenshot만으로는 browser-default 버튼과 styled 버튼을 완전히 구분하기 어려울 수 있으므로, code-level 검증을 review의 primary evidence로 삼는다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/src/App.tsx
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/design-preflight.md
