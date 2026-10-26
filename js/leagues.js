/*
 * Kleverr E-sporta liga S7 (Latvia, CS2): Virsliga + 1./2./3. liga group standings with
 * expandable team rosters and upcoming matches. Shown inside the "CS2 Latvija" section.
 * Data: leagues.json on the server-data branch (scripts/leagues.py), fallback data/leagues.json.
 */
(function () {
  "use strict";
  var RAW = "https://raw.githubusercontent.com/vilovx/flowathletiq/server-data/leagues.json";
  var TABS = [["virsliga", "Virslīga"], ["1", "1. līga"], ["2", "2. līga"], ["3", "3. līga"]];
  var st = { data: null, loaded: false, tab: null, open: {} }, ctx = null, started = false;

  function load() {
    function get(u) { return fetch(u + "?t=" + Date.now(), { cache: "no-store" }).then(function (r) { if (!r.ok) throw r.status; return r.json(); }); }
    return get(RAW).catch(function () { return get("data/leagues.json"); })
      .then(function (d) { st.data = d; }, function () {}).then(function () { st.loaded = true; paint(); });
  }
  function s(k, v) {
    var x = (ctx.t("lg") || {})[k]; if (x == null) x = k;
    return v ? x.replace(/\{(\w+)\}/g, function (_, n) { return v[n] != null ? v[n] : ""; }) : x;
  }
  function riga(iso, o) { try { return new Date(iso).toLocaleString(ctx.locale, Object.assign({ timeZone: "Europe/Riga" }, o)); } catch (e) { return iso; } }
  function signed(n) { return (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n); }
  function ext(h, t) { return '<a href="' + ctx.esc(h) + '" target="_blank" rel="noopener">' + t + "</a>"; }

  function rosterHTML(tid) {
    var esc = ctx.esc, d = st.data, r = (d.rosters || {})[tid], team = d.teams[tid] || {};
    if (!r || !r.members || !r.members.length) return '<p class="lg-empty">' + esc(s("noRoster")) + "</p>";
    function list(role) { return r.members.filter(function (m) { return m.role === role; }); }
    function chip(m) {
      var ig = m.ingame ? '<span class="lg-ig">' + esc(s("ig_" + m.ingame) || m.ingame) + "</span>" : "";
      return '<li><a href="' + esc(m.url) + '" target="_blank" rel="noopener">' + esc(m.nick) + "</a>" +
        (m.country && m.country !== "LV" ? ' <span class="lg-cc">' + esc(m.country) + "</span>" : "") + ig + "</li>";
    }
    function block(title, arr, empty) {
      return '<div class="lg-rblock"><h4>' + esc(title) + "</h4>" + (arr.length ? '<ul class="lg-chips">' + arr.map(chip).join("") + "</ul>" : '<p class="lg-empty">' + esc(empty) + "</p>") + "</div>";
    }
    var subs = list("SUBSTITUTE");
    return '<div class="lg-roster">' + block(s("lineup"), list("PLAYER"), s("noRoster")) +
      (subs.length ? block(s("subs"), subs) : "") + block(s("coach"), list("COACH"), s("noCoach")) +
      '<p class="lg-links">' + ext(team.url, esc(s("teamOnKleverr"))) + " ↗" + (team.faceit ? " · " + ext(team.faceit, "FACEIT") + " ↗" : "") + "</p></div>";
  }
  function table(div) {
    var esc = ctx.esc;
    var title = div.group ? s("group", { g: div.group }) : s("standings");
    return '<section class="srv-card lg-group"><h3>' + esc(title) + '</h3><table class="vl-table lg-table"><thead><tr><th scope="col" class="pos">#</th><th scope="col">' + esc(s("team")) +
      '</th><th scope="col" class="num">' + esc(s("pts")) + '</th><th scope="col" class="num">' + esc(s("wl")) + '</th><th scope="col" class="num"><abbr title="' + esc(s("rd")) + '">' + esc(s("rdShort")) + "</abbr></th></tr></thead><tbody>" +
      div.rows.map(function (r) {
        var key = div.key + ":" + r.teamId, open = !!st.open[key], id = "lg-r-" + key.replace(/\W/g, "-");
        return '<tr class="' + (r.rank <= (div.group ? 2 : 3) ? "top" : "") + (open ? " is-open" : "") + '"><td class="pos">' + r.rank + '</td><td class="team"><button type="button" class="lg-team" data-lg-team="' + esc(key) +
          '" aria-expanded="' + open + '" aria-controls="' + id + '">' + esc(r.team) + ' <span class="lg-caret" aria-hidden="true"></span></button></td><td class="num pts">' + esc(r.points) +
          '</td><td class="num">' + esc(r.wins) + "–" + esc(r.losses) + '</td><td class="num ' + (r.roundDiff > 0 ? "pos-rd" : r.roundDiff < 0 ? "neg-rd" : "") + '">' + signed(r.roundDiff) + "</td></tr>" +
          '<tr class="lg-roster-row" id="' + id + '"' + (open ? "" : " hidden") + '><td colspan="5">' + (open ? rosterHTML(r.teamId) : "") + "</td></tr>";
      }).join("") + "</tbody></table></section>";
  }
  function matches(list) {
    var esc = ctx.esc, cutoff = Date.now() - 3 * 3600e3;
    list = (list || []).filter(function (m) { return new Date(m.datetime).getTime() > cutoff; }).slice(0, 8);
    if (!list.length) return '<p class="vl-empty">' + esc(s("noMatches")) + "</p>";
    return '<ol class="vl-matches lg-matches">' + list.map(function (m) {
      return '<li><a href="' + esc(m.url) + '" target="_blank" rel="noopener"><span class="vl-when"><strong>' + esc(riga(m.datetime, { weekday: "short", day: "numeric", month: "short" })) +
        "</strong> " + esc(riga(m.datetime, { hour: "2-digit", minute: "2-digit" })) + '</span><span class="vl-teams">' + esc(m.left || "TBD") + " <em>" + esc(s("vs")) + "</em> " + esc(m.right || "TBD") +
        "</span>" + (m.bestOf ? '<span class="vl-bo">Bo' + esc(m.bestOf) + "</span>" : "") + "</a></li>";
    }).join("") + "</ol>";
  }
  function paint() {
    var root = document.getElementById("leagues-root"); if (!root || !ctx) return;
    var esc = ctx.esc, d = st.data;
    root.parentNode.hidden = false;
    var head = '<div class="lg-head"><h2>' + esc(s("title")) + ' <small>' + esc(s("season")) + "</small></h2><p>" + esc(s("lead")) + "</p></div>";
    if (!st.loaded) { root.innerHTML = head + '<p class="srv-note">' + esc(s("loading")) + "</p>"; return; }
    if (!d) { root.innerHTML = head + '<p class="srv-note">' + esc(s("unavailable")) + "</p>"; return; }
    var tab = st.tab || "virsliga", name = (TABS.filter(function (x) { return x[0] === tab; })[0] || TABS[0])[1];
    var divs = d.divisions.filter(function (x) { return x.name === name; });
    var tabs = '<div class="lg-tabs" role="tablist" aria-label="' + esc(s("title")) + '">' + TABS.map(function (x) {
      return '<button type="button" role="tab" id="lg-tab-' + x[0] + '" aria-selected="' + (x[0] === tab) + '" aria-controls="lg-panel" data-lg-tab="' + x[0] + '"' + (x[0] === tab ? "" : ' tabindex="-1"') + ">" + esc(s("tab_" + x[0])) + "</button>";
    }).join("") + "</div>";
    var faceit = divs[0] && divs[0].faceit;
    root.innerHTML = head + tabs + '<div id="lg-panel" role="tabpanel" aria-labelledby="lg-tab-' + tab + '">' +
      '<p class="lg-hint">' + esc(s("hint")) + "</p>" +
      '<div class="lg-groups' + (divs.length > 1 ? " two" : "") + '">' + divs.map(table).join("") + "</div>" +
      '<section class="srv-card lg-up"><h3>' + esc(s("upcoming")) + "</h3>" + matches((d.upcoming || {})[name]) + "</section>" +
      '<p class="vl-meta">' + s("source", { name: ext(d.source.url, "Kleverr League") }) + (faceit ? " · " + ext(faceit, esc(s("faceitChamp"))) : "") + " · " +
      esc(s("updated", { t: riga(new Date(d.updated * 1000).toISOString(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) })) + " · " + esc(s("tz")) + "</p></div>";
  }
  document.addEventListener("click", function (e) {
    var tb = e.target.closest("[data-lg-tab]");
    if (tb) {
      st.tab = tb.dataset.lgTab;
      var p = new URLSearchParams(location.search); p.set("liga", st.tab);
      history.replaceState(null, "", location.pathname + "?" + p.toString() + "#ligas");
      paint(); var nb = document.getElementById("lg-tab-" + st.tab); if (nb) nb.focus(); return;
    }
    var tm = e.target.closest("[data-lg-team]");
    if (tm) { var k = tm.dataset.lgTeam; st.open[k] = !st.open[k]; paint(); var b = document.querySelector('[data-lg-team="' + k + '"]'); if (b) b.focus(); }
  });
  document.addEventListener("keydown", function (e) {
    var tb = e.target.closest && e.target.closest("[data-lg-tab]"); if (!tb || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    var i = TABS.map(function (x) { return x[0]; }).indexOf(tb.dataset.lgTab), n = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length][0];
    document.getElementById("lg-tab-" + n).click();
  });

  window.FA_renderLeagues = function (c) {
    ctx = c;
    var root = document.getElementById("leagues-root");
    if (!root) return;
    if (!c.show) { root.parentNode.hidden = true; return; }
    if (st.tab == null) { var q = new URLSearchParams(location.search).get("liga"); st.tab = TABS.some(function (x) { return x[0] === q; }) ? q : "virsliga"; }
    paint();
    if (!started) { started = true; load(); setInterval(load, 10 * 60000); }
  };
})();
