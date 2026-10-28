#!/usr/bin/env python3
"""Export the CS2 Ranks plugin leaderboard (table lvl_base) as public JSON.

Env: DB_HOST, DB_USER, DB_PASS, DB_NAME (GitHub Actions secrets), optional DB_PORT.
Usage: python scripts/server_top.py OUT_DIR   -> OUT_DIR/server-top.json (+ OUT_DIR/server-top-week.json)
Only public fields are written: name, points, rank name, kills, deaths, K/D, headshots,
playtime and a Steam profile link. Never prints credentials.

Order: by the site-side "FA rating" (quality first, volume only guards against tiny samples).
The plugin's own points (+13 kill, -20 death, -8 lost round...) punish volume, so they are kept
in the JSON but no longer used for sorting.
  K/D*  = (kills + 50*avgKD) / (deaths + 50)       (shrunk toward the server average K/D)
  HS%*  = (headshots + 50*avgHS) / (kills + 50)    (shrunk toward the server average HS share)
  rating = 1000 * (0.6 * K/D*/avgKD + 0.4 * HS%*/avgHS) * min(1, kills / FULL)
1000 = an average player. FULL = 150 kills all-time, 50 kills for the weekly top. Server averages
are taken from all players' all-time totals (also used for the weekly top).

Weekly top ("week" key in server-top.json): the plugin only stores all-time totals, so the
workflow keeps a baseline snapshot in server-top-week.json (restored from / published to the
server-data branch). The week starts Monday 00:00 Europe/Riga; on the first run of a new week
the baseline is re-taken from the current totals. Weekly stats = current totals - baseline.
- Player not in the baseline (joined this week): baseline = plugin start values (500 pts, 0 stats).
- Any counter went down (player ran !reset / admin reset): that player's baseline is reset to the
  start values, so only play after the reset counts this week.
Baseline keys are Steam64 IDs, which are already public via the profile links.
"""
import datetime, json, os, re, sys, time
from zoneinfo import ZoneInfo

import pymysql

# Rank thresholds from the server's ranks.json (Ranks plugin, "Ranks" section), index = `rank` column.
RANKS = [("None", 0), ("Silver I", 50), ("Silver II", 100), ("Silver III", 150), ("Silver IV", 300),
         ("Silver Elite", 400), ("Silver Elite Master", 500), ("Gold Nova I", 600), ("Gold Nova II", 700),
         ("Gold Nova III", 800), ("Gold Nova Master", 900), ("Master Guardian I", 1000),
         ("Master Guardian II", 1400), ("Master Guardian Elite", 1600), ("BigStar", 2100),
         ("Legendary Eagle", 2600), ("Legendary Eagle Master", 2900), ("Supreme", 3400),
         ("The Global Elite", 4500)]
LIMIT = 100
TZ = ZoneInfo("Europe/Riga")
START = {"p": 500, "k": 0, "d": 0, "hs": 0, "t": 0}  # Ranks plugin start values for a new / reset player


def rank_name(points):
    name = RANKS[0][0]
    for n, need in RANKS:
        if points >= need:
            name = n
    return name


def steam64(steam2):
    m = re.match(r"^STEAM_[0-5]:([01]):(\d+)$", steam2 or "")
    return str(76561197960265728 + int(m.group(2)) * 2 + int(m.group(1))) if m else None


def profile(steam2):
    sid = steam64(steam2)
    return "https://steamcommunity.com/profiles/" + sid if sid else None


PRIOR = 50  # pseudo-kills/deaths at the server average
FULL_ALL, FULL_WEEK = 150, 50


def averages(rows):
    k = sum(int(r["kills"]) for r in rows); d = sum(int(r["deaths"]) for r in rows); h = sum(int(r["headshots"]) for r in rows)
    return (k / d if d and k else 1.0), (h / k if k and h else 0.5)


def rating(k, d, hs, avg, full):
    akd, ahs = avg
    kd = (k + PRIOR * akd) / (d + PRIOR)
    hsr = (hs + PRIOR * ahs) / (k + PRIOR)
    return round(1000 * (0.6 * kd / akd + 0.4 * hsr / ahs) * min(1.0, max(k, 0) / full))


def order_key(p):
    return (-p["rating"], -p["kills"])


def week_info(now):
    local = datetime.datetime.fromtimestamp(now, TZ)
    start = (local - datetime.timedelta(days=local.weekday())).date()
    iso = start.isocalendar()
    return "%d-W%02d" % (iso[0], iso[1]), start.isoformat(), (start + datetime.timedelta(days=6)).isoformat()


