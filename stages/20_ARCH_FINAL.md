# [REVISION] 20_ARCH_FINAL.md — 칭찬해줘 Architecture A

- updated: 2026-06-19 KST
- phase: Architecture / A revision
- status: final-revision
- project: 칭찬해줘
- scope: Apps in Toss first / Google Play compatible / text + notification first / voice excluded from MVP core
- source inputs: `00_PROJECT_BRIEF.md`, `01_DECISIONS.md`, `stages/08_PRODUCT_PLAN.md`, `stages/10_UX_FINAL.md`, `ai/plans/implementation-plan.md`, `지식저장소/projects/무한칭찬앱/platform.md`, `stages/reviews/ux-growth-review.md`, `stages/reviews/product-plan-validation.md`

## 1. Architecture intent

`칭찬해줘`의 승인된 UX는 다음 6개 핵심 흐름만 구현 대상으로 둔다.

1. channel landing / target confirm
2. praise pick
3. optional rewrite
4. time save + preview
5. next-day check-in
6. trust-safe monetization slot(fake-door, D1 return only)

이번 Architecture의 목표는 “지금 승인된 UX를 가장 작은 구현으로 실제 앱 형태로 만들 수 있는 구조”를 고정하는 것이다. 따라서 플랫폼/광고/AI/스토리지/분석/인증은 모두 교체 가능한 경계로 두되, 승인되지 않은 기능을 미리 일반화하지 않는다.

## 2. System shape

### 2.1 Recommended app shape

- Single shared product codebase.
- One cross-platform UI shell.
- Domain logic first, platform adapters second.
- Apps in Toss first, Google Play later by adapter swap.

### 2.2 Runtime split

```text
src/
  core/                 pure product rules, state machine, copy keys, validation
  domain/               entities, event schema, scheduling, entitlements, safety
  features/             screen composition and user flow orchestration
  platform/             adapter interfaces + capability detection
  platform/toss/        Apps in Toss implementation stubs / future native bridge
  platform/google/      Google Play implementation stubs / future native bridge
  i18n/                 locale catalog and string lookup
  app/                  top-level composition and route/state bootstrap
backend/                receipt verification, entitlement, abuse/rate-limit, LLM proxy later
```

### 2.3 Main principle

- Product/domain code must not import Toss SDK, Google Play Billing, AdMob, or login SDKs directly.
- UI may know adapter capability states, but not vendor-specific API details.
- A feature that is not approved now should not appear as a faux abstraction just because the same area might exist later.

## 3. Current implementation state and gap analysis

### 3.1 What already exists

From the current codebase:

- `src/App.tsx` already boots locale selection and passes a shared `i18n` object into the reminder flow.
- `src/platform/adapters.ts` already defines stubs for auth, payment, ads, storage, analytics, and notifications.
- `src/i18n.ts` already carries `ko`/`en` copy and platform readiness strings.
- `src/features/reminder/*` already organizes the MVP into home / create / detail screens.
- Domain files already exist for reminder schema, schedule, templates, and repository-style persistence.

### 3.2 Gaps relative to approved UX

The current implementation still reflects an older reminder/voice-oriented MVP. For the approved `칭찬해줘` architecture, the gaps are:

1. Screen model mismatch
   - Existing reminder screens are centered on “new reminder / detail / occurrence actions”.
   - Approved UX needs landing, praise pick, optional rewrite, time save, next-day check-in, and fake-door slot.

2. Domain model mismatch
   - Existing schema is reminder-centric and stores generic reminders, reactions, and occurrence actions.
   - Approved UX needs a smaller event model centered on selected praise, rewrite intent, reminder schedule, check-in outcome, reopen reason, and interest signal.

3. Copy/model mismatch
   - Current locale copy still includes reminders, nudge intensity, display mode, and voice-oriented language.
   - Approved UX needs praise-first copy and trust-safe microcopy with no paywall or therapy framing.

4. Feature boundary mismatch
   - Current code already has “platform readiness” seams, but they are wired around the older flow.
   - Architecture should preserve the seam concept while replacing the product flow that uses them.

