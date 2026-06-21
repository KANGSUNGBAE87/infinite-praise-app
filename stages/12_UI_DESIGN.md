---
version: 0.2.0
status: visual-ui-a2-candidate
updated: 2026-06-20 KST
project: 칭찬해줘
phase: Visual/UI Design A2 — layout challenge 반영 최종
canonical_stage: true
source_task: t_9460a4d8
parent_review: stages/reviews/ui-layout-design-review.md (t_02ca9722)
approved_product_decision: D-20260619-002
approved_ux_decision: D-20260619-003
visual_restart_decision: D-20260620-016
---

# 12_UI_DESIGN.md — 칭찬해줘 Visual/UI Design A2 (최종)

## 0. One-line direction

`칭찬해줘`의 새 6-screen no-audio MVP는 기존 2026-06-08 샘플의 따뜻한 크림 배경, 파스텔 CTA 카드, 굵고 둥근 모바일 앱 감각을 유지하되, UX의 first value인 `한 줄 저장 → 내일 preview → D1 check-in`을 가장 먼저 보이게 하는 retention-first visual system으로 재구성한다.

이 문서는 B1 layout challenge 7건을 모두 해소한 Visual/UI A2 최종안이다. CEO visual decision 직전 artifact이며, 이후 implementation은 이 문서의 semantic class mapping과 screenshot acceptance criteria를 따라야 한다.

## 1. Approved inputs and scope locks

| item | status | UI implication |
| --- | --- | --- |
| Product plan | D-20260619-002 APPROVE_WITH_CHANGES | bedtime 자기비판 20~30대 직장인, 큐레이션 칭찬 primary, next-day check-in, D1 fake-door만 설계한다. |
| UX flow | D-20260619-003 APPROVE | 6-screen UX와 first value를 바꾸지 않는다. |
| Visual restart | D-20260620-016 REJECT for visual readiness | 현재 기능/정책 QA PASS를 디자인 승인으로 보지 않는다. raw `<button>`은 visual defect로 명시한다. |
| B1 layout challenge | `stages/reviews/ui-layout-design-review.md` PASS_WITH_CHANGES | visual system은 승인, 4건 REQUIRED 변경 + 3건 RECOMMENDED 제안. A2에서 전면 수용. |
| Owner audio constraint | 2026-06-19 21:38 KST | 음성/TTS/audio player는 MVP core에서 제외한다. |
| Platform | Apps in Toss first, Google Play compatible | safe area, small viewport, ko/en i18n, platform SDK 비의존 UI를 전제로 한다. |

## 2. Lineage table

| date / lineage | source | what it proved | retained | changed for 6-screen no-audio MVP |
| --- | --- | --- | --- | --- |
| 2026-06-07 form-like sample | `ai/session-logs/2026-06-07-ui-review-mobile.png`, `ai/plans/2026-06-07-ui-product-upgrade-plan.md` | 기능은 있으나 `오늘의 상황` + `듣고 싶은 톤`이 설문/폼처럼 보였다. 짙은 결과 카드는 감정적 focal point 가능성을 보여줬다. | cream background, card grouping, strong result surface, 자기인정 영수증의 조용한 기록성. | numbered form, 같은 모양 선택지의 긴 세로 목록, 초반 receipt 노출, form-first hierarchy는 폐기한다. |
| 2026-06-08 polished 5-button sample | `ai/session-logs/2026-06-08-praise-me-design-mvp-mobile-initial.png`, `...selected.png`, `ai/session-logs/2026-06-08-praise-me-design-mvp.md` | 앱스토어 수준에 가까운 warm/polished direction. 큰 앱명, 파스텔 CTA 카드, rounded icon tile, deep navy type, spacious card가 강점이다. | warm cream/peach base, 22~28px radius cards, pastel category surfaces, thick headline type, white result card, pill labels, generous vertical rhythm, shadow softness. | 5-button audio control, play icon 중심 CTA, `짧은 음성` guide, audio fallback box는 no-audio MVP와 충돌하므로 제거/변환한다. |
| 2026-06-13 design brief | `ai/plans/2026-06-13-praise-me-design-brief.md` | "버튼 하나 누르면 지금 필요한 말을 바로 듣는다"라는 즉시성, 토스식 정보 구조, 유치하지 않은 self-care tone을 정의했다. | warm/calm/self-care, low-pressure copy, 토스식 큰 제목→짧은 설명→핵심 CTA→결과 카드 순서. | first value가 audio instant gratification에서 저장/preview/next-day loop로 바뀌었으므로 CTA는 `듣기`가 아니라 `고르기/저장/확인`으로 재정의한다. |
| 2026-06-19 6-screen UX pivot | `stages/10_UX_FINAL.md`, D-20260619-003 | 6-screen retention MVP: landing, praise pick, rewrite, time save+preview, next-day check-in, result/fake-door. | 첫 화면 목적 즉시 이해, curated choice first, first value 전 login/pay/ad 금지, ko/en selectable, small screen rule. | 단일 홈 오디오 앱에서 multi-step retention flow로 전환한다. 화면별 P0 action과 progress clarity가 필요하다. |
| 2026-06-20 live screenshot rejection | `01_DECISIONS.md` D-20260620-016, `ai/reviews/review.md` | 현재 live visual direction은 기능/정책 QA만 통과했고, screenshot design review가 incomplete이며 기본/1990s 홈페이지 버튼처럼 보인다는 Owner rejection이 있었다. | 기능적으로 검증된 6-screen contract는 유지한다. | 현재 unclassed/default-looking buttons는 visual defect로 명시하고, A2에서 semantic class mapping과 exact button prohibition으로 닫는다. |

