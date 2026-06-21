---
version: 0.2.0
status: visual-ui-a2-candidate
updated: 2026-06-20 KST
canonical: true
project: 칭찬해줘
source_stage: stages/12_UI_DESIGN.md
source_task: t_9460a4d8
parent_review: stages/reviews/ui-layout-design-review.md (t_02ca9722)
approved_product_decision: D-20260619-002
approved_ux_decision: D-20260619-003
visual_restart_decision: D-20260620-016
---

# 칭찬해줘 Canonical Design Plan

## Current status

Visual/UI Design A2 candidate — B1 layout challenge 7건을 전면 수용한 최종안. CEO visual decision 직전.

- `stages/12_UI_DESIGN.md`

## Design thesis

`칭찬해줘`의 6-screen no-audio MVP는 기존 2026-06-08 polished sample의 warm/pastel/mobile-app DNA를 보존하되, audio-first 5-button UX를 그대로 복사하지 않는다. 새로운 visual system은 `한 줄 선택 → 내 말로 조정 → 시간 저장 → 내일 preview → D1 check-in → trust-safe fake-door`의 retention loop를 더 또렷하게 보여줘야 한다.

## Approved constraints

| constraint | source | design impact |
| --- | --- | --- |
| Apps in Toss first / Google Play compatible | `00_PROJECT_BRIEF.md`, app platform docs | mobile safe-area, ko/en selectable, no platform-SDK visual dependency |
| Product Planning accepted scope | D-20260619-002 | bedtime self-criticism cohort, curated praise primary, D1 fake-door only |
| UX accepted flow | D-20260619-003, `stages/10_UX_FINAL.md` | 6 screens and first value must not be changed by visual design |
| No voice/audio MVP core | Owner 2026-06-19, `01_DECISIONS.md` | remove play icons/audio copy from core CTA language |
| Visual restart required | D-20260620-016 | current functional QA is not visual approval; default-looking buttons are defects |
| B1 layout challenge | `stages/reviews/ui-layout-design-review.md` PASS_WITH_CHANGES | A2에서 4건 REQUIRED + 3건 RECOMMENDED 전면 수용. zero raw button rule 명문화. |

## Lineage summary

| lineage | retained | changed |
| --- | --- | --- |
| 2026-06-07 form-like sample | cream base, card grouping, strong result-card possibility | remove numbered questionnaire/list feeling |
| 2026-06-08 polished 5-button sample | warm gradient, large navy type, pastel rounded CTA cards, icon tiles, white result card, soft shadows | remove direct audio/play affordance and single-screen audio promise |
| 2026-06-13 design brief | warm, immediate, self-care, Toss-like hierarchy | reinterpret immediacy as save/preview clarity, not voice playback |
| 2026-06-19 6-screen UX pivot | first value, D1 retention loop, ko/en, low-pressure copy | multi-screen rhythm needs progress, reserved bottom CTA, state styling |
| 2026-06-20 rejection | functionally proven 6-screen contract | raw/default buttons must be remediated later |
| 2026-06-20 A2 final | visual system (color/type/spacing/CTA hierarchy) — B1 승인 | Screen 2: 3장+reveal; Screen 5: 동등 choice card; lang switcher: landing-only 44px; zero raw button rule |

## Visual system summary

### Mood

- Warm, calm, low-pressure, polished mobile self-care.
- Not medical, not childish, not a generic landing page.
- The user should feel "여기서 한 줄만 남겨도 충분하다," not "설문을 채워야 한다."

### Color tokens

```css
--pm-bg: #fff8ef;
--pm-surface: #ffffff;
--pm-text: #172036;
--pm-text-strong: #1f2a44;
--pm-text-muted: #667085;
--pm-primary: #c65043;
--pm-primary-soft: #ffe6df;
--pm-accent-purple: #7a4de8;
--pm-accent-blue-soft: #e3f3ff;
--pm-accent-purple-soft: #eadfff;
--pm-accent-green-soft: #e4f5ea;
--pm-accent-amber-soft: #fff0c9;
--pm-warning-text: #b45309;
--pm-warning-bg: #fff7e5;
--pm-danger-text: #b42318;
--pm-danger-bg: #fff0ee;
--pm-safe-bottom: env(safe-area-inset-bottom, 0px);
```

Contrast spot checks:

- `#172036` on `#FFF8EF`: 15.37:1.
- `#1F2A44` on white: 14.26:1.
- white on `#C65043`: 4.54:1.
- white on `#7A4DE8`: 5.18:1.
- `#1F2A44` on pastel CTA cards: 11.2~12.6:1.

### Typography

- Font stack: `Pretendard, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`.
- Display: 38~48px, 900 weight, tight line-height.
- Screen title: 26~32px, 900 weight.
- Card title: 20~24px, 900 weight.
- Body: 15~17px, 700 weight.
- CTA: 16~18px, 900 weight.

