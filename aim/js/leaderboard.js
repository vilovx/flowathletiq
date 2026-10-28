// Online leaderboard (Supabase PostgREST RPC via fetch). The publishable key is public by design;
// the database only allows reading scores and inserting through the checked submit_score() function.
import { LANG, detectCountry } from './i18n.js?v=32';
const URL_ = 'https://ffnuweijixvrvjdvjhhu.supabase.co/rest/v1/rpc/';
const KEY = 'sb_publishable_TbkcthcbEITdVoaNZzmbRg_JlYxO4Nt';

async function rpc(name, body, timeout = 8000) {
  const ac = new AbortController(); const tm = setTimeout(() => ac.abort(), timeout);
  try {
    const r = await fetch(URL_ + name, { method: 'POST', signal: ac.signal,
      headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    if (!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  } finally { clearTimeout(tm); }
}

const cache = {};
export async function fetchTop(period = 'all', limit = 20, maxAge = 30000, device = 'pc') {
  const k = period + limit + device, c = cache[k];
  if (c && Date.now() - c.t < maxAge) return c.rows;
  const rows = await rpc('get_leaderboard', { p_period: period, p_limit: limit, p_device: device === 'mobile' ? 'mobile' : 'pc' });
  cache[k] = { t: Date.now(), rows }; return rows;
}
export function invalidate() { for (const k in cache) delete cache[k]; }

export async function submitScore(s) {
  const r = await rpc('submit_score', { p_nick: s.nick, p_country: s.country, p_level: s.level, p_score: s.score,
    p_kills: s.kills, p_hs_pct: s.hs, p_weapon: s.weapon, p_lang: null, p_device: s.device === 'mobile' ? 'mobile' : 'pc' }); // only what the board shows is sent
  invalidate(); return r;
}

// ---- countries / flags ----
const CODES = ('AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ ' +
  'DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ ' +
  'LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA ' +
  'RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS XK YE ZA ZM ZW').split(' ');
const PINNED = ['LV', 'LT', 'EE', 'FI', 'PL', 'DE', 'UA', 'GB', 'US'];
export function countryList() {
  let dn = null; try { dn = new Intl.DisplayNames([LANG], { type: 'region' }); } catch {}
  const name = (c) => { try { return (dn && dn.of(c)) || c; } catch { return c; } };
  const rest = CODES.filter((c) => !PINNED.includes(c)).map((c) => ({ code: c, name: name(c) })).sort((a, b) => a.name.localeCompare(b.name, LANG));
  return { pinned: PINNED.map((c) => ({ code: c, name: name(c) })), rest };
}
export function guessCountry() {
  const tc = detectCountry(); if (tc && CODES.includes(tc)) return tc; // same country signal as the language default
  for (const l of navigator.languages || [navigator.language || '']) {
    const m = /^[a-z]{2,3}[-_]([A-Za-z]{2})\b/.exec(String(l)); if (m && CODES.includes(m[1].toUpperCase())) return m[1].toUpperCase();
  }
  const base = String(navigator.language || '').slice(0, 2).toLowerCase();
  return { lv: 'LV', lt: 'LT', et: 'EE', fi: 'FI', pl: 'PL', de: 'DE', uk: 'UA', ru: 'LV', en: 'LV' }[base] || 'LV';
}
let flagOk = null;
function emojiFlags() { // Windows has no flag emoji glyphs; fall back to a code badge there
  if (flagOk !== null) return flagOk;
  try { const c = document.createElement('canvas'); c.width = c.height = 20; const g = c.getContext('2d', { willReadFrequently: true });
    g.font = '16px sans-serif'; g.textBaseline = 'top'; g.fillText('\u{1F1F1}\u{1F1FB}', 0, 0);
    const d = g.getImageData(0, 0, 20, 20).data; flagOk = false;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && (Math.abs(d[i] - d[i + 1]) > 40 || Math.abs(d[i + 1] - d[i + 2]) > 40)) { flagOk = true; break; }
  } catch { flagOk = false; }
  return flagOk;
}
export function flagHtml(cc) {
  cc = String(cc || '').toUpperCase(); if (!/^[A-Z]{2}$/.test(cc)) return '';
  if (emojiFlags()) return `<span class="flag" title="${cc}">${String.fromCodePoint(...[...cc].map((ch) => 0x1F1E6 + ch.charCodeAt(0) - 65))}</span>`;
  return `<span class="flag code" title="${cc}">${cc}</span>`;
}
// weapon a run was played with: compact label for the boards + full name for tooltips/messages
const WPN = { ak47: ['AK', 'AK-47'], m4a4: ['M4A4', 'M4A4'], m4a1s: ['M4A1-S', 'M4A1-S'] };
export const wpnShort = (id) => (WPN[id] || ['', ''])[0];
export const wpnName = (id) => (WPN[id] || ['', ''])[1];
export const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
