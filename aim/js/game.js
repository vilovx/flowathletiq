import * as THREE from '../vendor/three.module.min.js';
import { buildWorld } from './world.js';
import { createChicken, Puffs } from './chicken.js';
import { drawCrosshair, DEFAULT_XHAIR, COLOR_PRESETS } from './crosshair.js';
import { decodeCrosshair, encodeCrosshair } from './sharecode.js';
import { RANKS, rankForLevel, rankIcon } from './ranks.js';
import { Sfx } from './audio.js';

const $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const DEBUG = Q.has('debug');

// ---------------- CS2 constants ----------------
const M_YAW = 0.022, M_PITCH = 0.022;          // degrees per mouse count (CS2 default)
const HFOV_169 = 106.26;                          // CS2 horizontal FOV at 16:9
const VFOV = 2 * Math.atan(Math.tan((HFOV_169 * Math.PI / 180) / 2) * 9 / 16) * 180 / Math.PI; // ~73.74 (Hor+)
const AK = {
  name: 'AK', damage: 36, armorRatio: 1.55, hsMult: 4, legMult: 0.75, rangeMod: 0.98,
  cycle: 60 / 600, mag: 30, reload: 2.45, range: 8192,
};
const EYE = 64;

// ---------------- Settings ----------------
const LS = { settings: 'fa_aim_settings', xhair: 'fa_aim_xhair', best: 'fa_aim_best' };
const load = (k, d) => { try { return { ...d, ...(JSON.parse(localStorage.getItem(k)) || {}) }; } catch { return { ...d }; } };
const settings = load(LS.settings, { sens: 1.25, dpi: 800, sound: true, fps: false });
let xhair = load(LS.xhair, DEFAULT_XHAIR);
let xhairRaw = null;
const saveSettings = () => localStorage.setItem(LS.settings, JSON.stringify(settings));
const saveXhair = () => localStorage.setItem(LS.xhair, JSON.stringify(xhair));
if (Q.get('xhair')) { try { const d = decodeCrosshair(Q.get('xhair')); applyDecoded(d); saveXhair(); } catch (e) { console.warn('xhair param invalid'); } }
function applyDecoded(d) {
  xhairRaw = d.raw;
  xhair = { length: d.length, thickness: d.thickness, gap: d.gap, outlineEnabled: d.outlineEnabled, outline: d.outline,
    color: d.color > 5 ? 5 : d.color, red: d.red, green: d.green, blue: d.blue, alpha: d.alphaEnabled ? d.alpha : 255,
    centerDotEnabled: d.centerDotEnabled, tStyleEnabled: d.tStyleEnabled, style: d.style };
}
const cm360 = () => (360 / (settings.sens * M_YAW)) / settings.dpi * 2.54;
const sensText = () => `Sens ${settings.sens} · ${settings.dpi} DPI · ${cm360().toFixed(1)} cm/360°`;

