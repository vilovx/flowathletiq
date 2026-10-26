/* FlowAthletiq — ambient "wolf eyes" in the dark side margins (desktop only).
 * 4 wolves, 6 fixed spots (3 per side). Each wolf picks a random FREE spot (never one
 * that is occupied, never stacked/overlapping), fades in (~1.8 s), lingers 3–6 s with an
 * occasional blink, fades out, then hides for a random 5–14 s.
 * Only rendered when each side margin is >= MIN_MARGIN px wide; never over content;
 * pointer-events: none; disabled entirely for prefers-reduced-motion. No assets. */
(function () {
  "use strict";
  if (!window.matchMedia || !document.body) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) return;

  var WOLVES = 4, MIN_MARGIN = 90, EYE_W = 72, MIN_DIST = 140;
  // Spot templates: x = fraction across the margin, y = fraction of viewport height.
  var SPOTS = [
    { side: "l", x: 0.55, y: 0.24 }, { side: "l", x: 0.35, y: 0.52 }, { side: "l", x: 0.6, y: 0.8 },
    { side: "r", x: 0.4, y: 0.3 },  { side: "r", x: 0.62, y: 0.58 }, { side: "r", x: 0.38, y: 0.84 }
  ];

  var css =
    ".fa-wolf-layer{position:fixed;inset:0;pointer-events:none;z-index:-1;overflow:hidden;contain:strict}" +
    ".fa-wolf-layer[hidden]{display:none}" +
    ".fa-wolf{position:absolute;width:" + EYE_W + "px;height:22px;opacity:0;" +
      "transition:opacity 1.8s ease-in-out,transform 6s ease-in-out;will-change:opacity;" +
      "filter:drop-shadow(0 0 3px rgba(255,40,20,.9)) drop-shadow(0 0 14px rgba(210,0,0,.6))}" +
    ".fa-wolf.on{opacity:var(--fa-wolf-o,.85)}" +
    ".fa-wolf svg{display:block;width:100%;height:100%;overflow:visible}" +
    ".fa-wolf .lid{transform-box:fill-box;transform-origin:50% 50%}" +
    ".fa-wolf.blink .lid{animation:fa-wolf-blink .26s ease-in-out}" +
    "@keyframes fa-wolf-blink{0%,100%{transform:scaleY(1)}45%,55%{transform:scaleY(.08)}}" +
    "@media (max-width:1199px),(prefers-reduced-motion:reduce){.fa-wolf-layer{display:none}}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  // Slanted almond eyes, outer corners tilted up; red iris with hot core and a dark slit pupil.
  var uid = 0;
  function eyeSVG() {
    var g = "fawg" + (uid++);
    var eye = function (cx, flip) {
      var s = flip ? -1 : 1;
      return '<g class="lid" transform="translate(' + cx + ',11) scale(' + s + ',1) rotate(16)">' +
        '<path d="M-12 -1 C-7 -6 4 -6.5 11 1 C5 4.5 -4 4.5 -12 -1 Z" fill="url(#' + g + ')"/>' +
        '<ellipse cx="0" cy="-0.6" rx="1.1" ry="3.4" fill="#1a0000" opacity=".8"/></g>';
    };
    return '<svg viewBox="0 0 64 22" aria-hidden="true" focusable="false"><defs>' +
      '<radialGradient id="' + g + '" cx="50%" cy="45%" r="60%">' +
      '<stop offset="0" stop-color="#ffd2a0"/><stop offset=".25" stop-color="#ff3b1f"/>' +
      '<stop offset=".7" stop-color="#b30000"/><stop offset="1" stop-color="#4a0000"/></radialGradient></defs>' +
      eye(17, false) + eye(47, true) + "</svg>";
  }

  var layer = document.createElement("div");
  layer.className = "fa-wolf-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.insertBefore(layer, document.body.firstChild);

  var occupied = {};          // spot index -> wolf index
  var wolves = [];
  var geom = null;            // { left, right, margin, vh }

  function measure() {
    var c = document.querySelector("main .container, main.container, .container");
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var w = c ? c.getBoundingClientRect().width : 1200;
    var margin = (vw - w) / 2;
    geom = (vw >= 1200 && margin >= MIN_MARGIN) ? { margin: margin, vw: vw, vh: vh } : null;
    layer.hidden = !geom;
  }

  function spotXY(i) {
    var s = SPOTS[i], m = geom.margin;
    var usable = Math.max(0, m - EYE_W - 24);              // keep 12px clear of content & edge
    var jx = (Math.random() - 0.5) * 0.2, jy = (Math.random() - 0.5) * 0.06;
    var fx = Math.min(1, Math.max(0, s.x + jx));
    var x = 12 + usable * fx;
    if (s.side === "r") x = geom.vw - m + 12 + usable * fx;
    var y = Math.round(geom.vh * Math.min(0.9, Math.max(0.12, s.y + jy)));
    return { x: Math.round(x), y: y };
  }

  function tooClose(p, self) {
    for (var k = 0; k < wolves.length; k++) {
      var o = wolves[k];
      if (k === self || o.spot == null || !o.pos) continue;
      if (Math.hypot(o.pos.x - p.x, o.pos.y - p.y) < MIN_DIST) return true;
    }
    return false;
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function appear(w, idx) {
    if (!geom || document.hidden) { w.t = setTimeout(function () { appear(w, idx); }, 3000); return; }
    var free = [];
    for (var i = 0; i < SPOTS.length; i++) if (occupied[i] == null && i !== w.last) free.push(i);
    // shuffle, then take the first one that keeps the minimum distance
    for (var j = free.length - 1; j > 0; j--) { var r = Math.floor(Math.random() * (j + 1)); var t = free[j]; free[j] = free[r]; free[r] = t; }
    var pick = null, pos = null;
    for (var n = 0; n < free.length; n++) { var p = spotXY(free[n]); if (!tooClose(p, idx)) { pick = free[n]; pos = p; break; } }
    if (pick == null) { w.t = setTimeout(function () { appear(w, idx); }, rnd(2000, 4000)); return; }

    occupied[pick] = idx; w.spot = pick; w.pos = pos; w.last = pick;
    var el = w.el, sc = rnd(0.8, 1.1);
    el.style.left = pos.x + "px"; el.style.top = pos.y + "px";
    el.style.setProperty("--fa-wolf-o", rnd(0.6, 0.9).toFixed(2));
    el.style.transition = "none";
    el.style.transform = "scale(" + sc.toFixed(2) + ")";
    void el.offsetWidth;
    el.style.transition = "";
    el.classList.add("on");
    // slow lurking drift of a few px while visible
    var dx = Math.round(rnd(-6, 6));
    el.style.transform = "translateX(" + dx + "px) scale(" + sc.toFixed(2) + ")";

    var hold = rnd(3000, 6000), visible = 1800 + hold;
    if (Math.random() < 0.7) setTimeout(function () { el.classList.add("blink"); setTimeout(function () { el.classList.remove("blink"); }, 300); }, rnd(1900, 1800 + hold - 400));
    if (Math.random() < 0.25) setTimeout(function () { el.classList.add("blink"); setTimeout(function () { el.classList.remove("blink"); }, 300); }, 1800 + hold - 300);
    w.t = setTimeout(function () {
      el.classList.remove("on");
      setTimeout(function () {
        delete occupied[w.spot]; w.spot = null; w.pos = null;
        w.t = setTimeout(function () { appear(w, idx); }, rnd(5000, 14000));
      }, 1900);
    }, visible);
  }

  measure();
  for (var k = 0; k < WOLVES; k++) {
    var el = document.createElement("div");
    el.className = "fa-wolf";
    el.innerHTML = eyeSVG();
    layer.appendChild(el);
    var w = { el: el, spot: null, pos: null, last: null, t: null };
    wolves.push(w);
    (function (w, k) { w.t = setTimeout(function () { appear(w, k); }, 1500 + k * rnd(2500, 4500) + rnd(0, 1500)); })(w, k);
  }
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(measure, 200); });
  reduce.addEventListener && reduce.addEventListener("change", function (e) { if (e.matches) layer.remove(); });
  window.__faWolves = wolves; // debug/preview hook
})();