## 3. Design goals

1. First value clarity: 사용자가 첫 세션에서 `한 줄을 고르고 내일 다시 볼 시간 하나를 저장한다`는 목적을 3초 안에 이해해야 한다.
2. Warm but not childish: 파스텔과 하트/별을 쓰더라도 유아적 캐릭터 앱처럼 보이지 않게 deep navy typography와 넉넉한 white card를 같이 쓴다.
3. No form smell: 선택 화면은 설문지가 아니라 `오늘 밤 내게 남길 문장 카드`를 고르는 큐레이션처럼 보여야 한다.
4. Trust-safe monetization: D1 결과의 fake-door는 하단 작은 관심 CTA로만 보이고, 가격/결제/paywall의 시각 언어를 쓰지 않는다.
5. Accessibility before decoration: 색은 감정 tone을 보조할 뿐 상태를 단독으로 전달하지 않는다. 모든 actionable surface는 44px 이상 tap target과 AA 대비를 만족한다.
6. Apps in Toss-safe mobile polish: 360px class viewport, safe-area bottom, long Korean/English copy, native navigation 충돌을 전제로 둔다.
7. Zero raw buttons: 어떤 화면에서도 browser-default `<button>` 외관이 발견되지 않는다. 모든 CTA는 semantic class(`pm-primary-cta`, `pm-secondary-cta`, `pm-choice-card`, `pm-text-action` 등)에 매핑된다.

## 4. Screen priority

| screen | P0 visual focus | P1 support | what must not dominate |
| --- | --- | --- | --- |
| 1. Channel Landing / Target Confirm | headline + primary CTA `맞아요, 들어볼게요` | rejection secondary CTA, source/channel calm note | progress card, platform readiness, diagnostics |
| 2. Praise Pick | 3 large praise choice cards + "다른 한 줄 더 보기" reveal | short helper copy, selected state, next CTA | dense grid, unstyled native buttons, 5장 이상 initial load |
| 3. Rewrite Optional | selected sentence preview + one-line edit field | safety/caution status, `이대로 저장` secondary | blank writing pressure, medical/therapy tone |
| 4. Time Save + Preview | time choice + preview card, save action | preview-only notification explanation, CLS 방지 reserve | permission prompt, real notification claim, ads/pay CTA |
| 5. Next-day Check-in | yesterday line + 3 equal-dignity choice cards | source tag/manual re-entry note | monetization, settings, long history |
| 6. Result / Trust-safe Monetization Slot | check-in result summary | bottom fake-door CTA + dismissible explanation | price card, hard sell, modal interruption |

## 5. Reference / mood evidence

### 5.1 2026-06-08 polished sample visual DNA

Observed from `2026-06-08-praise-me-design-mvp-mobile-initial.png` and selected state:

- Background: full-screen cream/peach gradient, not pure white. The page feels soft before content appears.
- Brand: large app title in dark navy, bold rounded Korean type, centered, high confidence.
- Icon tile: rounded-square soft pink tile with a simple line icon, used as a warm brand anchor.
- CTA cards: large rounded pastel blocks, each with left icon tile, bold request text, small explanatory line, and right-side action affordance.
- Shape: 22~28px outer card radius, icon tile radius around 18~22px, pill labels for small metadata.
- Elevation: subtle warm shadow and white inner highlight; no harsh borders.
- Color role: coral/blue/violet/green/amber are category accents; deep navy remains text and structure.
- Result card: white surface, large quote, small category pill, status/waveform area, outlined secondary actions, one purple/coral primary action.
- Spacing: high vertical rhythm; cards are visually separated by 12~16px gaps, not cramped.

### 5.2 2026-06-07 form-like sample evidence

Observed from `2026-06-07-ui-review-mobile.png`:

- It uses cream background and cards, but the numbered `1`, `2` sections create a questionnaire feeling.
- Choice rows are flat bordered rectangles with repeated hierarchy; the user appears to fill a form rather than receive care.
- A dark teal result card has stronger emotional contrast, but appears after too many list choices.
- This sample should be treated as negative evidence for layout density and positive evidence for calm cream base and strong result focus.

### 5.3 Current live visual defect evidence

`src/App.tsx` now renders many step actions as raw `<button>` inside generic `<section>` blocks, e.g. step 1 confirm/reject, step 2 praise options, step 5 check-in actions, step 6 result actions. `src/styles.css` has polished legacy classes such as `.category-button`, `.quote-actions .primary-action`, `.create-reminder-button`, but the current 6-screen JSX does not consistently map its actions to those classes. D-20260620-016 records the Owner rejection: current screenshot buttons look default/1990s homepage-like.

Therefore: current default-looking/unclassed buttons are a visual defect, not an acceptable minimal style. A2 explicitly requires that every interactive element carries a semantic class name; no `<button>` without `className` is acceptable in the implementation.

## 6. Visual principles

