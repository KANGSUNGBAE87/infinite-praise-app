# Build Report — Screen 6 Analytics Removal + 2 MINOR Visual Fix

**Task**: t_8852de8f — Remediation D-20260620-018 APPROVE_WITH_CHANGES
**Date**: 2026-06-20 KST
**Worker**: dev-builder

## Changed Files

| File | Change |
|---|---|
| `src/App.tsx` | Removed `sanitizedPreview` const (lines 179-185) — analytics data no longer stored for UI rendering |
| `src/App.tsx` | Removed `<article>` dev-info block (lines 549-554) — no DOM rendering of analytics payload |
| `src/App.tsx` | Removed `minHeight: 44` override from both Screen 6 fake-door CTA buttons — reverts to CSS class defaults (56px primary / 52px secondary) |
| `src/styles.css` | `.pm-choice-card[aria-pressed="true"]` border-color changed from `rgba(31,42,68,0.16)` to `var(--pm-primary)` (coral #c65043) |
| `src/i18n.ts` | Removed 5 unused analytics i18n keys from both ko (`analytics.title`, `analytics.body`, `analytics.event`, `analytics.sanitized`, `analytics.rawBlocked`) and en locales |

## Commands and Results

```
npx tsc --noEmit   → 0 errors, clean exit
npm test            → 70/70 passed, 17/17 test files (1.80s)
```

## Manual Verification

- `sanitizeAnalytics` import retained — still used in `announce()` adapter path (line 130)
- `analyticsSanitizer.ts` core module untouched — analytics sanitization still active for real events
- Screen 6 fake-door: `pm-secondary-cta` inherits CSS `min-height: 52px`, `pm-primary-cta` inherits `var(--pm-primary-min)` = `56px`
- Screen 2 choice cards: `aria-pressed="true"` border now uses `var(--pm-primary)` coral

## Remaining Risks

- None identified. All changes are purely cosmetic/deletion — no behavioral or functional regressions.
- Tests cover both locale rendering (LocalFirstI18n.test.tsx, 17 tests) and full App flow (App.test.tsx, 7 tests); both pass.

## Reviewer Focus Points

1. Confirm no analytics payload visible in Screen 6 DOM in live browser
2. Confirm CTA buttons at expected heights (52px secondary, 56px primary)
3. Confirm selected choice card border is coral (not navy-tinted)
