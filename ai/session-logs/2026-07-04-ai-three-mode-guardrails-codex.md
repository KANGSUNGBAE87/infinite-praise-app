---
date: 2026-07-04
actor: codex
topic: AI three-mode flow, taxonomy, DeepSeek Pro guardrails
---

# Session Log

## User Request

`칭찬해줘 / 잔소리해줘 / 직접 쓸게` 제품 구조를 반영하고, 고정 문구 문제를 taxonomy 기반으로 풀며, DeepSeek V4 Pro 전제의 안전/개인정보 가드레일과 신고 경계를 포함해 구현.

## Decisions

- 앱 내부 명칭은 계속 `칭찬해줘`, `잔소리해줘`, `직접 쓸게`로 노출한다.
- `잔소리해줘`는 모욕/평가가 아니라 `모욕 없는 행동 리마인드`로 제한한다.
- 기본 경험은 로컬 template catalog 조합으로 제공하고, AI는 서버 프록시가 있을 때만 개인화 후보를 만든다.
- GitHub Pages는 정적 호스팅이므로 `/api/*`는 실제 운영 서버가 아니다. 실서비스 AI/신고 저장은 Supabase Edge Function, Vercel, Netlify, Cloudflare Worker 중 하나로 배포해야 한다.

## Files Changed

- `src/App.tsx`: 3모드 UI, 상황/감정/톤/강도 칩, 직접 쓰기 저장 흐름, 신고 adapter 호출.
- `src/core/messageGeneration.ts`: metadata 기반 fallback 후보 생성, DeepSeek 요청 payload sanitization.
- `src/core/messageSafety.ts`: 입력 마스킹, blocked/caution 분류, AI 출력 안전검사.
- `src/core/candidateReporting.ts`: 후보 신고 client adapter.
- `api/generate-candidates.ts`: `deepseek-v4-pro`, JSON output, rate limit, 안전 프롬프트, 마스킹된 context 전송.
- `api/report-candidate.ts`: 후보 원문 없이 신고 메타데이터만 수신/저장하는 server-ready route.
- `src/data/message-templates.v0.1.json`: release templates 유지 + taxonomy template catalog 추가.
- `supabase/migrations/20260704150000_praise_candidate_reports.sql`: 신고 메타데이터 테이블.
- `src/i18n.ts`, `src/styles.css`: 3모드/axis/direct-writing copy and styles.
- `test/*`: App, i18n, message generation, candidate reporting tests 갱신.
- `ai/plans/product-plan.md`, `ai/plans/implementation-plan.md`, `ai/plans/design-plan.md`: canonical plan 갱신.

## Verification

- `npm test -- --run` -> 19 files / 77 tests passed.
- `npm run build` -> TypeScript and Vite production build passed.
- Claude CLI first-party read-only review completed.
- Antigravity/Gemini read-only compliance/UX review completed.

## Remaining Risks

- GitHub Pages live URL에서는 `/api/generate-candidates`와 `/api/report-candidate`가 실행되지 않는다. 현재 live는 안전한 fallback 중심으로 동작한다.
- Supabase report migration은 파일로 준비했지만 원격 DB에 적용하지 않았다.
- DeepSeek V4 Pro 실제 호출은 서버 프록시 배포와 `DEEPSEEK_API_KEY` 설정 후 별도 smoke test가 필요하다.
- 실제 Apps in Toss/Google Play 정책 제출 전에는 알림 권한, Data Safety, AI generated content/reporting 요건을 공식 문서로 다시 확인해야 한다.

## Knowledge Promotion

- 이번 변경은 프로젝트-local canonical plan과 session log에 남겼다.
- 전역 지식저장소 승격은 아직 하지 않았다. 서버 프록시/AI 신고 운영 패턴이 다른 앱에서도 반복되면 shared app AI boundary 문서로 승격 후보.
