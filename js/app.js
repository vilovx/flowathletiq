(function () {
  "use strict";
  var CATS = window.FA_CATEGORIES || [];
  var catBySlug = {};
  CATS.forEach(function (c) { catBySlug[c.slug] = c; });
  // Only show content whose category exists (so deleting a category hides its content).
  var ARTICLES = (window.FA_ARTICLES || []).filter(function (a) { return catBySlug[a.category]; })
    .sort(function (a, b) { return b.date.localeCompare(a.date); });
  var MATCHES = (window.FA_MATCHES || []).filter(function (m) { return catBySlug[m.category]; });
  var BANNERS = window.FA_BANNERS || [];
  var page = document.body.dataset.page;
  var params = new URLSearchParams(location.search);
  var REL = "sponsored nofollow noopener";

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function cat(slug) { return catBySlug[slug] || { slug: slug, name: slug, color: "#00f0ff" }; }
  function children(slug) { return CATS.filter(function (c) { return (c.parent || null) === (slug || null); }); }
  function ancestors(slug) { var out = [], c = catBySlug[slug]; while (c) { out.unshift(c); c = catBySlug[c.parent]; } return out; }
  function descendants(slug) { var out = [slug]; children(slug).forEach(function (c) { out = out.concat(descendants(c.slug)); }); return out; }
  function inCat(item, slug) { return descendants(slug).indexOf(item.category) !== -1; }
  function catUrl(slug) { return "category.html?cat=" + encodeURIComponent(slug); }
  function fmtDate(d) {
    return new Date(d + (d.length === 10 ? "T12:00:00Z" : "")).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }
  function fmtMatch(d) {
    return new Date(d).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  // Self-made SVG cover art, generated per article (no external images).
  function cover(a, big) {
    var c = cat(a.category);
    var seed = 0; for (var i = 0; i < a.id.length; i++) seed = (seed * 31 + a.id.charCodeAt(i)) >>> 0;
    var shapes = "";
    for (var k = 0; k < 6; k++) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      var x = seed % 400, y = (seed >> 8) % 225, r = 20 + (seed >> 16) % 70;
      shapes += '<polygon points="' + x + "," + (y - r) + " " + (x + r) + "," + (y + r) + " " + (x - r) + "," + (y + r) +
        '" fill="none" stroke="' + (k % 2 ? c.color : "#00f0ff") + '" stroke-opacity=".35" stroke-width="2"/>';
    }
    return '<div class="cover' + (big ? " cover-big" : "") + '" style="--game:' + c.color + '" aria-hidden="true">' +
      '<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">' + shapes +
      '<text x="20" y="205" class="cover-label">' + esc((c.short || c.name).toUpperCase()) + "</text></svg></div>";
  }
  function badge(slug, isStatic) {
    var c = cat(slug), label = esc(c.short || c.name);
    var parent = catBySlug[c.parent];
    if (parent && parent.parent) label = esc(parent.short || parent.name) + " · " + label; // e.g. CS2 · Majors
    return isStatic
      ? '<span class="badge static" style="--game:' + c.color + '">' + label + "</span>"
      : '<a class="badge" style="--game:' + c.color + '" href="' + catUrl(c.slug) + '">' + label + "</a>";
  }
  function card(a) {
    return '<article class="card">' + cover(a) +
      '<div class="card-body">' + badge(a.category) +
      '<h3><a class="stretched" href="article.html?id=' + encodeURIComponent(a.id) + '">' + esc(a.title) + "</a></h3>" +
      "<p>" + esc(a.excerpt) + "</p>" +
      '<p class="meta"><time datetime="' + a.date + '">' + fmtDate(a.date) + "</time> · " + a.readMinutes + " min read</p>" +
      '<span class="example-tag">Example content</span></div></article>';
  }

  // ---- Partner banners ----
  function bannerHTML(b, extraClass) {
    var wh = (b.size || "").split("x"), w = parseInt(wh[0], 10), h = parseInt(wh[1], 10);
    var dims = w && h ? ' width="' + w + '" height="' + h + '" style="max-width:' + w + 'px"' : "";
    return '<figure class="partner-banner ' + (extraClass || "") + '">' +
      '<a href="' + esc(b.href) + '" target="_blank" rel="' + REL + '">' +
      '<img src="' + esc(b.image) + '" alt="' + esc(b.alt) + '"' + dims + ' loading="lazy"></a>' +
      '<figcaption class="aff-label">Partner / Affiliate link</figcaption></figure>';
  }
  function bannersFor(placement) { return BANNERS.filter(function (b) { return (b.placements || []).indexOf(placement) !== -1; }); }
  function fillSlots() {
    document.querySelectorAll(".ad-slot[data-placement]").forEach(function (slot) {
      var list = bannersFor(slot.dataset.placement);
      if (!list.length) { slot.hidden = true; return; }
      slot.setAttribute("aria-label", "Partner banner");
      slot.setAttribute("role", "complementary");
      slot.innerHTML = bannerHTML(list[0]);
    });
  }

  function renderGrid(list) {
    var el = $("news-grid"); if (!el) return;
    if (!list.length) { el.innerHTML = '<p class="empty">No articles yet in this category.</p>'; return; }
    var feed = page === "article" ? [] : bannersFor("in-feed");
    el.innerHTML = list.map(function (a, i) {
      var html = card(a);
      if (feed.length && i === 2 && list.length > 3) {
        html += '<div class="in-feed" role="complementary" aria-label="Partner banner">' + bannerHTML(feed[0]) + "</div>";
      }
      return html;
    }).join("");
  }
  function renderMatches(filter) {
    var el = $("matches"); if (!el) return;
    var list = MATCHES.filter(function (m) { return !filter || inCat(m, filter); })
      .sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(0, 6);
    el.innerHTML = list.length ? list.map(function (m) {
      var c = cat(m.category);
      return '<li class="match" style="--game:' + c.color + '">' +
        '<span class="match-game">' + badgeText(c) + "</span>" +
        '<span class="match-event">' + esc(m.event) + "</span>" +
        '<span class="match-teams">' + esc(m.teamA) + (m.teamB ? ' <span class="vs">vs</span> ' + esc(m.teamB) : "") + "</span>" +
        '<time datetime="' + m.date + '">' + fmtMatch(m.date) + "</time></li>";
    }).join("") + '<li class="match-note">Example schedule, not real fixtures.</li>'
      : '<li class="match-note">No upcoming matches listed.</li>';
  }
  function badgeText(c) {
    var p = catBySlug[c.parent];
    return esc(p && p.parent ? (p.short || p.name) + " · " + (c.short || c.name) : (c.short || c.name));
  }

  // ---- Header with hierarchical nav ----
  var currentCat = page === "category" ? (params.get("cat") || params.get("game")) : null;
  if (page === "article") {
    var art = ARTICLES.find(function (x) { return x.id === params.get("id"); });
    if (art) currentCat = art.category;
  }
  var activeTrail = currentCat ? ancestors(currentCat).map(function (c) { return c.slug; }) : [];

  function navLink(c, cls) {
    var attrs = c.slug === currentCat && page === "category" ? ' aria-current="page"' : "";
    var active = activeTrail.indexOf(c.slug) !== -1 ? " active" : "";
    return '<a class="' + (cls || "") + active + '" href="' + catUrl(c.slug) + '"' + attrs + ">" + esc(c.name) + "</a>";
  }
  function subList(slug, depth) {
    var kids = children(slug);
    if (!kids.length) return "";
    return '<ul class="' + (depth === 1 ? "submenu" : "submenu-nested") + '"' + (depth === 1 ? ' id="sub-' + slug + '"' : "") + ">" +
      (depth === 1 ? "<li>" + '<a class="sub-all" href="' + catUrl(slug) + '">All ' + esc(cat(slug).name) + "</a></li>" : "") +
      kids.map(function (k) { return "<li>" + navLink(k) + subList(k.slug, depth + 1) + "</li>"; }).join("") + "</ul>";
  }
  var navItems = '<li><a href="index.html"' + (page === "index" ? ' aria-current="page"' : "") + ">Home</a></li>" +
    children(null).map(function (c) {
      if (!children(c.slug).length) return "<li>" + navLink(c) + "</li>";
      return '<li class="has-sub">' +
        '<button type="button" class="sub-toggle' + (activeTrail.indexOf(c.slug) !== -1 ? " active" : "") + '" aria-expanded="false" aria-controls="sub-' + c.slug + '">' +
        esc(c.name) + ' <span class="caret" aria-hidden="true"></span></button>' + subList(c.slug, 1) + "</li>";
    }).join("") +
    '<li><a href="partners.html"' + (page === "partners" ? ' aria-current="page"' : "") + ">Partners</a></li>" +
    '<li><a href="about.html"' + (page === "about" ? ' aria-current="page"' : "") + ">About</a></li>";

  $("site-header").innerHTML =
    '<div class="container header-inner">' +
    '<a class="brand" href="index.html" aria-label="FlowAthletiq home"><img src="assets/logo.svg" alt="" width="36" height="36">' +
    '<span class="wordmark">FLOW<span>ATHLETIQ</span></span></a>' +
    '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="primary-nav"><span class="sr-only">Menu</span><span class="bars" aria-hidden="true"></span></button>' +
    '<nav id="primary-nav" class="nav" aria-label="Primary"><ul class="nav-list">' + navItems + "</ul></nav></div>";

  var toggle = document.querySelector(".nav-toggle"), navEl = $("primary-nav");
  function closeSubs(except) {
    document.querySelectorAll(".sub-toggle").forEach(function (b) {
      if (b !== except) { b.setAttribute("aria-expanded", "false"); b.parentNode.classList.remove("open"); }
    });
  }
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    navEl.classList.toggle("open", !open);
  });
  document.querySelectorAll(".sub-toggle").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = b.getAttribute("aria-expanded") === "true";
      closeSubs(b);
      b.setAttribute("aria-expanded", String(!open));
      b.parentNode.classList.toggle("open", !open);
    });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".has-sub")) closeSubs(); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openBtn = document.querySelector('.sub-toggle[aria-expanded="true"]');
    closeSubs();
    if (openBtn) openBtn.focus();
  });

  // ---- Footer ----
  $("site-footer").innerHTML =
    '<div class="container footer-inner">' +
    '<div><a class="brand" href="index.html"><img src="assets/logo.svg" alt="" width="28" height="28"><span class="wordmark">FLOW<span>ATHLETIQ</span></span></a>' +
    "<p>Counter-Strike &amp; esports news.</p></div>" +
    '<ul class="footer-links">' + CATS.filter(function (c) { return !c.parent || c.slug === "cs2"; }).map(function (c) {
      return '<li><a href="' + catUrl(c.slug) + '">' + esc(c.name) + "</a></li>"; }).join("") +
    '<li><a href="partners.html">Partners</a></li><li><a href="about.html">About</a></li></ul>' +
    '<p class="footer-disclosure"><strong>Affiliate disclosure:</strong> some links on FlowAthletiq, marked "Partner / Affiliate link", are affiliate links. We may earn a commission if you buy through them, at no extra cost to you.</p>' +
    '<p class="copy">© ' + new Date().getFullYear() + " FlowAthletiq · flowathletiq.com</p></div>";

  // ---- Pages ----
  if (page === "index") {
    var featured = ARTICLES.find(function (a) { return a.featured; }) || ARTICLES[0];
    if (featured) {
      $("hero").innerHTML = '<a class="hero-card" href="article.html?id=' + encodeURIComponent(featured.id) + '">' + cover(featured, true) +
        '<div class="hero-text"><span class="kicker">Top story</span>' + badge(featured.category, true) +
        "<h1>" + esc(featured.title) + "</h1><p>" + esc(featured.excerpt) + "</p>" +
        '<span class="meta">' + esc(featured.author) + " · " + fmtDate(featured.date) + ' · <span class="example-tag">Example content</span></span>' +
        '<span class="btn">Read story →</span></div></a>';
    }
    var rest = ARTICLES.filter(function (a) { return a !== featured; });
    var filters = $("filters");
    var opts = [{ slug: "", name: "All" }].concat(
      CATS.filter(function (c) { return !c.parent; }).reduce(function (acc, c) {
        // show top-level, plus CS2-level children of FPS (but not sub-subcategories)
        return acc.concat([c], c.slug === "fps" ? children("fps") : []);
      }, []));
    filters.innerHTML = opts.map(function (c) {
      return '<button type="button" data-cat="' + c.slug + '" aria-pressed="' + (c.slug === "") + '">' + esc(c.short || c.name) + "</button>";
    }).join("");
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      var s = b.dataset.cat;
      renderGrid(rest.filter(function (a) { return !s || inCat(a, s); }));
    });
    renderGrid(rest);
    renderMatches();
  }

  if (page === "category") {
    var c = catBySlug[currentCat];
    var hero = $("cat-hero");
    if (!c) {
      hero.innerHTML = "<h1>Category not found</h1><p><a href='index.html'>Back to home</a></p>";
      renderGrid([]);
    } else {
      document.title = c.name + " — FlowAthletiq";
      hero.style.setProperty("--game", c.color);
      var trail = ancestors(c.slug);
      var kids = children(c.slug);
      hero.innerHTML =
        '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>' +
        trail.slice(0, -1).map(function (t) { return ' / <a href="' + catUrl(t.slug) + '">' + esc(t.name) + "</a>"; }).join("") + "</nav>" +
        '<span class="kicker">' + (c.parent ? esc(cat(c.parent).name) + " · " : "") + (kids.length ? "Category" : "Subcategory") + "</span>" +
        "<h1>" + esc(c.name) + "</h1><p>" + esc(c.description || "") + "</p>" +
        (kids.length ? '<ul class="subcats" aria-label="Subcategories">' + kids.map(function (k) {
          return '<li><a style="--game:' + k.color + '" href="' + catUrl(k.slug) + '">' + esc(k.name) + "</a></li>"; }).join("") + "</ul>" : "");
      $("cat-latest-h").textContent = kids.length ? "All " + c.name + " articles" : "Articles";
      renderGrid(ARTICLES.filter(function (a) { return inCat(a, c.slug); }));
      renderMatches(c.slug);
    }
  }

  if (page === "article") {
    var a = ARTICLES.find(function (x) { return x.id === params.get("id"); });
    var el = $("article");
    if (!a) {
      el.innerHTML = '<h1>Article not found</h1><p>The article may have moved. <a href="index.html">Back to home</a>.</p>';
      renderGrid(ARTICLES.slice(0, 3));
      renderMatches();
    } else {
      document.title = a.title + " — FlowAthletiq";
      var body = a.body.map(function (p) {
        if (p.indexOf("## ") === 0) return "<h2>" + esc(p.slice(3)) + "</h2>";
        if (p.indexOf("> ") === 0) return "<blockquote>" + esc(p.slice(2)) + "</blockquote>";
        return "<p>" + esc(p) + "</p>";
      }).join("");
      var feedB = bannersFor("in-feed");
      el.innerHTML = '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>' +
        ancestors(a.category).map(function (t) { return ' / <a href="' + catUrl(t.slug) + '">' + esc(t.name) + "</a>"; }).join("") + "</nav>" +
        badge(a.category) +
        "<h1>" + esc(a.title) + "</h1>" +
        '<p class="meta">By ' + esc(a.author) + ' · <time datetime="' + a.date + '">' + fmtDate(a.date) + "</time> · " + a.readMinutes + " min read</p>" +
        cover(a, true) +
        '<div class="example-note" role="note"><strong>Example content.</strong> This is a placeholder article for previewing the site design.</div>' +
        '<div class="prose">' + body + "</div>" +
        (feedB.length ? '<div class="in-article" role="complementary" aria-label="Partner banner">' + bannerHTML(feedB[0]) + "</div>" : "") +
        '<ul class="tags">' + (a.tags || []).map(function (t) { return "<li>#" + esc(t) + "</li>"; }).join("") + "</ul>";
      var top = ancestors(a.category)[0].slug;
      var related = ARTICLES.filter(function (x) { return x.id !== a.id && x.category === a.category; })
        .concat(ARTICLES.filter(function (x) { return x.id !== a.id && x.category !== a.category && inCat(x, top); }))
        .concat(ARTICLES.filter(function (x) { return x.id !== a.id && !inCat(x, top); }));
      renderGrid(related.slice(0, 3));
      renderMatches(top);
    }
  }

  if (page === "partners") {
    var listEl = $("partner-list");
    listEl.innerHTML = BANNERS.length ? BANNERS.map(function (b) {
      return '<section class="partner-item">' + bannerHTML(b) +
        '<div class="partner-meta"><h2>' + esc(b.label) + "</h2>" +
        '<p class="meta">Size ' + esc(b.size || "flexible") + " · Placements: " + esc((b.placements || []).join(", ") || "partners page only") + "</p>" +
        '<a class="btn" href="' + esc(b.href) + '" target="_blank" rel="' + REL + '">Visit partner <span class="sr-only">(opens in a new tab)</span>↗</a></div></section>';
    }).join("") : '<p class="empty">No partners yet.</p>';
  }

  fillSlots();
})();
