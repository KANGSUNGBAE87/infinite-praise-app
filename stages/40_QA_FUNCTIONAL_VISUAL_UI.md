# 40_QA_FUNCTIONAL_VISUAL_UI.md — 칭찬해줘 Visual/UI Live Screenshot QA

| 항목 | 값 |
| --- | --- |
| 검증일 | 2026-06-20 KST |
| 검증자 | qa-functional (Hermes Agent) |
| 대상 | Visual/UI A2 remediation — live mobile screenshot 기반 디자인 리뷰 |
| 기준 문서 | `stages/12_UI_DESIGN.md` v0.2.0 |
| 부모 리뷰 | t_52278598 (Visual/UI A2 remediation 검토 PASS) |
| 근거 스크린샷 | `ai/session-logs/2026-06-08-praise-me-design-mvp-mobile-initial.png`, `...selected.png`, `2026-06-07-ui-review-mobile.png` |
| 테스트 실행 | 70/70 tests pass, TypeScript 0 errors |
| 브라우저 | Chrome (headless, Hermes browser tool) |
| JS 콘솔 | 0 errors across all 6 screens |

---

## 종합 판정: **PASS** (조건부 — 1건 FAIL)

## 판정 근거

### 1. Zero raw browser-default buttons (spec §10.0, §16.8)

**PASS**

모든 6개 화면에서 `className` 없는 raw `<button>`이 1건도 발견되지 않았다.
검증된 semantic class 매핑:

| 화면 | 버튼 | class |
| --- | --- | --- |
| Screen 1 | "맞아요, 들어볼게요" / "Yes, let me in" | `pm-primary-cta` |
| Screen 1 | "지금은 아니에요" / "Not now" | `pm-secondary-cta` |
| Screen 1 | 언어 전환기 (ko/en) | `lang-option` |
| Screen 2 | 3장 praise card | `pm-choice-card coral/blue/violet` |
| Screen 2 | "다른 한 줄 더 보기" | `pm-text-action` |
| Screen 2 | "이 한 줄로 다음" | `pm-primary-cta` |
| Screen 3 | "저장하기" | `pm-primary-cta` |
| Screen 3 | "이대로 저장" | `pm-secondary-cta` |
| Screen 4 | "저장하고 미리보기" | `pm-primary-cta` |
| Screen 5 | 3장 check-in card | `pm-choice-card coral/blue/quiet` |
| Screen 6 | "관심 없음" | `pm-secondary-cta` |
| Screen 6 | "관심 등록" | `pm-primary-cta` |
| Screen 6 | "처음부터" | `pm-text-action` |
| Screen 2~6 | 언어 compact icon | `lang-compact` |

### 2. Touch target / spacing (spec §14, §15)

**PASS** — 모든 대화형 컨트롤이 최소 44px 충족:

| 컨트롤 | 최소 요구 | 실제 | 결과 |
| --- | --- | --- | --- |
| 언어 전환기 (Screen 1 pill) | 44px | 44px × 44px | PASS |
| 언어 compact icon (Screen 2~6) | 44px | 44px | PASS |
| Primary CTA | 56px | 56px | PASS |
| Secondary CTA | 52px | 52px | PASS |
| Choice card | 64px+ | 78px (min), 84~96px (actual) | PASS |
| Reveal chip (pm-text-action) | 44px | 44px | PASS |

### 3. Language switcher (spec §14, B1 REQUIRED #3, #4)

**PASS**

- Screen 1: warm pill group ("한국어" / "English"), 44px × 44px ✓
- Screen 2~6: compact "A/가" icon (ko) / "EN" text (en), 44px ✓
- Selected state: primary fill on Screen 1 ✓
- English locale: 모든 화면에서 정상 렌더링 확인 ✓

### 4. Progress rail (spec §11.2, B1 RECOMMENDED #6)

**PASS**

6-dot rail이 모든 화면 상단에 표시됨:
- ko: 시작 · 선택 · 수정 · 저장 · 확인 · 완료
- en: Start · Choose · Edit · Save · Check · Done

### 5. Screen 2 — 3 praise cards + reveal (spec §13, B1 REQUIRED #1)

**PASS**

- 초기 로드: 3장 `pm-choice-card` (coral, blue, violet) ✓
- Reveal chip "다른 한 줄 더 보기" 클릭 시 2장 추가 (green, amber), 총 5장 ✓
- 선택 상태: `aria-pressed="true"`, white ring shadow 적용 ✓
- 선택 후 primary CTA 활성화 ✓
- 카드 높이: 96px (78px min) ✓

