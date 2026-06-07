# Session Log: App i18n Default

Date: 2026-06-06
Actor/tool: codex

## User Request

All apps should support multiple languages from the beginning. Korean should be
the default language, and English should be selectable.

## Decisions

- `무한칭찬앱` must include i18n in the first implementation.
- Korean (`ko`) is the default language.
- English (`en`) must be selectable.
- UI copy, LLM prompt templates, generated praise, notifications, purchase copy,
  errors, empty states, onboarding, and store-facing copy should use the active
  locale.

## Knowledge Promotion

Promoted to `/Users/kangsungbae/Documents/지식저장소/docs/workflows/app-platform-standard.md`.
