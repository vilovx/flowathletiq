// Wolf-themed ranks (FlowAthletiq own names, not Valve ranks). Rank = level reached.
export const RANKS = [
  { name: 'Vilcēns', minLevel: 1, colors: ['#6b7280', '#9ca3af'] },
  { name: 'Jaunais vilks', minLevel: 3, colors: ['#94a3b8', '#e2e8f0'] },
  { name: 'Mednieks', minLevel: 5, colors: ['#0e7490', '#00f0ff'] },
  { name: 'Bara sargs', minLevel: 7, colors: ['#1d4ed8', '#60a5fa'] },
  { name: 'Alfa', minLevel: 9, colors: ['#7e22ce', '#b000ff'] },
  { name: 'Vilks, kas gaudo mēness gaismā', minLevel: 12, colors: ['#00c8ff', '#b000ff'] },
];

export function rankForLevel(level) {
  let idx = 0;
  RANKS.forEach((r, i) => { if (level >= r.minLevel) idx = i; });
  return idx;
}

let uid = 0;
export function rankIcon(idx) {
  const r = RANKS[idx];
  const id = 'rg' + (uid++);
  const [a, b] = r.colors;
  const shield = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <path d="M50 3 L91 22 L91 62 Q91 84 50 97 Q9 84 9 62 L9 22 Z" fill="#0b0e19" stroke="url(#${id})" stroke-width="4"/>`;
  let body;
  if (idx === RANKS.length - 1) {
    // Howling wolf under the moon
    body = `<circle cx="66" cy="30" r="15" fill="#f5f3d7"/><circle cx="71" cy="26" r="13" fill="#0b0e19" opacity=".18"/>
    <path d="M26 86 L30 66 L27 54 L33 44 L40 38 L43 28 L46 18 L52 12 L53 20 L57 18 L55 27 L51 33 L52 44 L58 56 L62 70 L66 86 Z" fill="url(#${id})"/>
    <path d="M46 18 L42 12 L44 22 Z" fill="url(#${id})"/>`;
  } else {
    // Front wolf head; grows with rank, puppy is rounder with big eyes
    const s = [0.62, 0.72, 0.8, 0.86, 0.92][idx];
    const eye = idx === 0 ? 4.5 : 3;
    body = `<g transform="translate(50 52) scale(${s}) translate(-50 -52)">
      <path d="M50 90 L35 74 L23 62 L19 42 L${idx === 0 ? 24 : 17} ${idx === 0 ? 18 : 10} L36 28 L50 24 L64 28 L${idx === 0 ? 76 : 83} ${idx === 0 ? 18 : 10} L81 42 L77 62 L65 74 Z" fill="url(#${id})"/>
      <path d="M50 90 L41 70 L50 60 L59 70 Z" fill="#fff" opacity=".55"/>
      <path d="M28 46 L${42} ${50} L${30} ${50 + eye / 2} Z" fill="#0b0e19"/><path d="M72 46 L58 50 L70 ${50 + eye / 2} Z" fill="#0b0e19"/>
      <circle cx="36" cy="49" r="${eye / 2}" fill="#00f0ff"/><circle cx="64" cy="49" r="${eye / 2}" fill="#00f0ff"/>
      <ellipse cx="50" cy="84" rx="5" ry="3.5" fill="#0b0e19"/></g>`;
  }
  const pips = Array.from({ length: idx + 1 }, (_, i) => `<circle cx="${50 - idx * 4 + i * 8}" cy="88" r="2.6" fill="url(#${id})"/>`).join('');
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="${r.name}">${shield}${body}${idx === RANKS.length - 1 ? '' : pips}</svg>`;
}