5. Analytics mismatch
   - Current stub analytics are generic.
   - Approved UX needs a precise event contract so D1 and fake-door signals are measurable without client-side trust.

## 4. Proposed implementation structure

### 4.1 Core domain

Core domain owns the approved product rules.

Recommended submodules:

- `src/domain/session/`
  - landing state, target confirm, source tag
- `src/domain/praise/`
  - curated praise selection, optional rewrite, safety check, fallback text selection
- `src/domain/checkin/`
  - D1 reopen, keep/edit/skip outcomes, reopen reason tagging
- `src/domain/schedule/`
  - one reminder time, preview copy, notification readiness flag
- `src/domain/interest/`
  - fake-door interest state for `보관함`
- `src/domain/locale/`
  - locale choice and copy key resolution
- `src/domain/trust/`
  - safety guardrails, unsupported/blocked text handling

Domain output should be event-driven, not UI-driven. Screens should render domain state, not own the business rules.

### 4.2 Feature layer

Feature composition owns screen sequencing.

Recommended screens:

- `LandingScreen`
- `PraisePickScreen`
- `RewriteScreen`
- `ScheduleScreen`
- `CheckinScreen`
- `ResultSlotScreen`

Feature layer responsibilities:

- map approved UX screens to domain commands
- hold local transient UI state
- pass adapter results to the correct UI branch
- keep failure and offline fallback copy local to locale files

### 4.3 Platform layer

Platform layer is a boundary, not a product surface.

MVP keeps only the boundaries the current implementation actually uses:

- `StorageAdapter` for local persistence
- `AnalyticsAdapter` for event emission with sanitizer support
- `NotificationAdapter` for capability detection + preview-only scheduling
- `LocaleAdapter` or locale source helper

Future platform-specific bridge modules may be added only when a real platform feature is approved. At that point, Toss and Google implementations should live behind the same capability interface rather than product logic.

### 4.4 Backend boundary

No backend is required for the approved MVP loop. If backend is introduced later, it must own:

- receipt verification
- entitlement truth
- user-scoped deletion requests
- rate limiting / abuse defense
- optional notification scheduling proxy
- optional LLM proxy if AI is added later

Client must never be the source of truth for paid entitlement or any reward-like permission.

## 5. Data model

### 5.1 Core entities

#### `Session`

Represents a single app visit or recovery visit.

Fields:

- `sessionId`
- `sourceTag` (channel tag or direct recruit tag)
- `locale`
- `createdAt`
- `entryType` (`landing`, `manual_return`, `notification_return`)

#### `PraiseOption`

Represents a curated line the user can pick.

Fields:

- `optionId`
- `category`
- `displayText`
- `toneTag`
- `safetyStatus`

#### `PraiseDraft`

Represents selected or rewritten text.

Fields:

- `draftId`
- `selectedOptionId`
- `originalText`
- `editedText`
- `rewriteState` (`none`, `edited`)
- `safetyStatus`

#### `ReminderPlan`

Represents the chosen one-time or repeating reminder.

Fields:

- `planId`
- `draftId`
- `scheduledAt`
- `repeatRule`
- `timezone`
- `previewText`
- `notificationState`

#### `CheckIn`

Represents next-day return intent and outcome.

Fields:

- `checkInId`
- `planId`
- `dueDate`
- `outcome` (`keep`, `edit`, `skip`)
- `reasonTag`
- `completedAt`

#### `InterestSignal`

Represents trust-safe fake-door interest.

Fields:

- `signalId`
- `placementId` (`vault_interest`)
- `seenAt`
- `clickedAt?`
- `response` (`dismissed`, `registered`, `ignored`)

### 5.2 Event schema

Event names should be platform-neutral and stable across Apps in Toss and Google Play.

Privacy rule: user-entered free text must never be included in analytics payloads.
Allowed properties are closed enums, booleans, counts, coarse categories, and capability states only.

Recommended sanitizer: `src/domain/trust/analyticsSafeProperties.ts` removes any `text`, `rawText`, `editedText`, `originalText`, `customText`, or similar free-text field before the adapter receives the payload.

Minimum events:

