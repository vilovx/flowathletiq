// "Vistu krogs" interior (desktop, free mode only): its own small scene, built lazily on first entry and rendered only while the
// player is inside (the square is not rendered then). Cosy wood interior with a bar, tables + stools, fireplace, pendant lamps and a
// big cinema screen. Sitting at a table releases the mouse and overlays a Twitch player (DOM iframe) exactly on the projected screen.
// The iframe is created only when seated and removed when standing up / leaving (zero cost otherwise). No chat, no data collected.
import * as THREE from '../vendor/three.module.min.js';

export const CHANNELS = [ // verified Twitch channels (Oct 2026)
  { id: 'eslcs', label: 'ESL CS' }, { id: 'blastpremier', label: 'BLAST Premier' }, { id: 'pgl', label: 'PGL' }, { id: 'yekindar', label: 'YEKINDAR 🇱🇻' },
];
const SCREEN = { x: 0, y: 196, z: -213.5, w: 416, h: 234 }; // cinema screen: fills most of the back wall (16:9)

function tex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export function buildTavern() {
  const R = rnd(11), scene = new THREE.Scene();
  scene.background = new THREE.Color(0x120c08);
  const lam = (o) => new THREE.MeshLambertMaterial(o);
  const boards = tex(256, 256, (g, w, h) => { for (let y = 0; y < h; y += 32) { g.fillStyle = `hsl(${24 + R() * 6},${38 + R() * 10}%,${22 + R() * 7}%)`; g.fillRect(0, y, w, 31); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y + 31, w, 1);
    for (let i = 0; i < 12; i++) { g.strokeStyle = `rgba(0,0,0,${0.05 + R() * 0.08})`; g.beginPath(); const yy = y + 4 + R() * 24; g.moveTo(0, yy); g.bezierCurveTo(w * 0.3, yy + R() * 6 - 3, w * 0.6, yy + R() * 6 - 3, w, yy); g.stroke(); }
    g.fillStyle = 'rgba(0,0,0,.4)'; const xs = R() * w; g.fillRect(xs, y, 1.5, 31); } }, [3, 3]);
  const panel = tex(256, 128, (g, w, h) => { g.fillStyle = '#4a2c17'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = '#5a361c'; g.fillRect(x + 6, 10, 52, h - 20); g.strokeStyle = '#2c190c'; g.lineWidth = 3; g.strokeRect(x + 6, 10, 52, h - 20); } }, [6, 1]);
  const plaster = tex(256, 256, (g, w, h) => { g.fillStyle = '#c9a77a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${R() > 0.5 ? '255,235,200' : '90,60,30'},${R() * 0.1})`; g.fillRect(R() * w, R() * h, 3, 3); } }, [3, 3]);
  const brick = tex(128, 128, (g, w, h) => { g.fillStyle = '#3a2418'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < w; x += 32) { g.fillStyle = `hsl(${10 + R() * 10},${45 + R() * 15}%,${30 + R() * 10}%)`; g.fillRect(x + 1, y + 1, 30, 14); } }, [2, 2]);
  const M = { floor: lam({ map: boards }), panel: lam({ map: panel }), plaster: lam({ map: plaster }), wood: lam({ color: 0x6b4426 }), dark: lam({ color: 0x3b2414 }), top: lam({ map: boards.clone() }),
    iron: lam({ color: 0x2a2622 }), brick: lam({ map: brick }), bottle: [0x2f6b35, 0x6b3a14, 0x8fb8c9, 0x8a1f1f, 0xc9a227].map((c) => lam({ color: c })), brass: lam({ color: 0xc8a050 }), black: lam({ color: 0x080808 }) };
  M.top.map.repeat.set(1, 1);
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; scene.add(o); return o; };
  const box = (w, h, d, m, x, y, z, ry) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, ry);
  const W = 260, D = 220, H = 360; // tall cinema-hall ceiling
  { const f = new THREE.PlaneGeometry(2 * W, 2 * D); f.rotateX(-Math.PI / 2); add(f, M.floor, 0, 0, 0); }
  { const c = new THREE.PlaneGeometry(2 * W, 2 * D); c.rotateX(Math.PI / 2); add(c, M.dark, 0, H, 0); }
  for (let x = -W + 40; x < W; x += 90) box(14, 12, 2 * D, M.wood, x, H - 6, 0);                               // ceiling beams
  for (const z of [-180, -20, 140]) { box(2 * W, 18, 16, M.dark, 0, H - 21, z);                                   // heavy cross beams + wall braces
    for (const sx of [-1, 1]) { box(12, 70, 12, M.dark, sx * (W - 6), H - 65, z); const br = box(10, 80, 9, M.dark, sx * (W - 30), H - 52, z); br.rotation.z = sx * 0.75; } }
  const wall = (len, x, z, ry) => { const g1 = new THREE.PlaneGeometry(len, 52); add(g1, M.panel, x, 26, z, ry); const g2 = new THREE.PlaneGeometry(len, H - 52); add(g2, M.plaster, x, 52 + (H - 52) / 2, z, ry);
    const rail = box(len, 4, 3, M.wood, x, 52, z, ry); rail.position.x += Math.sin(ry) * 1.5; rail.position.z += Math.cos(ry) * 1.5; };
  wall(2 * W, 0, -D, 0); wall(2 * W, 0, D, Math.PI); wall(2 * D, -W, 0, Math.PI / 2); wall(2 * D, W, 0, -Math.PI / 2);
  // door (inside of the street door) on the front wall
  const DOOR = new THREE.Vector3(160, 0, D);
  box(52, 92, 4, M.wood, DOOR.x, 46, D - 1); box(60, 6, 6, M.dark, DOOR.x, 95, D - 2); add(new THREE.SphereGeometry(1.8, 8, 6), M.brass, DOOR.x - 18, 44, D - 4);
  // cinema screen: black frame + screen plane (poster texture while standing; the live iframe is overlaid when seated)
  box(SCREEN.w + 28, SCREEN.h + 28, 6, M.black, SCREEN.x, SCREEN.y, -D + 3);
  { const velvet = tex(256, 64, (g, w, h) => { for (let x = 0; x < w; x++) { const k = 0.45 + 0.55 * Math.pow(Math.abs(Math.sin(x / w * Math.PI * 7)), 0.6); g.fillStyle = `rgb(${Math.round(110 * k)},${Math.round(14 * k)},${Math.round(22 * k)})`; g.fillRect(x, 0, 1, h); } });
    const cm = lam({ map: velvet, color: 0xffffff }), top = H - 14, ch = top - 8;
    for (const sx of [-1, 1]) { add(new THREE.PlaneGeometry(40, ch), cm, sx * (W - 22), 8 + ch / 2, -D + 8); }
    const vt = velvet.clone(); vt.repeat.set(3, 1); vt.wrapS = THREE.RepeatWrapping; vt.needsUpdate = true;
    add(new THREE.PlaneGeometry(2 * W - 4, 28), lam({ map: vt }), 0, top - 14, -D + 10);
    box(2 * W - 4, 3, 5, M.brass, 0, top, -D + 10);
    box(SCREEN.w + 120, 14, 40, M.dark, 0, 7, -D + 20); }                                                            // small stage
  const poster = document.createElement('canvas'); poster.width = 640; poster.height = 360; const posterT = new THREE.CanvasTexture(poster); posterT.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.w, SCREEN.h), new THREE.MeshBasicMaterial({ map: posterT, toneMapped: false }));
  screen.position.set(SCREEN.x, SCREEN.y, SCREEN.z); scene.add(screen);
  const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.w * 1.5, SCREEN.h * 1.5), new THREE.MeshBasicMaterial({ map: radial('rgba(120,170,255,.35)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  screenGlow.position.set(SCREEN.x, SCREEN.y, -D + 0.4); scene.add(screenGlow);
  // bar counter along the left wall, shelves with bottles, beer taps, bar stools
  box(44, 44, 300, M.wood, -W + 52, 22, 20); box(54, 4, 306, M.top, -W + 50, 45, 20); box(4, 40, 300, M.dark, -W + 76, 20, 20);
  for (const y of [70, 100]) { box(14, 3, 280, M.wood, -W + 8, y, 20); for (let z = -110; z < 150; z += 13) { const m = M.bottle[Math.floor(R() * 5)]; add(new THREE.CylinderGeometry(2.2, 2.2, 10 + R() * 4, 8), m, -W + 8, y + 7, z + R() * 4); } }
  for (const z of [-40, 0, 40]) { add(new THREE.CylinderGeometry(1.2, 1.2, 16, 8), M.brass, -W + 46, 54, z); add(new THREE.BoxGeometry(2, 6, 2), M.dark, -W + 44, 64, z); }
  for (const z of [-90, -30, 30, 90, 150]) { add(new THREE.CylinderGeometry(9, 9, 3, 12), M.dark, -W + 96, 30, z); add(new THREE.CylinderGeometry(1.5, 2.5, 30, 6), M.iron, -W + 96, 15, z); }
  // sign above the bar
  { const st = tex(512, 128, (g, w, h) => { g.fillStyle = '#2a170c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d9b25c'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#f3dfa6'; g.font = '700 64px Oswald, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('VISTU KROGS', w / 2, h / 2 + 4); });
    const s = add(new THREE.PlaneGeometry(120, 30), lam({ map: st }), -W + 2, 126, 20, Math.PI / 2); s.position.x += 1; }
  // tables with stools; each table has one seat facing the screen
  const tables = [], seats = [];
  for (const tz of [-40, 80]) for (const tx of [-90, 30, 150]) {
    add(new THREE.CylinderGeometry(26, 26, 3, 20), M.top, tx, 30, tz); add(new THREE.CylinderGeometry(3, 3, 29, 8), M.dark, tx, 15, tz); add(new THREE.CylinderGeometry(12, 14, 2, 12), M.dark, tx, 1, tz);
    add(new THREE.CylinderGeometry(1.6, 1.6, 4, 8), lam({ color: 0xf2e6c8, emissive: 0x553311 }), tx + 8, 33.5, tz - 6);   // candle
    const mug = add(new THREE.CylinderGeometry(2.6, 2.4, 6, 10), lam({ color: 0xd9a441 }), tx - 9, 34.5, tz + 4); mug.rotation.y = R() * 6;
    for (const [dx, dz] of [[0, 38], [0, -38], [38, 0], [-38, 0]]) { add(new THREE.CylinderGeometry(9, 9, 3, 12), M.wood, tx + dx, 22, tz + dz); for (let k = 0; k < 3; k++) { const a = k * 2.1; add(new THREE.CylinderGeometry(1.1, 1.1, 21, 5), M.dark, tx + dx + Math.cos(a) * 5, 10.5, tz + dz + Math.sin(a) * 5); } }
    tables.push([tx, tz, 30]); seats.push(new THREE.Vector3(tx, 0, tz + 38));
  }
  // fireplace on the right wall
  box(10, 80, 110, M.brick, W - 5, 40, -90); box(16, 6, 124, M.wood, W - 8, 82, -90);
  const hearth = box(4, 40, 60, M.black, W - 10.5, 22, -90);
  for (const dz of [-12, 0, 12]) { const log = add(new THREE.CylinderGeometry(3, 3, 34, 7), lam({ color: 0x3a2010, emissive: 0x401000 }), W - 18, 6, -90 + dz * 0.5); log.rotation.x = Math.PI / 2; log.rotation.z = dz * 0.04; }
  const fireM = new THREE.MeshBasicMaterial({ map: radial('rgba(255,150,50,1)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const fire = add(new THREE.PlaneGeometry(46, 38), fireM, W - 16, 20, -90, -Math.PI / 2);
  const fireGlow = add(new THREE.PlaneGeometry(220, 160), new THREE.MeshBasicMaterial({ map: radial('rgba(255,120,40,.5)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), 0, 0.5, -90);
  fireGlow.rotation.x = -Math.PI / 2; fireGlow.position.x = W - 70;
  // barrels in the corners
  for (const [x, z] of [[W - 30, D - 40], [W - 30, D - 80], [-W + 110, -D + 30]]) add(new THREE.CylinderGeometry(16, 16, 44, 12), M.wood, x, 22, z);
  // pendant lamps (emissive shade + 3 shared point lights) + warm hemisphere
  scene.add(new THREE.HemisphereLight(0xffd6a0, 0x3a2414, 0.85));
  const lights = [];
  for (const [x, z] of [[-60, 20], [100, 20], [-200, 20], [-20, 150], [140, -120]]) {
    const LY = 150; // long cables from the tall ceiling, lamps stay at a cosy height
    add(new THREE.CylinderGeometry(0.4, 0.4, H - LY - 18, 4), M.iron, x, (H + LY + 18) / 2, z);
    add(new THREE.ConeGeometry(13, 10, 14, 1, true), lam({ color: 0x5a3a1a, side: THREE.DoubleSide }), x, LY + 4, z);
    add(new THREE.SphereGeometry(4, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe2a8, toneMapped: false }), x, LY, z);
    const L = new THREE.PointLight(0xffb36b, 900, 560, 1.2); L.position.set(x, LY - 4, z); scene.add(L); lights.push(L);
  }
  const fireL = new THREE.PointLight(0xff7a2a, 500, 300, 1.2); fireL.position.set(W - 30, 25, -90); scene.add(fireL);
  const drawPoster = (lines) => { const g = poster.getContext('2d'), w = poster.width, h = poster.height; const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#10131f'); gr.addColorStop(1, '#2a1630'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e21b1b'; g.beginPath(); g.arc(70, 64, 12, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '800 38px Inter, Arial, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(lines[0], 94, 66);
    g.font = '800 54px Oswald, Impact, sans-serif'; g.textAlign = 'center'; g.fillText(lines[1], w / 2, h / 2 + 4); g.font = '600 26px Inter, Arial, sans-serif'; g.fillStyle = '#cfd6ff'; g.fillText(lines[2], w / 2, h - 66); posterT.needsUpdate = true; };
  return {
    scene, seats, tables, door: DOOR, screen, drawPoster, spawn: new THREE.Vector3(DOOR.x, 0, D - 34),
    bounds: { x0: -W + 100, x1: W - 22, z0: -D + 46, z1: D - 18 }, // the bar counter is the left limit
    update(t) { const f = 0.85 + 0.1 * Math.sin(t * 7.1) + 0.06 * Math.sin(t * 15.3 + 1) + 0.04 * Math.sin(t * 29.7);
      fireM.opacity = 0.75 + 0.25 * f; fire.scale.set(1, 0.9 + 0.15 * f, 1); fireL.intensity = 420 * f; fireGlow.material.opacity = 0.7 * f; for (const L of lights) L.intensity = 860 + 40 * Math.sin(t * 3 + L.position.x); },
  };
}
function radial(c0) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, c0); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

// Twitch player overlay placed over the projected screen rectangle (camera is still while seated, so it stays aligned)
export class TvOverlay {
  constructor(root, labels) {
    this.root = root; this.labels = labels; this.ch = CHANNELS[0].id;
    const el = (this.el = document.createElement('div')); el.id = 'tv-ov'; el.className = 'hidden';
    el.innerHTML = `<div class="tv-frame"></div><div class="tv-bar"><span class="tv-live"></span><span class="tv-chs"></span><button type="button" class="btn small ghost tv-stand"></button><button type="button" class="btn small ghost tv-leave"></button><small class="tv-note"></small></div>`;
    root.appendChild(el);
    this.frame = el.querySelector('.tv-frame');
    el.querySelector('.tv-chs').innerHTML = CHANNELS.map((c) => `<button type="button" class="btn small tv-ch" data-ch="${c.id}">${c.label}</button>`).join('');
    el.querySelectorAll('.tv-ch').forEach((b) => (b.onclick = () => this.setChannel(b.dataset.ch)));
    this.text();
  }
  text() { const L = this.labels(); this.el.querySelector('.tv-live').textContent = '● ' + L.live; this.el.querySelector('.tv-stand').textContent = L.stand; this.el.querySelector('.tv-leave').textContent = L.leave; this.el.querySelector('.tv-note').textContent = L.offline; }
  src(ch) {
    const parents = ['flowathletiq.com', 'www.flowathletiq.com']; if (!parents.includes(location.hostname)) parents.push(location.hostname || 'localhost');
    return `https://player.twitch.tv/?channel=${encodeURIComponent(ch)}&${parents.map((p) => 'parent=' + encodeURIComponent(p)).join('&')}&muted=false&autoplay=true`;
  }
  setChannel(ch) { this.ch = ch; this.el.querySelectorAll('.tv-ch').forEach((b) => b.classList.toggle('on', b.dataset.ch === ch)); if (this.iframe) this.iframe.src = this.src(ch); }
  open() {
    if (!this.iframe) { const f = (this.iframe = document.createElement('iframe')); f.src = this.src(this.ch); f.allow = 'autoplay; fullscreen; picture-in-picture'; f.allowFullscreen = true; f.title = 'Twitch'; f.referrerPolicy = 'strict-origin-when-cross-origin'; this.frame.appendChild(f); }
    this.setChannel(this.ch); this.el.classList.remove('hidden');
  }
  close() { if (this.iframe) { this.iframe.remove(); this.iframe = null; } this.el.classList.add('hidden'); }
  // q = projected screen corners [tl, tr, br, bl] in px. The seated camera looks straight at the screen (image plane parallel to it, lens
  // shifted to centre it), so the projection is an exact axis-aligned rectangle and the iframe is simply positioned on it. No CSS
  // transform on purpose: Twitch pauses a player that is 3D-transformed (visibility check).
  place(q, vh) { const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = this.frame.style; s.transform = ''; s.left = Math.round(x0) + 'px'; s.top = Math.round(y0) + 'px'; s.width = Math.round(x1 - x0) + 'px'; s.height = Math.round(y1 - y0) + 'px';
    const b = this.el.querySelector('.tv-bar').style; b.left = Math.round(x0) + 'px'; b.width = Math.round(x1 - x0) + 'px'; b.top = Math.round(Math.min(y1 + 10, vh - 86)) + 'px'; }
}
export { SCREEN };

