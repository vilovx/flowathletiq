#!/usr/bin/env python3
"""Registered teams for FlowAthletiq FACEIT tournaments -> OUT_DIR/tournament-teams.json.

Uses only the official FACEIT Data API v4 (https://open.faceit.com/data/v4, docs:
https://docs.faceit.com/docs/data-api/data) with a server-side API key:
  GET /championships/{championship_id}                 -> slots, current_subscriptions, faceit_url
  GET /championships/{championship_id}/subscriptions   -> items[].team{name,avatar,faceit_url,members[]}, roster[]
Tournaments are read from data/tournaments.js (objects with faceitChampionshipId set and status != "finished").

No-op (exit 0, previous file untouched) when FACEIT_API_KEY is unset or no tournament has a championship id.
A tournament whose fetch fails keeps its previous entry, so a FACEIT hiccup never empties the list.
Usage: python scripts/faceit_teams.py OUT_DIR
"""
import json, os, re, sys, time, urllib.error, urllib.request

API = "https://open.faceit.com/data/v4"
CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "tournaments.js")
MAX_TEAMS = 256


def tournaments():
    src = open(CONFIG, encoding="utf-8").read()
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    out = []
    # each tournament object starts with `id: "..."`; read the fields we need from its chunk
    for chunk in re.split(r"\n\s*\{\s*\n", src)[1:]:
        def field(name):
            m = re.search(r"\b" + name + r'\s*:\s*(null|"([^"]*)")', chunk)
            return m.group(2) if m and m.group(2) is not None else None
        tid, champ, status = field("id"), field("faceitChampionshipId"), field("status")
        if tid and champ and status != "finished":
            out.append((tid, champ.strip()))
    return out


def get(path, key, params=""):
    req = urllib.request.Request(API + path + params, headers={
        "Authorization": "Bearer " + key, "Accept": "application/json",
        "User-Agent": "FlowAthletiq/1.0 (+https://flowathletiq.com)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and attempt < 2:
                time.sleep(3 * (attempt + 1)); continue
            raise


def team_entry(sub):
    team = sub.get("team") or {}
    members = team.get("members") or []
    by_id = {m.get("user_id"): m for m in members}
    roster = [by_id[u] for u in (sub.get("roster") or []) if u in by_id] or members
    subs = [by_id[u] for u in (sub.get("substitutes") or []) if u in by_id]
    def player(m):
        return {"nickname": m.get("nickname") or "", "country": (m.get("country") or "").upper(),
                "skillLevel": m.get("skill_level"), "faceitUrl": (m.get("faceit_url") or "").replace("{lang}", "en")}
    return {
        "teamId": team.get("team_id"),
        "name": team.get("name") or team.get("nickname") or "?",
        "avatar": team.get("avatar") or "",
        "faceitUrl": (team.get("faceit_url") or "").replace("{lang}", "en"),
        "status": sub.get("status") or "",
        "players": [player(m) for m in roster if m.get("nickname")],
        "substitutes": [player(m) for m in subs if m.get("nickname")],
    }


def fetch_one(champ, key):
    info = get("/championships/" + champ, key)
    items, offset = [], 0
    while offset < MAX_TEAMS:
        page = get("/championships/" + champ + "/subscriptions", key, "?offset=%d&limit=10" % offset)
        batch = page.get("items") or []
        items += batch
        if len(batch) < 10:
            break
        offset += 10
        time.sleep(0.3)
    teams = [team_entry(s) for s in items]
    return {
        "championshipId": champ,
        "name": info.get("name"),
        "faceitUrl": (info.get("faceit_url") or "").replace("{lang}", "en"),
        "faceitStatus": info.get("status"),
        "slots": info.get("slots"),
        "currentSubscriptions": info.get("current_subscriptions"),
        "full": info.get("full"),
        "teams": teams,
        "fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "out"
    key = (os.environ.get("FACEIT_API_KEY") or "").strip()
    todo = tournaments()
    if not key:
        print("FACEIT_API_KEY not set - skipping registered teams."); return 0
    if not todo:
        print("No tournament with faceitChampionshipId - skipping registered teams."); return 0
    path = os.path.join(out_dir, "tournament-teams.json")
    try:
        prev = json.load(open(path, encoding="utf-8"))
    except Exception:
        prev = {}
    result = {"updated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
              "tournaments": dict(prev.get("tournaments") or {})}
    ok = 0
    for tid, champ in todo:
        try:
            result["tournaments"][tid] = fetch_one(champ, key)
            ok += 1
            print("%s: %d teams" % (tid, len(result["tournaments"][tid]["teams"])))
        except Exception as e:  # keep previous entry for this tournament
            print("%s: FACEIT fetch failed (%s), keeping previous data" % (tid, e))
    if ok:
        os.makedirs(out_dir, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=1)
    return 0


if __name__ == "__main__":
    sys.exit(main())
