/*
 * FlowAthletiq Warmup Server page. Data comes from the `server-data` branch, which a GitHub
 * Actions workflow (.github/workflows/server-status.yml) refreshes every ~5 minutes via A2S.
 */
(function () {
  "use strict";
  var HOST = "flowathletiq.dat.gg:25082";
  // Join password shown on the page (public by design). Set to "" if the server has no password.
  var PASSWORD = "underpressure";
  var CONNECT_CMD = "connect " + HOST + (PASSWORD ? "; password " + PASSWORD : "");
  var STEAM_URL = "steam://connect/" + HOST + (PASSWORD ? "/" + encodeURIComponent(PASSWORD) : "");
  var RAW = "https://raw.githubusercontent.com/vilovx/flowathletiq/server-data/";
  var state = { status: null, history: null, top: null, failed: false, loaded: false };
  var ctx = null, timer = null;

  function getJSON(urls) {
    var u = urls[0] + (urls[0].indexOf("?") < 0 ? "?" : "&") + "t=" + Date.now();
    return fetch(u, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(r.status); return r.json();
    }).catch(function (e) { if (urls.length > 1) return getJSON(urls.slice(1)); throw e; });
  }
  function load() {
    return Promise.all([
      getJSON([RAW + "server-status.json", "data/server-status.json"]).catch(function () { return null; }),
      getJSON([RAW + "server-history.json", "data/server-history.json"]).catch(function () { return null; }),
      getJSON(["data/server-top.json"]).catch(function () { return null; })
    ]).then(function (r) {
      state.status = r[0]; state.history = r[1]; state.top = r[2]; state.failed = !r[0]; state.loaded = true;
      paint();
    });
  }
  function s(k, vars) {
    var v = (ctx.t("srv") || {})[k] || k;
    if (vars) v = v.replace(/\{(\w+)\}/g, function (_, x) { return vars[x] != null ? vars[x] : ""; });
    return v;
  }
  function fmtTime(sec) {
    try { return new Date(sec * 1000).toLocaleString(ctx.locale, { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }); }
    catch (e) { return new Date(sec * 1000).toISOString(); }
  }

  function chartSVG(points) {
    var narrow = window.innerWidth < 600, W = narrow ? 340 : 640, H = narrow ? 190 : 200, P = { l: 34, r: 12, t: 12, b: 26 };
    var now = Date.now() / 1000, from = now - 24 * 3600;
    var pts = (points || []).filter(function (p) { return p[0] >= from; });
    var maxY = Math.max(12, (state.status && state.status.maxPlayers) || 0);
    pts.forEach(function (p) { if (p[2] > maxY) maxY = p[2]; });
    function x(tm) { return P.l + (tm - from) / (now - from) * (W - P.l - P.r); }
    function y(v) { return H - P.b - v / maxY * (H - P.t - P.b); }
    var g = "";
    for (var v = 0; v <= maxY; v += maxY / 4) {
      g += '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + y(v) + '" y2="' + y(v) + '" class="grid"/>' +
        '<text x="' + (P.l - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end" class="axis">' + Math.round(v) + "</text>";
    }
    (narrow ? [24, 12, 0] : [24, 18, 12, 6, 0]).forEach(function (h) {
      g += '<text x="' + x(now - h * 3600) + '" y="' + (H - 6) + '" text-anchor="' + (h === 24 ? "start" : h === 0 ? "end" : "middle") +
        '" class="axis">' + ctx.esc(h ? s("hoursAgo", { h: h }) : s("now")) + "</text>";
    });
    function path(i) {
      // break the line on gaps > 15 min (missed polls / offline)
      var d = "", prev = null;
      pts.forEach(function (p) {
        var cmd = !prev || p[0] - prev[0] > 900 || !p[3] ? "M" : "L";
        if (p[3]) d += cmd + x(p[0]).toFixed(1) + "," + y(p[i]).toFixed(1);
        prev = p[3] ? p : null;
      });
      return d;
    }
    var lines = pts.length ? '<path d="' + path(2) + '" class="line-total"/><path d="' + path(1) + '" class="line-humans"/>' : "";
    var dots = pts.length === 1 ? '<circle cx="' + x(pts[0][0]) + '" cy="' + y(pts[0][1]) + '" r="3" class="dot-humans"/>' : "";
    return '<svg class="srv-chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + ctx.esc(s("chart")) + '">' + g + lines + dots + "</svg>";
  }

  function paint() {
    var root = document.getElementById("server-root");
    if (!root || !ctx) return;
    var esc = ctx.esc, st = state.status;
    var head = '<span class="kicker">' + esc(s("kicker")) + "</span><h1>" + s("h1") + '</h1><p class="lead">' + esc(s("lead")) + "</p>";
    if (!state.loaded) { root.innerHTML = head + '<p class="srv-note">' + esc(s("loading")) + "</p>"; return; }
    var online = !!(st && st.online);
    var max = (st && st.maxPlayers) || 12, humans = online ? st.humans : 0, bots = online ? st.bots : 0;
    var bar = '<div class="srv-bar" role="img" aria-label="' + esc(s("players") + ": " + (humans + bots) + "/" + max + " (" + s("humans") + " " + humans + ", " + s("bots") + " " + bots + ")") + '">' +
      '<span class="srv-bar-h" style="width:' + Math.min(100, humans / max * 100) + '%"></span>' +
      '<span class="srv-bar-b" style="width:' + Math.min(100, bots / max * 100) + '%"></span></div>';
    var card =
      '<article class="srv-card' + (online ? "" : " is-offline") + '">' +
      '<div class="srv-top"><div><h2 class="srv-name">' + esc((st && st.name) || "FlowAthletiq") + '</h2>' +
      '<p class="srv-addr"><span class="srv-dot" aria-hidden="true"></span><code>' + HOST + '</code> <span class="srv-state">' + esc(online ? s("online") : s("offline")) + "</span></p></div>" +
      '<div class="srv-map"><span>' + esc(s("map")) + "</span><strong>" + esc(online && st.map ? st.map : "—") + "</strong></div></div>" +
      (state.failed ? '<p class="srv-note">' + esc(s("unavailable")) + "</p>" : !online ? '<p class="srv-note">' + esc(s("offlineMsg")) + "</p>" : "") +
      '<div class="srv-players"><div class="srv-count"><span>' + esc(s("players")) + "</span><strong>" + (humans + bots) + "/" + max + "</strong></div>" + bar +
      '<p class="srv-legend"><span class="lg-h"></span>' + esc(s("humans")) + " " + humans + ' <span class="lg-b"></span>' + esc(s("bots")) + " " + bots + "</p></div>" +
      (PASSWORD ? '<div class="srv-pass"><span>' + esc(s("password")) + '</span><code>' + esc(PASSWORD) + '</code>' +
        '<button type="button" class="btn-ghost btn-sm" data-copy="' + esc(PASSWORD) + '">' + esc(s("copyPassword")) + "</button></div>" : "") +
      '<div class="srv-actions">' +
      '<button type="button" class="btn-ghost" data-copy="' + esc(CONNECT_CMD) + '">' + esc(s("copyConnect")) + "</button>" +
      '<button type="button" class="btn-ghost" data-copy="' + HOST + '">' + esc(s("copyIp")) + "</button>" +
      '<a class="btn" href="' + esc(STEAM_URL) + '">' + esc(s("instant")) + " ▶</a></div>" +
      '<div class="srv-chart-wrap"><h3>' + esc(s("chart")) + '</h3>' + chartSVG(state.history && state.history.points) +
      '<p class="srv-legend"><span class="lg-line"></span>' + esc(s("legendHumans")) + ' <span class="lg-dash"></span>' + esc(s("legendTotal")) + "</p>" +
      ((state.history && state.history.points || []).length < 3 ? '<p class="srv-note small">' + esc(s("noData")) + "</p>" : "") + "</div>" +
      '<p class="srv-updated">' + (st && st.updated ? esc(s("updated", { t: fmtTime(st.updated) })) + " · " : "") + esc(s("refresh")) + "</p>" +
      "</article>";
    var top = state.top && state.top.players && state.top.players.length ? state.top.players.slice(0, 5) : null;
    var topBox = '<aside class="srv-card srv-rank"><h2>' + esc(s("top")) + "</h2>" +
      (top ? "<ol>" + top.map(function (p) { return "<li><span>" + esc(p.name) + "</span><strong>" + esc(p.points) + "</strong></li>"; }).join("") + "</ol>"
        : '<ol class="srv-rank-empty" aria-hidden="true">' + [1, 2, 3, 4, 5].map(function (n) { return "<li><span>#" + n + "</span><i></i></li>"; }).join("") + "</ol>" +
          '<p class="srv-soon">' + esc(s("topSoon")) + "</p>") + "</aside>";
    root.innerHTML = head + '<div class="srv-grid">' + card + topBox + "</div>";
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]"); if (!b) return;
    var txt = b.getAttribute("data-copy"), label = b.textContent;
    function done() { b.textContent = s("copied"); setTimeout(function () { b.textContent = label; }, 1500); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = txt; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (err) {} document.body.removeChild(ta);
    }
  });

  window.FA_renderServer = function (c) {
    ctx = c; paint();
    if (!timer) { load(); timer = setInterval(load, 60000); }
  };
})();
