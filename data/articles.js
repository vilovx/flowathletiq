/*
 * FlowAthletiq content data. Edit this file to change what the site shows.
 *
 * LANGUAGES: text fields can be a plain string (same in every language) or an
 * object with one value per language: { lv: "...", en: "...", ru: "..." }.
 * Latvian (lv) is the default. If a translation is missing, the site falls back
 * to lv, then to any available language, and shows a small note.
 *
 * The match fixtures and partner banners below are EXAMPLE / PLACEHOLDER content
 * (not real teams, events or brands). Real articles are imported into data/imported.js.
 */

/* ---------------------------------------------------------------------------
 * CATEGORIES
 * "slug" is used in URLs (category.html?cat=<slug>) and in articles' "category".
 * "parent" makes it a subcategory. Order here = order in the nav.
 * A parent page also lists all articles of its children (and grandchildren).
 * ------------------------------------------------------------------------- */
window.FA_CATEGORIES = [
  { slug: "fps", name: "FPS", color: "#00f0ff",
    description: { lv: "Pirmās personas šāvēju spēles, galvenokārt Counter-Strike 2.", en: "First-person shooters, with a focus on Counter-Strike 2.", ru: "Шутеры от первого лица, прежде всего Counter-Strike 2." } },
  { slug: "cs2", name: "Counter-Strike 2", short: "CS2", parent: "fps", color: "#f5a623",
    description: { lv: "Counter-Strike 2 ziņas, analīze un ceļveži.", en: "News, analysis and guides for Counter-Strike 2.", ru: "Новости, аналитика и гайды по Counter-Strike 2." } },
  { slug: "cs2-majors", name: { lv: "Major turnīri", en: "Majors", ru: "Мейджоры" }, short: { lv: "Major", en: "Majors", ru: "Мейджоры" }, parent: "cs2", color: "#ffcc33",
    description: { lv: "Lielāko CS2 turnīru apskati.", en: "Coverage of the biggest CS2 events.", ru: "Освещение крупнейших турниров по CS2." } },
  { slug: "cs2-latvia", name: { lv: "Latvijas CS līga", en: "Latvian CS League", ru: "Латвийская лига CS" }, parent: "cs2", color: "#a4343a",
    description: { lv: "Ziņas par Latvijas Counter-Strike līgu.", en: "Coverage of the Latvian Counter-Strike league scene.", ru: "Новости латвийской лиги Counter-Strike." } },
  // Valorant: to remove it, delete this line (its articles/matches are then hidden automatically).
  { slug: "valorant", name: "Valorant", parent: "fps", color: "#ff4655",
    description: { lv: "Valorant ziņas un ceļveži.", en: "Valorant news and guides.", ru: "Новости и гайды по Valorant." } },
  { slug: "dota2", name: "Dota 2", color: "#e2473b",
    description: { lv: "Dota 2 ziņas, atjauninājumi un turnīri.", en: "Dota 2 news, patches and tournaments.", ru: "Новости, патчи и турниры Dota 2." } },
  { slug: "lol", name: "League of Legends", short: "LoL", color: "#c8aa6e",
    description: { lv: "League of Legends ziņas, atjauninājumi un e-sports.", en: "League of Legends news, patches and esports.", ru: "Новости, патчи и киберспорт League of Legends." } },
  { slug: "mmorpg", name: "MMORPG", color: "#3ddc97",
    description: { lv: "MMORPG ziņas, paplašinājumi un ceļveži.", en: "MMORPG news, expansions and guides.", ru: "Новости, дополнения и гайды по MMORPG." } }
];

var STAFF = { lv: "FlowAthletiq redakcija", en: "FlowAthletiq Staff", ru: "Редакция FlowAthletiq" };

/* ---------------------------------------------------------------------------
 * ARTICLES (the site sorts by date, newest first)
 * category: most specific category slug. featured: true = homepage hero (one article).
 * body lines: "## " = sub-heading, "> " = pull quote, anything else = paragraph.
 * ------------------------------------------------------------------------- */
window.FA_ARTICLES = [
  /*
   * Hand-written articles go here (most news is imported from content/news.json,
   * see scripts/import-news.js). Template:
   *
   * {
   *   id: "my-article", category: "cs2-majors", featured: false,
   *   author: STAFF, date: "2026-11-01", readMinutes: 3, tags: ["Major"],
   *   title:   { lv: "...", en: "...", ru: "..." },
   *   summary: { lv: "...", en: "...", ru: "..." },
   *   body:    { lv: ["...", "## Apakšvirsraksts", "..."], en: [...], ru: [...] },
   *   sources: [{ name: "HLTV.org", url: "https://..." }]
   * },
   */
];

/* ---------------------------------------------------------------------------
 * UPCOMING MATCHES (sidebar). "category" = a slug from FA_CATEGORIES.
 * Dates are ISO strings; they display in each visitor's timezone and language.
 * Entries with example: true are placeholders and are only shown when
 * FA_SHOW_EXAMPLE_MATCHES is true. If nothing is left to show, the box is hidden.
 * ------------------------------------------------------------------------- */
