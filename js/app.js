(function () {
  "use strict";
  var I18N = window.FA_I18N, LANGS = window.FA_LANGS, DEFAULT = window.FA_DEFAULT_LANG || "lv";
  var CATS = window.FA_CATEGORIES || [];
  var catBySlug = {};
  CATS.forEach(function (c) { catBySlug[c.slug] = c; });

  // Articles: hand-written (data/articles.js) + imported (data/imported.js). Imported wins on same id.
  var byId = {};
  (window.FA_ARTICLES || []).concat(window.FA_IMPORTED_ARTICLES || []).forEach(function (a) { byId[a.id] = a; });
  var ARTICLES = Object.keys(byId).map(function (k) { return byId[k]; })
    .filter(function (a) { return catBySlug[a.category]; }) // deleting a category hides its content
    .sort(function (a, b) { return b.date.localeCompare(a.date); });
  var MATCHES = (window.FA_MATCHES || []).filter(function (m) {
    return catBySlug[m.category] && (!m.example || window.FA_SHOW_EXAMPLE_MATCHES);
  });
  var SHOW_PARTNERS = window.FA_SHOW_PARTNERS !== false;
  var BANNERS = SHOW_PARTNERS ? (window.FA_BANNERS || []) : [];
  var page = document.body.dataset.page;
  if (page === "partners" && !SHOW_PARTNERS) { location.replace("index.html" + location.search); return; }
  var params = new URLSearchParams(location.search);
  var REL = "sponsored nofollow noopener";
  var LANG = pickLang();
  var ALIASES = window.FA_CATEGORY_ALIASES || {}, REMOVED = window.FA_REMOVED_CATEGORIES || [];
  if (page === "category") {
    var reqCat = params.get("cat") || params.get("game");
    if (ALIASES[reqCat]) { // old URL -> canonical
      params.delete("game"); params.set("cat", ALIASES[reqCat]);
      history.replaceState(null, "", location.pathname + "?" + params.toString());
    } else if (REMOVED.indexOf(reqCat) !== -1) { // removed game -> home with a friendly notice
      location.replace("index.html?notice=removed" + (params.get("lang") ? "&lang=" + encodeURIComponent(params.get("lang")) : ""));
      return;
    }
  }
  var homeFilter = "";

  // ---------- language ----------
  function valid(code) { return LANGS.some(function (l) { return l.code === code; }); }
  function pickLang() {
    var q = (params.get("lang") || "").toLowerCase();
    if (valid(q)) { store(q); return q; }
    try { var s = localStorage.getItem("fa-lang"); if (valid(s)) return s; } catch (e) {}
    return DEFAULT;
  }
  function store(code) { try { localStorage.setItem("fa-lang", code); } catch (e) {} }
  function setLang(code) {
    if (!valid(code) || code === LANG) return;
    LANG = code; store(code);
    var p = new URLSearchParams(location.search); p.set("lang", code);
    history.replaceState(null, "", location.pathname + "?" + p.toString() + location.hash);
    render();
    var btn = document.querySelector('.lang-switch [data-lang="' + code + '"]');
    if (btn) btn.focus();
  }
  function locale() { return (LANGS.find(function (l) { return l.code === LANG; }) || {}).locale || LANG; }
  // Localized value with fallback: current language -> lv -> any available.
  function loc(v) {
    if (v == null) return { v: "", lang: LANG };
    if (typeof v !== "object" || Array.isArray(v)) return { v: v, lang: LANG };
    if (v[LANG] != null && v[LANG] !== "" && !(Array.isArray(v[LANG]) && !v[LANG].length)) return { v: v[LANG], lang: LANG };
    if (v[DEFAULT] != null && v[DEFAULT] !== "") return { v: v[DEFAULT], lang: DEFAULT };
    var k = Object.keys(v).find(function (x) { return v[x] != null && v[x] !== ""; });
    return k ? { v: v[k], lang: k } : { v: "", lang: LANG };
  }
  function L(v) { return loc(v).v; }
  function t(key, vars) {
    var s = I18N[LANG][key] != null ? I18N[LANG][key] : I18N[DEFAULT][key];
    if (typeof s === "string" && vars) s = s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ""; });
    return s;
  }

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function cat(slug) { return catBySlug[slug] || { slug: slug, name: slug, color: "#00f0ff" }; }
  function cname(c) { return L(c.name); }
  function cshort(c) { return L(c.short || c.name); }
  function children(slug) { return CATS.filter(function (c) { return (c.parent || null) === (slug || null); }); }
  function ancestors(slug) { var out = [], c = catBySlug[slug]; while (c) { out.unshift(c); c = catBySlug[c.parent]; } return out; }
  function descendants(slug) { var out = [slug]; children(slug).forEach(function (c) { out = out.concat(descendants(c.slug)); }); return out; }
  function inCat(item, slug) { return descendants(slug).indexOf(item.category) !== -1; }
  function catUrl(slug) { return "category.html?cat=" + encodeURIComponent(slug); }
  function isExample(a) { return a.example || (a.tags || []).some(function (x) { return String(x).toLowerCase() === "example"; }); }
  function fmtDate(d) {
    return new Date(d + (d.length === 10 ? "T12:00:00Z" : "")).toLocaleDateString(locale(), { year: "numeric", month: "long", day: "numeric" });
  }
  function fmtMatch(d) {
    return new Date(d).toLocaleString(locale(), { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function langName(code) { return (t("langNames") || {})[code] || code; }
  function extLink(href, text, rel) {
    return '<a href="' + esc(href) + '" target="_blank" rel="' + rel + '">' + text + ' <span class="sr-only">(' + esc(t("opensNewTab")) + ")</span></a>";
  }

  // Section cover art (assets/covers/*, set per category in css/styles.css); dark gradient fallback.
  function cover(a, big) {
    var c = cat(a.category);
    return '<div class="cover' + (big ? " cover-big" : "") + '" data-cat="' + esc(c.slug) + '" style="--game:' + c.color + '" aria-hidden="true">' +
      '<span class="cover-label">' + esc(cshort(c).toUpperCase()) + "</span></div>";
  }
  function badgeText(c) {
    var p = catBySlug[c.parent];
    return esc(p && p.parent ? cshort(p) + " · " + cshort(c) : cshort(c));
  }
  function badge(slug, isStatic) {
    var c = cat(slug);
    return isStatic
      ? '<span class="badge static" style="--game:' + c.color + '">' + badgeText(c) + "</span>"
      : '<a class="badge" style="--game:' + c.color + '" href="' + catUrl(c.slug) + '">' + badgeText(c) + "</a>";
  }
  function fallbackTag(lang) {
    return lang !== LANG ? '<span class="fallback-tag" title="' + esc(t("fallbackNote", { lang: langName(lang) })) + '">' +
      esc(t("fallbackShort")) + " · " + lang.toUpperCase() + "</span>" : "";
  }
  function card(a) {
    var title = loc(a.title), summary = loc(a.summary);
    var src = a.sources && a.sources[0] ? " · " + esc(a.sources[0].name) : "";
    return '<article class="card">' + cover(a) +
      '<div class="card-body">' + badge(a.category) +
      '<h3><a class="stretched" href="article.html?id=' + encodeURIComponent(a.id) + '"' + (title.lang !== LANG ? ' lang="' + title.lang + '"' : "") + ">" + esc(title.v) + "</a></h3>" +
      "<p" + (summary.lang !== LANG ? ' lang="' + summary.lang + '"' : "") + ">" + esc(summary.v) + "</p>" +
      '<p class="meta"><time datetime="' + a.date + '">' + fmtDate(a.date) + "</time>" + src + "</p>" +
      fallbackTag(title.lang) +
      (isExample(a) ? '<span class="example-tag">' + esc(t("exampleTag")) + "</span>" : "") + "</div></article>";
  }

  // ---------- partner banners ----------
  function bannerHTML(b) {
    var wh = (b.size || "").split("x"), w = parseInt(wh[0], 10), h = parseInt(wh[1], 10);
    var dims = w && h ? ' width="' + w + '" height="' + h + '" style="max-width:' + w + 'px"' : "";
    return '<figure class="partner-banner">' +
      '<a href="' + esc(b.href) + '" target="_blank" rel="' + REL + '">' +
      '<img src="' + esc(L(b.image)) + '" alt="' + esc(L(b.alt)) + '"' + dims + ' loading="lazy"></a>' +
      '<figcaption class="aff-label">' + esc(t("partnerLabel")) + "</figcaption></figure>";
  }
  function bannersFor(placement) { return BANNERS.filter(function (b) { return (b.placements || []).indexOf(placement) !== -1; }); }
  function fillSlots() {
    document.querySelectorAll(".ad-slot[data-placement]").forEach(function (slot) {
      var list = bannersFor(slot.dataset.placement);
      if (!list.length) { slot.hidden = true; return; }
      slot.setAttribute("role", "complementary");
      slot.setAttribute("aria-label", t("partnerBanner"));
      slot.innerHTML = bannerHTML(list[0]);
    });
  }

  function renderGrid(list) {
    var el = $("news-grid"); if (!el) return;
    if (!list.length) { el.innerHTML = '<p class="empty">' + esc(t("noArticles")) + "</p>"; return; }
    var feed = page === "article" ? [] : bannersFor("in-feed");
    el.innerHTML = list.map(function (a, i) {
      var html = card(a);
      if (feed.length && i === 2 && list.length > 3) {
        html += '<div class="in-feed" role="complementary" aria-label="' + esc(t("partnerBanner")) + '">' + bannerHTML(feed[0]) + "</div>";
      }
      return html;
    }).join("");
  }
  function renderMatches(filter) {
    var box = $("matches-box"), el = $("matches"); if (!el) return;
    var list = MATCHES.filter(function (m) { return !filter || inCat(m, filter); })
      .sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(0, 6);
    if (!MATCHES.length) { box.hidden = true; return; }
    box.hidden = false;
    var anyExample = list.some(function (m) { return m.example; });
    el.innerHTML = list.length ? list.map(function (m) {
      var c = cat(m.category);
      return '<li class="match" style="--game:' + c.color + '">' +
        '<span class="match-game">' + badgeText(c) + "</span>" +
        '<span class="match-event">' + esc(L(m.event)) + "</span>" +
        '<span class="match-teams">' + esc(L(m.teamA)) + (m.teamB ? ' <span class="vs">' + esc(t("vs")) + "</span> " + esc(L(m.teamB)) : "") + "</span>" +
        '<time datetime="' + m.date + '">' + fmtMatch(m.date) + "</time></li>";
    }).join("") + (anyExample ? '<li class="match-note">' + esc(t("exampleSchedule")) + "</li>" : "")
      : '<li class="match-note">' + esc(t("noMatches")) + "</li>";
  }

  // ---------- header / nav / footer ----------
  function currentCat() {
    if (page === "category") return params.get("cat") || params.get("game");
    if (page === "article") { var a = byId[params.get("id")]; return a ? a.category : null; }
    if (page === "virsliga") return "cs2-latvia";
    return null;
  }
  function renderHeader() {
    var cur = currentCat();
    var trail = cur ? ancestors(cur).map(function (c) { return c.slug; }) : [];
    // Menu labels can differ from the category page headings (t("nav")[slug]).
    var NAV = t("nav") || {};
    function navLabel(c) { return (NAV[c.slug]) || cname(c); }
    function navLink(c) {
      var attrs = c.slug === cur && page === "category" ? ' aria-current="page"' : "";
      return '<a class="' + (trail.indexOf(c.slug) !== -1 ? "active" : "") + '" href="' + catUrl(c.slug) + '"' + attrs + ">" + esc(navLabel(c)) + "</a>";
    }
    function subList(slug, depth) {
      var kids = children(slug); if (!kids.length) return "";
      return '<ul class="' + (depth === 1 ? "submenu" : "submenu-nested") + '"' + (depth === 1 ? ' id="sub-' + slug + '"' : "") + ">" +
        (depth === 1 ? '<li><a class="sub-all" href="' + catUrl(slug) + '">' + esc(navLabel(cat(slug))) + "</a></li>" : "") +
        kids.map(function (k) { return "<li>" + navLink(k) + subList(k.slug, depth + 1) + "</li>"; }).join("") + "</ul>";
    }
    function isPage(pg) { return page === pg || (pg === "server" && page === "server-top"); }
    function plainA(href, label, pg) { return '<a href="' + href + '"' + (isPage(pg) ? ' aria-current="page"' : "") + ">" + esc(label) + "</a>"; }
    function plain(href, key, pg) { return "<li>" + plainA(href, t(key), pg) + "</li>"; }
    // Top level: one "CS2" dropdown (all categories + Warmup server) and "About".
    var CS2_ORDER = ["cs2-majors", "cs2-latvia", "cs2"];
    var cs2Cats = CATS.filter(function (c) { return !c.parent; }).sort(function (a, b) {
      var ia = CS2_ORDER.indexOf(a.slug), ib = CS2_ORDER.indexOf(b.slug);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    var cs2Active = !!cur || isPage("server");
    var cs2Items = cs2Cats.map(function (c) { return "<li>" + navLink(c) + subList(c.slug, 2) + "</li>"; }).join("") +
      "<li>" + plainA("server.html", NAV.server || t("server"), "server") + "</li>";
    var items = '<li class="has-sub"><button type="button" class="sub-toggle' + (cs2Active ? " active" : "") +
        '" aria-expanded="false" aria-controls="sub-cs2-menu">' + esc(NAV.top || "CS2") +
        ' <span class="caret" aria-hidden="true"></span></button><ul class="submenu" id="sub-cs2-menu">' + cs2Items + "</ul></li>" +
      plain("tournaments.html", "tournaments", "tournaments") +
      (SHOW_PARTNERS ? plain("partners.html", "partners", "partners") : "") + plain("about.html", "about", "about");
    var langs = '<div class="lang-switch" role="group" aria-label="' + esc(t("language")) + '">' +
      LANGS.map(function (l) {
        return '<button type="button" data-lang="' + l.code + '" lang="' + l.code + '" aria-pressed="' + (l.code === LANG) +
          '" aria-label="' + esc(l.name) + '">' + l.label + "</button>";
      }).join("") + "</div>";
    $("site-header").innerHTML =
      '<div class="container header-inner">' +
      '<a class="brand" href="index.html" aria-label="FlowAthletiq — ' + esc(t("home")) + '"><span class="brand-mark"><picture><source srcset="assets/logo.webp?v=2" type="image/webp">' +
      '<img class="brand-logo" src="assets/logo.png?v=2" alt="FlowAthletiq" width="480" height="242"></picture><span class="logo-eye" aria-hidden="true"><i class="glow"></i><i class="lid"></i></span></span></a>' +
      '<nav id="primary-nav" class="nav" aria-label="' + esc(t("primaryNav")) + '"><ul class="nav-list">' + items + "</ul></nav>" +
      langs +
      '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="primary-nav"><span class="sr-only">' + esc(t("menu")) +
      '</span><span class="bars" aria-hidden="true"></span></button></div>';
  }
  function renderFooter() {
    $("site-footer").innerHTML =
      '<div class="container footer-inner">' +
      '<div><a class="brand" href="index.html"><span class="brand-mark"><picture><source srcset="assets/logo.webp?v=2" type="image/webp"><img class="brand-logo" src="assets/logo.png?v=2" alt="FlowAthletiq" width="480" height="242" loading="lazy"></picture><span class="logo-eye" aria-hidden="true"><i class="glow"></i><i class="lid"></i></span></span></a>' +
      "<p>" + esc(t("footerTag")) + "</p></div>" +
      '<ul class="footer-links">' + CATS.filter(function (c) { return !c.parent; }).map(function (c) {
        return '<li><a href="' + catUrl(c.slug) + '">' + esc(cname(c)) + "</a></li>"; }).join("") +
      '<li><a href="server.html">' + esc(t("server")) + '</a></li><li><a href="tournaments.html">' + esc(t("tournaments")) + '</a></li>' + (SHOW_PARTNERS ? '<li><a href="partners.html">' + esc(t("partners")) + '</a></li>' : "") + '<li><a href="about.html">' + esc(t("about")) + "</a></li>" +
        '<li><a class="footer-discord" href="' + DISCORD_URL + '" target="_blank" rel="noopener"><img src="assets/brand/discord/Discord-Symbol-White.svg" alt="" width="18" height="14">Discord<span class="sr-only"> (' + esc(t("discordNew")) + ")</span></a></li></ul>" +
      (SHOW_PARTNERS ? '<p class="footer-disclosure">' + t("footerDisclosure") + "</p>" : "") +
      '<p class="copy">© ' + new Date().getFullYear() + " FlowAthletiq · flowathletiq.com</p></div>";
  }

  // ---------- pages ----------
  function renderNotice() {
    var n = $("notice");
    if (params.get("notice") !== "removed") { if (n) n.remove(); return; }
    if (!n) {
      n = document.createElement("div"); n.id = "notice"; n.className = "container notice"; n.setAttribute("role", "status");
      $("main").insertBefore(n, $("main").firstChild);
    }
    n.innerHTML = "<p>" + esc(t("removedNotice")) + '</p><button type="button" class="notice-close">' + esc(t("dismiss")) + "</button>";
  }
  function renderIndex() {
    renderNotice();
    var featured = ARTICLES.find(function (a) { return a.featured; }) || ARTICLES[0];
    var hero = $("hero");
    if (featured) {
      var ft = loc(featured.title), fs = loc(featured.summary);
      hero.hidden = false;
      hero.innerHTML = '<a class="hero-card" href="article.html?id=' + encodeURIComponent(featured.id) + '">' + cover(featured, true) +
        '<div class="hero-text"><span class="kicker">' + esc(t("topStory")) + "</span>" + badge(featured.category, true) +
        "<h1" + (ft.lang !== LANG ? ' lang="' + ft.lang + '"' : "") + ">" + esc(ft.v) + "</h1><p>" + esc(fs.v) + "</p>" +
        '<span class="meta">' + fmtDate(featured.date) + (featured.sources && featured.sources[0] ? " · " + esc(featured.sources[0].name) : "") +
        (isExample(featured) ? ' · <span class="example-tag">' + esc(t("exampleTag")) + "</span>" : "") + "</span>" +
        fallbackTag(ft.lang) + '<span class="btn">' + esc(t("readStory")) + "</span></div></a>";
    } else hero.hidden = true;
    var rest = ARTICLES.filter(function (a) { return a !== featured; });
    var opts = [{ slug: "", label: t("all") }];
    CATS.filter(function (c) { return !c.parent; }).forEach(function (c) {
      opts.push({ slug: c.slug, label: cshort(c) });
      children(c.slug).forEach(function (k) { opts.push({ slug: k.slug, label: cshort(k) }); });
    });
    // Hide filters that would show nothing (except "All").
    opts = opts.filter(function (o) { return !o.slug || rest.some(function (a) { return inCat(a, o.slug); }); });
    if (!opts.some(function (o) { return o.slug === homeFilter; })) homeFilter = "";
    $("filters").innerHTML = opts.map(function (o) {
      return '<button type="button" data-cat="' + o.slug + '" aria-pressed="' + (o.slug === homeFilter) + '">' + esc(o.label) + "</button>";
    }).join("");
    renderGrid(rest.filter(function (a) { return !homeFilter || inCat(a, homeFilter); }));
    renderMatches();
  }
  function renderCategory() {
    var c = catBySlug[currentCat()], hero = $("cat-hero");
    if (!c) {
      document.title = t("catNotFound") + " — FlowAthletiq";
      hero.innerHTML = "<h1>" + esc(t("catNotFound")) + '</h1><p><a href="index.html">' + esc(t("backHome")) + "</a></p>";
      $("cat-latest-h").textContent = t("articles");
      renderGrid([]); renderMatches(); return;
    }
    document.title = cname(c) + " — FlowAthletiq";
    hero.style.setProperty("--game", c.color);
    var kids = children(c.slug);
    hero.innerHTML =
      '<nav class="crumbs" aria-label="' + esc(t("breadcrumb")) + '"><a href="index.html">' + esc(t("home")) + "</a>" +
      ancestors(c.slug).slice(0, -1).map(function (x) { return ' / <a href="' + catUrl(x.slug) + '">' + esc(cname(x)) + "</a>"; }).join("") + "</nav>" +
      '<span class="kicker">' + (c.parent ? esc(cname(cat(c.parent))) + " · " : "") + esc(kids.length ? t("category") : t("subcategory")) + "</span>" +
      "<h1>" + esc(cname(c)) + "</h1><p>" + esc(L(c.description)) + "</p>" +
      (kids.length ? '<ul class="subcats" aria-label="' + esc(t("subcategories")) + '">' + kids.map(function (k) {
        return '<li><a style="--game:' + k.color + '" href="' + catUrl(k.slug) + '">' + esc(cname(k)) + "</a></li>"; }).join("") + "</ul>" : "");
    $("cat-latest-h").textContent = kids.length ? t("allArticles", { name: cname(c) }) : t("articles");
    renderGrid(ARTICLES.filter(function (a) { return inCat(a, c.slug); }));
    renderMatches(c.slug);
  }
  function renderArticle() {
    var a = byId[params.get("id")], el = $("article");
    if (!a || !catBySlug[a.category]) {
      document.title = t("artNotFound") + " — FlowAthletiq";
      el.innerHTML = "<h1>" + esc(t("artNotFound")) + "</h1><p>" + esc(t("artMoved")) + ' <a href="index.html">' + esc(t("backHome")) + "</a>.</p>";
      renderGrid(ARTICLES.slice(0, 3)); renderMatches(); return;
    }
    var title = loc(a.title), body = loc(a.body), summary = loc(a.summary);
    document.title = title.v + " — FlowAthletiq";
    var paras = body.v || [];
    if (typeof paras === "string") paras = paras.split(/\n\s*\n/);
    var bodyHtml = paras.map(function (p) {
      if (p.indexOf("## ") === 0) return "<h2>" + esc(p.slice(3)) + "</h2>";
      if (p.indexOf("> ") === 0) return "<blockquote>" + esc(p.slice(2)) + "</blockquote>";
      return "<p>" + esc(p) + "</p>";
    }).join("");
    var fbLang = title.lang !== LANG ? title.lang : body.lang !== LANG ? body.lang : null;
    var feedB = bannersFor("in-feed");
    var sources = a.sources || [];
    el.innerHTML = '<nav class="crumbs" aria-label="' + esc(t("breadcrumb")) + '"><a href="index.html">' + esc(t("home")) + "</a>" +
      ancestors(a.category).map(function (x) { return ' / <a href="' + catUrl(x.slug) + '">' + esc(cname(x)) + "</a>"; }).join("") + "</nav>" +
      badge(a.category) +
      "<h1" + (title.lang !== LANG ? ' lang="' + title.lang + '"' : "") + ">" + esc(title.v) + "</h1>" +
      (summary.v ? '<p class="lead"' + (summary.lang !== LANG ? ' lang="' + summary.lang + '"' : "") + ">" + esc(summary.v) + "</p>" : "") +
      '<p class="meta">' + esc(t("by", { name: L(a.author) || "FlowAthletiq" })) + ' · <time datetime="' + a.date + '">' + fmtDate(a.date) + "</time></p>" +
      (fbLang ? '<p class="fallback-note" role="note">' + esc(t("fallbackNote", { lang: langName(fbLang) })) + "</p>" : "") +
      cover(a, true) +
      (isExample(a) ? '<div class="example-note" role="note">' + t("exampleNote") + "</div>" : "") +
      '<div class="prose"' + (body.lang !== LANG ? ' lang="' + body.lang + '"' : "") + ">" + bodyHtml + "</div>" +
      (sources.length ? '<section class="sources" aria-labelledby="sources-h"><h2 id="sources-h">' + esc(t("sources")) + "</h2><ul>" +
        sources.map(function (s) { return "<li>" + extLink(s.url, esc(s.name), "noopener noreferrer") + '<span class="src-host">' + esc(hostOf(s.url)) + "</span></li>"; }).join("") +
        "</ul></section>" : "") +
      (feedB.length ? '<div class="in-article" role="complementary" aria-label="' + esc(t("partnerBanner")) + '">' + bannerHTML(feedB[0]) + "</div>" : "") +
      '<ul class="tags">' + (a.tags || []).map(function (x) { return "<li>#" + esc(x) + "</li>"; }).join("") + "</ul>";
    var top = ancestors(a.category)[0].slug;
    var related = ARTICLES.filter(function (x) { return x.id !== a.id && x.category === a.category; })
      .concat(ARTICLES.filter(function (x) { return x.id !== a.id && x.category !== a.category && inCat(x, top); }))
      .concat(ARTICLES.filter(function (x) { return x.id !== a.id && !inCat(x, top); }));
    renderGrid(related.slice(0, 3));
    renderMatches(top);
  }
  function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } }
  function renderPartners() {
    $("partner-list").innerHTML = BANNERS.length ? BANNERS.map(function (b) {
      var pl = (b.placements || []).map(function (p) { return (t("placementNames") || {})[p] || p; }).join(", ") || t("placementNames").none;
      return '<section class="partner-item">' + bannerHTML(b) +
        '<div class="partner-meta"><h2>' + esc(L(b.label)) + "</h2>" +
        '<p class="meta">' + esc(t("size", { s: b.size || "—" })) + " · " + esc(t("placementsLabel", { p: pl })) + "</p>" +
        '<a class="btn" href="' + esc(b.href) + '" target="_blank" rel="' + REL + '">' + esc(t("visitPartner")) +
        ' <span class="sr-only">' + esc(t("newTab")) + "</span>↗</a></div></section>";
    }).join("") : '<p class="empty">' + esc(t("noPartners")) + "</p>";
  }
  var DISCORD_URL = "https://discord.gg/xMrxBh8FzU";
  function renderAbout() {
    $("about").innerHTML =
      '<section class="discord-block" aria-labelledby="dc-h"><h1 id="dc-h">' + esc(t("discordTitle")) + "</h1><p>" + esc(t("discordText")) + "</p>" +
      '<a class="dc-banner" href="' + DISCORD_URL + '" target="_blank" rel="noopener" aria-label="' + esc(t("discordCta") + " (" + t("discordNew") + ")") + '">' +
      '<picture><source type="image/webp" srcset="assets/discord/discord-banner-640.webp 640w, assets/discord/discord-banner.webp 1280w" sizes="(max-width: 760px) 100vw, 1000px">' +
      '<img class="dc-img" src="assets/discord/discord-banner.jpg" srcset="assets/discord/discord-banner-640.jpg 640w, assets/discord/discord-banner.jpg 1280w" sizes="(max-width: 760px) 100vw, 1000px" alt="" width="1280" height="720" loading="lazy"></picture>' +
      '<span class="dc-pill" aria-hidden="true"><img src="assets/brand/discord/Discord-Symbol-White.svg" alt="" width="40" height="30">' +
      '<span>' + esc(t("discordCta")) + '</span><span class="dc-arrow">↗</span></span></a>' +
      '<p class="dc-tm">' + esc(t("discordTm")) + "</p></section>" +
      '<p class="privacy-note">' + esc(t("analyticsNote")) + "</p>";
  }


  // ---------- tournaments (data/tournaments.js) ----------
  var TOURS = (window.FA_TOURNAMENTS || []).slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  // Registered teams: tournament-teams.json on the server-data branch (scripts/faceit_teams.py, official FACEIT Data API),
  // fallback data/tournament-teams.json. If neither exists the list is simply not shown.
  var TEAMS_RAW = "https://raw.githubusercontent.com/vilovx/flowathletiq/server-data/tournament-teams.json";
  var TEAMS = null, teamsStarted = false;
  function loadTeams() {
    if (teamsStarted) return; teamsStarted = true;
    function get(u) { return fetch(u + "?t=" + Date.now(), { cache: "no-store" }).then(function (r) { if (!r.ok) throw r.status; return r.json(); }); }
    function go() {
      get(TEAMS_RAW).catch(function () { return get("data/tournament-teams.json"); })
        .then(function (d) { TEAMS = (d && d.tournaments) ? d : null; }, function () {})
        .then(function () { if (page === "tournaments") renderTournaments(); if (page === "index") renderTourTeaser(); });
    }
    go(); setInterval(go, 5 * 60000);
  }
  function teamsFor(x) { return TEAMS && TEAMS.tournaments[x.id] || null; }
  function regCount(x) { var d = teamsFor(x); return d ? d.teams.length + "/" + (d.slots || x.teams) : ""; }
  function initials(n) { return String(n || "?").replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2).toUpperCase() || "?"; }
  function teamsHTML(x) {
    var d = teamsFor(x); if (!d) return "";
    var T = t("tour"), slots = d.slots || x.teams, n = d.teams.length;
    var pct = Math.min(100, Math.round(n / slots * 100));
    function nick(p) {
      var lvl = p.skillLevel ? ' <span class="tt-lvl" title="FACEIT level ' + esc(p.skillLevel) + '">' + esc(p.skillLevel) + "</span>" : "";
      var inner = esc(p.nickname) + lvl;
      return "<li>" + (p.faceitUrl ? '<a href="' + esc(p.faceitUrl) + '" target="_blank" rel="noopener">' + inner + "</a>" : inner) + "</li>";
    }
    var list = d.teams.map(function (tm, i) {
      var av = tm.avatar
        ? '<img class="tt-av" src="' + esc(tm.avatar) + '" alt="" width="44" height="44" loading="lazy" referrerpolicy="no-referrer">'
        : '<span class="tt-av tt-av-x" aria-hidden="true">' + esc(initials(tm.name)) + "</span>";
      var name = tm.faceitUrl ? '<a href="' + esc(tm.faceitUrl) + '" target="_blank" rel="noopener" title="' + esc(T.regOnFaceit) + '">' + esc(tm.name) + "</a>" : esc(tm.name);
      return '<li class="tt-team"><span class="tt-n">' + (i + 1) + "</span>" + av + '<div class="tt-body"><strong class="tt-name">' + name + "</strong>" +
        ((tm.players || []).length || (tm.substitutes || []).length ? '<ul class="tt-players">' + (tm.players || []).map(nick).join("") +
          (tm.substitutes || []).map(function (p) { return nick(p).replace("</li>", ' <span class="tt-sub">(' + esc(T.regSubs) + ")</span></li>"); }).join("") + "</ul>" : "") +
        "</div></li>";
    }).join("");
    var upd = d.fetchedAt || (TEAMS && TEAMS.updated);
    var updTxt = upd ? new Date(upd).toLocaleString(locale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Riga" }) : "";
    return '<section class="tour-teams" aria-labelledby="tt-h-' + esc(x.id) + '">' +
      '<div class="tt-head"><h3 id="tt-h-' + esc(x.id) + '">' + esc(T.regTeams) + '</h3><span class="tt-count"><strong>' + n + "</strong>/" + esc(slots) + "</span></div>" +
      '<div class="tt-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + esc(slots) + '" aria-valuenow="' + n + '" aria-label="' + esc(T.regTeams) + '"><span style="width:' + pct + '%"></span></div>' +
      (n ? '<ol class="tt-list">' + list + "</ol>" : '<p class="tt-empty">' + esc(T.regEmpty) + "</p>") +
      (updTxt ? '<p class="tt-upd">' + esc(T.regUpdated.replace("{t}", updTxt)) + "</p>" : "") + "</section>";
  }
  function upcomingTours() { var d = todayStr(); return TOURS.filter(function (x) { return x.status !== "finished" && x.date >= d; }); }
  function tourStatus(x) {
    var T = t("tour"), st = x.status === "finished" || x.date < todayStr() ? "finished" : x.status === "open" ? "open" : "soon";
    var label = st === "open" ? T.statusOpen : st === "finished" ? T.statusFinished : T.statusSoon;
    return '<span class="tour-status is-' + st + '">' + esc(label) + "</span>";
  }
  function tourTime(x) { var T = t("tour"); return x.time ? esc(x.time) + ' <span class="tour-tz">(' + esc(T.tz) + ")</span>" : esc(T.tba); }
  function tourCard(x) {
    var T = t("tour"), past = x.status === "finished" || x.date < todayStr();
    function row(k, v) { return "<div><dt>" + esc(k) + "</dt><dd>" + v + "</dd></div>"; }
    function prizeRow(k, txt) {
      var m = String(txt).match(/^(.*?[.!?])\s+([\s\S]+)$/);
      return '<div class="tour-prize"><dt>' + esc(k) + "</dt><dd>" + (m ? "<strong>" + esc(m[1]) + '</strong> <span>' + esc(m[2]) + "</span>" : esc(txt)) + "</dd></div>";
    }
    var series = x.series === "BO3" ? T.seriesBo3 : x.series;
    var fmt = esc(x.format) + (x.bracket === "single" ? " · " + esc(T.bracketSingle) : "");
    return '<article class="tour-card" id="' + esc(x.id) + '">' +
      '<div class="tour-head">' + tourStatus(x) + "<h2>" + esc(L(x.name)) + "</h2>" +
      '<p class="tour-when"><time datetime="' + esc(x.date) + '">' + fmtDate(x.date) + "</time> · " + esc(T.time) + ": " + tourTime(x) + "</p></div>" +
      '<dl class="tour-facts">' +
        row(T.format, fmt) +
        row(T.series, esc(series)) +
        row(T.maps, (x.maps || []).map(function (m) { return '<span class="tour-map">' + esc(m) + "</span>"; }).join(" ")) +
        row(T.teams, esc(t("tour").teamsN.replace("{n}", x.teams))) +
        row(T.platform, esc(x.platform)) +
        row(T.region, esc(x.region)) +
        (x.prize ? prizeRow(T.prize, L(x.prize)) : "") +
      "</dl>" +
      '<p class="tour-elig">' + esc(T.eligibility) + "</p>" +
      (!past && x.registerUrl ? '<div class="tour-actions"><a class="btn tour-register" href="' + esc(x.registerUrl) + '" target="_blank" rel="noopener">' +
        esc(T.register) + ' <span aria-hidden="true">↗</span><span class="sr-only"> (' + esc(t("discordNew")) + ")</span></a>" +
        (x.introFormUrl ? '<a class="btn-ghost tour-intro-btn" href="' + esc(x.introFormUrl) + '" target="_blank" rel="noopener">' +
          esc(T.introCta) + ' <span aria-hidden="true">↗</span><span class="sr-only"> (' + esc(t("discordNew")) + ")</span></a>" : "") + "</div>" : "") +
      (!past ? teamsHTML(x) : "") +
      "</article>";
  }
  function renderTournaments() {
    var T = t("tour"), up = upcomingTours(), past = TOURS.filter(function (x) { return up.indexOf(x) === -1; }).reverse();
    $("tournaments-root").innerHTML =
      '<nav class="crumbs" aria-label="' + esc(t("breadcrumb")) + '"><a href="index.html">' + esc(t("home")) + "</a></nav>" +
      '<span class="kicker">' + esc(T.kicker) + "</span><h1>" + esc(T.title) + '</h1><p class="lead">' + esc(T.lead) + "</p>" +
      '<section aria-labelledby="tour-up-h"><h2 id="tour-up-h" class="sr-only">' + esc(T.upcoming) + "</h2>" +
      (up.length ? up.map(tourCard).join("") : '<p class="empty">' + esc(T.none) + "</p>") + "</section>" +
      '<div class="tour-discord"><img src="assets/brand/discord/Discord-Symbol-White.svg" alt="" width="32" height="24"><p>' + esc(T.discord) + "</p>" +
      '<a class="btn-ghost" href="' + DISCORD_URL + '" target="_blank" rel="noopener">' + esc(T.discordCta) + ' <span aria-hidden="true">↗</span><span class="sr-only"> (' + esc(t("discordNew")) + ")</span></a></div>" +
      (past.length ? '<section aria-labelledby="tour-past-h"><h2 id="tour-past-h">' + esc(T.past) + "</h2>" + past.map(tourCard).join("") + "</section>" : "") +
      '<p class="dc-tm">' + esc(T.faceitNote) + "</p>";
  }
  function renderTourTeaser() {
    var box = $("tour-teaser"); if (!box) return;
    var x = upcomingTours()[0];
    if (!x) { box.hidden = true; return; }
    var T = t("tour");
    box.hidden = false;
    box.innerHTML = '<span class="kicker">' + esc(T.teaserKicker) + "</span>" +
      '<h2 id="tour-teaser-h">' + esc(L(x.name)) + "</h2>" +
      '<p class="tour-teaser-when"><time datetime="' + esc(x.date) + '">' + fmtDate(x.date) + "</time> · " + esc(T.time) + ": " + tourTime(x) + "</p>" +
      '<p class="tour-teaser-facts">' + esc(x.format) + " · " + esc(x.series) + " · " + esc(T.teamsN.replace("{n}", x.teams)) + " · " + esc(x.platform) + "</p>" +
      (teamsFor(x) ? '<p class="tour-teaser-reg">' + esc(T.regTeams) + ": <strong>" + esc(regCount(x)) + "</strong></p>" : "") +
      '<a class="btn" href="tournaments.html#' + esc(x.id) + '">' + esc(x.status === "open" ? T.statusOpen : T.teaserMore) + " →</a>";
  }

  // ---------- sidebar promo (data/promo.js) ----------
  function renderPromo() {
    var box = $("promo-box"), P = window.FA_PROMO;
    if (!box) return;
    if (!P || !P.url) { box.hidden = true; return; }
    var T = t("promo") || {}, code = esc(P.code || "");
    var text = esc(T.text || "").replace(esc("{code}"), "<strong>" + code + "</strong>").replace("{code}", "<strong>" + code + "</strong>");
    box.hidden = false;
    box.innerHTML = '<span class="promo-label">' + esc(T.label) + "</span>" +
      '<h2 class="promo-brand" id="promo-h">' + esc(P.brand) + "</h2>" +
      '<p class="promo-text">' + text + "</p>" +
      (P.code ? '<div class="promo-code"><code aria-label="' + esc(T.codeLabel) + '">' + code + "</code>" +
        '<button type="button" class="promo-copy" data-code="' + code + '" aria-label="' + esc((T.copyAria || "").replace("{code}", P.code)) + '">' +
        '<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15"><rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
        '<span class="promo-copy-t">' + esc(T.copy) + "</span></button></div>" +
        '<span class="promo-status" role="status" aria-live="polite"></span>' : "") +
      '<a class="btn promo-cta" href="' + esc(P.url) + '" target="_blank" rel="sponsored noopener">' + esc(T.cta) +
        ' <span aria-hidden="true">↗</span><span class="sr-only"> (' + esc(t("discordNew")) + ")</span></a>" +
      '<p class="promo-disc">' + esc(T.disclosure) + "</p>";
  }
  function copyText(txt) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt);
    return new Promise(function (ok, fail) {
      var ta = document.createElement("textarea"); ta.value = txt; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? ok() : fail(); } catch (e) { fail(e); } finally { ta.remove(); }
    });
  }

  function render() {
    document.documentElement.lang = LANG;
    var titles = t("titles");
    document.title = titles[page] || "FlowAthletiq";
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute("content", page === "about" ? t("discordText") : t("metaDesc"));
    document.querySelectorAll("[data-i18n]").forEach(function (e) { e.textContent = t(e.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach(function (e) { e.innerHTML = t(e.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-label]").forEach(function (e) { e.setAttribute("aria-label", t(e.dataset.i18nLabel)); });
    var eb = $("example-banner");
    var showEx = ARTICLES.some(isExample);
    eb.hidden = !showEx; eb.textContent = showEx ? t("exampleBanner") : "";
    renderHeader();
    renderFooter();
    if (page === "index") renderIndex();
    if (page === "category") renderCategory();
    if (page === "article") renderArticle();
    if (page === "partners") renderPartners();
    if (page === "about") renderAbout();
    if (page === "tournaments") renderTournaments();
    renderPromo();
    if (page === "index") renderTourTeaser();
    // Only fetch once a cup is linked to a FACEIT championship (avoids 404 noise before that).
    if ((page === "tournaments" || page === "index") && TOURS.some(function (x) { return x.faceitChampionshipId; })) loadTeams();
    if (window.FA_renderLeagues) window.FA_renderLeagues({ t: t, lang: LANG, locale: locale(), esc: esc,
      show: page === "category" && params.get("cat") === "cs2-latvia" });
    if (window.FA_renderVirsliga) window.FA_renderVirsliga({ t: t, lang: LANG, locale: locale(), esc: esc,
      showWidget: page === "index" });
    if ((page === "server" || page === "server-top") && window.FA_renderServer) window.FA_renderServer({ t: t, lang: LANG, locale: locale(), esc: esc });
    fillSlots();
  }

  // ---------- events (delegated once; survive re-renders) ----------
  function closeSubs(except) {
    document.querySelectorAll(".sub-toggle").forEach(function (b) {
      if (b !== except) { b.setAttribute("aria-expanded", "false"); b.parentNode.classList.remove("open"); }
    });
  }
  document.addEventListener("click", function (e) {
    var langBtn = e.target.closest(".lang-switch [data-lang]");
    if (langBtn) { setLang(langBtn.dataset.lang); return; }
    var nt = e.target.closest(".nav-toggle");
    if (nt) {
      var open = nt.getAttribute("aria-expanded") === "true";
      nt.setAttribute("aria-expanded", String(!open));
      $("primary-nav").classList.toggle("open", !open);
      return;
    }
    var st = e.target.closest(".sub-toggle");
    if (st) {
      var o = st.getAttribute("aria-expanded") === "true";
      closeSubs(st);
      st.setAttribute("aria-expanded", String(!o));
      st.parentNode.classList.toggle("open", !o);
      return;
    }
    if (!e.target.closest(".has-sub")) closeSubs();
    if (e.target.closest(".notice-close")) {
      params.delete("notice"); var q = params.toString();
      history.replaceState(null, "", location.pathname + (q ? "?" + q : ""));
      renderNotice(); return;
    }
    var pc = e.target.closest(".promo-copy");
    if (pc) {
      var done = function () {
        var T = t("promo") || {}, lbl = pc.querySelector(".promo-copy-t"), st = document.querySelector(".promo-status");
        pc.classList.add("is-copied"); if (lbl) lbl.textContent = T.copied; if (st) st.textContent = T.copied;
        clearTimeout(pc._t); pc._t = setTimeout(function () { pc.classList.remove("is-copied"); if (lbl) lbl.textContent = T.copy; if (st) st.textContent = ""; }, 2000);
      };
      copyText(pc.dataset.code).then(done, function () { var c = pc.parentNode.querySelector("code"); if (c) { var r = document.createRange(); r.selectNodeContents(c); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); } });
      return;
    }
    var fb = e.target.closest("#filters button");
    if (fb) { homeFilter = fb.dataset.cat; renderIndex(); fillSlots(); var nb = document.querySelector('#filters button[data-cat="' + homeFilter + '"]'); if (nb) nb.focus(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openBtn = document.querySelector('.sub-toggle[aria-expanded="true"]');
    closeSubs();
    if (openBtn) openBtn.focus();
  });

  render();
})();
