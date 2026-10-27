-- Leaderboard shows the weapon each result was achieved with and the rank (rank_idx 0-5) that run earned.
-- get_leaderboard() already returned aim_scores.weapon of the nick's best run (distinct on lower(nick) ordered by
-- level desc, score desc, created_at); this pins that row deterministically (id as final tie-break) and documents it.
create or replace function public.get_leaderboard(p_period text default 'all', p_limit int default 50)
returns table (pos int, nick text, country text, level int, score int, kills int, hs_pct int, rank_idx int, weapon text, created_at timestamptz)
language sql stable security invoker set search_path = '' as $$
  select (row_number() over (order by b.level desc, b.score desc, b.created_at, b.id))::int, b.nick, b.country::text, b.level, b.score, b.kills, b.hs_pct, b.rank_idx, b.weapon, b.created_at
  from (
    select distinct on (lower(s.nick)) s.* from public.aim_scores s
    where p_period <> 'week' or s.created_at > now() - interval '7 days'
    order by lower(s.nick), s.level desc, s.score desc, s.created_at, s.id
  ) b
  order by b.level desc, b.score desc, b.created_at, b.id
  limit least(greatest(coalesce(p_limit, 50), 1), 50)
$$;
comment on function public.get_leaderboard(text, int) is 'Public top list: one row per nick (its best run: level, score, weapon ak47|m4a4|m4a1s, rank_idx 0-5 from aim_rank_idx(level, hs%), country, hs%).';
revoke execute on function public.get_leaderboard(text, int) from public;
grant execute on function public.get_leaderboard(text, int) to anon, authenticated;
