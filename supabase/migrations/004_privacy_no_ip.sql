-- Privacy: the leaderboard keeps only what is shown publicly (nick, chosen country, level/score/kills/hs%, weapon, rank, time).
-- No IP address (not even hashed), no user agent, no fingerprint, no UI language.
-- Anti-spam without any client identifier: same nick at most 1 submit / 20 s, whole board at most 600 submits / hour,
-- plus the existing plausibility check of every score.
create or replace function public.submit_score(p_nick text, p_country text, p_level int, p_score int, p_kills int, p_hs_pct int, p_weapon text, p_lang text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  n text := public.aim_clean_nick(p_nick);
  nk text; c text := upper(coalesce(p_country, '')); new_id bigint; pos int;
begin
  if not public.aim_nick_ok(n) then return json_build_object('ok', false, 'error', 'nick'); end if;
  if c !~ '^[A-Z]{2}$' then return json_build_object('ok', false, 'error', 'country'); end if;
  -- p_lang is still accepted (older clients send it) but is not stored
  if p_weapon not in ('ak47','m4a4','m4a1s') or coalesce(p_lang, 'lv') not in ('lv','en','ru') then return json_build_object('ok', false, 'error', 'bad'); end if;
  if not public.aim_plausible(p_level, p_score, p_kills, p_hs_pct) then return json_build_object('ok', false, 'error', 'implausible'); end if;
  nk := lower(n);
  perform pg_advisory_xact_lock(hashtext('aim_submit'));  -- serialize submits so the limits below are exact
  if exists (select 1 from public.aim_scores where lower(nick) = nk and created_at > now() - interval '20 seconds')
     or (select count(*) from public.aim_scores where created_at > now() - interval '1 hour') >= 600 then
    return json_build_object('ok', false, 'error', 'rate');
  end if;
  insert into public.aim_scores (nick, country, level, score, kills, hs_pct, rank_idx, weapon)
  values (n, c, p_level, p_score, p_kills, p_hs_pct, public.aim_rank_idx(p_level, p_hs_pct), p_weapon)
  returning id into new_id;
  select 1 + count(*) into pos from (
    select distinct on (lower(s.nick)) lower(s.nick) k, s.level, s.score from public.aim_scores s
    order by lower(s.nick), s.level desc, s.score desc, s.created_at, s.id) b
  where b.k <> nk and (b.level > p_level or (b.level = p_level and b.score > p_score));
  return json_build_object('ok', true, 'id', new_id, 'position', pos);
end $$;
revoke execute on function public.submit_score(text, text, int, int, int, int, text, text) from public;
grant execute on function public.submit_score(text, text, int, int, int, int, text, text) to anon, authenticated;
-- delete the hashed-IP rate-limit log (and its data) and the stored UI language
drop table if exists public.aim_submit_log;
alter table public.aim_scores drop column if exists lang;
