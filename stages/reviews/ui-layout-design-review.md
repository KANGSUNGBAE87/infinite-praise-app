---
version: 0.1.0
status: layout-reviewed
updated: 2026-06-20 KST
project: 칭찬해줘
phase: Visual/UI Design B1 — Layout Challenge
source_task: t_02ca9722
reviewed_artifact: stages/12_UI_DESIGN.md
related_decisions: D-20260620-016, D-20260619-003, D-20260619-002
---

# UI Layout Design Review — 칭찬해줘 A1 Visual Proposal

## Verdict: PASS_WITH_CHANGES

A1 proposal(visual system, color, typography, spacing, CTA 계층)은 2026-06-08 polished sample의 warm/pastel DNA를 정확히 계승하고, no-audio 6-screen MVP의 retention first-value를 올바르게 시각화했다. layout challenge 7개 중 4개는 A1 방향에 동의하고, 3개는 360px 모바일 배치·safe-area·첫 가치 가시성 기준으로 변경을 요구한다. **현재 raw `<button>` JSX는 visual defect이며, A2 remediation 전까지 통과로 간주할 수 없다.**

---

## 1. 버튼 계층 평가

### 1.1 현재 결함 — default-looking button 문제

| 증거 | 확인 내용 |
| --- | --- |
| `src/App.tsx` | Step 1~6 모든 action이 `<button>` raw element. `className` 미부여. `section`도 bare `<section>`. |
| `src/styles.css` | `.category-button` (78px min-height, 22px radius, gradient, shadow), `.quote-actions .primary-action`, `.create-reminder-button`, `.save-reminder-button` 등 polished 클래스가 990줄 존재하지만 현재 JSX와 연결되지 않음. |
| D-20260620-016 | Owner 명시적 REJECT: "current live UI has mostly unclassed default buttons." |

**결론:** A1 문서가 정의한 CTA 계층(primary filled coral, secondary outline, choice card, text action)은 정확하다. 그러나 현재 live 구현은 이 계층을 전혀 반영하지 않으며, raw `<button>`은 browser-default 외관으로 렌더링된다. 이는 **기능 QA PASS와 무관한 visual defect**다.

### 1.2 계층 구조 적합성

A1이 제안한 4-tier CTA 계층은 아래와 같이 타당:

| tier | A1 정의 | layout 평가 |
| --- | --- | --- |
| Primary | filled `--pm-primary`, white label, 56px, 그림자 | ✅ 통과. Screen 1/3/4의 단일 전진 액션에 적합. |
| Secondary | outline, navy label, 52~56px | ✅ 통과. 거절/취소/유지(low-pressure exit) 위상에 적합. |
| Choice card | 64px+, pastel/white, 선택 ring+check | ✅ 통과. Screen 2/5의 선택형 액션을 설문지가 아닌 큐레이션으로 만드는 핵심. |
| Text/Tertiary | pill/chip, 44px tap | ⚠️ 주의. Screen 5의 3개 check-in action을 tertiary로 처리하면 `건너뛰기`가 shameful해 보일 위험. choice card로 통일 권장. |

**변경 요구:** Screen 5의 `유지`/`내 말로 수정`/`오늘은 건너뛰기` 3개 액션은 equal dignity가 필요하므로, primary-secondary-tertiary가 아닌 **동등한 choice card 3장**으로 배치할 것.

---

## 2. 모바일 배치 평가

### 2.1 Screen 2 praise 카드 밀도 (5 vs 3+reveal)

**A1 제안:** 5장 우선, 공간 부족 시 top 3 + `다른 한 줄 보기`

**B1 판단:** **3장 + reveal로 변경 권장.**

| 기준 | 5장 | 3장 + reveal |
| --- | --- | --- |
| 360×740px 공간 | header(~120px) + title(~54px) + 5×102px + gaps(~48px) + CTA(~96px) = ~828px → **넘침** | header + title + 3×102px + gaps(~24px) + CTA = ~540px → **여유 있음** |
| first-value clarity | 스크롤 필요 → 선택지 인지 부담 | 한눈에 3장 인식 → 빠른 결정 |
| 설문지 느낌 회피 | 5장 연속 리스트는 questionnaire 인상 | 3장은 큐레이션 느낌 |
| 확장성 | 카드 추가 시 대응 곤란 | reveal 버튼으로 확장 자연스러움 |

권장: `3장 카드 + "다른 한 줄 더 보기"` (secondary style chip), 선택 시 "이미 3개를 봤다면 충분하다"는 인상을 준다.

### 2.2 Bottom CTA 전략 (sticky vs in-flow)

**B1 판단:** Screen 2~4는 **in-flow CTA**를 기본으로 하고, Screen 2는 선택 후 CTA가 항상 보이도록 카드 목록 하단에 고정하지 않고 in-flow로 배치.

