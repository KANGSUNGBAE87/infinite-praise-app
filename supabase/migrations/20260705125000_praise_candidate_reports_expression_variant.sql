do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'praise_candidate_reports'
      and column_name = 'style'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'praise_candidate_reports'
      and column_name = 'expression_variant'
  ) then
    alter table public.praise_candidate_reports
      rename column style to expression_variant;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'praise_candidate_reports'
      and column_name = 'expression_variant'
  ) then
    alter table public.praise_candidate_reports
      add column expression_variant text;
  end if;
end $$;

alter table public.praise_candidate_reports
  drop constraint if exists praise_candidate_reports_style_check;

alter table public.praise_candidate_reports
  drop constraint if exists praise_candidate_reports_expression_variant_check;

alter table public.praise_candidate_reports
  drop constraint if exists praise_candidate_reports_candidate_id_check;

update public.praise_candidate_reports
set expression_variant = case expression_variant
  when 'warm' then 'short_sentence'
  when 'short' then 'action_suggestion'
  when 'practical' then 'ack_then_act'
  when 'calm' then 'notification_short'
  when 'direct' then 'firmer_line'
  else expression_variant
end
where expression_variant in ('warm', 'short', 'practical', 'calm', 'direct');

alter table public.praise_candidate_reports
  alter column expression_variant set not null;

alter table public.praise_candidate_reports
  add constraint praise_candidate_reports_expression_variant_check
  check (expression_variant in ('short_sentence', 'action_suggestion', 'ack_then_act', 'notification_short', 'firmer_line'));

alter table public.praise_candidate_reports
  add constraint praise_candidate_reports_candidate_id_check
  check (candidate_id ~ '^(ai-[1-5]|fallback-(praise|nag)-[1-5])$');

comment on column public.praise_candidate_reports.expression_variant is
  'AI candidate expression pattern. Not a user tone and not raw candidate text.';
