# 2026-07-05 Supabase AI Edge Function

Actor: codex

## User request

- Revert the previous broad Mac-local AI env integration.
- Use the existing Supabase DeepSeek secret to generate AI candidates through Supabase.

## Decisions

- Superseded the temporary local Mac AI env standard. App AI runtime now defaults to Supabase Edge Function secrets/routes.
- Kept browser/client AI keys forbidden. Client uses only public Supabase URL/anon key.
- Used `deepseek-chat` for this app function by default because the shared `DEEPSEEK_MODEL` secret produced reasoning-only output with no final JSON for short candidate generation. App-specific override can use `PRAISE_DEEPSEEK_MODEL`.

## Files changed

- Added Supabase Edge Functions:
  - `supabase/functions/generate-candidates/index.ts`
  - `supabase/functions/report-candidate/index.ts`
  - `supabase/functions/_shared/message-safety.ts`
- Updated client adapters:
  - `src/core/supabaseFunctions.ts`
  - `src/core/messageGeneration.ts`
  - `src/core/candidateReporting.ts`
- Updated public env/build routing:
  - `src/vite-env.d.ts`
  - `vite.config.ts`
  - `.github/workflows/deploy.yml`
  - `.env.example`
- Updated canonical implementation plan and global/shared operating docs.

## Commands and verification

- `npm run typecheck` passed.
- `npm test` passed: 19 files, 79 tests.
- `npm run build` passed.
- Built bundle check found no `DEEPSEEK`, `VITE_DEEPSEEK`, `AI_SECRETS_FILE`, or Mac-local AI env path in `dist`.
- Supabase remote:
  - `DEEPSEEK_API_KEY` secret name exists.
  - `praise_candidate_reports` table created.
  - `generate-candidates` and `report-candidate` functions deployed.
  - `generate-candidates` smoke returned `status=200`, `decision=ok`, `candidate_count=5`, `first_source=ai`.
  - `report-candidate` accepted metadata but returned `stored=false` because service-role JWT is not present in shared admin env / function runtime path.

## Remaining risks

- GitHub Pages Action needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured as GitHub Variables or Secrets for AI to work in Actions-built Pages artifacts.
- Report persistence needs a real service-role JWT secret or another server-side DB write route. Current app flow does not block on report storage.
- Public site has not been redeployed in this session.

## Knowledge promotion

- Global/shared docs were updated from Mac-local AI env default to Supabase Edge Function default for app AI runtime.

## Follow-up: pending rewrite save bug

- User reported that selecting an AI candidate and pressing the rewrite save button did not update home/vault.
- Root cause: when `savedAt` already existed, `step === 4` was always interpreted as home dashboard, so a new pending line could jump back to the old saved card before the final schedule/save step.
- Fix:
  - Added `hasPendingLine` guard so `step === 4` shows the schedule/final-save screen when the selected/rewrite text differs from `previewText`.
  - Schedule preview now shows the pending line, not the old saved `previewText`.
  - Renamed rewrite button from `이 문장으로 저장` to `알림 시간 정하기`.
  - Renamed final schedule button to `이 문장으로 최종 저장`.
- Verification:
  - `npm run typecheck` passed.
  - `npm test -- test/App.test.tsx test/LocalFirstI18n.test.tsx` passed: 25 tests.
  - `npm test` passed: 19 files, 80 tests.
  - `npm run build` passed.
  - Project cmm and Graphify indexes refreshed.

## Follow-up: vault save expectation

- User screenshots showed the selected line was expected to appear in the vault after final save, not only after a next-day "도움됐어" check-in.
- Fix:
  - Final schedule/save now adds the saved line to `vaultItems` immediately.
  - Later check-in keep action avoids duplicate vault entries for the same text.
  - Vault empty copy now says saved lines collect there.
- Verification:
  - `npm test -- test/App.test.tsx test/LocalFirstI18n.test.tsx` passed: 25 tests.
  - `npm run typecheck` passed.
  - `npm test` passed: 19 files, 80 tests.
  - `npm run build` passed.
  - Local browser reloaded at `http://127.0.0.1:5174/infinite-praise-app/`.