window.FA_SHOW_EXAMPLE_MATCHES = false;
var EV_MAJOR = { lv: "Piemēra Major — 1. posms", en: "Example Major — Stage 1", ru: "Пример мейджора — стадия 1" };
var EV_LV = { lv: "Latvijas CS līga (piemērs) — 5. kārta", en: "Latvian CS League (example) — Round 5", ru: "Латвийская лига CS (пример) — 5-й тур" };
window.FA_MATCHES = [
  { example: true, category: "cs2-majors", event: EV_MAJOR, teamA: "Team Alpha", teamB: "Team Bravo", date: "2026-10-27T15:00:00Z" },
  { example: true, category: "cs2-latvia", event: EV_LV, teamA: "LV Team A", teamB: "LV Team B", date: "2026-10-28T17:00:00Z" },
  { example: true, category: "cs2-majors", event: EV_MAJOR, teamA: "Team Charlie", teamB: "Team Delta", date: "2026-10-28T19:00:00Z" },
  { example: true, category: "cs2-latvia", event: EV_LV, teamA: "LV Team C", teamB: "LV Team D", date: "2026-10-29T17:00:00Z" },
  { example: true, category: "cs2", event: { lv: "Piemēra tiešsaistes kauss", en: "Sample Online Cup", ru: "Пример онлайн-кубка" }, teamA: "Team Echo", teamB: "Team Foxtrot", date: "2026-10-30T18:00:00Z" },
  { example: true, category: "valorant", event: { lv: "Piemēra kauss — A grupa", en: "Example Cup — Group A", ru: "Пример кубка — группа A" }, teamA: "Team Golf", teamB: "Team Hotel", date: "2026-10-31T18:00:00Z" },
  { example: true, category: "dota2", event: { lv: "Piemēra ielūguma turnīrs", en: "Placeholder Invitational", ru: "Пригласительный турнир (пример)" }, teamA: "Team India", teamB: "Team Juliet", date: "2026-11-01T14:00:00Z" },
  { example: true, category: "lol", event: { lv: "Demo sērija — fināls", en: "Demo Series — Final", ru: "Демо-серия — финал" }, teamA: "Team Kilo", teamB: "Team Lima", date: "2026-11-02T19:00:00Z" }
];

/* ---------------------------------------------------------------------------
 * PARTNER BANNERS (affiliate links for PC and gaming gear)
 * image: path in assets/ or a full https:// URL (can also be {lv,en,ru} for per-language banners)
 * alt / label: text (string or {lv,en,ru})
 * href: your affiliate link. size: "728x90", "300x250", "970x250" ...
 * placements: "sidebar", "in-feed", "full-width". All banners are listed on partners.html.
 * Links automatically get rel="sponsored nofollow noopener" and open in a new tab.
 * ------------------------------------------------------------------------- */
window.FA_BANNERS = [
  {
    id: "placeholder-leaderboard",
    image: "assets/banners/placeholder-728x90.svg",
    alt: { lv: "Partnera banera aizvietotājs, 728 × 90", en: "Placeholder partner banner, 728 by 90", ru: "Баннер-заглушка партнёра, 728 × 90" },
    href: "https://example.com/?ref=flowathletiq",
    label: { lv: "Piemēra partneris: datoru komponentes (aizvietotājs)", en: "Example partner: PC hardware (placeholder)", ru: "Пример партнёра: комплектующие для ПК (заглушка)" },
    size: "728x90",
    placements: ["in-feed"]
  },
  {
    id: "placeholder-rectangle",
    image: "assets/banners/placeholder-300x250.svg",
    alt: { lv: "Partnera banera aizvietotājs, 300 × 250", en: "Placeholder partner banner, 300 by 250", ru: "Баннер-заглушка партнёра, 300 × 250" },
    href: "https://example.com/?ref=flowathletiq-sidebar",
    label: { lv: "Piemēra partneris: spēļu perifērija (aizvietotājs)", en: "Example partner: gaming peripherals (placeholder)", ru: "Пример партнёра: игровая периферия (заглушка)" },
    size: "300x250",
    placements: ["sidebar"]
  },
  {
    id: "placeholder-billboard",
    image: "assets/banners/placeholder-970x250.svg",
    alt: { lv: "Partnera banera aizvietotājs, 970 × 250", en: "Placeholder partner banner, 970 by 250", ru: "Баннер-заглушка партнёра, 970 × 250" },
    href: "https://example.com/?ref=flowathletiq-billboard",
    label: { lv: "Piemēra partneris: monitori un krēsli (aizvietotājs)", en: "Example partner: monitors and chairs (placeholder)", ru: "Пример партнёра: мониторы и кресла (заглушка)" },
    size: "970x250",
    placements: ["full-width"]
  }
];
