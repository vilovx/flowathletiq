/*
 * Optibet E-sporta Virsliga (CS2, Latvia) standings + upcoming matches.
 * Data: virsliga.json on the server-data branch, refreshed every ~2 h by
 * .github/workflows/server-status.yml (scripts/virsliga.py) from the official league site.
 */
(function () {
  "use strict";
  var RAW = "https://raw.githubusercontent.com/vilovx/flowathletiq/server-data/virsliga.json";
  var state = { data: null, loaded: false, failed: false, started: false };
  var ctx = null;

  function load() {
    function get(u) { return fetch(u + "?t=" + Date.now(), { cache: "no-store" }).then(function (r) { if (!r.ok) throw r.status; return r.json(); }); }
    return get(RAW).catch(function () { return get("data/virsliga.json"); })
      .then(function (d) { state.data = d; }, function () { state.failed = true; })
      .then(function () { state.loaded = true; paint(); });
  }
  function s(k, vars) {
    var v = (ctx.t("vl") || {})[k]; if (v == null) v = k;
    if (vars) v = v.replace(/\{(\w+)\}/g, function (_, x) { return vars[x] != null ? vars[x] : ""; });
    return v;
  }
  function riga(iso, opts) {
    try { return new Date(iso).toLocaleString(ctx.locale, Object.assign({ timeZone: "Europe/Riga" }, opts)); }
    catch (e) { return iso; }
  }
  function ext(href, text) { return '<a href="' + ctx.esc(href) + '" target="_blank" rel="noopener">' + text + "</a>"; }
  function signed(n) { return (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n); }

  function table(rows, compact) {
    var esc = ctx.esc;
    return '<table class="vl-table' + (compact ? " compact" : "") + '"><caption class="sr-only">' + esc(s("standings")) + "</caption><thead><tr>" +
      '<th scope="col" class="pos">#</th><th scope="col">' + esc(s("team")) + '</th><th scope="col" class="num">' + esc(s("pts")) +
      '</th><th scope="col" class="num">' + esc(s("wl")) + '</th><th scope="col" class="num"><abbr title="' + esc(s("rd")) + '">' + esc(s("rdShort")) + "</abbr></th></tr></thead><tbody>" +
      rows.map(function (r) {
        return '<tr class="' + (r.rank <= 3 ? "top" : "") + '"><td class="pos">' + r.rank + '</td><td class="team">' + (compact ? esc(r.team) : ext(r.url, esc(r.team))) +
          '</td><td class="num pts">' + esc(r.points) + '</td><td class="num">' + esc(r.wins) + "–" + esc(r.losses) +
          '</td><td class="num ' + (r.roundDiff > 0 ? "pos-rd" : r.roundDiff < 0 ? "neg-rd" : "") + '">' + signed(r.roundDiff) + "</td></tr>";
      }).join("") + "</tbody></table>";
  }
  function matchList(ms, limit) {
    var esc = ctx.esc, cutoff = Date.now() - 3 * 3600e3; // hide matches that started >3 h ago (data refreshes every ~2 h)
    ms = ms.filter(function (m) { return new Date(m.datetime).getTime() > cutoff; }).slice(0, limit || 99);
    if (!ms.length) return '<p class="vl-empty">' + esc(s("noMatches")) + "</p>";
    return '<ol class="vl-matches">' + ms.map(function (m) {
      var live = m.status === "live";
      return '<li><a href="' + esc(m.url) + '" target="_blank" rel="noopener">' +
        '<span class="vl-when"><strong>' + esc(riga(m.datetime, { weekday: "short", day: "numeric", month: "short" })) + "</strong> " +
        esc(riga(m.datetime, { hour: "2-digit", minute: "2-digit" })) + (live ? ' <span class="vl-live">' + esc(s("live")) + "</span>" : "") + "</span>" +
        '<span class="vl-teams">' + esc(m.left || "TBD") + ' <em>' + esc(s("vs")) + "</em> " + esc(m.right || "TBD") + "</span>" +
        (m.bestOf ? '<span class="vl-bo">Bo' + esc(m.bestOf) + "</span>" : "") + "</a></li>";
    }).join("") + "</ol>";
  }
  function meta(d) {
    return '<p class="vl-meta">' + s("source", { name: ext(d.source.url, ctx.esc(d.source.name)) }) + " · " +
      ctx.esc(s("updated", { t: riga(new Date(d.updated * 1000).toISOString(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) })) +
      " · " + ctx.esc(s("tz")) + "</p>";
  }

  function paint() {
    if (!ctx) return;
    var esc = ctx.esc, d = state.data;
    var w = document.getElementById("vl-widget");
    if (w) {
      if (!state.loaded) { w.hidden = true; }
      else if (!d || !d.standings || !d.standings.length) { w.hidden = true; }
      else {
        w.hidden = false;
        w.innerHTML = '<h2 id="vl-h">' + esc(s("short")) + ' <small>' + esc(s("seasonShort")) + "</small></h2>" + table(d.standings, true) +
          '<h3>' + esc(s("upcoming")) + "</h3>" + matchList(d.upcoming || [], 3) +
          '<a class="vl-more" href="virsliga.html">' + esc(s("full")) + " →</a>" + meta(d);
      }
    }
    var root = document.getElementById("virsliga-root");
    if (root) {
      var head = '<span class="kicker">' + esc(s("kicker")) + "</span><h1>" + s("h1") + '</h1><p class="lead">' + esc(s("lead")) + "</p>";
      if (!state.loaded) { root.innerHTML = head + '<p class="srv-note">' + esc(s("loading")) + "</p>"; return; }
      if (!d) { root.innerHTML = head + '<p class="srv-note">' + esc(s("unavailable")) + "</p>"; return; }
      root.innerHTML = head + '<div class="vl-grid"><section class="srv-card"><h2>' + esc(s("standings")) + "</h2>" + table(d.standings || [], false) +
        '<p class="vl-note">' + esc(s("ptsNote")) + "</p></section>" +
        '<section class="srv-card"><h2>' + esc(s("upcoming")) + "</h2>" + matchList(d.upcoming || []) +
        '<p class="vl-note">' + ext(d.source.calendarUrl || d.source.url, esc(s("calendar"))) + " ↗</p></section></div>" + meta(d);
    }
  }

  window.FA_renderVirsliga = function (c) {
    ctx = c;
    var want = document.getElementById("virsliga-root") || (document.getElementById("vl-widget") && c.showWidget);
    if (!want) { var w = document.getElementById("vl-widget"); if (w) w.hidden = true; return; }
    paint();
    if (!state.started) { state.started = true; load(); setInterval(load, 10 * 60000); }
  };
})();
