# FlowAthletiq

Esports & gaming news site for **flowathletiq.com** / **flowathletiq.xyz**.
Plain static HTML, CSS, and vanilla JavaScript. No framework, no build step, no backend,
so it deploys as-is to GitHub Pages, Netlify, Vercel, or Cloudflare Pages.

Languages: **Latvian (default)**, English, Russian.

> Articles are real news imported from `content/news.json`. The partner banners and the (hidden) match
> fixtures are still **example placeholders**.

## Structure

```
index.html            Homepage: top story, partner banners, latest news with category filters
category.html         Category page, e.g. category.html?cat=fps, ?cat=cs2, ?cat=cs2-majors, ?cat=cs2-latvia
article.html          Article page with source links, e.g. article.html?id=battle-of-baltics-riga-2026
partners.html         Partner / affiliate banners with disclosure
about.html            About page
js/i18n.js            ALL UI strings in lv / en / ru + language list
js/app.js             Renders everything from the data files; language switching
data/articles.js      Categories, hand-written articles, matches, partner banners
data/imported.js      GENERATED from content/news.json by the import script (don't edit by hand)
content/news.json     News articles (source for the import)
scripts/import-news.js  news.json -> data/imported.js
assets/logo.svg, assets/banners/, favicon.svg, css/styles.css
screenshots/          Preview screenshots
```

## Category structure

```
FPS
├── Counter-Strike 2   (main focus)
│   ├── Majors
│   └── Latvian CS League
└── Valorant           (secondary; easy to remove)
Dota 2
League of Legends
MMORPG
Partners               (separate page, not a news category)
```

A parent category page shows its own articles plus all of its children's articles
(e.g. `?cat=fps` shows everything from CS2, Majors, Latvian CS League and Valorant).
The old `?game=` URLs still work.

## Preview locally

```bash
python3 -m http.server 8080
# open http://localhost:8080            (Latvian)
#      http://localhost:8080/?lang=en   (English)
#      http://localhost:8080/?lang=ru   (Russian)
```

## Languages

- The LV / EN / RU switcher is in the header (also on mobile). The choice is saved in `localStorage`
  and can be forced with `?lang=lv|en|ru`. `<html lang>`, page titles and dates follow the language.
- UI text lives in `js/i18n.js`. Every key must exist in `lv`, `en` and `ru`.
- Content text (category names, article title/summary/body, match events, banner alt/labels) can be a
  plain string or `{ lv: "...", en: "...", ru: "..." }`.
- Missing translation: the site shows Latvian, or else any available language, plus a small
  "not translated" note (on cards and at the top of the article).

## Import news (main way to publish)

1. Add or edit articles in `content/news.json` (an array). Fields:
   - `title`, `summary`, `body`: Latvian
   - `titleEn`, `summaryEn`, `bodyEn`: English. `titleRu`, `summaryRu`, `bodyRu`: Russian
   - `category`: a slug such as `cs2`, `cs2-majors`, `cs2-latvia` (alias `lv-scene` works too)
   - `id`, `date` (YYYY-MM-DD), `tags`, `featured` (true = homepage top story), `author`
   - `sourceName` + `sourceUrl`, and optional `extraSources: [{ "name": "...", "url": "..." }]`.
     These are shown as a "Sources" list under each article.
   - `body*` can be an array of paragraphs or one string with blank lines between paragraphs.
     `## ` starts a sub-heading, `> ` a pull quote.
2. Run `node scripts/import-news.js` (or `node scripts/import-news.js path/to/news.json`).
   It writes `data/imported.js` and warns about unknown categories, missing translations or missing sources.
3. Commit both files.

## Add a category or subcategory

Add an entry to `window.FA_CATEGORIES` in `data/articles.js`:

```js
{ slug: "apex", name: "Apex Legends", parent: "fps", color: "#da292a",
  description: { lv: "Apex Legends ziņas.", en: "Apex Legends news.", ru: "Новости Apex Legends." } }
```

- `slug` is used in the URL (`category.html?cat=apex`) and in articles' `category` field.
- Leave out `parent` for a top-level category, set `parent` to make a subcategory
  (subcategories can be nested, like `cs2` → `cs2-majors`).
- `name`, `short` (short badge label) and `description` can be strings or `{ lv, en, ru }`.
- The order of the list is the order in the nav. Nav dropdowns, footer links, homepage
  filters and category pages all update automatically.

**Removing a category** (e.g. Valorant): delete its line in `FA_CATEGORIES`. Any articles or
matches still pointing at it are hidden automatically; delete them too to keep the file tidy.

## Add an article by hand

Usually use the import above. To write one directly, add an object to `window.FA_ARTICLES` in
`data/articles.js` (the site sorts by date, newest first; an imported article with the same id wins):

```js
{
  id: "my-new-article",          // unique, used in the URL: article.html?id=my-new-article
  category: "cs2-majors",        // the most specific category slug
  featured: false,               // true = shown in the homepage hero (use on one article)
  date: "2026-10-25",            // YYYY-MM-DD
  tags: ["news"],
  title:   { lv: "Virsraksts", en: "Headline", ru: "Заголовок" },
  summary: { lv: "...", en: "...", ru: "..." },
  body:    { lv: ["Rindkopa.", "## Apakšvirsraksts", "> Citāts"], en: [...], ru: [...] },
  sources: [{ name: "HLTV.org", url: "https://..." }]
}
```

Cover art is generated automatically as an SVG from the category colour, so no image is required.
The yellow "example content" banner appears only if an article is tagged `example`.

## Add an upcoming match

Add an entry to `window.FA_MATCHES` with `category`, `event` (string or `{lv,en,ru}`), `teamA`, `teamB`,
and an ISO `date` (e.g. `"2026-11-05T18:00:00Z"`). The current entries are placeholders marked
`example: true` and are hidden while `window.FA_SHOW_EXAMPLE_MATCHES = false`; the matches box is hidden
when nothing is left to show. Add real fixtures without `example: true` and they appear. Times display in each visitor's local timezone. Category pages show
matches from that category and its children.

## Add a partner banner

Put the banner image in `assets/banners/` (or use a full `https://` image URL) and add an entry to
`window.FA_BANNERS`:

```js
{
  id: "my-partner",
  image: "assets/banners/my-partner-300x250.png",
  alt: "Describe the banner for screen readers",     // or { lv, en, ru }
  href: "https://partner.example/?aff=YOURCODE",   // your affiliate link
  label: { lv: "...", en: "Partner name: what they sell", ru: "..." },
  size: "300x250",                                  // width x height
  placements: ["sidebar"]                           // "sidebar", "in-feed", "full-width"
}
```

- Every banner is listed on `partners.html`.
- `sidebar`: homepage, category and article sidebars (300x250 works best).
- `in-feed`: inside the news grid on the homepage/category pages and below the article body (728x90).
- `full-width`: below the homepage hero (970x250 or 728x90).
- If several banners share a placement, the first one in the list is shown.
- Links automatically get `target="_blank"` and `rel="sponsored nofollow noopener"`, plus a
  "Partner / Affiliate link" label. The affiliate disclosure is on the partners page and in the footer.
  Check each affiliate program's own disclosure rules.

## Before pushing

The local git repo uses a placeholder author email (`285768046+vilovx@users.noreply.github.com`).
Set your real identity first:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"   # or your GitHub noreply address
```

## Deploy

Any static host works: point it at this folder, with no build command and the output directory set to `/` (root).
Then add `flowathletiq.com` as a custom domain in the host's dashboard and update DNS at your registrar.
