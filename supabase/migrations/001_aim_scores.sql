-- FlowAthletiq Aim Trainer leaderboard
create extension if not exists pgcrypto with schema extensions;

create table public.aim_scores (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  nick text not null check (char_length(nick) between 2 and 16),
  country char(2) not null check (country ~ '^[A-Z]{2}$'),
  level int not null check (level between 1 and 60),
  score int not null check (score >= 0),
  kills int not null check (kills >= 0),
  hs_pct int not null check (hs_pct between 0 and 100),
  rank_idx int not null check (rank_idx between 0 and 5),
  weapon text not null check (weapon in ('ak47','m4a4','m4a1s')),
  lang text not null check (lang in ('lv','en','ru'))
);
create index aim_scores_best_idx on public.aim_scores (lower(nick), level desc, score desc);
create index aim_scores_created_idx on public.aim_scores (created_at);

alter table public.aim_scores enable row level security;
create policy "aim_scores public read" on public.aim_scores for select to anon, authenticated using (true);
revoke insert, update, delete, truncate on public.aim_scores from anon, authenticated;

-- private rate-limit log (RLS on, no policies => not readable/writable through the API)
create table public.aim_submit_log (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  nick_key text not null,
  ip_hash text
);
create index aim_submit_log_idx on public.aim_submit_log (created_at);
alter table public.aim_submit_log enable row level security;
revoke all on public.aim_submit_log from anon, authenticated;

-- Plausibility helper: mirrors js/game.js levelCfg() and scoring.
--  count(l) = 6 + 2(l-1); interval(l) = max(0.45, 2*0.88^(l-1)); kill = (hs?100:40) + 10(l-1);
--  clear bonus(l) <= round((count*interval + 12) * 5). Reaching level L = levels 1..L-1 fully cleared.
create or replace function public.aim_plausible(p_level int, p_score int, p_kills int, p_hs int)
returns boolean language plpgsql immutable set search_path = '' as $$
declare
  l int; cnt int; kmin int := 0; lvlterm int := 0; bmax int := 0; part int; hmin int; hmax int; lo bigint; hi bigint;
begin
  if p_level < 1 or p_level > 60 or p_kills < 0 or p_hs < 0 or p_hs > 100 or p_score < 0 then return false; end if;
  for l in 1 .. p_level - 1 loop
    cnt := 6 + 2 * (l - 1);
    kmin := kmin + cnt;
    lvlterm := lvlterm + cnt * 10 * (l - 1);
    bmax := bmax + round((cnt * greatest(0.45, 2.0 * power(0.88, l - 1)) + 12) * 5)::int;
  end loop;
  part := p_kills - kmin;
  if part < 0 or part > 6 + 2 * (p_level - 1) then return false; end if;
  lvlterm := lvlterm + part * 10 * (p_level - 1);
  if p_kills = 0 then return p_hs = 0 and p_score = 0; end if;
  hmin := greatest(0, floor((p_hs - 0.5) * p_kills / 100.0)::int);
  hmax := least(p_kills, ceil((p_hs + 0.5) * p_kills / 100.0)::int);
  lo := 40 * p_kills + 60 * hmin + lvlterm;
  hi := 40 * p_kills + 60 * hmax + lvlterm + bmax;
  return p_score between lo and hi;
end $$;

create or replace function public.aim_rank_idx(p_level int, p_hs int)
returns int language sql immutable set search_path = '' as $$
  select case when p_level >= 12 then (case when p_hs >= 60 then 5 else 4 end)
              when p_level >= 9 then 4 when p_level >= 7 then 3 when p_level >= 5 then 2 when p_level >= 3 then 1 else 0 end
$$;

create or replace function public.aim_clean_nick(p text)
returns text language plpgsql immutable set search_path = '' as $$
declare n text;
begin
  n := regexp_replace(coalesce(p, ''), '[[:cntrl:]]', '', 'g');
  n := regexp_replace(btrim(n), '\s+', ' ', 'g');
  return n;
end $$;

create or replace function public.aim_nick_ok(n text)
returns boolean language plpgsql immutable set search_path = '' as $$
declare k text := lower(n);
begin
  if char_length(n) < 2 or char_length(n) > 16 then return false; end if;
  if n !~ '^[0-9A-Za-zĀ-žА-Яа-яЁё _.\-]+$' then return false; end if;
  if k ~ '(https?|www\.|\.(com|lv|ru|net|org|gg|io|xyz|me|tv)$|discord|t\.me|casino)' then return false; end if;
  if k ~ '(fuck|fck|shit|cunt|nigg|n1gg|fag|hitler|nazi|rape|porn|whore|bitch|pedo|pidar|pidor|pizd|pisd|mauka|dirsa|dirsā|сука|хуй|пизд|бля|ебал|ебат|пидор|пидар|шлюх|нацист)' then return false; end if;
  return true;