// ---------------- Renderer / scene ----------------
const canvas = $('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.autoClear = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(VFOV, 16 / 9, 2, 6000);
camera.rotation.order = 'YXZ';
const PLAYER = new THREE.Vector3(0, EYE, 250);
camera.position.copy(PLAYER);
const world = buildWorld(scene);
const puffs = new Puffs(scene);
const sfx = new Sfx(() => settings.sound);

// view model (separate scene so it never clips into walls)
const vmScene = new THREE.Scene();
const vmCam = new THREE.PerspectiveCamera(60, 16 / 9, 0.5, 200);
vmScene.add(new THREE.HemisphereLight(0xffffff, 0x665544, 1.6));
const vmSun = new THREE.DirectionalLight(0xfff0d2, 1.6); vmSun.position.set(-3, 5, 2); vmScene.add(vmSun);
const gun = buildGun(); vmScene.add(gun.root);

function buildGun() {
  const root = new THREE.Group();
  const metal = new THREE.MeshLambertMaterial({ color: 0x2b2d31 }), wood = new THREE.MeshLambertMaterial({ color: 0x8a4f25 });
  const skin = new THREE.MeshLambertMaterial({ color: 0x1f2a36 });
  const m = (g, mat, x, y, z, rx = 0) => { const o = new THREE.Mesh(g, mat); o.position.set(x, y, z); o.rotation.x = rx; root.add(o); return o; };
  m(new THREE.BoxGeometry(2.2, 2.6, 14), metal, 0, 0, -4);                     // receiver
  m(new THREE.BoxGeometry(2.4, 2.2, 8), wood, 0, -0.2, -14);                   // handguard
  m(new THREE.CylinderGeometry(0.45, 0.45, 12, 8), metal, 0, 0.5, -22, Math.PI / 2); // barrel
  m(new THREE.CylinderGeometry(0.35, 0.35, 9, 6), metal, 0, 1.6, -15, Math.PI / 2);  // gas tube
  m(new THREE.BoxGeometry(1.8, 6, 2.6), metal, 0, -4, -6, 0.35);              // magazine
  m(new THREE.BoxGeometry(1.6, 4, 2), wood, 0, -3, 1.5, -0.35);               // grip
  m(new THREE.BoxGeometry(2, 3, 10), wood, 0, -1, 7.5, -0.12);                // stock
  m(new THREE.BoxGeometry(0.5, 1.4, 0.5), metal, 0, 1.6, -27);                // front sight
  m(new THREE.BoxGeometry(4, 3, 8), skin, -1.5, -2.6, -12.5, 0.1);            // gloved hand (support)
  m(new THREE.BoxGeometry(3.5, 4, 5), skin, 0.6, -4, 3.5, -0.3);              // gloved hand (trigger)
  const flash = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  flash.position.set(0, 0.5, -28.5); flash.visible = false; root.add(flash);
  const flash2 = flash.clone(); flash2.rotation.z = Math.PI / 4; flash2.scale.setScalar(0.7); flash.add(flash2);
  root.scale.setScalar(0.5); root.position.set(7.2, -6.8, -17); root.rotation.y = 0.1;
  return { root, flash, base: root.position.clone(), kick: 0 };
}

// ---------------- Crosshair overlay ----------------
const xc = $('xh'), xctx = xc.getContext('2d');
let hitMarker = { t: 0, kill: false };
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  vmCam.aspect = w / h; vmCam.updateProjectionMatrix();
  const dpr = devicePixelRatio || 1;
  xc.width = Math.round(w * dpr); xc.height = Math.round(h * dpr);
}
addEventListener('resize', resize); resize();
function drawOverlay(dt) {
  xctx.clearRect(0, 0, xc.width, xc.height);
  if (state !== 'play' && state !== 'over-anim') return;
  const cx = xc.width / 2, cy = xc.height / 2;
  drawCrosshair(xctx, xhair, cx, cy, xc.height);
  if (hitMarker.t > 0) {
    hitMarker.t -= dt;
    const s = xc.height / 1080, a = Math.min(1, hitMarker.t / 0.12);
    xctx.strokeStyle = hitMarker.kill ? `rgba(255,70,70,${a})` : `rgba(255,255,255,${a})`;
    xctx.lineWidth = Math.max(1.5, 2.5 * s);
    const g = 9 * s, l = 9 * s;
    xctx.beginPath();
    for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { xctx.moveTo(cx + dx * g, cy + dy * g); xctx.lineTo(cx + dx * (g + l), cy + dy * (g + l)); }
    xctx.stroke();
  }
}

// ---------------- Game state ----------------
let state = 'menu';
let yaw = 0, pitch = 3; // degrees
let G = null;            // run state
const chickens = [];
let timeScale = 1;
let rawInput = null;

function levelCfg(L) {
  return {
    count: 6 + 2 * (L - 1),
    interval: Math.max(0.45, 2.0 * Math.pow(0.88, L - 1)),
    warn: Math.max(0.3, 0.9 - 0.06 * (L - 1)),
    jump: Math.max(0.75, 1.35 - 0.05 * (L - 1)),
    speed: Math.min(260, 85 + 15 * (L - 1)),
    spawnCount: Math.min(world.spawns.length, 4 + 2 * (L - 1)),
    exits: L < 3 ? 1 : 3,
  };
}

function newRun(level = 1) {
  for (const c of chickens) scene.remove(c.root);
  chickens.length = 0;
  G = { level, score: 0, kills: 0, hsKills: 0, shots: 0, hits: 0, ammo: AK.mag, reloadT: 0, nextShot: 0, burst: 0, lastShot: -9,
    trigger: false, time: 0, over: false };
  startLevel(level);
}
function startLevel(L) {
  const cfg = levelCfg(L);
  Object.assign(G, { level: L, cfg, spawned: 0, spawnT: 1.6, timeLeft: cfg.count * cfg.interval + 12, between: 0 });
  showBanner(`Līmenis ${L}`, `${cfg.count} vistas`);
  updateHud();
}