### Shape and spacing

- Main cards: 22~26px radius.
- Controls: 16~20px radius.
- Choice card min-height: 64px.
- Primary CTA min-height: 56px.
- Utility tap target: at least 44px.
- Mobile column: `min(100%, 430px)`.
- Avoid 8px-radius main CTA/card styling because it contributes to the rejected default/web-form impression.

### CTA hierarchy (A2 finalized — zero raw button rule)

| semantic class | role | min-height | visual |
| --- | --- | --- | --- |
| `pm-primary-cta` | screen-advancing action only | 56px | filled `--pm-primary`, white label, 20px radius, soft shadow |
| `pm-secondary-cta` | safe alternative, rejection, dismiss | 52~56px | white/warm outline, navy label, no heavy shadow |
| `pm-choice-card` | praise selection, check-in decisions | 64px+ | pastel/white card, `aria-pressed`, selected ring+check |
| `pm-text-action` | reveal, restart, language icon | 44px | pill/chip, compact |

**모든 `<button>`은 반드시 위 네 가지 class 중 하나로 렌더링되어야 한다. `className` 없는 raw `<button>`은 visual defect 간주.**

## Screen-by-screen design direction (A2 finalized)

### Screen 1 — Channel Landing / Target Confirm

P0: headline and primary CTA.

- Hero: `자기 전, 오늘을 덜 가혹하게 닫고 싶나요?`
- Support: `한 줄 칭찬을 고르고, 내일 다시 확인해요.`
- Primary filled CTA (`pm-primary-cta`): `맞아요, 들어볼게요`.
- Secondary outline CTA (`pm-secondary-cta`): `지금은 아니에요`.
- Language switcher: warm pill group, **44px** tap height (Screen 1 only).

### Screen 2 — Praise Pick (A2: 3 + reveal)

P0: curated praise choice cards.

- **3장**의 `pm-choice-card` — 2026-06-08 pastel gradient DNA 사용.
- Reveal chip `pm-text-action`: `다른 한 줄 더 보기` (추가 1~2장).
- Selected state: border ring + check, not color alone.
- In-flow primary CTA (`pm-primary-cta`): `이 한 줄로 다음`.
- 5장 initial load는 360px 초과하므로 **허용하지 않음**.

### Screen 3 — Rewrite Optional

P0: selected sentence preview + calm one-line edit.

- Original selected sentence remains visible.
- Textarea is a warm card, not a browser form field.
- Caution state uses amber calm surface; blocked state uses red/tan border and clear helper.
- Primary (`pm-primary-cta`): `저장하기`; secondary (`pm-secondary-cta`): `이대로 저장`.

### Screen 4 — Time Save + Preview (A2: CLS reserve)

P0: save one time and immediately see first-value preview.

- Time selection uses rounded control/chips.
- Primary (`pm-primary-cta`): `저장하고 미리보기`.
- Preview card container에 `min-height: 180px` reserve → CLS 방지.
- Preview card: badge + large sentence + preview-only note.
- No permission prompt, ads, payment, or audio promise.

### Screen 5 — Next-day Check-in (A2: equal dignity)

P0: yesterday line + three check-in choices.

- Quote card: `어제의 한 줄, 오늘도 맞나요?`
- Three **equal-dignity** `pm-choice-card`:
  - `유지`: warm accent (coral-soft 배경)
  - `내 말로 수정`: neutral (white)
  - `오늘은 건너뛰기`: quiet (light border, no fill)
- Skip card가 작거나 덜 중요해 보이면 안 된다 (B1 REQUIRED).
- Manual/notification source should be a quiet utility, not a form-select centerpiece.

### Screen 6 — Result / Trust-safe Monetization Slot

P0: check-in result summary.

- D1-only fake-door appears at bottom as a reserved card slot.
- Clicking leads to dismissible explanation + optional interest registration.
- No price, discount, paywall, payment copy, or aggressive modal.
- User-facing JSON/debug analytics must not be visible.

## Current visual defects to remediate later

- Current `src/App.tsx` contains many raw `<button>` actions in generic `<section>` blocks for screens 1, 2, 3, 5, and 6.
- Existing polished classes in `src/styles.css` are not consistently mapped to the current 6-screen JSX.
- D-20260620-016 records that current screenshot buttons look default/1990s homepage-like.
- Therefore: no future screenshot can pass visual approval while core CTAs look like raw browser buttons.
- A2 implementation handoff requires that every `<button>` carries a `pm-*` semantic class. Zero raw buttons.

## Language switcher (A2 변경)