이유:
- Apps in Toss WebView 하단에는 Toss 자체 bottom nav/safe area(44~56px)가 존재. sticky CTA는 이 영역과 중첩될 위험.
- Screen 2: 3장 카드면 CTA가 자연스럽게 viewport 하단에 위치 (별도 sticky 불필요).
- Screen 3: textarea + safety 상태 + CTA 순서가 중요. keyboard가 올라오면 sticky CTA가 input을 가림.
- Screen 4: save CTA 아래 preview card가 이어지므로 in-flow가 자연스럽다.

**Screen 2 예외:** 카드 수가 많아질 미래 확장을 고려해, CTA wrapper에 `position: sticky; bottom: calc(24px + env(safe-area-inset-bottom))`을 선택적 적용할 수 있게 CSS 변수로 준비만 해둔다.

### 2.3 Screen 4 preview 배치 (same-viewport vs transition)

**B1 판단:** **same-viewport inline** — A1 방향에 동의.

Preview card는 `칭찬해줘`의 first value("이 앱은 나를 혼내는 앱이 아니라 내일의 나를 위해 한 줄을 남겨두는 앱")를 전달하는 결정적 순간이다. save CTA click 직후 동일 viewport에서 badge(`내일의 나에게`) + 큰 문장 + 미리보기 노트가 나타나야 한다. transition/새 화면 전환은 이 순간의 즉시성을 깬다.

구현 시 주의: save 후 preview card가 DOM에 삽입될 때 layout shift가 없도록 **preview card 영역을 미리 reserve**하거나, `min-height`를 지정한다.

### 2.4 Screen 5 check-in actions 배치

**B1 판단:** **동등한 3장 choice card** — A1의 "primary-secondary-tertiary" 구분보다 강하게 요구.

현재 App.tsx의 Screen 5는 3개의 raw `<button>`을 세로로 나열한다. 이는 2026-06-07 form-like sample의 실패 패턴을 반복한다. 대신:

- 3장의 동일 너비 카드 (가로 배치 또는 세로 배치)
- 각 카드: 아이콘(tile) + 액션명 + 짧은 설명 1줄
- `유지`: warm accent card (coral-soft 배경). "어제의 한 줄, 그대로 둘게요."
- `내 말로 수정`: neutral card (white). "조금 다르게 바꾸고 싶어요."
- `오늘은 건너뛰기`: quiet card (light border, no fill). "오늘은 확인만 할게요."
- Skip card가 작거나 덜 중요한 것처럼 보이면 안 된다. dignity 유지.

### 2.5 Screen 6 fake-door slot

**B1 판단:** **reserved bottom card** — A1 방향에 동의.

D1 복귀자에게만 fake-door가 나타나므로, result summary 아래에 **height가 예약된 slot**을 두어 late DOM 삽입 시 layout shift를 방지한다. 첫 세션에서는 이 slot이 보이지 않거나 아주 작은 안내 문구만 표시.

---

## 3. 터치 타깃 평가

A1이 정의한 최소 tap target(44px 일반, 56px primary CTA, 64px choice card)은 WCAG 및 모바일 기준을 충족한다.

| 확인 항목 | A1 기준 | 코드 현황 | 판단 |
| --- | --- | --- | --- |
| 언 어 전환 | 44px | `min-height: 32px` (defect) | **변경 필요** |
| primary CTA | 56px | 정의만 있고 구현 미적용 | A2 remediation |
| choice card | 64px | 정의만 있고 구현 미적용 | A2 remediation |
| secondary CTA | 52~56px | 정의만 있고 구현 미적용 | A2 remediation |

**변경 요구:** `.language-switcher button`의 `min-height`와 `min-width`를 44px로 상향 조정할 것. 이는 `ai/reviews/review.md` M2 finding과도 일치한다.

---

## 4. 샘플 대비 시각 일관성

| 2026-06-08 polished sample DNA | A1 proposal 반영 | 평가 |
| --- | --- | --- |
| cream/peach gradient 배경 | `--pm-bg: #fff8ef` + gradient token | ✅ 정확히 계승 |
| deep navy bold typography | `--pm-text: #172036`, display 38~48px 900w | ✅ 정확히 계승 |
| pastel rounded CTA cards (22~28px) | `--pm-radius-card: 22px`, pastel accent soft | ✅ 정확히 계승 |
| icon tile (rounded square) | left icon tile pattern retained | ✅ 유지 |
| white result card + quote | preview card, result summary card | ✅ 변환 적절 |
| soft shadow | `--pm-shadow-card`, `--pm-shadow-cta` | ✅ 계승 |
| audio play icon / voice guide | retired for no-audio MVP | ✅ 올바른 제거 |
| 5-button audio control | 6-screen retention flow로 재구성 | ✅ 구조 변경 타당 |

