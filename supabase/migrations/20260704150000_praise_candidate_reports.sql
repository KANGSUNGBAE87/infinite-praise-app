create table if not exists public.praise_candidate_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  candidate_id text not null check (candidate_id ~ '^(ai-[1-5]|fallback-(praise|nag)-[1-5])$'),
  mode text not null check (mode in ('praise', 'nag')),
  expression_variant text not null check (expression_variant in ('short_sentence', 'action_suggestion', 'ack_then_act', 'notification_short', 'firmer_line')),
  source text not null check (source in ('ai', 'fallback')),
  locale text not null check (locale in ('ko', 'en')),
  surface text not null check (surface in ('candidate_card')),
  reason_code text not null check (reason_code in ('uncomfortable', 'unsafe', 'irrelevant'))
);

alter table public.praise_candidate_reports enable row level security;

comment on table public.praise_candidate_reports is
  'Minimal AI candidate report metadata for Praise Me. Raw candidate/user text is intentionally not stored.';
