#!/usr/bin/env node
// Builds sitemap.xml (every page in lv/en/ru, with xhtml:link hreflang alternates and x-default -> English).
// Run after changing articles/categories:  node scripts/build-sitemap.js   (import-news.js runs it automatically).
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, ".."), SITE = "https://flowathletiq.com", LANGS = ["lv", "en", "ru"];
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ["data/articles.js", "data/imported.js"]) { const p = path.join(root, f); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, "utf8"), ctx); }
const W = ctx.window, cats = W.FA_CATEGORIES || [], catSet = new Set(cats.map((c) => c.slug));
const byId = {}; (W.FA_ARTICLES || []).concat(W.FA_IMPORTED_ARTICLES || []).forEach((a) => (byId[a.id] = a));
const isEx = (a) => a.example || (a.tags || []).some((x) => String(x).toLowerCase() === "example");
const arts = Object.values(byId).filter((a) => catSet.has(a.category) && !isEx(a));
const today = new Date().toISOString().slice(0, 10);
const entries = [ // [path, extra query, lastmod, priority]
  ["/", "", today, "1.0"], ["/aim/", "", today, "0.9"], ["/tournaments.html", "", today, "0.7"], ["/server.html", "", today, "0.6"],
  ["/server-top.html", "", today, "0.5"], ["/virsliga.html", "", today, "0.6"], ["/about.html", "", today, "0.4"],
  ...cats.map((c) => ["/category.html", "cat=" + encodeURIComponent(c.slug), today, "0.6"]),
  ...arts.sort((a, b) => String(b.date).localeCompare(String(a.date))).map((a) => ["/article.html", "id=" + encodeURIComponent(a.id), String(a.date || today).slice(0, 10), "0.5"]),
];
if (W.FA_SHOW_PARTNERS !== false) entries.push(["/partners.html", "", today, "0.3"]);
const url = (p, q, l) => SITE + p + "?" + (q ? q + "&" : "") + "lang=" + l;
const xml = (s) => s.replace(/&/g, "&amp;");
let out = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
for (const [p, q, lm, pr] of entries) for (const l of LANGS) {
  out += "  <url>\n    <loc>" + xml(url(p, q, l)) + "</loc>\n    <lastmod>" + lm + "</lastmod>\n    <priority>" + pr + "</priority>\n";
  for (const a of LANGS) out += '    <xhtml:link rel="alternate" hreflang="' + a + '" href="' + xml(url(p, q, a)) + '"/>\n';
  out += '    <xhtml:link rel="alternate" hreflang="x-default" href="' + xml(url(p, q, "en")) + '"/>\n  </url>\n';
}
out += "</urlset>\n";
fs.writeFileSync(path.join(root, "sitemap.xml"), out);
console.log("build-sitemap: " + entries.length + " pages x " + LANGS.length + " languages -> sitemap.xml");
