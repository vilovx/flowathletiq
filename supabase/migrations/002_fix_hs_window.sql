-- tighter headshot-count window: H must round to the reported hs_pct
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
  hmin := greatest(0, ceil((p_hs - 0.5) * p_kills / 100.0)::int);
  hmax := least(p_kills, floor((p_hs + 0.5) * p_kills / 100.0)::int);
  if hmin > hmax then return false; end if;
  lo := 40 * p_kills + 60 * hmin + lvlterm;
  hi := 40 * p_kills + 60 * hmax + lvlterm + bmax;
  return p_score between lo and hi;
end $$;
revoke execute on function public.aim_plausible(int, int, int, int) from public, anon, authenticated;
-- explicit deny-all policy on the private rate-limit log (documents intent; API roles get nothing)
create policy "aim_submit_log no api access" on public.aim_submit_log as restrictive for all to anon, authenticated using (false) with check (false);
