#!/usr/bin/env node
/*
 * Import articles from a news.json file into the site.
 *
 *   node scripts/import-news.js [input.json] [output.js]
 *   defaults: content/news.json  ->  data/imported.js
 *
 * Input: an array of objects (or { "articles": [...] }). Latvian is the main language:
 *   title, summary, body          Latvian (lv)
 *   titleEn, summaryEn, bodyEn    English (en)
 *   titleRu, summaryRu, bodyRu    Russian (ru)
 *   category  (slug from data/articles.js, e.g. "cs2-majors")   required
 *   id, date (YYYY-MM-DD), author, tags, featured, readMinutes   optional
 *   sourceName, sourceUrl          main source (shown under the article)
 *   extraSources                   [{ "name": "...", "url": "https://..." }]  more sources
 * Category aliases: "lv-scene"/"latvia" -> "cs2-latvia", "majors" -> "cs2-majors".
 * body* may be an array of paragraphs or one string (paragraphs separated by a blank line).
 * Missing languages are simply left out; the site falls back to lv (then any language)
 * and shows a "not translated" note.
 *
 * No dependencies: plain Node.js 14+.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const input = path.resolve(process.argv[2] || path.join(root, "content", "news.json"));
const output = path.resolve(process.argv[3] || path.join(root, "data", "imported.js"));
const LANGS = { lv: "", en: "En", ru: "Ru" };

function fail(msg) { console.error("import-news: " + msg); process.exit(1); }

// Load the category list from the data file so we can validate slugs.
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data", "articles.js"), "utf8"), sandbox);
const categories = new Set((sandbox.window.FA_CATEGORIES || []).map((c) => c.slug));
const existingIds = new Set((sandbox.window.FA_ARTICLES || []).map((a) => a.id));

let raw;
try { raw = JSON.parse(fs.readFileSync(input, "utf8")); } catch (e) { fail("cannot read " + input + ": " + e.message); }
const items = Array.isArray(raw) ? raw : raw && Array.isArray(raw.articles) ? raw.articles : fail("expected an array or { articles: [...] }");

const TRANSLIT = { ā: "a", č: "c", ē: "e", ģ: "g", ī: "i", ķ: "k", ļ: "l", ņ: "n", š: "s", ū: "u", ž: "z" };
const CYR = "а:a б:b в:v г:g д:d е:e ё:e ж:zh з:z и:i й:y к:k л:l м:m н:n о:o п:p р:r с:s т:t у:u ф:f х:h ц:ts ч:ch ш:sh щ:sch ъ: ы:y ь: э:e ю:yu я:ya"
  .split(" ").reduce((m, p) => { const [k, v] = p.split(":"); m[k] = v || ""; return m; }, {});
function slugify(s) {
  return String(s).toLowerCase().replace(/./g, (ch) => TRANSLIT[ch] ?? CYR[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
function toParagraphs(v) {
  if (v == null || v === "") return null;
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  return String(v).split(/\r?\n\s*\r?\n/).map((s) => s.replace(/\s*\r?\n\s*/g, " ").trim()).filter(Boolean);
}
function localized(item, base, isBody) {
  const out = {};
  for (const [lang, suffix] of Object.entries(LANGS)) {
    const v = item[base + suffix];
    const val = isBody ? toParagraphs(v) : v == null || String(v).trim() === "" ? null : String(v).trim();
    if (val && (!isBody || val.length)) out[lang] = val;
  }
  return Object.keys(out).length ? out : null;
}

const CATEGORY_ALIASES = { "lv-scene": "cs2-latvia", latvia: "cs2-latvia", "lv-league": "cs2-latvia", majors: "cs2-majors", major: "cs2-majors", counterstrike: "cs2", "cs-2": "cs2" };
function isUrl(u) { try { const x = new URL(u); return x.protocol === "https:" || x.protocol === "http:"; } catch (e) { return false; } }
function sourcesOf(item, where) {
  const list = [];
  if (item.sourceUrl) list.push({ name: item.sourceName || item.sourceUrl, url: item.sourceUrl });
  (Array.isArray(item.extraSources) ? item.extraSources : []).forEach((s) => { if (s && s.url) list.push({ name: s.name || s.url, url: s.url }); });
  if (Array.isArray(item.sources)) item.sources.forEach((s) => { if (s && s.url) list.push({ name: s.name || s.url, url: s.url }); });
  return list.filter((s) => { if (isUrl(s.url)) return true; warnings.push(where + ": dropped invalid source URL " + s.url); return false; });
}

const seen = new Set();
const articles = [];
const warnings = [];
items.forEach((item, i) => {
  const where = "item " + (i + 1);
  const title = localized(item, "title");
  if (!title) { warnings.push(where + ": skipped, no title/titleEn/titleRu"); return; }
  const body = localized(item, "body", true) || {};
  const summary = localized(item, "summary") || {};
  let category = CATEGORY_ALIASES[item.category] || item.category;
  if (!categories.has(category)) {
    warnings.push(where + ': unknown category "' + category + '", using "cs2"');
    category = "cs2";
  }
  let id = item.id ? slugify(item.id) : slugify(title.lv || title.en || title.ru);
  if (!id) id = "article-" + (i + 1);
  let n = 2; const baseId = id;
  while (seen.has(id)) id = baseId + "-" + n++;
  if (existingIds.has(id)) warnings.push(where + ': id "' + id + '" also exists in data/articles.js; the imported version wins');
  seen.add(id);
  const words = (body.lv || body.en || body.ru || []).join(" ").split(/\s+/).length;
  const date = item.date && /^\d{4}-\d{2}-\d{2}/.test(item.date) ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10);
  const missing = Object.keys(LANGS).filter((l) => !title[l]);
  if (missing.length) warnings.push(where + ' ("' + id + '"): no ' + missing.join("/") + " title, the site will fall back");
  const a = { id, category, title, summary, body, author: item.author || "FlowAthletiq", date,
    readMinutes: Number(item.readMinutes) || Math.max(1, Math.round(words / 200)), tags: Array.isArray(item.tags) ? item.tags : [] };
  if (item.featured) a.featured = true;
  const sources = sourcesOf(item, where);
  if (sources.length) a.sources = sources; else warnings.push(where + ' ("' + id + '"): no source links');
  articles.push(a);
});

const header = "/* Generated by scripts/import-news.js from " + path.relative(root, input) +
  " on " + new Date().toISOString() + ". Do not edit by hand; edit the JSON and re-run the script. */\n";
fs.writeFileSync(output, header + "window.FA_IMPORTED_ARTICLES = " + JSON.stringify(articles, null, 2) + ";\n");
warnings.forEach((w) => console.warn("warning: " + w));
console.log("import-news: wrote " + articles.length + " article(s) to " + path.relative(process.cwd(), output));
