#!/usr/bin/env python3
"""Query the FlowAthletiq CS2 server over A2S and write status + rolling 24h history.

Usage: python scripts/server_status.py OUT_DIR
Writes OUT_DIR/server-status.json and OUT_DIR/server-history.json.
"""
import ipaddress, json, os, socket, sys, time, urllib.request
from datetime import datetime, timezone

import a2s

HOST, PORT = "flowathletiq.dat.gg", 25082
HISTORY_SECONDS = 24 * 3600


def resolve(host):
    try:
        ip = socket.gethostbyname(host)
        if not ipaddress.ip_address(ip).is_private and not ip.startswith("198.18."):
            return ip
    except OSError:
        pass
    # Fallback: DNS-over-HTTPS (some sandboxes hand out fake IPs)
    with urllib.request.urlopen("https://dns.google/resolve?name=%s&type=A" % host, timeout=10) as r:
        ans = json.load(r).get("Answer", [])
    return [a["data"] for a in ans if a.get("type") == 1][-1]


def query():
    now = int(time.time())
    base = {"host": HOST, "port": PORT, "address": "%s:%d" % (HOST, PORT), "updated": now}
    try:
        ip = resolve(HOST)
        info = a2s.info((ip, PORT), timeout=5)
        bots = max(0, int(info.bot_count or 0))
        total = max(0, int(info.player_count or 0))
        humans = max(0, total - bots)
        base.update({
            "online": True,
            "name": info.server_name,
            "map": info.map_name,
            "players": total,
            "humans": humans,
            "bots": bots,
            "maxPlayers": info.max_players,
            "vac": bool(info.vac_enabled),
            "password": bool(info.password_protected),
            "version": info.version,
            "pingMs": round(info.ping * 1000) if info.ping else None,
        })
    except Exception as e:  # offline / timeout
        base.update({"online": False, "players": 0, "humans": 0, "bots": 0, "maxPlayers": None, "error": type(e).__name__})
    return base


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "data"
    os.makedirs(out, exist_ok=True)
    status = query()
    hist_path = os.path.join(out, "server-history.json")
    try:
        with open(hist_path) as f:
            hist = json.load(f)
    except (OSError, ValueError):
        hist = {"points": []}
    now = status["updated"]
    pts = [p for p in hist.get("points", []) if now - p[0] <= HISTORY_SECONDS]
    # point = [unix_time, humans, total_incl_bots, online(1/0)]
    pts.append([now, status["humans"], status["players"], 1 if status["online"] else 0])
    hist = {"host": status["address"], "fields": ["t", "humans", "total", "online"], "points": pts}
    with open(os.path.join(out, "server-status.json"), "w") as f:
        json.dump(status, f, ensure_ascii=False, indent=1)
    with open(hist_path, "w") as f:
        json.dump(hist, f, separators=(",", ":"))
    print(json.dumps({k: status.get(k) for k in ("online", "name", "map", "humans", "bots", "players", "maxPlayers")}))
    print("history points:", len(pts), "at", datetime.fromtimestamp(now, timezone.utc).isoformat())


if __name__ == "__main__":
    main()