1. One primary action per screen: filled coral/dark-coral button only for the next step or save/confirm action.
2. Choice as card, not browser button: praise and check-in choices are tappable cards with labels, description, selected state, and minimum 64px height.
3. Preview as reward: saved preview is visually the strongest white card on Screen 4, using a small warm badge and large sentence text.
4. Step progress is quiet: progress is a 6-dot rail with optional short label per dot (e.g. `선택` under dot 2). Never a large summary card competing with content.
5. Safety states are calm: caution uses amber/tan surface and explanatory copy; blocked uses red only for border/status text, not alarmist backgrounds.
6. Locale switcher is utility: Screen 1 only as warm pill group (44px tap height). Screens 2~6 use a compact language icon (44×44px) in top-right corner, visually quieter than primary CTA.
7. Fake-door is reserved: D1 result screen reserves a bottom slot so late CTA appearance does not push stable actions unexpectedly.
8. Motion is optional: tiny press/selected transitions are okay; continuous particle/canvas effects are not appropriate for Apps in Toss/mobile self-care.
9. Zero browser-default buttons: 모든 `<button>`에는 반드시 semantic class가 부여되어야 한다. class 없는 raw `<button>`은 screenshot에서 발견되는 즉시 visual defect 간주.

## 7. Color tokens

Palette selected from the 2026-06-08 sample and checked against Coolors/WCAG contrast guidance. Coolors was used as fallback because the requested colors.io source did not surface as a usable palette source in quick search; Coolors exposes palette generation and contrast checker guidance.

```css
:root {
  --pm-bg: #fff8ef;
  --pm-bg-gradient-top: #fffaf3;
  --pm-bg-gradient-bottom: #fff6ec;
  --pm-surface: #ffffff;
  --pm-surface-warm: #fffaf5;
  --pm-border: #e6d8ca;
  --pm-border-strong: #d8c8ba;

  --pm-text: #172036;
  --pm-text-strong: #1f2a44;
  --pm-text-muted: #667085;
  --pm-text-soft: #8c7f75;

  --pm-primary: #c65043;
  --pm-primary-hover: #b6463a;
  --pm-primary-soft: #ffe6df;
  --pm-focus: rgba(198, 80, 67, 0.34);

  --pm-accent-purple: #7a4de8;
  --pm-accent-purple-soft: #eadfff;
  --pm-accent-blue-soft: #e3f3ff;
  --pm-accent-green-soft: #e4f5ea;
  --pm-accent-amber-soft: #fff0c9;
  --pm-warning-text: #b45309;
  --pm-warning-bg: #fff7e5;
  --pm-danger-text: #b42318;
  --pm-danger-bg: #fff0ee;

  --pm-disabled-bg: #ebe7e1;
  --pm-disabled-text: #8c7f75;

  /* B1 challenge: safe-area bottom 준비 */
  --pm-safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

Contrast checks run for key pairs:

| pair | ratio | usage |
| --- | ---: | --- |
| `#172036` on `#FFF8EF` | 15.37:1 | body/headline on warm background |
| `#1F2A44` on white | 14.26:1 | card text |
| `#667085` on white | 4.97:1 | secondary text minimum |
| white on `#C65043` | 4.54:1 | primary CTA text |
| white on `#7A4DE8` | 5.18:1 | optional purple action |
| `#1F2A44` on pastel CTA cards | 11.2~12.6:1 | card labels on soft accents |
| `#B45309` on `#FFF7E5` | 4.71:1 | warning/caution text |

Note: old disabled `#98A2B3` on `#EBE7E1` only measured 2.09:1, so disabled buttons must not rely on low-contrast text alone. Use `--pm-disabled-text: #8c7f75` plus disabled label/icon/opacity pattern.

## 8. Typography

| token | value | use |
| --- | --- | --- |
| font stack | `Pretendard, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif` | Korean-first mobile UI |
| display | 38~48px / 1.04 / 900 | app title or major result sentence; avoid every screen using this size |
| screen title | 26~32px / 1.18 / 900 | each screen h1/h2 |
| card title | 20~24px / 1.22 / 900 | praise card, check-in option |
| body | 15~17px / 1.55 / 700 | explanatory copy |
| caption | 12~14px / 1.45 / 800 | badges, status, metadata, progress dot labels |
| CTA | 16~18px / 1.2 / 900 | primary buttons |

Korean copy should use `word-break: keep-all` for hero/result text, but cards must allow wrapping without horizontal overflow. English locale must be tested because labels become longer.

## 9. Shape, spacing, and elevation tokens

```css
:root {
  --pm-radius-page-card: 26px;
  --pm-radius-card: 22px;
  --pm-radius-control: 16px;
  --pm-radius-pill: 999px;
  --pm-space-page-x: 18px;
  --pm-space-section: 18px;
  --pm-space-card: 16px;
  --pm-gap-card: 12px;
  --pm-tap-min: 44px;
  --pm-choice-min: 64px;
  --pm-primary-min: 56px;
  --pm-shadow-card: 0 16px 30px rgba(47, 35, 26, 0.08);
  --pm-shadow-cta: 0 18px 34px rgba(198, 80, 67, 0.22);
}
```

Rules:

- Outer mobile content width: `min(100%, 430px)` centered.
- Page padding: `max(18px, env(safe-area-inset-left/right))` horizontally and safe-area aware bottom padding.
- Bottom CTA wrapper: `padding-bottom: calc(24px + var(--pm-safe-bottom))`. Screens 2~6의 하단 영역은 이 계산을 기본 적용한다.
- Section gap: 18~24px; card internal padding 16~20px.
- Avoid 8px radius on main cards/buttons; that is one source of the current default/web-form feel.
- Dense rows may use 14~16px radius only when clearly secondary.