function spawnChicken(opts = {}) {
  const cfg = G.cfg;
  const parts = createChicken();
  const sp = opts.spawn || world.spawns[Math.floor(Math.random() * cfg.spawnCount)];
  const s = world.site;
  let land;
  for (let k = 0; k < 20; k++) {
    land = new THREE.Vector3(s.x0 + Math.random() * (s.x1 - s.x0), s.y, s.z0 + Math.random() * (s.z1 - s.z0));
    if (!world.blockers.some((b) => land.x > b.x0 && land.x < b.x1 && land.z > b.z0 && land.z < b.z1)) break;
  }
  if (opts.land) land = opts.land;
  const exit = opts.exit || world.exits[Math.floor(Math.random() * cfg.exits)];
  const c = { ...parts, hp: 100, armor: 100, helmet: true, state: 'perch', t: 0, p0: sp.p.clone(), land,
    path: exit.path.map((v) => v.clone()), wp: 0, warn: cfg.warn, jumpDur: cfg.jump * (0.9 + Math.random() * 0.2),
    arc: 50 + Math.random() * 50, speed: cfg.speed * (0.9 + Math.random() * 0.25), dead: false, phase: Math.random() * 6 };
  c.root.position.copy(c.p0);
  faceTo(c, land);
  c.root.__c = c; scene.add(c.root); chickens.push(c);
  if (opts.state === 'jump') { c.state = 'jump'; c.t = (opts.u ?? 0.5) * c.jumpDur; }
  if (opts.state === 'run') { c.state = 'run'; c.root.position.copy(land); c.t = 0; if (opts.runDist) moveAlong(c, opts.runDist); }
  return c;
}
function faceTo(c, target) {
  const dx = target.x - c.root.position.x, dz = target.z - c.root.position.z;
  c.root.rotation.y = Math.atan2(dx, dz);
}
function moveAlong(c, dist) {
  while (dist > 0 && c.wp < c.path.length) {
    const tgt = c.path[c.wp]; const p = c.root.position;
    const d = Math.hypot(tgt.x - p.x, tgt.z - p.z);
    faceTo(c, tgt);
    if (d <= dist) { p.x = tgt.x; p.z = tgt.z; dist -= d; c.wp++; }
    else { p.x += (tgt.x - p.x) / d * dist; p.z += (tgt.z - p.z) / d * dist; dist = 0; }
  }
  return c.wp >= c.path.length;
}

function updateChicken(c, dt) {
  c.t += dt; c.phase += dt;
  const P = c.root.position;
  if (c.state === 'perch') {
    // nervous pre-jump: crouch + wing shake
    c.model.position.y = -Math.abs(Math.sin(c.t * 18)) * 1.5;
    c.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (0.2 + Math.abs(Math.sin(c.t * 25)) * 0.4)));
    if (c.t >= c.warn) { c.state = 'jump'; c.t = 0; sfx.cluck(); }
  } else if (c.state === 'jump') {
    const u = Math.min(1, c.t / c.jumpDur);
    P.x = c.p0.x + (c.land.x - c.p0.x) * u;
    P.z = c.p0.z + (c.land.z - c.p0.z) * u;
    P.y = c.p0.y + (c.land.y - c.p0.y) * u + c.arc * 4 * u * (1 - u);
    c.model.position.y = 0;
    c.model.rotation.x = (u - 0.5) * 0.6;
    c.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (0.3 + Math.abs(Math.sin(c.t * 30)) * 1.1)));
    c.legs.forEach((l) => (l.rotation.x = 0.6));
    if (u >= 1) { c.state = 'run'; c.t = 0; c.model.rotation.x = 0; puffs.burst(P.clone().setY(P.y + 2), 4, 0xcbb38a, 60); }
  } else if (c.state === 'run') {
    const escaped = moveAlong(c, c.speed * dt);
    c.model.position.y = Math.abs(Math.sin(c.phase * 14)) * 2.5;
    c.legs.forEach((l, i) => (l.rotation.x = Math.sin(c.phase * 22 + i * Math.PI) * 0.8));
    c.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (0.15 + Math.abs(Math.sin(c.phase * 14)) * 0.35)));
    P.y = world.site.y * (Math.abs(P.x) < 310 && P.z > -440 && P.z < -140 ? 1 : 0);
    if (escaped && !G.over) chickenEscaped(c);
  } else if (c.state === 'dead') {
    c.model.rotation.z = Math.min(Math.PI / 2, c.t * 9);
    if (c.fallV !== undefined) { c.fallV -= 600 * dt; P.y = Math.max(groundY(P), P.y + c.fallV * dt); }
    if (c.t > 1.4) { c.model.scale.multiplyScalar(Math.max(0, 1 - dt * 6)); }
    if (c.t > 2) { scene.remove(c.root); c.removed = true; }
  }
}
const groundY = (P) => (Math.abs(P.x) < 310 && P.z > -440 && P.z < -140 ? world.site.y : 0);

