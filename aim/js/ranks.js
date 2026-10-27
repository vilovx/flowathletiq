import { t } from './i18n.js?v=13';
// Wolf-themed ranks (FlowAthletiq's own names and artwork by the site owner, not Valve ranks).
// Rank = level reached; the top rank additionally needs a headshot share of at least TOP_HS % in that run.
const LEVELS = [1, 3, 5, 7, 9, 12];
export const TOP_HS = 60;
export const TOP = LEVELS.length - 1;
export const RANKS = LEVELS.map((minLevel, i) => ({ minLevel, get name() { return t('ranks')[i]; } }));

export function rankForLevel(level) {
  let idx = 0;
  RANKS.forEach((r, i) => { if (level >= r.minLevel) idx = i; });
  return idx;
}
// Full rule: level 12+ AND >= 60 % of kills were headshots, otherwise capped at Alpha.
export function rankFor(level, hsPct) {
  const idx = rankForLevel(level);
  return idx === TOP && !(hsPct >= TOP_HS) ? TOP - 1 : idx;
}
export function rankIcon(idx, big = false) {
  const sz = big ? 512 : 256;
  return `<img class="rank-img${idx === TOP ? ' top' : ''}" src="img/ranks/rank${idx + 1}-${sz}.webp?v=13" alt="" width="${sz}" height="${sz}" decoding="async">`;
}
