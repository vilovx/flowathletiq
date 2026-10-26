(function () {
  "use strict";
  var GAMES = window.FA_GAMES || [];
  var ARTICLES = (window.FA_ARTICLES || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
  var MATCHES = window.FA_MATCHES || [];
  var page = document.body.dataset.page;
  var params = new URLSearchParams(location.search);

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function game(slug) { return GAMES.find(function (g) { return g.slug === slug; }) || { slug: slug, name: slug, color: "#00f0ff" }; }
  function fmtDate(d) {
    return new Date(d + (d.length === 10 ? "T12:00:00Z" : "")).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }
  function fmtMatch(d) {
    return new Date(d).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  // Self-made SVG cover art, generated per article (no external images).
  function cover(a, big) {
    var g = game(a.game);
    var seed = 0; for (var i = 0; i < a.id.length; i++) seed = (seed * 31 + a.id.charCodeAt(i)) >>> 0;
    var shapes = "";
    for (var k = 0; k < 6; k++) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      var x = seed % 400, y = (seed >> 8) % 225, r = 20 + (seed >> 16) % 70;
      shapes += '<polygon points="' + x + "," + (y - r) + " " + (x + r) + "," + (y + r) + " " + (x - r) + "," + (y + r) +
        '" fill="none" stroke="' + (k % 2 ? g.color : "#00f0ff") + '" stroke-opacity=".35" stroke-width="2"/>';
    }
    return '<div class="cover' + (big ? " cover-big" : "") + '" style="--game:' + g.color + '" aria-hidden="true">' +
      '<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">' + shapes +
      '<text x="20" y="205" class="cover-label">' + esc(g.name.toUpperCase()) + "</text></svg></div>";
  }
  function badge(slug) {
    var g = game(slug);
    return '<a class="badge" style="--game:' + g.color + '" href="category.html?game=' + g.slug + '">' + esc(g.name) + "</a>";
  }
  function card(a) {
    return '<article class="card">' + cover(a) +
      '<div class="card-body">' + badge(a.game) +
      '<h3><a class="stretched" href="article.html?id=' + encodeURIComponent(a.id) + '">' + esc(a.title) + "</a></h3>" +
      "<p>" + esc(a.excerpt) + "</p>" +
      '<p class="meta"><time datetime="' + a.date + '">' + fmtDate(a.date) + "</time> · " + a.readMinutes + " min read</p>" +
      '<span class="example-tag">Example content</span></div></article>';
  }
  function renderGrid(list) {
    var el = $("news-grid"); if (!el) return;
    el.innerHTML = list.length ? list.map(card).join("") : '<p class="empty">No articles yet for this game.</p>';
  }
  function renderMatches(filter) {
    var el = $("matches"); if (!el) return;
    var list = MATCHES.filter(function (m) { return !filter || m.game === filter; })
      .sort(function (a, b) { return a.date.localeCompare(b.date); });
    el.innerHTML = list.length ? list.map(function (m) {
      return '<li class="match" style="--game:' + game(m.game).color + '">' +
        '<span class="match-game">' + esc(game(m.game).name) + "</span>" +
        '<span class="match-event">' + esc(m.event) + "</span>" +
        '<span class="match-teams">' + esc(m.teamA) + (m.teamB ? ' <span class="vs">vs</span> ' + esc(m.teamB) : "") + "</span>" +
        '<time datetime="' + m.date + '">' + fmtMatch(m.date) + "</time></li>";
    }).join("") + '<li class="match-note">Example schedule, not real fixtures.</li>'
      : '<li class="match-note">No upcoming matches listed.</li>';
  }

  // Header & footer (shared across pages)
  var current = page === "category" ? params.get("game") : page;
  var nav = [{ href: "index.html", label: "Home", key: "index" }]
    .concat(GAMES.map(function (g) { return { href: "category.html?game=" + g.slug, label: g.name, key: g.slug }; }))
    .concat([{ href: "about.html", label: "About", key: "about" }]);
  $("site-header").innerHTML =
    '<div class="container header-inner">' +
    '<a class="brand" href="index.html" aria-label="FlowAthletiq home"><img src="assets/logo.svg" alt="" width="36" height="36">' +
    '<span class="wordmark">FLOW<span>ATHLETIQ</span></span></a>' +
    '<button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav"><span class="sr-only">Menu</span><span class="bars" aria-hidden="true"></span></button>' +
    '<nav id="primary-nav" class="nav" aria-label="Primary"><ul>' +
    nav.map(function (n) {
      return '<li><a href="' + n.href + '"' + (n.key === current ? ' aria-current="page"' : "") + ">" + esc(n.label) + "</a></li>";
    }).join("") + "</ul></nav></div>";
  var toggle = document.querySelector(".nav-toggle");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    document.getElementById("primary-nav").classList.toggle("open", !open);
  });
  $("site-footer").innerHTML =
    '<div class="container footer-inner">' +
    '<div><a class="brand" href="index.html"><img src="assets/logo.svg" alt="" width="28" height="28"><span class="wordmark">FLOW<span>ATHLETIQ</span></span></a>' +
    "<p>Esports &amp; gaming news.</p></div>" +
    '<ul class="footer-links">' + GAMES.map(function (g) { return '<li><a href="category.html?game=' + g.slug + '">' + esc(g.name) + "</a></li>"; }).join("") +
    '<li><a href="about.html">About</a></li></ul>' +
    '<p class="copy">© ' + new Date().getFullYear() + " FlowAthletiq · flowathletiq.com</p></div>";

  // Pages
  if (page === "index") {
    var featured = ARTICLES.find(function (a) { return a.featured; }) || ARTICLES[0];
    if (featured) {
      $("hero").innerHTML = '<a class="hero-card" href="article.html?id=' + encodeURIComponent(featured.id) + '">' + cover(featured, true) +
        '<div class="hero-text"><span class="kicker">Top story</span>' +
        '<span class="badge static" style="--game:' + game(featured.game).color + '">' + esc(game(featured.game).name) + "</span>" +
        "<h1>" + esc(featured.title) + "</h1><p>" + esc(featured.excerpt) + "</p>" +
        '<span class="meta">' + esc(featured.author) + " · " + fmtDate(featured.date) + ' · <span class="example-tag">Example content</span></span>' +
        '<span class="btn">Read story →</span></div></a>';
    }
    var rest = ARTICLES.filter(function (a) { return a !== featured; });
    var filters = $("filters");
    var opts = [{ slug: "", name: "All" }].concat(GAMES);
    filters.innerHTML = opts.map(function (g) {
      return '<button type="button" data-game="' + g.slug + '" aria-pressed="' + (g.slug === "" ) + '">' + esc(g.name) + "</button>";
    }).join("");
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      var s = b.dataset.game;
      renderGrid(rest.filter(function (a) { return !s || a.game === s; }));
    });
    renderGrid(rest);
    renderMatches();
  }

  if (page === "category") {
    var slug = params.get("game");
    var g = GAMES.find(function (x) { return x.slug === slug; });
    if (!g) {
      $("cat-hero").innerHTML = "<h1>Game not found</h1><p><a href='index.html'>Back to home</a></p>";
      renderGrid([]);
    } else {
      document.title = g.name + " news — FlowAthletiq";
      $("cat-hero").style.setProperty("--game", g.color);
      $("cat-hero").innerHTML = '<span class="kicker">Game hub</span><h1>' + esc(g.name) + "</h1><p>Latest " + esc(g.name) + " news, guides, and analysis.</p>";
      renderGrid(ARTICLES.filter(function (a) { return a.game === slug; }));
      renderMatches(slug);
    }
  }

  if (page === "article") {
    var a = ARTICLES.find(function (x) { return x.id === params.get("id"); });
    var el = $("article");
    if (!a) {
      el.innerHTML = '<h1>Article not found</h1><p>The article may have moved. <a href="index.html">Back to home</a>.</p>';
      renderGrid(ARTICLES.slice(0, 3));
    } else {
      document.title = a.title + " — FlowAthletiq";
      var body = a.body.map(function (p) {
        if (p.indexOf("## ") === 0) return "<h2>" + esc(p.slice(3)) + "</h2>";
        if (p.indexOf("> ") === 0) return "<blockquote>" + esc(p.slice(2)) + "</blockquote>";
        return "<p>" + esc(p) + "</p>";
      }).join("");
      el.innerHTML = '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / ' + badge(a.game) + "</nav>" +
        "<h1>" + esc(a.title) + "</h1>" +
        '<p class="meta">By ' + esc(a.author) + ' · <time datetime="' + a.date + '">' + fmtDate(a.date) + "</time> · " + a.readMinutes + " min read</p>" +
        cover(a, true) +
        '<div class="example-note" role="note"><strong>Example content.</strong> This is a placeholder article for previewing the site design.</div>' +
        '<div class="prose">' + body + "</div>" +
        '<ul class="tags">' + (a.tags || []).map(function (t) { return "<li>#" + esc(t) + "</li>"; }).join("") + "</ul>";
      var related = ARTICLES.filter(function (x) { return x.id !== a.id && x.game === a.game; });
      if (related.length < 3) related = related.concat(ARTICLES.filter(function (x) { return x.id !== a.id && x.game !== a.game; })).slice(0, 3);
      renderGrid(related.slice(0, 3));
    }
  }
})();
