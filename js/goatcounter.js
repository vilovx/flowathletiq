/* GoatCounter (https://www.goatcounter.com) — cookie-free, anonymous visit statistics.
 * Dashboard: https://flowathletiq.goatcounter.com
 * Settings object documented at https://www.goatcounter.com/help/js (window.goatcounter.path).
 * Count each article/category as its own page: keep only the meaningful query params
 * (?id= for articles, ?cat= for categories) and drop ?lang=, cache-busters, tracking params, etc.
 * localhost / file:// visits are not counted (GoatCounter default). */
window.goatcounter = {
  path: function (p) {
    var KEEP = ["id", "cat"];
    var u;
    try { u = new URL(p, location.origin); } catch (e) { return p; }
    var path = u.pathname.replace(/\/index\.html$/, "/");
    var q = new URLSearchParams();
    KEEP.forEach(function (k) { var v = u.searchParams.get(k); if (v) q.set(k, v); });
    var s = q.toString();
    return path + (s ? "?" + s : "");
  }
};
