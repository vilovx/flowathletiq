/* FlowAthletiq — ambient "wolf eyes" in the dark side margins (desktop only).
 * 4 wolves, 6 fixed spots (3 per side). Each wolf picks a random FREE spot (never one
 * that is occupied, never stacked/overlapping), fades in slowly (3.5–4.5 s), lingers 3–6 s
 * narrowing into a slow squint with an occasional blink, fades out (3.5–4.5 s), then hides for a
 * random 15–35 s. First appearances are staggered ~8–50 s after load.
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
      "transition:opacity 4s cubic-bezier(.45,0,.25,1),transform 12s ease-in-out;will-change:opacity;" +
      "filter:drop-shadow(0 0 2px rgba(255,70,30,.95)) drop-shadow(0 0 9px rgba(230,0,0,.7)) drop-shadow(0 0 22px rgba(150,0,0,.45))}" +
    ".fa-wolf.on{opacity:var(--fa-wolf-o,.9)}" +
    ".fa-wolf svg{display:block;width:100%;height:100%;overflow:visible}" +
    ".fa-wolf .sq,.fa-wolf .bl{transform-box:fill-box;transform-origin:50% 60%}" +
    ".fa-wolf.hunt .sq{animation:fa-wolf-squint var(--fa-wolf-sq,8s) ease-in-out forwards}" +
    ".fa-wolf.blink .bl{animation:fa-wolf-blink .3s ease-in-out}" +
    "@keyframes fa-wolf-squint{0%{transform:scaleY(1)}100%{transform:scaleY(.7)}}" +
    "@keyframes fa-wolf-blink{0%,100%{transform:scaleY(1)}45%,55%{transform:scaleY(.06)}}" +
    "@media (max-width:1199px),(prefers-reduced-motion:reduce){.fa-wolf-layer{display:none}}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  // Angry hunting eyes: sharp almond, outer corners raised, upper lid cut flat and sloping hard
  // down toward the nose (heavy brow), hot yellow-white core fading to deep red, thin slit pupil.
  var uid = 0;
  function eyeSVG() {
    var g = "fawg" + (uid++);
    var eye = function (cx, flip) {
      var s = flip ? -1 : 1;
      return '<g transform="translate(' + cx + ',11) scale(' + s + ',1) rotate(9)"><g class="sq"><g class="bl">' +
        // outer corner (-13,-4) -> nearly straight top lid down to the sharp inner corner (12,3),
        // fuller curved lower lid back to the outer corner
        '<path d="M-13 -4 L-4 -3.6 Q4 -2.6 12 3 Q4 5.6 -3 4.2 Q-9 2.6 -13 -4 Z" fill="url(#' + g + ')"/>' +
        // dark brow shadow along the upper lid
        '<path d="M-13.5 -4.6 L-4 -4.2 Q4 -3.2 12.5 2.6" fill="none" stroke="#120000" stroke-width="1.2" stroke-linecap="round" opacity=".9"/>' +
        '<ellipse cx="0.6" cy="0.6" rx="0.55" ry="2.7" fill="#140000" opacity=".9"/></g></g></g>';
    };
    return '<svg viewBox="0 0 64 22" aria-hidden="true" focusable="false"><defs>' +
      '<radialGradient id="' + g + '" cx="45%" cy="55%" r="62%">' +
      '<stop offset="0" stop-color="#fff4c8"/><stop offset=".18" stop-color="#ffb347"/><stop offset=".38" stop-color="#ff2a10"/>' +
      '<stop offset=".72" stop-color="#c00000"/><stop offset="1" stop-color="#3a0000"/></radialGradient></defs>' +
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
    var fin = rnd(3500, 4500), fout = rnd(3500, 4500), hold = rnd(3000, 6000);
    el.style.setProperty("--fa-wolf-o", rnd(0.65, 0.95).toFixed(2));
    el.style.setProperty("--fa-wolf-sq", ((fin + hold) / 1000).toFixed(1) + "s");
    el.style.transition = "none";
    el.style.transform = "scale(" + sc.toFixed(2) + ")";
    void el.offsetWidth;
    el.style.transition = "";
    el.style.transitionDuration = (fin / 1000).toFixed(2) + "s, 12s";
    el.classList.add("on", "hunt");
    // slow lurking drift of a few px while visible
    var dx = Math.round(rnd(-6, 6));
    el.style.transform = "translateX(" + dx + "px) scale(" + sc.toFixed(2) + ")";

    var blink = function () { el.classList.add("blink"); setTimeout(function () { el.classList.remove("blink"); }, 340); };
    if (Math.random() < 0.6) setTimeout(blink, rnd(fin * 0.8, fin + hold - 500));
    if (Math.random() < 0.2) setTimeout(blink, fin + hold - 200);
    w.t = setTimeout(function () {
      el.style.transitionDuration = (fout / 1000).toFixed(2) + "s, 12s";
      el.classList.remove("on");
      setTimeout(function () {
        el.classList.remove("hunt");
        delete occupied[w.spot]; w.spot = null; w.pos = null;
        w.t = setTimeout(function () { appear(w, idx); }, rnd(15000, 35000));
      }, fout + 150);
    }, fin + hold);
  }

  measure();
  for (var k = 0; k < WOLVES; k++) {
    var el = document.createElement("div");
    el.className = "fa-wolf";
    el.innerHTML = eyeSVG();
    layer.appendChild(el);
    var w = { el: el, spot: null, pos: null, last: null, t: null };
    wolves.push(w);
    (function (w, k) { w.t = setTimeout(function () { appear(w, k); }, rnd(6000, 11000) + k * rnd(7000, 11000) + rnd(0, 4000)); })(w, k);
  }
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(measure, 200); });
  reduce.addEventListener && reduce.addEventListener("change", function (e) { if (e.matches) layer.remove(); });
  window.__faWolves = wolves; // debug/preview hook
})();
