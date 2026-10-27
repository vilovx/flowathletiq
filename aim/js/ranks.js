import { t } from './i18n.js?v=5';
// Wolf-themed ranks (FlowAthletiq own names and art, not Valve ranks). Rank = level reached.
const LEVELS = [1, 3, 5, 7, 9, 12];
export const RANKS = LEVELS.map((minLevel, i) => ({ minLevel, get name() { return t('ranks')[i]; } }));

export function rankForLevel(level) {
  let idx = 0;
  RANKS.forEach((r, i) => { if (level >= r.minLevel) idx = i; });
  return idx;
}

// Palette per rank: [frame A, frame B, fur light, fur dark, eye]
const PAL = [
  ['#5b6478', '#8a93a8', '#c9ced9', '#7d8596', '#00f0ff'],
  ['#7d8aa3', '#d7deea', '#e6ebf3', '#8d97ab', '#00f0ff'],
  ['#00b8d4', '#00f0ff', '#d9f7ff', '#5aa9bb', '#ffffff'],
  ['#2563eb', '#00f0ff', '#dbe7ff', '#5b78b8', '#00f0ff'],
  ['#b000ff', '#00f0ff', '#efe3ff', '#7a5bb0', '#00f0ff'],
  ['#00f0ff', '#b000ff', '#f2ecff', '#6b4fa8', '#00f0ff'],
];

// Adult wolf head, front view (viewBox units ~ 0..100)
const WOLF = 'M50 88 L45 83 L39 81 L34 76 L27 73 L29 67 L22 61 L27 57 L22 50 L27 45 L24 30 L23 13 L33 21 L41 31 L50 29 L59 31 L67 21 L77 13 L76 30 L73 45 L78 50 L73 57 L78 61 L71 67 L73 73 L66 76 L61 81 L55 83 Z';
const WOLF_DETAIL = (fur, dark, eye) => `
  <path d="M27 18 L38 31 L30 37 Z M73 18 L62 31 L70 37 Z" fill="${dark}"/>
  <path d="M50 31 L43 45 L50 60 L57 45 Z" fill="${fur}" opacity=".55"/>
  <path d="M29 47 L44 51 L35 55 Z M71 47 L56 51 L65 55 Z" fill="#0b0e19"/>
  <path d="M33 50.5 L41 51.5 L36 53.5 Z M67 50.5 L59 51.5 L64 53.5 Z" fill="${eye}"/>
  <path d="M41 63 L50 58 L59 63 L57 75 L50 82 L43 75 Z" fill="${fur}"/>
  <path d="M45.5 72 L54.5 72 L50 77.5 Z" fill="#0b0e19"/>
  <path d="M27 61 L36 66 M73 61 L64 66 M30 68 L38 71 M70 68 L62 71" stroke="${dark}" stroke-width="1.6" stroke-linecap="round"/>`;