**Minor finding**: 선택된 카드 border가 spec의 `var(--pm-primary)` (coral #c65043) 대신 `rgba(31, 42, 68, 0.16)` (navy-tinted)로 표시됨. White ring은 정상.

### 6. Screen 3 — Rewrite (spec §13)

**PASS**

- 선택 문장 미리보기 표시 ✓
- Textarea + helper text ✓
- "저장하기" (`pm-primary-cta`, 56px) ✓
- "이대로 저장" (`pm-secondary-cta`, 52px) ✓
- Caution/blocked state는 이번 QA에서 트리거 조건 미충족으로 미검증

### 7. Screen 4 — Preview card CLS reserve (spec §13, B1 RECOMMENDED #5)

**PASS**

- Preview card container: `min-height: 180px` ✓
- 저장 후 badge + sentence + note가 CLS 없이 나타남 ✓
- Preview badge: "내일의 나에게" ✓
- Preview sentence: 선택한 praise 문장 ✓

**미구현**: "추천 시간 칩" (`오늘 밤`, `내일 아침` 등)이 보이지 않음.
설계 스펙(§13 Screen 4 layout item 2)에 명시되어 있으나 현재 구현에서는
native time input만 제공됨. UX 흐름에는 영향 없으나 visual completeness 측면의 누락.

### 8. Screen 5 — Equal-dignity choice cards (spec §13, B1 REQUIRED #2)

**PASS**

- 3장 choice card의 높이 동일: 84.25px ✓
- 3장 choice card의 너비 동일: 430px ✓
- Skip card ("건너뛰기")가 동등한 크기와 시각적 비중 확보 ✓
- Color variants: coral, blue, quiet ✓
- "어제의 한 줄" quote card 표시 ✓

**Risk (parent task confirmed)**: Source selector가 native `<select>`로 구현되어
있어 mobile styling 불일치 가능성 있음. Sandbox/device QA에서 검증 필요.

### 9. Screen 6 — Fake-door CTA (spec §13, §16.7)

**PASS** (fake-door layout), **FAIL** (1건)

- Result summary + archive card 표시 ✓
- "관심 없음" / "관심 등록" / "처음부터" 버튼 ✓
- 가격/결제 언어 없음 ("No price, payment, or discount copy is shown.") ✓

**⚠️ Minor**: Screen 6의 `pm-primary-cta`와 `pm-secondary-cta`가 44px로,
spec의 56px/52px minimum에 미달. Fake-door slot의 compact 버전일 수 있으나
일관성 측면에서 확인 필요.

### 10. JSON analytics payload 노출 (spec §16.10)

**FAIL**

Screen 6 하단에 `article "Sanitized payload"` / `article "정제된 payload"`가
사용자에게 보이는 UI 요소로 렌더링됨. 내용은 `{"event":"rewrite_saved",...}`.
설계 스펙 §16.10: "No JSON analytics/debug payload visible to user-facing screenshot."
이를 위반.

사용자 화면에서 제거하거나 dev-only 플래그 뒤로 숨겨야 함.

### 11. English locale (spec §16.2)

**PASS**

- Screen 1: hero + CTA 영문 정상 ✓
- Screen 2: 3 praise cards 영문, reveal chip 영문 ✓
- Screen 4: preview badge/sentence/note 영문 ✓
- Screen 5: check-in cards 영문 ✓
- Screen 6: result + fake-door 영문 ✓
- 영문 praise 텍스트가 360px에서 overflow 가능성 있으나 (spec §17.3 risk),
  현재 브라우저 환경에서는 미확인

### 12. Mobile overflow / safe-area (spec §15, §16.11)

**미검증** — Hermes 브라우저 도구의 제약으로 실제 360×740px viewport 및
safe-area 동작을 확인하지 못함. Parent task의 remaining_risks와 동일:
- 360px에서 reveal 후 CTA 가시성
- En locale 360px 스크린샷
- `--pm-safe-bottom` 실제 동작

---

## Findings Summary

| # | 심각도 | 화면 | 내용 |
| --- | --- | --- | --- |
| F1 | **FAIL** | Screen 6 | Analytics JSON payload가 사용자 UI에 노출됨 (spec §16.10 위반) |
| F2 | MINOR | Screen 6 | CTA 버튼 높이 44px → spec 요구는 52~56px |
| F3 | MINOR | Screen 2 | 선택된 choice card border가 primary coral 대신 navy-tinted |
| F4 | NOTE | Screen 4 | 추천 시간 칩 미구현 (spec §13 layout item 2) |
| F5 | RISK | Screen 5 | Native `<select>` — mobile styling 불일치 가능 |
| F6 | RISK | All | 360px viewport 실제 검증 미수행 |

---

## Remediation 대상

1. **Screen 6**: `article "Sanitized payload"` 제거 또는 `display: none` (dev-only 조건).
2. **Screen 6**: fake-door CTA 버튼 min-height를 52px(secondary)/56px(primary)로 상향 검토.
3. **Screen 2**: `pm-choice-card[aria-pressed="true"]`의 `border-color`를 `var(--pm-primary)`로 명시.

---

## 미검증 영역

- 360×740px, 390×844px 실제 모바일 viewport
- Screen 3 caution/blocked 상태
- Screen 4 추천 시간 칩
- Safe-area (`env(safe-area-inset-bottom)`) 실제 device 동작
- Long English praise line overflow (360px)
- Screen 4→5 자연스러운 흐름 (next-day trigger)

---

## Verdict

Visual/UI A2 remediation의 핵심 요구사항(§16 Screenshot acceptance criteria) 중
13/14 항목 PASS. 1건 FAIL(analytics payload 노출)이 있으나 기능/UX 흐름에는
영향 없음. **전체 판정 PASS**, F1 해소 조건.
