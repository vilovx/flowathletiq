# FlowAthletiq

Esports & gaming news site for **flowathletiq.com** / **flowathletiq.xyz**.
Plain static HTML, CSS, and vanilla JavaScript. No framework, no build step, no backend,
so it deploys as-is to GitHub Pages, Netlify, Vercel, or Cloudflare Pages.

> All articles, matches and partner banners currently in the site are **example placeholder content**.

## Structure

```
index.html          Homepage: top-story hero, partner banners, latest news with category filters, upcoming matches
category.html       Category page, e.g. category.html?cat=fps, ?cat=cs2, ?cat=cs2-majors, ?cat=cs2-latvia
article.html        Article page, e.g. article.html?id=sample-cs2-major-preview
partners.html       Partner / affiliate banners with disclosure
about.html          About page
favicon.svg         Site icon
assets/logo.svg     FlowAthletiq logo (hand-made SVG)
assets/banners/     Placeholder partner banners (728x90, 300x250, 970x250)
css/styles.css      All styles (dark theme, neon accents, responsive, dropdown nav)
js/app.js           Renders nav, footer, pages and banners from the data file
data/articles.js    ALL content: categories, articles, matches, partner banners
screenshots/        Preview screenshots
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
# open http://localhost:8080
```

## Add a category or subcategory

Add an entry to `window.FA_CATEGORIES` in `data/articles.js`:

```js
{ slug: "apex", name: "Apex Legends", parent: "fps", color: "#da292a", description: "Apex news." }
```

- `slug` is used in the URL (`category.html?cat=apex`) and in articles' `category` field.
- Leave out `parent` for a top-level category, set `parent` to make a subcategory
  (subcategories can be nested, like `cs2` → `cs2-majors`).
- Optional `short` sets a short label for badges (e.g. `short: "CS2"`).
- The order of the list is the order in the nav. Nav dropdowns, footer links, homepage
  filters and category pages all update automatically.

**Removing a category** (e.g. Valorant): delete its line in `FA_CATEGORIES`. Any articles or
matches still pointing at it are hidden automatically; delete them too to keep the file tidy.

## Add an article

Add an object to `window.FA_ARTICLES` (the site sorts by date, newest first):

```js
{
  id: "my-new-article",          // unique, used in the URL: article.html?id=my-new-article
  category: "cs2-majors",        // the most specific category slug
  featured: false,               // true = shown in the homepage hero (use on one article)
  title: "My headline",
  excerpt: "One or two sentence summary for cards.",
  author: "Your Name",
  date: "2026-10-25",            // YYYY-MM-DD
  readMinutes: 4,
  tags: ["news"],
  body: [
    "A normal paragraph.",
    "## A sub-heading",
    "> A pull quote",
    "Another paragraph."
  ]
}
```

Cover art is generated automatically as an SVG from the category color, so no image is required.

## Add an upcoming match

Add an entry to `window.FA_MATCHES` with `category`, `event`, `teamA`, `teamB`, and an ISO `date`
(e.g. `"2026-11-05T18:00:00Z"`). Times display in each visitor's local timezone. Category pages show
matches from that category and its children.

## Add a partner banner

Put the banner image in `assets/banners/` (or use a full `https://` image URL) and add an entry to
`window.FA_BANNERS`:

```js
{
  id: "my-partner",
  image: "assets/banners/my-partner-300x250.png",
  alt: "Describe the banner for screen readers",
  href: "https://partner.example/?aff=YOURCODE",   // your affiliate link
  label: "Partner name: what they sell",
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
