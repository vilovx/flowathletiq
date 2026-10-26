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
 * Order here = order in the nav. (Optional "parent" makes a subcategory, shown as a dropdown.)
 * ------------------------------------------------------------------------- */
window.FA_CATEGORIES = [
  { slug: "cs2-latvia", name: { lv: "Latvijas CS2 scēna", en: "Latvian CS2 scene", ru: "Латвийская сцена CS2" },
    short: { lv: "Latvija", en: "Latvia", ru: "Латвия" }, color: "#a4343a",
    description: { lv: "Latvijas CS2 turnīri, komandas un spēlētāji mājās un ārzemēs.", en: "Latvian CS2 tournaments, teams and players at home and abroad.", ru: "Латвийские турниры, команды и игроки CS2 — дома и за рубежом." } },
  { slug: "cs2-majors", name: { lv: "Major turnīri un lielie notikumi", en: "Majors & big events", ru: "Мейджоры и крупные турниры" },
    short: { lv: "Major", en: "Majors", ru: "Мейджоры" }, color: "#ffcc33",
    description: { lv: "Major turnīri, lielākie CS2 notikumi un top komandu jaunumi.", en: "Majors, the biggest CS2 events and top-team news.", ru: "Мейджоры, крупнейшие турниры CS2 и новости топ-команд." } },
  { slug: "cs2", name: { lv: "CS2 ziņas", en: "CS2 news", ru: "Новости CS2" }, short: "CS2", color: "#f5a623",
    description: { lv: "Atjauninājumi, spēles izmaiņas un citas Counter-Strike 2 ziņas.", en: "Updates, game changes and other Counter-Strike 2 news.", ru: "Обновления, изменения в игре и другие новости Counter-Strike 2." } }
];

/* Old category URLs: aliases map to a current slug; removed categories send visitors home with a notice. */
window.FA_CATEGORY_ALIASES = { "lv-scene": "cs2-latvia", latvia: "cs2-latvia", majors: "cs2-majors" };
window.FA_REMOVED_CATEGORIES = ["fps", "valorant", "dota2", "lol", "mmorpg", "fortnite"];

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

/*
 * Partners section switch. false = hidden everywhere: no Partners nav/footer link, no banners on
 * any page, no affiliate disclosure, and partners.html redirects to the home page.
 * Set back to true to restore it (also remove the noindex/redirect lines marked in partners.html).
 */
window.FA_SHOW_PARTNERS = false;
var EV_MAJOR = { lv: "Piemēra Major — 1. posms", en: "Example Major — Stage 1", ru: "Пример мейджора — стадия 1" };
var EV_LV = { lv: "Latvijas CS līga (piemērs) — 5. kārta", en: "Latvian CS League (example) — Round 5", ru: "Латвийская лига CS (пример) — 5-й тур" };
window.FA_MATCHES = [
  { example: true, category: "cs2-majors", event: EV_MAJOR, teamA: "Team Alpha", teamB: "Team Bravo", date: "2026-10-27T15:00:00Z" },
  { example: true, category: "cs2-latvia", event: EV_LV, teamA: "LV Team A", teamB: "LV Team B", date: "2026-10-28T17:00:00Z" },
  { example: true, category: "cs2-majors", event: EV_MAJOR, teamA: "Team Charlie", teamB: "Team Delta", date: "2026-10-28T19:00:00Z" },
  { example: true, category: "cs2-latvia", event: EV_LV, teamA: "LV Team C", teamB: "LV Team D", date: "2026-10-29T17:00:00Z" },
  { example: true, category: "cs2", event: { lv: "Piemēra tiešsaistes kauss", en: "Sample Online Cup", ru: "Пример онлайн-кубка" }, teamA: "Team Echo", teamB: "Team Foxtrot", date: "2026-10-30T18:00:00Z" }
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
    image: { lv: "assets/banners/placeholder-728x90-lv.svg", en: "assets/banners/placeholder-728x90-en.svg", ru: "assets/banners/placeholder-728x90-ru.svg" },
    alt: { lv: "Partnera banera aizvietotājs, 728 × 90", en: "Placeholder partner banner, 728 by 90", ru: "Баннер-заглушка партнёра, 728 × 90" },
    href: "https://example.com/?ref=flowathletiq",
    label: { lv: "Piemēra partneris: datoru komponentes (aizvietotājs)", en: "Example partner: PC hardware (placeholder)", ru: "Пример партнёра: комплектующие для ПК (заглушка)" },
    size: "728x90",
    placements: ["in-feed"]
  },
  {
    id: "placeholder-rectangle",
    image: { lv: "assets/banners/placeholder-300x250-lv.svg", en: "assets/banners/placeholder-300x250-en.svg", ru: "assets/banners/placeholder-300x250-ru.svg" },
    alt: { lv: "Partnera banera aizvietotājs, 300 × 250", en: "Placeholder partner banner, 300 by 250", ru: "Баннер-заглушка партнёра, 300 × 250" },
    href: "https://example.com/?ref=flowathletiq-sidebar",
    label: { lv: "Piemēra partneris: spēļu perifērija (aizvietotājs)", en: "Example partner: gaming peripherals (placeholder)", ru: "Пример партнёра: игровая периферия (заглушка)" },
    size: "300x250",
    placements: ["sidebar"]
  },
  {
    id: "placeholder-billboard",
    image: { lv: "assets/banners/placeholder-970x250-lv.svg", en: "assets/banners/placeholder-970x250-en.svg", ru: "assets/banners/placeholder-970x250-ru.svg" },
    alt: { lv: "Partnera banera aizvietotājs, 970 × 250", en: "Placeholder partner banner, 970 by 250", ru: "Баннер-заглушка партнёра, 970 × 250" },
    href: "https://example.com/?ref=flowathletiq-billboard",
    label: { lv: "Piemēra partneris: monitori un krēsli (aizvietotājs)", en: "Example partner: monitors and chairs (placeholder)", ru: "Пример партнёра: мониторы и кресла (заглушка)" },
    size: "970x250",
    placements: ["full-width"]
  }
];