## 10. CTA and button hierarchy (A2 finalized)

### 10.0 Zero raw button rule

모든 버튼은 반드시 다음 네 가지 semantic class 중 하나로 렌더링되어야 한다. `className` 없는 raw `<button>`은 screenshot acceptance에서 즉시 reject된다.

### 10.1 Primary CTA (`pm-primary-cta`)

Use for one screen-advancing action only.

- Visual: filled `--pm-primary`, white label, 56px min-height, 18~20px radius, soft shadow (`--pm-shadow-cta`).
- Class: `pm-primary-cta`.
- Copy examples: `맞아요, 들어볼게요`, `다음으로`, `저장하고 미리보기`, `확인했어요`.
- Disabled: keep the same layout height; use warm disabled surface, muted text, explanatory helper nearby.
- Width: full width within content column (not inline-block).

### 10.2 Secondary CTA (`pm-secondary-cta`)

Use for safe alternatives that do not advance primary conversion.

- Visual: white/warm outline, deep navy label, 52~56px min-height, no heavy shadow.
- Class: `pm-secondary-cta`.
- Copy examples: `지금은 아니에요`, `이대로 저장`, `뒤로`.
- It must not look like a raw browser button.

### 10.3 Tertiary/text action (`pm-text-action`)

Use sparingly for cancel/back/language/reveal.

- Visual: pill or text chip, 44px tap target where exposed at top of screen.
- Class: `pm-text-action`.
- Never place five raw tertiary buttons in a row for core actions.

### 10.4 Choice card button (`pm-choice-card`)

For praise selection and check-in decisions. **Screen 2와 Screen 5의 모든 선택 액션은 이 class를 사용한다.**

- Visual: pastel or white card, 64px+ height, title + optional one-line support copy, selected border/focus ring.
- Class: `pm-choice-card`.
- Color variants: `.pm-choice-card.coral`, `.blue`, `.violet`, `.green`, `.amber` — 2026-06-08 `.category-button`의 pastel gradient palette를 그대로 쓴다.
- Selected state: `pm-choice-card[aria-pressed="true"]` → subtle `0 0 0 4px rgba(255,255,255,.72)` ring + accent border + selected check label, not only color.
- Pressed/hover: small translate only; no flashy motion.

## 11. Component direction

### 11.1 App shell

- Warm gradient background covering the whole viewport.
- Single centered mobile column; no desktop-specific wide split.
- Header is screen-specific after the landing; avoid repeating large brand hero on every step if it pushes the P0 CTA below fold.

### 11.2 Progress rail (B1 반영: 6-dot with optional labels)

- Use six-dot rail at top, not `1/6` pill or large summary card.
- 각 dot 아래에 작은 caption label 배치 가능 (예: `시작`·`선택`·`수정`·`저장`·`확인`·`완료`). label 제공 여부는 optional이며, 360px에서도 horizontal overflow 없이 배치.
- Do not show a large `summary-card` at top; 현재 `summary-card`는 content와 경쟁하므로 progress rail로 교체 권장.

### 11.3 Cards

- Primary content card: white, 22~26px radius, warm border, soft shadow.
- Praise choice card: 2026-06-08 `.category-button` DNA를 직접 사용. pastel gradient 배경, left icon tile, bold text, subtle right affordance.
- Preview card: white/warm card with small amber/coral badge `내일 다시 볼 한 줄` and large sentence.

### 11.4 Inputs

- Textarea should feel like a calm card, not a form field: 16px padding, 18px radius, warm border, clear focus ring.
- Native time input can stay but must be wrapped in a rounded card/pill and paired with one recommended time chip.

### 11.5 Status and safety

- Loading: skeleton lines/cards in the same shape as final card.
- Empty: low-pressure copy, no sad/empty icon overload.
- Error: compact retry banner with action.
- Offline: readable content remains; save action explains preview-only behavior.
- Caution: amber message card; allow save if UX says caution-saveable.
- Blocked: red/tan border and short explanation; primary save disabled, secondary `문장 다시 고치기` visible.

## 12. Imagery and iconography

- No stock photos. The product should feel like a calm utility, not a therapy landing page.
- Use simple line icons only: heart, moon, check, spark, archive, pencil. Icons support text but do not replace labels.
- Old 2026-06-08 left icon tile pattern is retained: soft rounded-square tile inside cards.
- Remove/avoid audio play icons in no-audio MVP except if explicitly used as historical reference; they would mislead users.
- Avoid medical, clinical, or counseling imagery.
- Language switcher icon (Screens 2~6): simple globe or `A/가` icon in a 44×44px compact touch target.

## 13. Screen-by-screen visual direction (A2 finalized)

### Screen 1. Channel Landing / Target Confirm

Purpose: qualify whether the user is in the bedtime self-criticism moment.

Layout:

