#!/usr/bin/env python3
"""Export the CS2 Ranks plugin leaderboard (table lvl_base) as public JSON.

Env: DB_HOST, DB_USER, DB_PASS, DB_NAME (GitHub Actions secrets), optional DB_PORT.
Usage: python scripts/server_top.py OUT_DIR   -> OUT_DIR/server-top.json
Only public fields are written: name, points, rank name, kills, deaths, K/D, headshots,
playtime and a Steam profile link. Never prints credentials.
"""
import json, os, re, sys, time

import pymysql

# Rank thresholds from the server's ranks.json (Ranks plugin, "Ranks" section), index = `rank` column.
RANKS = [("None", 0), ("Silver I", 50), ("Silver II", 100), ("Silver III", 150), ("Silver IV", 300),
         ("Silver Elite", 400), ("Silver Elite Master", 500), ("Gold Nova I", 600), ("Gold Nova II", 700),
         ("Gold Nova III", 800), ("Gold Nova Master", 900), ("Master Guardian I", 1000),
         ("Master Guardian II", 1400), ("Master Guardian Elite", 1600), ("BigStar", 2100),
         ("Legendary Eagle", 2600), ("Legendary Eagle Master", 2900), ("Supreme", 3400),
         ("The Global Elite", 4500)]
LIMIT = 100


def rank_name(points):
    name = RANKS[0][0]
    for n, need in RANKS:
        if points >= need:
            name = n
    return name


def profile(steam2):
    m = re.match(r"^STEAM_[0-5]:([01]):(\d+)$", steam2 or "")
    if not m:
        return None
    return "https://steamcommunity.com/profiles/%d" % (76561197960265728 + int(m.group(2)) * 2 + int(m.group(1)))


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
        cur.execute("SELECT `steam`,`name`,`value`,`kills`,`deaths`,`headshots`,`assists`,`playtime`,`lastconnect` "
                    "FROM `lvl_base` WHERE `steam` LIKE 'STEAM\\_%%' ORDER BY `value` DESC, `kills` DESC LIMIT %s", (LIMIT,))
        rows = cur.fetchall()
    players = []
    for i, r in enumerate(rows, 1):
        k, d = int(r["kills"]), int(r["deaths"])
        players.append({
            "pos": i,
            "name": (r["name"] or "").strip()[:48] or "—",
            "points": int(r["value"]),
            "rank": rank_name(int(r["value"])),
            "kills": k, "deaths": d, "kd": round(k / d, 2) if d else float(k),
            "headshots": int(r["headshots"]), "assists": int(r["assists"]),
            "playtimeMin": round(int(r["playtime"]) / 60),
            "lastSeen": int(r["lastconnect"]) or None,
            "profile": profile(r["steam"]),
        })
    data = {"status": "ok", "updated": int(time.time()), "totalPlayers": int(total), "players": players}
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "server-top.json"), "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print("top players exported:", len(players), "of", total)


if __name__ == "__main__":
    main()