function chickenEscaped(c) {
  G.over = true;
  c.root.visible = false;
  sfx.alarm();
  endRun('Vista aizbēga!');
}

// ---------------- Shooting ----------------
const ray = new THREE.Raycaster();
const decals = []; let decalI = 0;
{
  const geo = new THREE.CircleGeometry(1.6, 8), mat = new THREE.MeshBasicMaterial({ color: 0x1a1410, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  for (let i = 0; i < 40; i++) { const d = new THREE.Mesh(geo, mat); d.visible = false; scene.add(d); decals.push(d); }
}
function shotDirection() {
  // First shot is accurate. Later shots in a burst climb and sway (simplified, not the full CS2 spray pattern yet).
  const n = G.burst;
  let dp = 0, dy = 0;
  if (n > 0) {
    dp = Math.min(n, 9) * 0.55 + (n > 9 ? Math.random() * 0.6 : 0);
    dy = n > 9 ? Math.sin(n * 0.7) * 1.4 : (Math.random() - 0.5) * 0.3;
    const cone = Math.min(1, n / 6) * 0.35;
    const a = Math.random() * Math.PI * 2, r = Math.random() * cone;
    dp += Math.sin(a) * r; dy += Math.cos(a) * r;
  }
  const e = new THREE.Euler((pitch + dp) * Math.PI / 180, (yaw + dy) * Math.PI / 180, 0, 'YXZ');
  return new THREE.Vector3(0, 0, -1).applyEuler(e);
}
function fire(dirOverride) {
  G.ammo--; G.shots++; G.lastShot = G.time;
  const dir = dirOverride || shotDirection();
  G.burst++;
  gun.kick = 1; gun.flash.visible = true; gun.flash.rotation.z = Math.random() * 3; setTimeout(() => (gun.flash.visible = false), 45);
  sfx.shot();
  ray.set(camera.position, dir); ray.far = AK.range;
  const targets = world.worldMeshes.slice();
  for (const c of chickens) if (!c.dead) targets.push(...c.hit);
  const hits = ray.intersectObjects(targets, false);
  if (!hits.length) return;
  const h = hits[0];
  if (h.object.userData.zone) damageChicken(h.object.userData.root.__c, h.object.userData.zone, h.distance, h.point);
  else placeDecal(h);
  updateHud();
}
function placeDecal(h) {
  const d = decals[decalI++ % decals.length];
  d.position.copy(h.point); d.visible = true;
  const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
  d.lookAt(h.point.clone().add(n));
  puffs.burst(h.point.clone().addScaledVector(n, 2), 3, 0xd9c7a2, 70);
}
// CS2 damage model: range falloff, hitgroup multiplier, armor ratio 1.55 => 77.5% of damage goes to health.
function calcDamage(c, zone, dist) {
  let dmg = AK.damage * Math.pow(AK.rangeMod, dist / 500);
  if (zone === 'head') dmg *= AK.hsMult; else if (zone === 'leg') dmg *= AK.legMult;
  const armored = c.armor > 0 && (zone === 'body' || (zone === 'head' && c.helmet));
  let health = dmg;
  if (armored) {
    health = dmg * (AK.armorRatio * 0.5);
    let armorTaken = (dmg - health) * 0.5;
    if (armorTaken > c.armor) { health = dmg - c.armor / 0.5; armorTaken = c.armor; }
    c.armor = Math.max(0, c.armor - Math.floor(armorTaken));
  }
  return Math.floor(health);
}
function damageChicken(c, zone, dist, point) {
  const d = calcDamage(c, zone, dist);
  c.hp -= d; G.hits++;
  const kill = c.hp <= 0;
  hitMarker = { t: 0.22, kill };
  floatDamage(point, d, zone === 'head', kill);
  puffs.burst(point, zone === 'head' ? 6 : 3, zone === 'head' ? 0x6c7a3a : 0xffffff, 90);
  if (zone === 'head') sfx.dink(); else sfx.thud();
  if (kill) {
    c.dead = true; c.state = 'dead'; c.t = 0; c.fallV = c.root.position.y > 20 ? 0 : undefined;
    G.kills++;
    const hs = zone === 'head';
    if (hs) G.hsKills++;
    const pts = (hs ? 100 : 40) + 10 * (G.level - 1);
    G.score += pts;
    puffs.burst(point, 14, 0xffffff, 140);
    feed(hs ? `AK ▸ Vista  <b>HEADSHOT</b> +${pts}` : `AK ▸ Vista +${pts}`, hs);
    sfx.cluckDie();
  }
}

const _v = new THREE.Vector3();
function floatDamage(point, d, hs, kill) {
  _v.copy(point).project(camera);
  const el = document.createElement('div');
  el.className = 'dmg' + (hs ? ' hs' : '') + (kill ? ' kill' : '');
  el.textContent = (hs ? '⌖ ' : '') + d;
  el.style.left = ((_v.x + 1) / 2 * innerWidth + 18) + 'px';
  el.style.top = ((1 - _v.y) / 2 * innerHeight - 14) + 'px';
  $('fx').appendChild(el); setTimeout(() => el.remove(), 850);
}
function feed(html, hs) {
  const el = document.createElement('div'); el.innerHTML = html; if (hs) el.className = 'hs';
  const f = $('feed'); f.prepend(el); while (f.children.length > 5) f.lastChild.remove();
  setTimeout(() => el.remove(), 3000);
}
function reload() {
  if (G.reloadT > 0 || G.ammo === AK.mag) return;
  G.reloadT = AK.reload; G.trigger = false; sfx.reload(); $('h-reload').classList.remove('hidden');
}

// ---------------- Main loop ----------------
let last = performance.now(), fpsAcc = 0, fpsN = 0;
function tick(now) {
  requestAnimationFrame(tick);
  let dt = Math.min(0.05, (now - last) / 1000); last = now;
  fpsAcc += dt; fpsN++; if (fpsAcc > 0.5) { $('h-fps').textContent = settings.fps ? `${Math.round(fpsN / fpsAcc)} FPS` : ''; fpsAcc = 0; fpsN = 0; }
  const sdt = dt * timeScale;
  if (state === 'play' && G && sdt > 0) step(sdt);
  else if (state !== 'play') { // idle camera sway on menu
    if (state === 'menu') { yaw = Math.sin(now / 7000) * 8; pitch = 6 + Math.sin(now / 5000) * 2; }
  }
  if (state === 'over-anim') for (const c of chickens) if (!c.removed && c.dead) updateChicken(c, sdt);
  puffs.update(sdt);
  camera.rotation.set(pitch * Math.PI / 180, yaw * Math.PI / 180, 0);
  // gun kick recovery
  gun.kick = Math.max(0, gun.kick - dt * 12);
  gun.root.position.set(gun.base.x, gun.base.y + gun.kick * 0.3, gun.base.z + gun.kick * 1.4);
  gun.root.rotation.x = gun.kick * 0.06;
  if (G && G.reloadT > 0) { const r = G.reloadT / AK.reload; gun.root.rotation.x = -Math.sin(r * Math.PI) * 0.6; gun.root.position.y -= Math.sin(r * Math.PI) * 3; }
  renderer.clear(); renderer.render(scene, camera);
  if (state === 'play' || state === 'pause') { renderer.clearDepth(); renderer.render(vmScene, vmCam); }
  drawOverlay(dt);
}
function step(dt) {
  G.time += dt;
  if (G.time - G.lastShot > 0.38) G.burst = 0; // recovery
  if (G.reloadT > 0) {
    G.reloadT -= dt;
    if (G.reloadT <= 0) { G.reloadT = 0; G.ammo = AK.mag; $('h-reload').classList.add('hidden'); }
  } else if (G.trigger && G.time >= G.nextShot) {
    if (G.ammo > 0) { fire(); G.nextShot = Math.max(G.nextShot + AK.cycle, G.time - AK.cycle * 0.5); if (G.nextShot < G.time) G.nextShot = G.time + AK.cycle; }
    else { reload(); }
  }
  // spawning
  if (G.between > 0) {
    G.between -= dt; if (G.between <= 0) startLevel(G.level + 1);
  } else {
    G.timeLeft -= dt;
    G.spawnT -= dt;
    if (G.spawned < G.cfg.count && G.spawnT <= 0) { spawnChicken(); G.spawned++; G.spawnT = G.cfg.interval * (0.75 + Math.random() * 0.5); }
    const alive = chickens.some((c) => !c.dead);
    if (G.spawned >= G.cfg.count && !alive) levelCleared();
    else if (G.timeLeft <= 0 && !G.over) { G.over = true; endRun('Laiks beidzās!'); }
  }
  for (const c of chickens) if (!c.removed) updateChicken(c, dt);
  for (let i = chickens.length - 1; i >= 0; i--) if (chickens[i].removed) chickens.splice(i, 1);
  updateHud();
}
function levelCleared() {
  const bonus = Math.round(Math.max(0, G.timeLeft) * 5);
  G.score += bonus;
  showBanner(`Līmenis ${G.level} izturēts`, `Laika bonuss +${bonus}`);
  G.between = 2.6;
  sfx.level();
}

// ---------------- HUD / UI ----------------
function fmtTime(t) { t = Math.max(0, Math.ceil(t)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; }
function updateHud() {
  if (!G) return;
  $('h-level').textContent = G.level;
  $('h-timer').textContent = fmtTime(G.timeLeft);
  $('h-timer').classList.toggle('warn', G.timeLeft < 10 && G.between <= 0);
  const remaining = G.cfg.count - G.spawned + chickens.filter((c) => !c.dead).length;
  $('h-left').textContent = G.between > 0 ? 'Gatavojies…' : `Atlikušas vistas: ${remaining}`;
  $('h-kills').textContent = G.kills;
  $('h-hs').textContent = G.kills ? Math.round(G.hsKills / G.kills * 100) + '%' : '0%';
  $('h-score').textContent = G.score;
  $('h-ammo').textContent = G.ammo; $('h-mag').textContent = AK.mag;
  document.querySelector('.ammo').classList.toggle('low', G.ammo <= 6);
  $('h-sens').textContent = sensText();
}
let bannerTimer;
function showBanner(t, sub) {
  const b = $('banner'); b.innerHTML = `${t}<small>${sub || ''}</small>`; b.classList.remove('hidden');
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.add('hidden'), 1900);
}
const screens = ['menu', 'settings', 'editor', 'pause', 'over'];
let modalReturn = 'menu';
function show(id) {
  for (const s of screens) $(s).classList.toggle('hidden', s !== id);
  $('hud').classList.toggle('hidden', !(state === 'play' || state === 'pause' || state === 'over-anim'));
}
function goMenu() {
  state = 'menu'; G = null; for (const c of chickens) scene.remove(c.root); chickens.length = 0;
  renderMenu(); show('menu');
}
function renderMenu() {
  const best = load(LS.best, { level: 0, score: 0, hs: 0 });
  const ri = best.level ? rankForLevel(best.level) : -1;
  $('pb').innerHTML = best.level
    ? `Augstākais līmenis: <b>${best.level}</b><br>Labākais rezultāts: <b>${best.score}</b> punkti<br>Rangs: <b>${RANKS[ri].name}</b>`
    : 'Vēl nav rezultāta. Uzspēlē pirmo raundu!';
  $('ranks').innerHTML = RANKS.map((r, i) => `<li class="${i === ri ? 'me' : ''}">${rankIcon(i)}<div><div class="rn">${r.name}</div><div class="rl">no ${r.minLevel}. līmeņa</div></div></li>`).join('');
  $('menu-sens').textContent = sensText();
}

// ---------------- Pointer lock / input ----------------
async function lock() {
  if (DEBUG && Q.has('nolock')) return;
  try {
    const p = canvas.requestPointerLock({ unadjustedMovement: true });
    if (p && p.then) { await p; rawInput = true; }
  } catch (e) {
    try { rawInput = false; const p2 = canvas.requestPointerLock(); if (p2 && p2.catch) p2.catch(() => $('clicklock').classList.remove('hidden')); }
    catch { $('clicklock').classList.remove('hidden'); }
  }
  $('s-raw').textContent = rawInput ? 'Jā' : (rawInput === false ? 'Nē (pārlūks neatbalsta)' : '—');
}
const locked = () => document.pointerLockElement === canvas;
document.addEventListener('pointerlockchange', () => {
  if (locked()) { $('clicklock').classList.add('hidden'); if (state === 'pause') { state = 'play'; show(null); } }
  else if (state === 'play') { state = 'pause'; if (G) G.trigger = false; show('pause'); }
});
document.addEventListener('mousemove', (e) => {
  if (!locked() || state !== 'play') return;
  yaw -= e.movementX * settings.sens * M_YAW;
  pitch -= e.movementY * settings.sens * M_PITCH;
  pitch = Math.max(-89, Math.min(89, pitch));
});
canvas.addEventListener('mousedown', (e) => {
  if (state !== 'play') return;
  if (!locked()) { lock(); return; }
  if (e.button === 0) G.trigger = true;
});
addEventListener('mouseup', (e) => { if (e.button === 0 && G) G.trigger = false; });
addEventListener('keydown', (e) => { if (state === 'play' && (e.code === 'KeyR')) reload(); });
$('clicklock').addEventListener('click', lock);

function startGame(level = 1) {
  sfx.unlock();
  yaw = 0; pitch = 3;
  state = 'play'; newRun(level); show(null); lock();
}
function endRun(reason) {
  state = 'over-anim'; G.trigger = false;
  if (document.pointerLockElement) document.exitPointerLock();
  setTimeout(() => showOver(reason), DEBUG ? 0 : 900);
}
function showOver(reason) {
  state = 'over';
  const best = load(LS.best, { level: 0, score: 0, hs: 0 });
  const isPB = G.level > best.level || (G.level === best.level && G.score > best.score);
  if (isPB) localStorage.setItem(LS.best, JSON.stringify({ level: G.level, score: G.score, hs: G.kills ? Math.round(G.hsKills / G.kills * 100) : 0 }));
  const ri = rankForLevel(G.level);
  $('o-reason').textContent = reason;
  $('o-rankicon').innerHTML = rankIcon(ri);
  $('o-rank').textContent = RANKS[ri].name;
  $('o-level').textContent = `Sasniegtais līmenis: ${G.level}` + (RANKS[ri + 1] ? ` · nākamais rangs no ${RANKS[ri + 1].minLevel}. līmeņa` : ' · augstākais rangs!');
  $('o-score').textContent = G.score; $('o-kills').textContent = G.kills;
  $('o-hs').textContent = G.kills ? Math.round(G.hsKills / G.kills * 100) + '%' : '0%';
  $('o-acc').textContent = G.shots ? Math.round(G.hits / G.shots * 100) + '%' : '0%';
  $('o-pb').textContent = isPB ? 'Jauns personīgais rekords!' : `Tavs rekords: ${best.level}. līmenis, ${best.score} punkti`;
  show('over');
}

// ---------------- Menu buttons ----------------
$('btn-start').onclick = () => startGame(1);
$('btn-xhair').onclick = () => openModal('editor', 'menu');
$('btn-settings').onclick = () => openModal('settings', 'menu');
$('p-resume').onclick = () => { lock(); };
$('p-xhair').onclick = () => openModal('editor', 'pause');
$('p-settings').onclick = () => openModal('settings', 'pause');
$('p-quit').onclick = goMenu;
$('o-again').onclick = () => startGame(1);
$('o-menu').onclick = goMenu;
document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => { show(modalReturn); if (modalReturn === 'menu') renderMenu(); }));
function openModal(id, from) { modalReturn = from; if (id === 'editor') syncEditor(); if (id === 'settings') syncSettings(); show(id); }

