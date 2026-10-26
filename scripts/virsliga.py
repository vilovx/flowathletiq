#!/usr/bin/env python3
"""Fetch Optibet E-sporta Virsliga (CS2, Latvia) standings + upcoming matches from the
official league site (Kleverr League, league.kleverr.gg) and write OUT_DIR/virsliga.json.

Reads only the public HTML pages (robots.txt allows them; /api is not used) and parses the
data embedded in the page. Exits non-zero without writing if the data looks wrong, so the
previous snapshot is kept.
Usage: python scripts/virsliga.py OUT_DIR
"""
import json, os, re, sys, time, urllib.request

BASE = "https://league.kleverr.gg"
HOME = BASE + "/lv"
CALENDAR = BASE + "/lv/calendar"
UA = "Mozilla/5.0 (compatible; FlowAthletiqBot/1.0; +https://flowathletiq.com)"
DIVISION = "Virslīga"
SEASON_MARK = "SEPT"  # "E-sporta līgas SEPTĪTĀ SEZONA (LV, S7)"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "lv,en;q=0.8"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def rsc_text(html):
    chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html, re.S)
    return "".join(json.loads('"' + c + '"') for c in chunks)


def find_objects(txt, start_pattern):
    dec = json.JSONDecoder()
    for m in re.finditer(start_pattern, txt):
        try:
            yield dec.raw_decode(txt, m.start())[0]
        except ValueError:
            continue


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "data"
    home = rsc_text(fetch(HOME))
    time.sleep(2)
    cal = rsc_text(fetch(CALENDAR))

    props = next((o for o in find_objects(home, r'\{"countryIso":"LV","stats"') if "standingDivisions" in o), None)
    if not props:
        sys.exit("standings block not found")
    tname = props.get("tournamentName") or ""
    if SEASON_MARK not in tname:
        sys.exit("unexpected season: %r" % tname)
    div = next((d for d in props["standingDivisions"] if d.get("name") == DIVISION), None)
    if not div or not div.get("rows"):
        sys.exit("Virsliga division not found")
    standings = [{
        "rank": r["rank"], "team": r["teamName"], "points": r["powerScore"],
        "wins": r["wins"], "losses": r["losses"], "roundDiff": r["roundDiff"],
        "rankDelta": r.get("rankDelta"),
        "url": "%s/lv/teams/%s/%s" % (BASE, r["teamId"], r["teamSlug"]),
    } for r in div["rows"]]

    teams = {r["team"] for r in standings}
    matches = {}
    for e in find_objects(cal, r'\{"id":\d+,"event_type":"event_match"'):
        d = e.get("details") or {}
        if (d.get("division") or {}).get("name") != DIVISION or SEASON_MARK not in (d.get("tournament_name") or ""):
            continue
        L, R = d.get("team_left") or {}, d.get("team_right") or {}
        matches[e["id"]] = {
            "datetime": e["datetime"], "status": e.get("status"),
            "left": L.get("name"), "right": R.get("name"),
            "scoreLeft": L.get("score"), "scoreRight": R.get("score"),
            "bestOf": d.get("best_of"), "stage": d.get("stage_name"),
            "url": "%s/lv/matches/%s" % (BASE, e.get("match_id") or e["id"]),
        }
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    upcoming = sorted((m for m in matches.values() if m["status"] in ("scheduled", "live") and m["datetime"] >= time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(time.time() - 4 * 3600))),
                      key=lambda m: m["datetime"])
    data = {
        "league": "Optibet E-sporta Virslīga", "season": 7, "game": "CS2", "tournamentName": tname,
        "division": DIVISION, "updated": int(time.time()), "updatedIso": now,
        "source": {"name": "Kleverr League", "url": HOME, "calendarUrl": CALENDAR},
        "standings": standings, "upcoming": upcoming[:12],
    }
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "virsliga.json"), "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print("virsliga: %d teams, %d upcoming matches (%s)" % (len(standings), len(upcoming), ", ".join(sorted(teams))))


if __name__ == "__main__":
    main()