- `landing_viewed`
- `target_confirmed`
- `target_rejected`
- `praise_selected`
- `rewrite_started`
- `rewrite_saved`
- `rewrite_blocked`
- `schedule_started`
- `reminder_created`
- `preview_viewed`
- `checkin_prompt_viewed`
- `checkin_completed`
- `message_kept`
- `message_edited`
- `message_skipped_today`
- `reopen_reason_tagged`
- `vault_interest_viewed`
- `vault_interest_clicked`
- `vault_interest_handled`
- `locale_changed`

### 5.3 State transitions

```text
landing_viewed
  -> target_confirmed | target_rejected

target_confirmed
  -> praise_selected

praise_selected
  -> rewrite_started -> rewrite_saved | rewrite_blocked
  -> schedule_started

schedule_started
  -> reminder_created
  -> preview_viewed

next_day_return
  -> checkin_prompt_viewed
  -> checkin_completed
  -> message_kept | message_edited | message_skipped_today
  -> reopen_reason_tagged

checkin_completed
  -> vault_interest_viewed (D1 return only)
  -> vault_interest_clicked
  -> vault_interest_handled
```

## 6. Storage and deletion flow

### 6.1 What is stored locally first

- locale choice
- source tag
- selected praise option
- optional rewrite text
- reminder schedule
- check-in outcome
- fake-door interest response
- UI copy/history needed for immediate return

### 6.2 What should not be stored client-side as truth

- paid entitlement
- receipt verification result
- store secret material
- any backend-issued trust decision
- any AI/provider token or secret

### 6.3 Deletion flow

Separate local reset from any future backend deletion.

- `local reset` clears local storage, drafts, locale if desired, and cached UI state.
- `backend deletion request` is separate if any user-scoped server record exists later.
- A successful local reset must not imply that backend data was deleted.

## 7. i18n architecture

### 7.1 Rule

- `ko` is default.
- `en` is selectable.
- All user-facing strings go through locale paths.

### 7.2 Locale pathing

Keep strings in locale-owned modules or JSON catalogs, not inside business logic.

Recommended layout:

```text
src/i18n/
  ko.ts
  en.ts
  index.ts
```

Or, if the current flat file remains temporarily, it should still behave as a catalog boundary and not a dumping ground for product rules.

### 7.3 What must be localized

- UI copy
- empty states
- error states
- onboarding
- notification text
- rewrite helper text
- fake-door microcopy
- future purchase or entitlement copy

## 8. Fallback UX rules

### 8.1 Notifications unavailable

If notification capability is unsupported or preview-only:

- show preview state
- allow saving and check-in simulation
- clearly say delivery will be enabled later or is unavailable on this platform
- do not block the core flow

### 8.2 Ads unavailable

- hide all ad slots in MVP core
- keep placement IDs only in the adapter boundary
- if a future slot fails, degrade to no-op with no visible disruption

### 8.3 Auth unavailable

- default to anonymous/local-first mode
- do not gate the approved core flow on login
- only introduce login when a future backend flow actually requires it

### 8.4 AI unavailable or excluded

- no AI is required in the approved MVP
- if AI is later introduced, fallback must be curated static copy and never a hard failure

### 8.5 Storage failure

- fail closed with retry copy for critical writes
- keep the selected text visible in local UI until user can save again
- do not silently drop the selected praise or check-in outcome

## 9. Privacy, security, and policy constraints

- Do not trust client-side entitlement or reward state.
- Do not put API keys, receipt secrets, or store credentials in the app bundle.
- Do not collect more identity than needed for the approved MVP.
- Do not send user-written free text to analytics, ads, or platform telemetry.
- Keep personal data minimization in mind for any future backend extension.
- Keep fake-door monetization trust-safe: no price, no urgency, no paywall language in the MVP.
- Keep the product away from therapy/diagnosis framing.
- If a future paid feature exists, entitlement must be verified server-side and stored as a normalized entitlement, not a raw receipt.

## 10. Development cut plan

### Cut 1 — Architecture refactor only

- Replace reminder/voice-oriented shell with approved 6-screen shell.
- Keep local storage and i18n working.
- Preserve adapters as stubs.