// Settings
function syncSettings() {
  $('s-sens').value = settings.sens; $('s-dpi').value = settings.dpi; $('s-sound').checked = settings.sound; $('s-fps').checked = settings.fps;
  $('s-cm').textContent = cm360().toFixed(2);
  if (rawInput === null) $('s-raw').textContent = 'Pārbaudīs, sākot spēli';
}
for (const id of ['s-sens', 's-dpi', 's-sound', 's-fps']) $(id).addEventListener('input', () => {
  const sens = parseFloat($('s-sens').value), dpi = parseInt($('s-dpi').value, 10);
  if (sens > 0 && sens <= 20) settings.sens = sens;
  if (dpi >= 100) settings.dpi = dpi;
  settings.sound = $('s-sound').checked; settings.fps = $('s-fps').checked;
  saveSettings(); $('s-cm').textContent = cm360().toFixed(2); updateHud();
});

// Crosshair editor
const prev = $('xh-prev'), pctx = prev.getContext('2d');
const XF = ['length', 'thickness', 'gap', 'outline', 'red', 'green', 'blue', 'alpha'];
const XB = ['outlineEnabled', 'centerDotEnabled', 'tStyleEnabled'];
$('x-color').innerHTML = COLOR_PRESETS.map((c, i) => `<option value="${i}">${c.name}</option>`).join('');
function syncEditor() {
  for (const f of XF) { $('x-' + f).value = xhair[f]; $('x-' + f).nextElementSibling.textContent = xhair[f]; }
  for (const f of XB) $('x-' + f).checked = !!xhair[f];
  $('x-color').value = xhair.color;
  document.querySelectorAll('.row.rgb').forEach((r) => (r.style.opacity = xhair.color === 5 ? 1 : 0.4));
  $('x-code').value = encodeCrosshair(xhair, xhairRaw);
  drawPreview();
}
function drawPreview() {
  const w = prev.width, h = prev.height;
  const g = pctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#9cc4e4'); g.addColorStop(0.45, '#d9c39a'); g.addColorStop(1, '#8a7558');
  pctx.fillStyle = g; pctx.fillRect(0, 0, w, h);
  pctx.fillStyle = '#c9ae84'; pctx.fillRect(w * 0.6, h * 0.15, w * 0.4, h * 0.6);
  pctx.fillStyle = '#2b2a2e'; pctx.fillRect(w * 0.7, h * 0.3, w * 0.1, h * 0.18);
  pctx.fillStyle = '#3f2a1a'; pctx.fillRect(0, h * 0.62, w * 0.35, h * 0.38);
  // draw at the same pixel size as in game (scale by real screen height)
  const screenH = innerHeight * (devicePixelRatio || 1);
  drawCrosshair(pctx, xhair, w / 2, h / 2, screenH * (prev.width / prev.clientWidth || 1) / (devicePixelRatio || 1));
}
for (const f of XF) $('x-' + f).addEventListener('input', (e) => { xhair[f] = parseFloat(e.target.value); if (['red', 'green', 'blue'].includes(f)) xhair.color = 5; saveXhair(); syncEditor(); });
for (const f of XB) $('x-' + f).addEventListener('change', (e) => { xhair[f] = e.target.checked; saveXhair(); syncEditor(); });
$('x-color').addEventListener('change', (e) => { xhair.color = parseInt(e.target.value, 10); const p = COLOR_PRESETS[xhair.color].rgb; if (p) [xhair.red, xhair.green, xhair.blue] = p; saveXhair(); syncEditor(); });
const msg = (t, cls) => { const m = $('x-msg'); m.textContent = t; m.className = 'muted small ' + (cls || ''); };
$('x-import').onclick = () => {
  try { applyDecoded(decodeCrosshair($('x-code').value)); saveXhair(); syncEditor(); msg('Crosshair importēts!', 'ok'); }
  catch { msg('Nederīgs share kods. Tam jāizskatās kā CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx.', 'err'); }
};
const copy = async (t, ok) => { try { await navigator.clipboard.writeText(t); msg(ok, 'ok'); } catch { $('x-code').select(); msg('Nokopē manuāli (Ctrl+C).'); } };
$('x-copy').onclick = () => copy(encodeCrosshair(xhair, xhairRaw), 'Kods nokopēts. Ielīmē to CS2: Crosshair → Share or Import.');
$('x-link').onclick = () => { const u = new URL(location.href); u.search = ''; u.searchParams.set('xhair', encodeCrosshair(xhair, xhairRaw)); copy(u.toString(), 'Saite nokopēta. Kas to atvērs, redzēs tavu crosshair.'); };
$('x-reset').onclick = () => { xhair = { ...DEFAULT_XHAIR }; xhairRaw = null; saveXhair(); syncEditor(); msg('Atjaunots noklusējums.'); };