A1은 audio-first → retention-first 전환에서 브랜드 DNA를 희생하지 않았다. `오디오 컨트롤을 없앴다`와 `따뜻한 앱 감각을 잃었다`는 별개이며, 전자는 의도된 scope cut, 후자는 발생하지 않았다.

---

## 5. 7개 layout challenge 답변

| # | challenge point | B1 판단 |
| --- | --- | --- |
| 1 | Screen 2: 5장 vs 3+reveal | **3장 + reveal** (360px first-value 가시성 우선) |
| 2 | Bottom CTA: sticky vs in-flow | **in-flow 기본** (Apps in Toss safe-area 충돌 회피), CSS 변수로 sticky 옵션 준비 |
| 3 | Screen 4 preview: same vs transition | **same-viewport inline** (first-value 즉시성) — A1에 동의 |
| 4 | Screen 5: equal vs hierarchical | **동등한 choice card 3장** (dignity 유지, skip-shaming 방지) |
| 5 | Screen 6: reserved vs inline | **reserved bottom slot** (CLS 방지) — A1에 동의 |
| 6 | Language switcher: persistent vs landing | **landing-only + 축소 아이콘** (다른 화면의 수직 공간 절약) |
| 7 | Progress: 6-dot vs `n/6` pill | **6-dot rail + 짧은 화면명** (form-like 느낌 회피) — A1에 동의 |

---

## 6. A2 변경 요구사항

visual-designer A2는 아래 항목을 `stages/12_UI_DESIGN.md`에 반영하거나 명시적으로 reject 사유를 기록해야 한다.

### REQUIRED (blocking)

1. **Screen 2 praise 카드 수:** 5장 → 3장 + "다른 한 줄 더 보기"로 변경. 근거: 360px viewport에서 5장은 first-viewport 초과.
2. **Screen 5 check-in 액션:** primary-secondary-tertiary 계층 → 동등한 3장 choice card로 변경. 근거: skip-shaming 방지, equal dignity.
3. **Language switcher policy:** persistent → Screen 1 전용 + Screen 2~6 축소 아이콘(44px). 근거: 360px에서 불필요한 수직 공간 소비.
4. **Language switcher size:** `min-height` 32px → 44px. 근거: WCAG touch target, `ai/reviews/review.md` M2.

### RECOMMENDED (non-blocking)

5. Screen 4 preview card: DOM 삽입 전 `min-height` reserve로 CLS 방지 명시.
6. Progress indicator: 6-dot rail에 각 dot 옆 작은 한글 label (`선택`/`수정`/`저장`...) 추가 검토.
7. Bottom CTA 영역: `env(safe-area-inset-bottom)` 적용을 CSS custom property로 준비.

---

## 7. 구현 수용 검사 (A2 이후 implementation 전)

구현이 시작되기 전에 아래 확인이 필요하다.

| # | 검사 항목 | 기준 |
| --- | --- | --- |
| 1 | 모든 CTA에 semantic class 부여 | `pm-primary-cta`, `pm-secondary-cta`, `pm-choice-card`, `pm-text-action` 중 하나에 매핑 |
| 2 | 360px × 6 screenshots (ko) | P0 CTA가 horizontal overflow 없이 viewport 내에 존재 |
| 3 | 360px × Screen 1,2,4,6 (en) | 영문 레이블이 잘림 없이 wrapping |
| 4 | Screen 2 선택/미선택 state | 선택 카드에 border ring+check가 시각적으로 확인 가능 |
| 5 | Screen 3 safe/caution/blocked state | caution=amber calm surface, blocked=red/tan border, 배경 알람 없음 |
| 6 | Screen 4 save 전/후 | preview card가 동일 viewport에서 CLS 없이 나타남 |
| 7 | Screen 6 fake-door | D1 returner에만 visible, 첫 세션에서는 hidden |
| 8 | 검사 항목 0: raw/default button 없음 | 어떤 screenshot에서도 browser-default button 외관이 발견되지 않음 |

---

## 8. 제외 범위 확인

이 review는 다음을 승인하거나 변경하지 않는다.
- 제품 scope (D-20260619-002)
- UX flow (D-20260619-003)
- architecture, backend, TTS, audio, login, ads, IAP
- 구현 코드 수정
- CEO 최종 visual 승인

---

## Change Log

| version | date | note |
| --- | --- | --- |
| 0.1.0 | 2026-06-20 | B1 layout challenge 완료. A1 visual system을 대체로 승인, 4건 REQUIRED 변경 + 3건 RECOMMENDED 제안. |