1. Top utility row: quiet language switcher pill group (`한국어`, `EN`) aligned right or centered under safe-area, **44px height** (B1 REQUIRED #4).
2. Brand mark: small warm rounded-square heart/moon icon, not huge.
3. Hero headline: `자기 전, 오늘을 덜 가혹하게 닫고 싶나요?`
4. Support copy: `한 줄 칭찬을 고르고, 내일 다시 확인해요.`
5. Primary CTA: full-width filled coral `pm-primary-cta` → `맞아요, 들어볼게요`.
6. Secondary CTA: outlined `pm-secondary-cta` → `지금은 아니에요`.
7. Tiny trust note: `로그인·결제 없이 먼저 써볼 수 있어요.` if copy is approved.

Visual rules:

- Hero + primary CTA must be visible within first 640px height on 360px viewport.
- No progress summary card above headline.
- Rejection CTA should not look disabled; it is a valid low-pressure exit.
- Language switcher `min-height` and `min-width`를 **반드시 44px**로 설정한다. 32px는 WCAG touch target 미달.

### Screen 2. Praise Pick (B1 REQUIRED #1 반영)

Purpose: start primary action without blank input friction.

Layout (B1 변경: 5장 → 3장 + reveal):

1. Small 6-dot progress rail at top with dot 2 강조.
2. Screen title: `오늘 자기 전 남길 한 줄을 골라볼까요?`
3. **3장**의 `pm-choice-card` — 2026-06-08 `.category-button` pastel gradient DNA를 직접 사용.
   - 각 카드: left icon tile(48×48px, rounded-square) + main sentence (bold 20~24px) + one-line intent caption (`오늘 버틴 나에게`, `작은 시도를 놓치지 않게`).
   - 3장은 360×740px viewport에서 header + title + cards + CTA + gap을 모두 포함해도 first-viewport를 초과하지 않는다(~540px 소요).
4. 3장 아래: `pm-text-action` chip → `다른 한 줄 더 보기`. 클릭 시 추가 카드 1~2장 reveal (기존 praiseOptions 중 미노출 항목).
5. In-flow primary CTA: `pm-primary-cta` → `이 한 줄로 다음`. 선택 후에만 enabled.

Visual rules:

- `pm-choice-card` selected: `aria-pressed="true"`, border ring + check icon. Color alone is not enough.
- Reveal chip은 secondary 사이즈보다 작고 조용하게; 이미 3장을 봤다면 충분하다는 인상을 준다.
- Avoid `button` row clusters with no spacing; that is the rejected defect.
- Card 수(3)는 360px에서 first-value 가시성을 보장한다. 5장 initial load는 360px viewport를 초과하므로 **허용하지 않는다.**
- 카드 배경색 로테이션: `.coral` → `.blue` → `.violet` 순으로 2026-06-08 palette 사용. reveal 카드에는 `.green`, `.amber` 적용.

### Screen 3. Rewrite Optional

Purpose: let users adjust wording without turning the app into blank writing.

Layout:

1. Selected sentence preview card at top.
2. Calm textarea card below with helper `짧게 바꿔도 충분해요.`
3. Safety status area directly below input.
4. Primary CTA: `pm-primary-cta` → `저장하기` if safe/caution; disabled if blocked.
5. Secondary CTA: `pm-secondary-cta` → `이대로 저장`.

Visual rules:

- The selected original sentence remains visible to prevent blank-page anxiety.
- Caution copy is warm/low-pressure, not red alarm.
- Keyboard-aware bottom spacing is required if implemented as mobile WebView.

### Screen 4. Time Save + Preview (B1 RECOMMENDED #5 반영)

Purpose: deliver first value after saving one time.

Layout:

1. Title: `내일 다시 볼 시간을 하나 정해요.`
2. Recommended time chips: `오늘 밤`, `내일 아침`, or actual time presets if approved.
3. Native time control inside rounded surface.
4. Primary CTA: `pm-primary-cta` → `저장하고 미리보기`.
5. **Preview card container에 `min-height` reserve** (B1 RECOMMENDED): save 전에도 preview가 들어갈 공간을 미리 확보. save 직후 CLS 없이 badge + large sentence가 나타난다.
   - Badge: `내일의 나에게`
   - Large sentence: 26~32px, 900 weight
   - Small note: `실제 알림 전에도 여기서 미리 확인할 수 있어요.`
   - Reserve `min-height: 180px` — preview card가 DOM에 삽입될 때 아래 CTA가 밀리지 않도록.

Visual rules:

- The preview card is the first-value hero; use larger type and more whitespace.
- No permission prompt before the user understands the preview.
- If save is preview-only, use clear status label, not tiny footer-only copy.

### Screen 5. Next-day Check-in (B1 REQUIRED #2 반영)

Purpose: D1 return reason and message fit are checked with one tap.

Layout (B1 변경: 3장 동등 choice card):

1. Title: `어제의 한 줄, 오늘도 맞나요?`
2. Yesterday line in a white quote card.
3. **3장의 동등한 `pm-choice-card`** — A1의 primary-secondary-tertiary 계층을 폐기하고, equal dignity 3장으로 배치:
   - `유지`: warm accent card (`.pm-choice-card.coral` 배경). "어제의 한 줄, 그대로 둘게요."
   - `내 말로 수정`: neutral card (`.pm-choice-card` white). "조금 다르게 바꾸고 싶어요."
   - `오늘은 건너뛰기`: quiet card (`.pm-choice-card` with light border, no fill). "오늘은 확인만 할게요."
   - 모든 카드는 동일 너비/높이. skip card가 작거나 덜 중요해 보이면 안 된다.
4. Source/manual re-entry tag as a small utility row, not a form-select centerpiece.

Visual rules:

- The three decisions need equal dignity; do not make skip look shameful (B1 REQUIRED #2).
- Avoid native `<select>` visual prominence. If source is user-facing, make it a small segmented pill or hide under diagnostic if not needed by user.
- No monetization on this screen before the user completes check-in.
- `pm-choice-card`을 3장 세로 배치 시 360px에서 세트가 viewport 안에 들어온다.

### Screen 6. Result / Trust-safe Monetization Slot

Purpose: summarize check-in and gently test interest only for D1 returners.

Layout:

1. Result summary card: `오늘은 이 한 줄을 유지해둘게요.` or action-specific text.
2. Small archive/future card at bottom: `마음에 든 한 줄 보관함 보기`.
3. CTA behavior: clicking opens dismissible explanation card + optional interest registration. No price.
4. Dismiss and register actions use secondary/primary hierarchy but both are safe exits.
5. Restart/new flow action is tertiary and lower than result summary.

Visual rules:

- Fake-door must be below the emotional result, not adjacent to vulnerable text input.
- Reserve bottom slot height to prevent layout jump when CTA appears.
- Do not show JSON/sanitized analytics article in user-facing UI. If diagnostics are needed, hide behind dev-only flag.

## 14. Language switcher (B1 REQUIRED #3, #4 반영)

- Required because ko default / en selectable is a platform rule.
- **Screen 1 only**: warm pill group, selected `#1f2a44` or primary fill, unselected white outline.
- **Screen 2~6**: compact globe/`A/가` icon button, 44×44px, top-right corner. 더 이상 전체 pill group을 반복하지 않는다 (B1 REQUIRED #3: persistent → landing-only + compact icon).
- Minimum tap target: **44px** (B1 REQUIRED #4). A1의 32px는 WCAG touch target 미달이므로 허용하지 않는다.
- English labels and long text must be screenshot-tested at 360px.

## 15. Mobile and accessibility criteria

### Mobile viewport

- Primary target: 360×740 and 390×844.
- Content width max: 430px.
- All P0 CTA visible without horizontal scroll.
- Bottom padding: `calc(24px + var(--pm-safe-bottom))`를 모든 하단 CTA 영역에 적용 (B1 RECOMMENDED #7).
- Sticky bottom CTA는 allowed only if it does not cover content or Apps in Toss nav/safe area. 기본 전략은 in-flow.

### Tap and focus

- All interactive controls: 44px minimum; P0 CTA: 56px minimum; choice cards: 64px minimum.
- Language switcher: 44px minimum (B1 REQUIRED #4).
- Focus ring: visible 2px outline or 3~4px soft ring using `--pm-focus`.
- Disabled controls keep their space and include a reason/helper where needed.

### Contrast

- Body text, labels, CTA text meet WCAG AA contrast.
- Pastel cards use deep navy text, not muted gray.
- Disabled state may be lower emphasis but still readable; never use only opacity to communicate disabled.

### Semantics

- Buttons that behave like choices use `aria-pressed` and selected text/icon state.
- Screen changes should announce status for save/preview/error.
- Color is never the only safety/error signal.

## 16. Screenshot acceptance criteria (A2 updated)

Before CEO visual approval, implementation/screenshots must show:

1. 360px and 390px screenshots for all 6 screens in Korean.
2. At least Screen 1, 2, 4, 6 in English locale.
3. Screen 2: 3 `pm-choice-card` + reveal chip visible; selected state with border ring + check.
4. Screen 3: safe, caution, and blocked states.
5. Screen 4: before save (reserved preview area visible) and after preview first-value state (no CLS).
6. Screen 5: 3 equal-dignity `pm-choice-card` for 유지/수정/건너뛰기. Skip card is same size, not visually diminished.
7. Screen 6: fake-door hidden on first session and visible only for D1 return/result.
8. **검사 항목 0: zero browser-default buttons.** 어떤 screenshot에서도 class 없는 raw `<button>` 외관이 발견되지 않아야 한다.
9. No audio/play icon/copy implying voice in MVP core.
10. No JSON analytics/debug payload visible to user-facing screenshot.
11. No horizontal overflow at 360px; no P0 CTA covered by safe area.
12. Long Korean and English labels wrap without clipping.
13. Language switcher: Screen 1에서 44×44px minimum; Screen 2~6에서 compact globe icon 44×44px.
14. Progress: 6-dot rail visible; optional label 작동 확인.

## 17. Response to B1 layout challenge

### 17.1 Accepted changes (수용)

| # | B1 요구 | A2 조치 |
| --- | --- | --- |
| 1 | Screen 2: 5 praise cards → 3 + "다른 한 줄 더 보기" (REQUIRED) | **수용.** Screen 2를 3장 `pm-choice-card` + reveal chip으로 변경. 360px first-viewport 가시성 보장. 5장 initial load는 허용하지 않음. |
| 2 | Screen 5: 3 check-in actions → 동등한 choice card 3장 (REQUIRED) | **수용.** A1의 primary-secondary-tertiary 계층을 폐기하고, 3장 동등 `pm-choice-card`로 배치. skip card는 동일 크기와 dignity를 가짐. |
| 3 | Language switcher: persistent → Screen 1 only + compact icon (REQUIRED) | **수용.** Screen 1은 warm pill group, Screen 2~6은 44×44px globe icon으로 대체. 수직 공간 절약. |
| 4 | Language switcher size: 32px → 44px (REQUIRED) | **수용.** 모든 language control의 min-height/min-width를 44px로 상향. 32px는 touch target 미달. |
| 5 | Screen 4 preview: min-height reserve for CLS (RECOMMENDED) | **수용.** preview card container에 `min-height: 180px` reserve. save 후 CLS 방지. |
| 6 | Progress: dot + label 검토 (RECOMMENDED) | **수용.** 6-dot rail + optional caption label 허용. `summary-card`는 progress 용도로 사용하지 않음. |
| 7 | Bottom CTA: `env(safe-area-inset-bottom)` CSS custom property (RECOMMENDED) | **수용.** `--pm-safe-bottom` token 추가, 모든 하단 CTA 영역에 적용. |

### 17.2 Rejected changes (기각)

없음. B1 layout challenge의 4건 REQUIRED + 3건 RECOMMENDED를 **전면 수용**한다. A1 visual system (color, typography, spacing, CTA 계층)은 B1에서 승인되었으므로 변경하지 않는다.

### 17.3 Remaining risks

| risk | mitigation |
| --- | --- |
| 3장 카드 set으로도 긴 영문 praise 라인이 360px에서 overflow 가능 | English screenshot 필수 검증. `word-break: break-word` 적용. |
| reveal chip 클릭 시 추가 카드가 viewport를 밀어내 CTA가 가려질 수 있음 | reveal은 in-flow로 추가되고, CTA는 카드 목록 하단 in-flow 유지. viewport 하단에 CTA가 보이도록 카드 수 제한 (최대 5). |
| Screen 5 choice card 3장 + quote card가 360px에 빡빡할 수 있음 | quote card와 choice card 간 간격을 12px로 tight하게 유지. |
| Apps in Toss sandbox-safe-area 실제 동작은 아직 미검증 | `--pm-safe-bottom` token으로 준비만 해두고, sandbox QA에서 실측. |

## 18. Implementation handoff requirements (A2 finalized)

Implementation은 CEO visual decision 이후 시작한다. 시작 시 아래 요구사항을 반드시 충족해야 한다.

### 18.1 Semantic class mapping (필수)

모든 interactive element는 아래 class 중 하나에 반드시 매핑된다. `className` 없는 raw `<button>`/`<input>`/`<select>`는 허용되지 않는다.

| semantic class | 적용 화면 | minimum spec |
| --- | --- | --- |
| `pm-primary-cta` | Screen 1 (confirm), 2 (next), 3 (save), 4 (save+preview), 6 (register) | 56px min-height, filled `--pm-primary`, white label, 18~20px radius, `--pm-shadow-cta` |
| `pm-secondary-cta` | Screen 1 (reject), 3 (keep original), 6 (dismiss) | 52~56px min-height, white/warm outline, deep navy label |
| `pm-choice-card` | Screen 2 (3 praise + reveal extras), Screen 5 (3 check-in) | 64px+ min-height, pastel/white, `aria-pressed`, selected ring+check |
| `pm-text-action` | Screen 2 (reveal chip), Screen 6 (restart), language icon | 44px min tap target, pill/chip or compact icon |
| `pm-language-switch` | Screen 1 (pill group), Screen 2~6 (globe icon) | 44px min-height × min-width |

### 18.2 Component style expectations

**`pm-primary-cta`:**
```css
.pm-primary-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 56px;
  padding: 14px 24px;
  color: #ffffff;
  font-size: 17px;
  font-weight: 900;
  background: var(--pm-primary);
  border: none;
  border-radius: 20px;
  box-shadow: var(--pm-shadow-cta);
  cursor: pointer;
}
.pm-primary-cta:disabled {
  background: var(--pm-disabled-bg);
  color: var(--pm-disabled-text);
  box-shadow: none;
  cursor: not-allowed;
}
```

**`pm-choice-card`:**
```css
.pm-choice-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  width: 100%;
  min-height: 64px;
  padding: 16px 20px;
  color: var(--pm-text-strong);
  text-align: left;
  background: var(--pm-surface);
  border: 1.5px solid var(--pm-border);
  border-radius: var(--pm-radius-card);
  box-shadow: var(--pm-shadow-card);
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}
.pm-choice-card[aria-pressed="true"] {
  border-color: var(--pm-primary);
  box-shadow:
    0 22px 40px rgba(47, 35, 26, 0.14),
    0 0 0 4px rgba(255, 255, 255, 0.72);
}
/* color variants — 2026-06-08 category-button palette */
.pm-choice-card.coral  { background: linear-gradient(135deg, #ffe6df 0%, #fff1ec 100%); }
.pm-choice-card.blue   { background: linear-gradient(135deg, #e3f3ff 0%, #f1f8ff 100%); }
.pm-choice-card.violet { background: linear-gradient(135deg, #eadfff 0%, #f5efff 100%); }
.pm-choice-card.green  { background: linear-gradient(135deg, #e4f5ea 0%, #f2fbf5 100%); }
.pm-choice-card.amber  { background: linear-gradient(135deg, #fff0c9 0%, #fff7e5 100%); }
```

**`pm-secondary-cta`:**
```css
.pm-secondary-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 52px;
  padding: 12px 24px;
  color: var(--pm-text-strong);
  font-size: 16px;
  font-weight: 900;
  background: var(--pm-surface);
  border: 1.5px solid var(--pm-border-strong);
  border-radius: 18px;
  cursor: pointer;
}
```

**`pm-text-action`:**
```css
.pm-text-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  padding: 6px 14px;
  color: var(--pm-text-muted);
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: 1px solid var(--pm-border);
  border-radius: var(--pm-radius-pill);
  cursor: pointer;
}
```

### 18.3 State styling expectations

| state | visual treatment |
| --- | --- |
| Disabled CTA | `--pm-disabled-bg` 배경 + `--pm-disabled-text` 텍스트 + `cursor: not-allowed`. 높이 유지. |
| Selected choice card | `aria-pressed="true"` + coral border + white ring shadow. pastel 배경 위에서도 border가 명확히 보여야 함. |
| Caution (Screen 3) | amber message card: `--pm-warning-bg` 배경, `--pm-warning-text` 텍스트, 왼쪽 amber border accent. save는 가능. |
| Blocked (Screen 3) | red/tan border + `--pm-danger-text` helper. `pm-primary-cta` disabled. 배경은 calm 유지 (alarm 없음). |
| Preview card (Screen 4) | white card, coral/amber badge, large navy sentence. `min-height: 180px` reserve. |
| Fake-door (Screen 6) | reserved bottom card slot. visible only when `sessionPhase === "reopened"`. |
| Language switcher (selected) | Screen 1: primary fill. Screen 2~6 icon: subtle opacity change. |
| Focus ring | `box-shadow: 0 0 0 3px var(--pm-focus)` on keyboard focus. |

### 18.4 CSS variable migration

기존 `src/styles.css`에 아래 custom property set을 최상단에 주입한다:

```css
:root {
  --pm-safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

그리고 모든 하단 CTA wrapper에 `padding-bottom: calc(24px + var(--pm-safe-bottom))`을 적용한다.

### 18.5 Reuse of existing polished CSS

기존 `src/styles.css`의 `.category-button` 클래스는 `pm-choice-card`의 DNA로 직접 포팅한다:
- grid layout (icon tile + text + affordance)
- pastel gradient variants (.coral, .blue, .violet, .green, .amber)
- 22px radius, soft shadow, selected ring
- left icon tile pattern (`.category-icon`)

단, `.category-button`은 오디오 play icon(> `.play-glyph`)과 강하게 결합되어 있으므로, **play icon을 제거**하고 선택 check indicator로 대체한다.

### 18.6 Pre-implementation checklist

구현 시작 전에 아래 항목을 확인한다:

1. `src/App.tsx`의 모든 `<button>`이 `pm-*` semantic class를 가진다.
2. `src/styles.css`에 `:root` token set과 `pm-*` component class가 정의되어 있다.
3. 360px × 6 screenshots (ko)에서 browser-default button이 단 하나도 없다.
4. Screen 2 선택/미선택 state가 border ring + check로 시각적으로 확인 가능하다.
5. Screen 5 3장 choice card가 동일 크기와 dignity를 가진다.
6. Language switcher가 Screen 1에서만 pill group으로, Screen 2~6에서는 compact icon으로 보인다.
7. Screen 4 preview card가 CLS 없이 나타난다 (min-height reserve).
8. Progress indicator가 6-dot rail로 표시된다 (summary-card 대체).

## 19. Excluded scope

This Visual/UI artifact does not approve or define:

- product scope changes beyond `stages/10_UX_FINAL.md`
- voice/TTS/audio playback
- AI counseling/generative advice
- login, ads, IAP, Toss points, real payment, paywall, price card
- backend, release/store submission, Apps in Toss sandbox validation
- implementation code changes
- final CEO visual approval

## 20. Unresolved assumptions

1. Exact current live screenshot file for the rejected 2026-06-20 UI was not provided in the task; D-20260620-016 and source inspection are treated as sufficient evidence for the defect.
2. No official brand guideline beyond existing sample screenshots exists; the palette is a derived project palette, not a formal brand claim.
3. The final set of praise lines for Screen 2 may still change in Product/Copy, but the 3-card + reveal system should hold.
4. Actual Apps in Toss safe-area behavior still needs sandbox/device QA later.
5. colors.io did not surface as a usable palette source in quick search; Coolors contrast guidance was used as fallback per design-preflight.

## 21. Knowledge candidates

- maturity: confirmed
  summary: Existing-app visual refresh after a UX pivot should preserve proven visual DNA (palette, radius, typography, card affordance) while explicitly retiring old affordances that now contradict scope, such as audio play cues after a no-audio MVP decision.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/12_UI_DESIGN.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/design-preflight.md
- maturity: provisional
  summary: 감정/자기조율 앱의 D1 fake-door CTA는 bottom reserved slot + dismissible explanation card로 설계해야 emotional result 직후의 trust risk와 late layout shift를 동시에 줄일 수 있다.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/10_UX_FINAL.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-non-game-ads-points-monetization.md
- maturity: provisional
  summary: React/Vite MVP가 UX pivot 후 JSX를 단순 raw button으로 재구성하면 기존 CSS 디자인 DNA가 남아 있어도 live UI는 browser-default처럼 보일 수 있으므로, Visual/UI handoff에는 semantic class/component mapping acceptance criterion이 필요하다.
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
| 0.2.0 | 2026-06-20 | A2 final: B1 layout challenge 7건 전면 수용. Screen 2 → 3장+reveal, Screen 5 → 동등 choice card 3장, language switcher → Screen 1 only + 44px, Screen 4 CLS reserve, 6-dot rail, safe-area token. Zero raw button rule 명문화. Implementation handoff criteria 완성. |