def weekly(rows, out, now, avg):
    """Update the baseline file and return the public weekly-top dict."""
    wid, start, end = week_info(now)
    path = os.path.join(out, "server-top-week.json")
    try:
        with open(path) as f:
            base = json.load(f)
    except (OSError, ValueError):
        base = None
    cur = {}
    for r in rows:
        sid = steam64(r["steam"])
        if sid:
            cur[sid] = {"p": int(r["value"]), "k": int(r["kills"]), "d": int(r["deaths"]),
                        "hs": int(r["headshots"]), "t": int(r["playtime"])}
    if not base or base.get("week") != wid:  # new week (or first run): snapshot current totals
        base = {"week": wid, "start": start, "taken": int(now), "players": dict(cur)}
    bp = base["players"]
    players = []
    for r in rows:
        sid = steam64(r["steam"])
        if not sid:
            continue
        c, b = cur[sid], bp.get(sid)
        if b is None or any(c[x] < b[x] for x in ("k", "d", "hs", "t")):
            b = bp[sid] = dict(START)  # new this week, or stats were reset
        dk, dd, dt = c["k"] - b["k"], c["d"] - b["d"], c["t"] - b["t"]
        if dk <= 0 and dd <= 0 and dt <= 0:
            continue
        dh = c["hs"] - b["hs"]
        players.append({
            "name": (r["name"] or "").strip()[:48] or "—",
            "rating": rating(dk, dd, dh, avg, FULL_WEEK), "points": c["p"] - b["p"], "rank": rank_name(c["p"]),
            "kills": dk, "deaths": dd, "kd": round(dk / dd, 2) if dd else float(dk),
            "headshots": dh, "hsPct": round(100 * dh / dk) if dk > 0 else 0, "playtimeMin": round(dt / 60),
            "profile": profile(r["steam"]),
        })
    players.sort(key=order_key)
    players = players[:LIMIT]
    for i, p in enumerate(players, 1):
        p["pos"] = i
    with open(path, "w") as f:
        json.dump(base, f, separators=(",", ":"))
    return {"id": wid, "start": start, "end": end, "activePlayers": len(players), "players": players}


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "data"
    db = pymysql.connect(host=os.environ["DB_HOST"], port=int(os.environ.get("DB_PORT") or 3306),
                         user=os.environ["DB_USER"], password=os.environ["DB_PASS"],
                         database=os.environ["DB_NAME"], connect_timeout=10, read_timeout=20,
                         charset="utf8mb4", cursorclass=pymysql.cursors.DictCursor)
    with db, db.cursor() as cur:
        # bots are never stored by the plugin, but keep only real SteamIDs to be safe
        cur.execute("SELECT COUNT(*) AS n FROM `lvl_base` WHERE `steam` LIKE 'STEAM\\_%%'")
        total = cur.fetchone()["n"]
        # all players (small table): sorted by FA rating here, and used for the weekly baseline
        cur.execute("SELECT `steam`,`name`,`value`,`kills`,`deaths`,`headshots`,`assists`,`playtime`,`lastconnect` "
                    "FROM `lvl_base` WHERE `steam` LIKE 'STEAM\\_%%'")
        allrows = cur.fetchall()
    now = time.time()
    os.makedirs(out, exist_ok=True)
    avg = averages(allrows)
    week = weekly(allrows, out, now, avg)
    players = []
    for r in allrows:
        k, d, hs = int(r["kills"]), int(r["deaths"]), int(r["headshots"])
        players.append({
            "name": (r["name"] or "").strip()[:48] or "—",
            "rating": rating(k, d, hs, avg, FULL_ALL),
            "points": int(r["value"]),
            "rank": rank_name(int(r["value"])),
            "kills": k, "deaths": d, "kd": round(k / d, 2) if d else float(k),
            "headshots": hs, "hsPct": round(100 * hs / k) if k > 0 else 0, "assists": int(r["assists"]),
            "playtimeMin": round(int(r["playtime"]) / 60),
            "lastSeen": int(r["lastconnect"]) or None,
            "profile": profile(r["steam"]),
        })
    players.sort(key=order_key)
    players = players[:LIMIT]
    for i, p in enumerate(players, 1):
        p["pos"] = i
    data = {"status": "ok", "ratingFormula": "1000*(0.6*KD*/avgKD + 0.4*HS*/avgHS)*min(1,kills/150|50), shrink prior 50", "serverAvg": {"kd": round(avg[0], 3), "hsPct": round(100 * avg[1], 1)}, "updated": int(now), "totalPlayers": int(total), "players": players, "week": week}
    with open(os.path.join(out, "server-top.json"), "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print("top players exported:", len(players), "of", total, "| week", week["id"], "active:", week["activePlayers"])


if __name__ == "__main__":
    main()
