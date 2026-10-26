#!/usr/bin/env python3
"""Kleverr E-sporta liga S7 (LV, CS2): standings for every division/group, upcoming matches,
and team rosters (nickname, role, in-game role, country), from the official league site
league.kleverr.gg (public pages only; robots.txt allows them, /api is not used).

Usage: python scripts/leagues.py OUT_DIR [--rosters]
  Writes OUT_DIR/leagues.json. Rosters (one page per team, ~60 requests, polite delay) are
  refreshed only with --rosters or when older than 20 h; otherwise kept from the previous file.
"""
import json, os, re, sys, time, urllib.request

BASE = "https://league.kleverr.gg"
UA = "Mozilla/5.0 (compatible; FlowAthletiqBot/1.0; +https://flowathletiq.com)"
SEASON_MARK = "SEPT"  # E-sporta līgas SEPTĪTĀ SEZONA (LV, S7)
# FACEIT championship per division (read from Kleverr match pages, faceit_championship_id)
FACEIT = {
    "Virslīga": "3a957279-d560-4e1d-9315-a1984b4ecd69",
    "1. līga": "3ecfaf70-ef64-48f3-8321-74d582f30ba5",
    "2. līga": "7b0fc446-736a-442b-9f62-e9e71629cb5e",
    "3. līga": "dd88e8eb-430b-4fd8-b5b6-23bf37874b62",
}
ROSTER_MAX_AGE = 20 * 3600


def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": UA, "Accept-Language": "lv,en;q=0.8"})
    with urllib.request.urlopen(req, timeout=30) as r:
        html = r.read().decode("utf-8")
    chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html, re.S)
    return "".join(json.loads('"' + c + '"') for c in chunks)


def objects(txt, pattern):
    dec = json.JSONDecoder()
    for m in re.finditer(pattern, txt):
        try:
            yield dec.raw_decode(txt, m.start())[0]
        except ValueError:
            pass


def roster(team_id, slug):
    txt = fetch("/lv/teams/%s/%s" % (team_id, slug))
    j = txt.find('"players":[{"history_id"')
    if j < 0:
        return None
    dec = json.JSONDecoder()
    for st in [m.start() for m in re.finditer(r'\{"id":%s,"name"' % team_id, txt[:j])][::-1]:
        try:
            o, end = dec.raw_decode(txt, st)
        except ValueError:
            continue
        if end > j and "players" in o:
            members = []
            for p in o["players"]:
                if p.get("status") != "accepted":
                    continue
                members.append({"nick": p.get("player_name"), "role": p.get("member_role"),
                                "ingame": p.get("role_type"), "country": p.get("country"),
                                "url": "%s/lv/players/%s/%s" % (BASE, p["id"], p["slug"])})
            order = {"PLAYER": 0, "SUBSTITUTE": 1, "COACH": 2}
            members.sort(key=lambda m: order.get(m["role"], 3))
            return {"members": members, "faceitTeam": o.get("faceit_team_id")}
    return None


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "data"
    force_rosters = "--rosters" in sys.argv
    path = os.path.join(out, "leagues.json")
    try:
        prev = json.load(open(path))
    except (OSError, ValueError):
        prev = {}

    home = fetch("/lv")
    props = next((o for o in objects(home, r'\{"countryIso":"LV","stats"') if "standingDivisions" in o), None)
    if not props or SEASON_MARK not in (props.get("tournamentName") or ""):
        sys.exit("standings not found / unexpected season")
    time.sleep(2)
    cal = fetch("/lv/calendar")

    divisions, teams = [], {}
    for d in props["standingDivisions"]:
        rows = []
        for r in d.get("rows") or []:
            tid = str(r["teamId"])
            teams.setdefault(tid, {"name": r["teamName"], "slug": r["teamSlug"],
                                   "url": "%s/lv/teams/%s/%s" % (BASE, r["teamId"], r["teamSlug"])})
            rows.append({"rank": r["rank"], "teamId": tid, "team": r["teamName"], "points": r["powerScore"],
                         "wins": r["wins"], "losses": r["losses"], "roundDiff": r["roundDiff"]})
        divisions.append({"key": d.get("key"), "name": d.get("name"), "group": d.get("groupKey") or "",
                          "faceit": "https://www.faceit.com/en/championship/%s" % FACEIT[d["name"]] if d.get("name") in FACEIT else None,
                          "rows": rows})
    if not any(d["name"] == "Virslīga" for d in divisions):
        sys.exit("no Virsliga division")

    cutoff = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(time.time() - 4 * 3600))
    upcoming = {}
    for e in objects(cal, r'\{"id":\d+,"event_type":"event_match"'):
        det = e.get("details") or {}
        if SEASON_MARK not in (det.get("tournament_name") or "") or e.get("status") not in ("scheduled", "live") or e["datetime"] < cutoff:
            continue
        name = (det.get("division") or {}).get("name")
        upcoming.setdefault(name, []).append({
            "datetime": e["datetime"], "status": e["status"], "bestOf": det.get("best_of"),
            "left": (det.get("team_left") or {}).get("name"), "right": (det.get("team_right") or {}).get("name"),
            "url": "%s/lv/matches/%s" % (BASE, e.get("match_id") or e["id"])})
    for k, v in upcoming.items():
        upcoming[k] = sorted({m["url"]: m for m in v}.values(), key=lambda m: m["datetime"])

    rosters = prev.get("rosters") or {}
    stale = force_rosters or time.time() - (prev.get("rostersUpdated") or 0) > ROSTER_MAX_AGE
    missing = [t for t in teams if t not in rosters]
    todo = list(teams) if stale else missing
    for tid in todo:
        time.sleep(1.5)
        try:
            r = roster(tid, teams[tid]["slug"])
            if r is not None:
                rosters[tid] = r
        except Exception as e:  # keep previous roster on errors
            print("roster failed", tid, type(e).__name__)
    rosters = {k: v for k, v in rosters.items() if k in teams}
    for tid, r in rosters.items():
        if r.get("faceitTeam"):
            teams[tid]["faceit"] = "https://www.faceit.com/en/teams/%s" % r["faceitTeam"]

    data = {"league": "Kleverr E-sporta līga", "season": 7, "game": "CS2", "tournamentName": props["tournamentName"],
            "updated": int(time.time()),
            "rostersUpdated": int(time.time()) if stale else prev.get("rostersUpdated", int(time.time())),
            "source": {"name": "Kleverr League", "url": BASE + "/lv", "calendarUrl": BASE + "/lv/calendar",
                       "faceitOrganizer": "https://www.faceit.com/en/organizers/fb0f9717-893c-41d9-8acd-760cbf731adc/kleverr"},
            "divisions": divisions, "teams": teams, "rosters": rosters, "upcoming": upcoming}
    os.makedirs(out, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("leagues: %d groups, %d teams, %d rosters (%d fetched), upcoming %s" % (
        len(divisions), len(teams), len(rosters), len(todo), {k: len(v) for k, v in upcoming.items()}))


if __name__ == "__main__":
    main()