let uid = 0;
export function rankIcon(idx) {
  const id = 'rk' + uid++;
  const [fa, fb, fur, dark, eye] = PAL[idx];
  const defs = `<defs>
    <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${fa}"/><stop offset="1" stop-color="${fb}"/></linearGradient>
    <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fur}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
    <radialGradient id="${id}g" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="${fb}" stop-opacity=".45"/><stop offset="1" stop-color="${fb}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}m" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e9f9ff"/><stop offset="1" stop-color="#a5e9ff"/></radialGradient>
  </defs>`;
  let art = '';
  if (idx === 0) {
    // Vilcēns: small round badge, wolf pup (round head, big eyes, short ears)
    art = `<circle cx="50" cy="52" r="38" fill="#0b0e19" stroke="url(#${id}f)" stroke-width="4"/>
      <circle cx="50" cy="52" r="30" fill="url(#${id}g)"/>
      <path d="M32 44 L26 15 L46 33 Z M68 44 L74 15 L54 33 Z" fill="url(#${id}w)"/>
      <path d="M33 39 L29.5 22 L41 33 Z M67 39 L70.5 22 L59 33 Z" fill="${dark}"/>
      <path d="M30 52 L21 60 L30 61 L25 68 L35 66 L50 74 L65 66 L75 68 L70 61 L79 60 L70 52 Z" fill="${dark}"/>
      <ellipse cx="50" cy="53" rx="21" ry="19" fill="url(#${id}w)"/>
      <ellipse cx="50" cy="63.5" rx="10" ry="8.5" fill="${fur}"/><path d="M50 36 L45 44 L50 50 L55 44 Z" fill="${fur}" opacity=".6"/>
      <circle cx="41" cy="50" r="4.6" fill="#0b0e19"/><circle cx="59" cy="50" r="4.6" fill="#0b0e19"/>
      <circle cx="42.4" cy="48.6" r="1.8" fill="${eye}"/><circle cx="60.4" cy="48.6" r="1.8" fill="${eye}"/>
      <path d="M46.5 60 L53.5 60 L50 64 Z" fill="#0b0e19"/>
      <path d="M50 64 Q47 68 44 66 M50 64 Q53 68 56 66" stroke="#0b0e19" stroke-width="1.2" fill="none"/>`;
  } else if (idx === 1) {
    // Jaunais vilks: hexagon badge, young wolf head, one chevron
    art = `<path d="M50 6 L89 28 L89 72 L50 94 L11 72 L11 28 Z" fill="#0b0e19" stroke="url(#${id}f)" stroke-width="4"/>
      <circle cx="50" cy="50" r="34" fill="url(#${id}g)"/>
      <g transform="translate(50 50) scale(.72) translate(-50 -52)"><path d="${WOLF}" fill="url(#${id}w)"/>${WOLF_DETAIL(fur, dark, eye)}</g>
      <path d="M38 84 L50 78 L62 84" stroke="url(#${id}f)" stroke-width="3.5" fill="none" stroke-linejoin="round"/>`;
  } else if (idx === 2) {
    // Mednieks: hunter shield with claw marks, two chevrons
    art = `<path d="M50 4 L90 18 L90 52 Q90 80 50 97 Q10 80 10 52 L10 18 Z" fill="#0b0e19" stroke="url(#${id}f)" stroke-width="4"/>
      <circle cx="50" cy="46" r="36" fill="url(#${id}g)"/>
      <path d="M17 26 L27 58 M22 22 L33 55 M83 26 L73 58 M78 22 L67 55" stroke="url(#${id}f)" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>
      <g transform="translate(50 46) scale(.78) translate(-50 -52)"><path d="${WOLF}" fill="url(#${id}w)"/>${WOLF_DETAIL(fur, dark, eye)}</g>
      <path d="M38 80 L50 74 L62 80 M38 87 L50 81 L62 87" stroke="url(#${id}f)" stroke-width="3.2" fill="none" stroke-linejoin="round"/>`;
  } else if (idx === 3) {
    // Bara sargs: winged guardian shield, three chevrons, star
    art = `<path d="M10 30 Q0 44 6 62 L16 56 Q12 46 18 36 Z M90 30 Q100 44 94 62 L84 56 Q88 46 82 36 Z" fill="url(#${id}f)" opacity=".85"/>
      <path d="M50 4 L86 16 L86 52 Q86 80 50 97 Q14 80 14 52 L14 16 Z" fill="#0b0e19" stroke="url(#${id}f)" stroke-width="4"/>
      <circle cx="50" cy="44" r="34" fill="url(#${id}g)"/>
      <path d="M50 7 L52.4 12.6 L58.4 12.8 L53.6 16.4 L55.4 22 L50 18.6 L44.6 22 L46.4 16.4 L41.6 12.8 L47.6 12.6 Z" fill="${fb}"/>
      <g transform="translate(50 47) scale(.76) translate(-50 -52)"><path d="${WOLF}" fill="url(#${id}w)"/>${WOLF_DETAIL(fur, dark, eye)}</g>
      <path d="M38 78 L50 72.5 L62 78 M38 84 L50 78.5 L62 84 M38 90 L50 84.5 L62 90" stroke="url(#${id}f)" stroke-width="2.8" fill="none" stroke-linejoin="round"/>`;
  } else if (idx === 4) {
    // Alfa: crowned wolf with laurel wreath
    const leaves = (side) => Array.from({ length: 6 }, (_, i) => {
      const t = i / 5, ang = (200 - t * 120) * Math.PI / 180, cx = 50 + side * Math.cos(ang) * -40, cy = 56 - Math.sin(ang) * -40 * 0.95;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="3.2" ry="7" transform="rotate(${(side * (20 + t * 110)).toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="url(#${id}f)"/>`;
    }).join('');
    art = `<circle cx="50" cy="54" r="40" fill="#0b0e19" stroke="url(#${id}f)" stroke-width="3"/>
      <circle cx="50" cy="54" r="36" fill="url(#${id}g)"/>
      ${leaves(1)}${leaves(-1)}
      <g transform="translate(50 58) scale(.66) translate(-50 -52)"><path d="${WOLF}" fill="url(#${id}w)"/>${WOLF_DETAIL(fur, dark, eye)}</g>
      <path d="M34 26 L38 12 L44 22 L50 8 L56 22 L62 12 L66 26 Z" fill="url(#${id}f)" stroke="#0b0e19" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="50" cy="20" r="2.2" fill="#fff"/><circle cx="39" cy="22" r="1.6" fill="#fff"/><circle cx="61" cy="22" r="1.6" fill="#fff"/>`;
  } else {
    // Vilks, kas gaudo mēness gaismā: howling wolf on a rock under a big glowing moon, ornate frame, stars
    const stars = [[18, 26, 1.6], [28, 14, 1.1], [88, 52, 1.3], [84, 62, 1], [14, 46, 1], [70, 10, 0.9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join('');
    art = `<path d="M50 2 L62 8 L76 6 L82 18 L94 24 L92 38 L98 50 L92 62 L94 76 L82 82 L76 94 L62 92 L50 98 L38 92 L24 94 L18 82 L6 76 L8 62 L2 50 L8 38 L6 24 L18 18 L24 6 L38 8 Z" fill="url(#${id}f)" opacity=".9"/>
      <circle cx="50" cy="50" r="42" fill="#070a16" stroke="#0b0e19" stroke-width="2"/>
      <circle cx="50" cy="50" r="40" fill="url(#${id}g)"/>
      ${stars}
      <circle cx="70" cy="34" r="23" fill="#a5e9ff" opacity=".16"/>
      <circle cx="70" cy="34" r="16.5" fill="url(#${id}m)"/>
      <circle cx="65" cy="29" r="2.6" fill="#c7eefc" opacity=".8"/><circle cx="75" cy="40" r="3.4" fill="#c7eefc" opacity=".7"/><circle cx="76" cy="27" r="1.6" fill="#c7eefc" opacity=".8"/>
      <path d="M12 90 L22 84 L34 86 L44 82 L62 84 L76 82 L90 90 Z" fill="#1a2140"/>
      <path d="M31 83 C20 86 13 79 15 69 C17 76 23 79 31 78 Z" fill="url(#${id}f)"/>
      <path d="M28 84 C24 76 26 66 34 62 C36 56 38 48 42 42 C43 36 43 30 44 26 L41 17 L48 22.5 L54 20 C57 17 60 13 64 9 L62.5 14 L60 16.5 C59 19 57 22 56 24 C56 30 57 36 59 41 L57 44 L60.5 47 L58 50 L61.5 53 C62.5 60 61.5 68 60.5 76 L61 84 L67 86 L67 88.5 L53 88.5 L52 82 C48 86 44 88.5 38 88.5 L30 88.5 Z" fill="url(#${id}f)"/>
      <path d="M43.5 25 L42.4 19.5 L46.5 23 Z" fill="#070a16" opacity=".6"/>
      <path d="M38 64 C42 70 46 76 47 84" stroke="#070a16" stroke-width="1.2" fill="none" opacity=".35"/>
      <circle cx="51.5" cy="22.5" r="1.1" fill="#070a16"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${RANKS[idx].name}">${defs}${art}</svg>`;
}
