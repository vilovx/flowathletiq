-- doc only: get_leaderboard returns weapon + rank_idx of each nick's best run
comment on function public.get_leaderboard(text, int) is 'Public top list: one row per nick (its best run: level, score, weapon ak47|m4a4|m4a1s, rank_idx 0-5 from aim_rank_idx(level, hs%), country, hs%).';