- Screen 1: warm pill group (`한국어`, `EN`), **44px** minimum.
- Screen 2~6: compact globe/`A/가` icon, 44×44px, top-right corner. 더 이상 전체 pill group을 반복하지 않는다.
- 32px touch target은 WCAG 미달 → 허용하지 않음.

## Mobile/accessibility approval criteria

1. 360px and 390px screenshots for all 6 Korean screens.
2. English screenshots for at least Screens 1, 2, 4, and 6.
3. All tap targets >= 44px; primary CTAs >= 56px; language switcher >= 44px.
4. No horizontal overflow.
5. No P0 CTA hidden behind safe area or sticky footer.
6. All text/CTA contrast meets WCAG AA for intended text size.
7. State is not communicated by color alone.
8. No audio/play copy or icon in MVP core.
9. **No raw/default-looking buttons (zero browser-default button rule).**
10. Fake-door visible only in D1 result context and visually low-pressure.
11. Screen 2: 3 `pm-choice-card` + reveal chip, 360px first-viewport fit.
12. Screen 4: preview card CLS-free (min-height reserve).
13. Screen 5: 3 equal-dignity choice cards, skip not diminished.
14. Progress: 6-dot rail (not `1/6` pill, not summary-card).

## Layout challenge points — resolved

| # | challenge point | A2 resolution |
| --- | --- | --- |
| 1 | Screen 2: 5장 vs 3+reveal | **3장 + reveal** — 360px first-value 가시성 우선 |
| 2 | Bottom CTA: sticky vs in-flow | **in-flow 기본** — `--pm-safe-bottom` token으로 준비 |
| 3 | Screen 4 preview: same vs transition | **same-viewport inline + min-height reserve** — CLS 방지 |
| 4 | Screen 5: equal vs hierarchical | **동등한 choice card 3장** — dignity 유지, skip-shaming 방지 |
| 5 | Screen 6: reserved vs inline | **reserved bottom slot** — CLS 방지 |
| 6 | Language switcher: persistent vs landing | **Screen 1 only + compact icon** — 수직 공간 절약 |
| 7 | Progress: 6-dot vs `n/6` pill | **6-dot rail + optional label** — form-like 느낌 회피 |

## Excluded scope

This plan does not approve product scope changes, voice/TTS/audio, AI counseling, login, ads, IAP, payment, backend, release/store submission, or product code implementation.

## Unresolved assumptions

- No separate official brand guideline exists; this system derives from sample screenshots and project docs.
- Exact rejected live screenshot path was not provided; D-20260620-016 and source inspection are used as evidence.
- Final copy/praise line set may change, but the visual card system should remain stable.
- Apps in Toss sandbox safe-area 동작은 아직 미검증; `--pm-safe-bottom` token으로 준비.

## Knowledge candidates

- maturity: confirmed
  summary: Existing-app visual refresh after a UX pivot should preserve proven visual DNA while retiring affordances that now contradict scope, such as audio play cues after a no-audio MVP decision.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/12_UI_DESIGN.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/design-preflight.md
- maturity: provisional
  summary: 감정/자기조율 앱의 D1 fake-door CTA는 bottom reserved slot + dismissible explanation card로 설계해야 emotional result 직후의 trust risk와 late layout shift를 동시에 줄일 수 있다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/10_UX_FINAL.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-non-game-ads-points-monetization.md
- maturity: provisional
  summary: React/Vite MVP가 UX pivot 후 JSX를 raw button으로 재구성하면 기존 CSS 디자인 DNA가 있어도 live UI는 browser-default처럼 보일 수 있으므로, Visual/UI handoff에는 semantic class/component mapping acceptance criterion이 필요하다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/src/App.tsx
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/design-preflight.md
- maturity: provisional
  summary: 칭찬/자기돌봄 앱의 check-in screen에서 skip action이 작거나 tertiary로 보이면 shameful해지므로, 3개 check-in action은 항상 동등한 card size와 dignity를 가져야 한다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/ui-layout-design-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/design-preflight.md
- maturity: provisional
  summary: 모바일 앱의 language switcher는 landing screen에서만 전체 pill/picker를 노출하고 이후 화면에서는 compact icon(44px)으로 대체하면 360px small-screen에서 불필요한 수직 공간을 아낄 수 있다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/reviews/ui-layout-design-review.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/design-preflight.md

## Change Log

| version | date | note |
| --- | --- | --- |
| 0.1.0 | 2026-06-20 | Visual/UI A1 restart candidate created from project samples, original design lineage, approved 6-screen UX, and D-20260620-016 visual rejection. |
| 0.2.0 | 2026-06-20 | A2 final: B1 layout challenge 7건 전면 수용. Screen 2 → 3장+reveal, Screen 5 → 동등 choice card 3장, language switcher → landing-only 44px, CLS reserve, 6-dot rail, safe-area token, zero raw button rule, implementation handoff 명문화. |