// ---------------- Boot ----------------
goMenu();
requestAnimationFrame(tick);

// ---------------- Debug API (for screenshots/tests only, ?debug) ----------------
if (DEBUG) {
  window.__aim = {
    THREE, camera, chickens, world,
    get G() { return G; }, get state() { return state; },
    startGame(level = 1) { startGame(level); },
    freeze(v = true) { timeScale = v ? 0 : 1; },
    view(y, p) { yaw = y; pitch = p; },
    step(sec, n = 10) { for (let i = 0; i < n; i++) step(sec / n); },
    spawn(o) { return spawnChicken(o); },
    lookAt(c, zone = 'head') {
      const t = (zone === 'head' ? c.headG : c.model).getWorldPosition(new THREE.Vector3());
      if (zone !== 'head') t.y += 18;
      const d = t.sub(camera.position).normalize();
      yaw = Math.atan2(-d.x, -d.z) * 180 / Math.PI; pitch = Math.asin(d.y) * 180 / Math.PI;
      camera.rotation.set(pitch * Math.PI / 180, yaw * Math.PI / 180, 0); camera.updateMatrixWorld();
    },
    shoot() { G.burst = 0; G.nextShot = 0; camera.updateMatrixWorld(); for (const c of chickens) c.root.updateMatrixWorld(true); fire(shotDirection()); },
    calcDamage, openEditor() { openModal('editor', 'menu'); }, openSettings() { openModal('settings', 'menu'); },
    over(reason = 'Vista aizbēga!') { G.over = true; endRun(reason); },
  };
}