end $$;

create or replace function public.submit_score(p_nick text, p_country text, p_level int, p_score int, p_kills int, p_hs_pct int, p_weapon text, p_lang text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  n text := public.aim_clean_nick(p_nick);
  nk text; c text := upper(coalesce(p_country, '')); ip text; iph text; new_id bigint; pos int; hdr json;
begin
  if not public.aim_nick_ok(n) then return json_build_object('ok', false, 'error', 'nick'); end if;
  if c !~ '^[A-Z]{2}$' then return json_build_object('ok', false, 'error', 'country'); end if;
  if p_weapon not in ('ak47','m4a4','m4a1s') or p_lang not in ('lv','en','ru') then return json_build_object('ok', false, 'error', 'bad'); end if;
  if not public.aim_plausible(p_level, p_score, p_kills, p_hs_pct) then return json_build_object('ok', false, 'error', 'implausible'); end if;
  nk := lower(n);
  begin hdr := current_setting('request.headers', true)::json; exception when others then hdr := null; end;
  ip := coalesce(hdr ->> 'cf-connecting-ip', split_part(hdr ->> 'x-forwarded-for', ',', 1), '');
  iph := case when ip <> '' then encode(extensions.digest('fa-aim:' || ip, 'sha256'), 'hex') end;
  -- rate limits: same nick 1 / 20 s; same client 30 / h; whole board 600 / h
  if exists (select 1 from public.aim_submit_log where nick_key = nk and created_at > now() - interval '20 seconds')
     or (iph is not null and (select count(*) from public.aim_submit_log where ip_hash = iph and created_at > now() - interval '1 hour') >= 30)
     or (select count(*) from public.aim_submit_log where created_at > now() - interval '1 hour') >= 600 then
    return json_build_object('ok', false, 'error', 'rate');
  end if;
  insert into public.aim_submit_log (nick_key, ip_hash) values (nk, iph);
  delete from public.aim_submit_log where created_at < now() - interval '2 days';
  insert into public.aim_scores (nick, country, level, score, kills, hs_pct, rank_idx, weapon, lang)
  values (n, c, p_level, p_score, p_kills, p_hs_pct, public.aim_rank_idx(p_level, p_hs_pct), p_weapon, p_lang)
  returning id into new_id;
  select 1 + count(*) into pos from (
    select distinct on (lower(s.nick)) lower(s.nick) k, s.level, s.score from public.aim_scores s
    order by lower(s.nick), s.level desc, s.score desc, s.created_at) b
  where b.k <> nk and (b.level > p_level or (b.level = p_level and b.score > p_score));
  return json_build_object('ok', true, 'id', new_id, 'position', pos);
end $$;

-- best run per nick; period 'all' or 'week'
create or replace function public.get_leaderboard(p_period text default 'all', p_limit int default 50)
returns table (pos int, nick text, country text, level int, score int, kills int, hs_pct int, rank_idx int, weapon text, created_at timestamptz)
language sql stable security invoker set search_path = '' as $$
  select (row_number() over (order by b.level desc, b.score desc, b.created_at))::int, b.nick, b.country::text, b.level, b.score, b.kills, b.hs_pct, b.rank_idx, b.weapon, b.created_at
  from (
    select distinct on (lower(s.nick)) s.* from public.aim_scores s
    where p_period <> 'week' or s.created_at > now() - interval '7 days'
    order by lower(s.nick), s.level desc, s.score desc, s.created_at
  ) b
  order by b.level desc, b.score desc, b.created_at
  limit least(greatest(coalesce(p_limit, 50), 1), 50)
$$;

revoke execute on function public.submit_score(text, text, int, int, int, int, text, text) from public;
grant execute on function public.submit_score(text, text, int, int, int, int, text, text) to anon, authenticated;
revoke execute on function public.get_leaderboard(text, int) from public;
grant execute on function public.get_leaderboard(text, int) to anon, authenticated;
revoke execute on function public.aim_plausible(int, int, int, int) from public, anon, authenticated;
revoke execute on function public.aim_rank_idx(int, int) from public, anon, authenticated;
revoke execute on function public.aim_clean_nick(text) from public, anon, authenticated;
revoke execute on function public.aim_nick_ok(text) from public, anon, authenticated;