### Cut 2 — Approved UX contract

- Implement event schema and state transitions.
- Make landing, praise pick, rewrite, schedule, check-in, and result slot the only product surfaces.

### Cut 3 — Platform readiness

- Keep Toss/Google compatibility via adapters.
- No direct SDK imports in domain/features.
- Add platform-specific implementations only after Owner approves Development.

### Cut 4 — Future backend trust

- Add entitlement verification, deletion flow, and any delivery proxy only when a real server need is approved.

## 11. Migration and backward compatibility

### 11.1 Existing reminder model

The current reminder/occurrence model should be treated as implementation history, not as the product end state.

Migration approach:

- keep existing local storage keys readable during transition if needed
- map old state into the new session/praise/check-in model only if a user still has old data
- do not preserve outdated UI semantics just because the storage key already exists

### 11.2 Compatibility with future platform ports

Compatibility rule:

- domain events and state must be stable across platforms
- platform differences live only in adapter implementations and capability flags
- do not fork product rules by platform unless the platform truly differs

## 12. Test strategy

### 12.1 Domain tests

- praise selection and rewrite safety
- schedule creation and preview text
- check-in transitions
- interest signal handling
- locale selection

### 12.2 Feature tests

- landing confirm / reject
- curated pick to rewrite path
- schedule save and preview
- D1 check-in and reason tagging
- fake-door hidden on first session, visible only on D1 return

### 12.3 Adapter tests

- stub adapters return safe no-op results
- capability gating prevents unsupported flows from failing the app
- storage adapter preserves locale and approved user state

### 12.4 Release-readiness gates

Before Development approval, verify:

- approved UX screens exist as explicit routes or states
- no direct platform SDK imports in domain/features
- i18n path covers every user-facing string
- client-side trust boundaries are documented
- fallback states work without notification/auth/ads/payment

## 13. Recommended folder responsibilities

- `src/core/`: pure product decisions and reusable logic
- `src/domain/`: entities, validation, state transitions, event contracts
- `src/features/`: screen orchestration and user flow composition
- `src/platform/`: stable adapter contracts and capability detection
- `src/platform/toss/`: Toss-specific implementation boundary
- `src/platform/google/`: Google Play-specific implementation boundary
- `backend/`: only for future trust-sensitive server responsibilities

## 14. Final architecture decision

Adopt a small, domain-first architecture with a single shared shell and thin platform adapters.

Do not keep the current reminder/voice MVP as the architectural center. Recast it into the approved `칭찬해줘` flow, with local-first storage, ko/en i18n, trust-safe fake-door monetization, and platform capability stubs that can later be replaced by Toss or Google implementations without changing the product rules.

## 15. Knowledge candidates

- maturity: confirmed
  summary: Apps in Toss first for non-game apps, but keep Google Play compatibility by isolating auth, ads, IAP, storage, analytics, notifications, and backend transport behind adapters from the first implementation.
  evidence_path: /Users/kangsungbae/Documents/지식저장소/docs/workflows/app-platform-standard.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/app-platform-standard.md

- maturity: confirmed
  summary: For approved UX work, the product should keep only the smallest approved flow and avoid pre-building abstractions for capabilities that are not actually in scope yet.
  evidence_path: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md
  suggested_owner_file: /Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md

- maturity: provisional
  summary: `칭찬해줘` should move from reminder/voice-centric state to a six-screen praise/check-in flow with local-first storage and event-driven transitions.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/stages/10_UX_FINAL.md
  suggested_owner_file: /Users/kangsungbae/Documents/무한칭찬앱/ai/plans/implementation-plan.md

- maturity: provisional
  summary: The approved monetization probe should remain a trust-safe D1-only fake-door CTA with no price, urgency, or payment copy in the MVP.
  evidence_path: /Users/kangsungbae/Documents/무한칭찬앱/01_DECISIONS.md
  suggested_owner_file: /Users/kangsungbae/Documents/무한칭찬앱/stages/08_PRODUCT_PLAN.md

## Change Log

- 2026-06-19: initial architecture revision saved after reading project brief, decision log, product plan, UX final, platform standard, and implementation context.