# FlowAthletiq

Esports & gaming news site for **flowathletiq.com** / **flowathletiq.xyz**.
Plain static HTML, CSS, and vanilla JavaScript. No framework, no build step, no backend,
so it deploys as-is to GitHub Pages, Netlify, Vercel, or Cloudflare Pages.

> All articles and matches currently in the site are **example placeholder content**.

## Structure

```
index.html          Homepage: top-story hero, latest news grid with game filters, upcoming matches
category.html       Game hub, e.g. category.html?game=valorant
article.html        Article template, e.g. article.html?id=sample-cs2-map-pool
about.html          About page
favicon.svg         Site icon
assets/logo.svg     FlowAthletiq logo (hand-made SVG)
css/styles.css      All styles (dark theme, neon accents, responsive)
js/app.js           Renders header, footer, and page content from the data file
data/articles.js    ALL content: games, articles, upcoming matches
screenshots/        Preview screenshots
```

## Preview locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

(Opening the HTML files directly also works, since data is a JS file rather than fetched JSON.)

## Add an article

Open `data/articles.js` and add an object to the top of `window.FA_ARTICLES`:

```js
{
  id: "my-new-article",          // unique, used in the URL: article.html?id=my-new-article
  game: "valorant",              // must match a slug in FA_GAMES
  featured: false,               // true = shown in the homepage hero (use on one article)
  title: "My headline",
  excerpt: "One or two sentence summary for cards.",
  author: "Your Name",
  date: "2026-10-25",            // YYYY-MM-DD; lists are sorted newest first
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

Cover art is generated automatically as an SVG from the game color, so no image is required.

## Add a game

Add `{ slug: "apex", name: "Apex Legends", color: "#da292a" }` to `window.FA_GAMES`.
It appears automatically in the nav, filters, footer, and gets its own `category.html?game=apex` page.

## Add an upcoming match

Add an entry to `window.FA_MATCHES` with `game`, `event`, `teamA`, `teamB`, and an ISO `date`.
Times display in each visitor's local timezone.

## Deploy

Any static host works: point it at this folder, with no build command and the output directory set to `/` (root).
Then add `flowathletiq.com` as a custom domain in the host's dashboard and update DNS at your registrar.
