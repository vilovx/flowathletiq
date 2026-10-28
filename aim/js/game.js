import * as THREE from '../vendor/three.module.min.js';
import { buildWorld } from './world.js?v=34';
import { RoastSystem } from './roast.js?v=34';
import { createChicken, Puffs } from './chicken.js?v=34';
import { drawCrosshair, DEFAULT_XHAIR as PC_XHAIR, MOBILE_XHAIR, COLOR_PRESETS } from './crosshair.js?v=34';
import { decodeCrosshair, encodeCrosshair } from './sharecode.js?v=34';
import { RANKS, rankFor, rankIcon, TOP, TOP_HS } from './ranks.js?v=34';
import { t, onLang, applyDom } from './i18n.js?v=34';
import { Sfx } from './audio.js?v=34';
import { buildGunModel } from './gunmodels.js?v=34';
import { fetchTop, submitScore, countryList, guessCountry, flagHtml, esc, wpnShort, wpnName } from './leaderboard.js?v=34';
import { WEAPONS, WEAPON_ORDER, RECOIL, recoilTable, Punch, idealSpray } from './weapons.js?v=34';

const $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const DEBUG = Q.has('debug');
const MOBILE = document.documentElement.classList.contains('mobile'); // touch mode (set in main.js)
const DEVICE = MOBILE ? 'mobile' : 'pc';
const QUALITY = document.documentElement.dataset.q || 'desktop'; // touch mode: high | medium | low
import { forced, forceOff } from './rot.js?v=34';
const VW = () => document.getElementById('app').clientWidth, VH = () => document.getElementById('app').clientHeight; // layout size (= rotated size in forced landscape)
const tm = (k, v) => (MOBILE ? t(k + '.m', v) : t(k, v)); // touch wording for control hints on phones

// ---------------- CS2 constants ----------------
const M_YAW = 0.022, M_PITCH = 0.022;          // degrees per mouse count (CS2 default)
const HFOV_169 = 106.26;                          // CS2 horizontal FOV at 16:9
const VFOV = 2 * Math.atan(Math.tan((HFOV_169 * Math.PI / 180) / 2) * 9 / 16) * 180 / Math.PI; // ~73.74 (Hor+)
const RANGE = 8192;
let W = WEAPONS.ak47; // current weapon (set from settings below)
const EYE = 64;

// ---------------- Settings ----------------
const LS = { settings: 'fa_aim_settings', xhair: 'fa_aim_xhair', best: 'fa_aim_best', rank: 'fa_aim_rank', nick: 'fa_aim_nick', country: 'fa_aim_country' };
const load = (k, d) => { try { return { ...d, ...(JSON.parse(localStorage.getItem(k)) || {}) }; } catch { return { ...d }; } };
const settings = load(LS.settings, { sens: 1.25, dpi: 800, sound: true, fps: false, weapon: 'ak47', tsens: 1, gyro: false, quality: 'auto', fire: 104 });
settings.gyro = false; // gyro needs a fresh (iOS) permission each visit, so it always starts off
W = WEAPONS[settings.weapon] || WEAPONS.ak47;
const DEFAULT_XHAIR = MOBILE ? MOBILE_XHAIR : PC_XHAIR; // saved settings win; only the default differs on touch
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
const sensText = () => MOBILE ? `Touch ${settings.tsens.toFixed(2)}${settings.gyro ? ' · Gyro' : ''}` : `Sens ${settings.sens} · ${settings.dpi} DPI · ${cm360().toFixed(1)} cm/360°`;

// ---------------- Renderer / scene ----------------
const canvas = $('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE || QUALITY !== 'low', powerPreference: 'high-performance' });
const QDPR = { desktop: 2, high: 2, medium: 1.5, low: 1.25 };
renderer.setPixelRatio(Math.min(devicePixelRatio, QDPR[QUALITY])); // phones: High = up to 2x + MSAA + shadows, Medium = 1.5x no shadows, Low = 1.25x
renderer.shadowMap.enabled = !MOBILE || QUALITY === 'high'; renderer.shadowMap.type = MOBILE ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.autoClear = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(VFOV, 16 / 9, 2, 6000);
camera.rotation.order = 'YXZ';
const PLAYER = new THREE.Vector3(0, EYE, 250);
camera.position.copy(PLAYER);
// ---- Desktop movement (WASD / arrows): CS2-like walk speeds in Hammer-ish units (EYE 64 = CS2 eye height).
// Left/right and back up to the wall, forward only ~2 steps (60 u = ~1.5 m) from the start point. Touch mode: no movement.
const MOVE = { fwd: 60, x0: -504, x1: 509, z1: 678, r: 16, walk: 0.52, accel: 10 };
const PROPS = [[-440, 160, 16], [430, 200, 16], [-480, 200, 26], [-480, 80, 26]]; // barrels + cypress trees (x, z, radius)
const keys = new Set(), vel = new THREE.Vector2();
const MOVE_KEYS = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r' };
const RUN_SPEED = { ak47: 215, m4a4: 225, m4a1s: 225 };
function resetPos() { camera.position.copy(PLAYER); vel.set(0, 0); keys.clear(); }
function moveFrac() { return Math.min(1, vel.length() / (RUN_SPEED[W.id] || 215)); }
function updateMove(dt) {
  if (MOBILE || !G || G.mode !== 'chickens') return;
  const f = (keys.has('f') ? 1 : 0) - (keys.has('b') ? 1 : 0), r = (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0);
  const max = (RUN_SPEED[W.id] || 215) * (keys.has('walk') ? MOVE.walk : 1), a = yaw * Math.PI / 180;
  const tx = new THREE.Vector2(-Math.sin(a) * f + Math.cos(a) * r, -Math.cos(a) * f - Math.sin(a) * r);
  if (tx.lengthSq() > 0) tx.normalize().multiplyScalar(max);
  vel.lerp(tx, 1 - Math.exp(-MOVE.accel * dt));
  if (vel.lengthSq() < 1) vel.set(0, 0);
  const P = camera.position; P.x += vel.x * dt; P.z += vel.y * dt;
  for (const [x, z, rr] of PROPS) { const dx = P.x - x, dz = P.z - z, d = Math.hypot(dx, dz), m = rr + MOVE.r; if (d < m && d > 0) { P.x = x + dx / d * m; P.z = z + dz / d * m; } }
  const cx = Math.max(MOVE.x0, Math.min(MOVE.x1, P.x)), cz = Math.max(PLAYER.z - MOVE.fwd, Math.min(MOVE.z1, P.z));
  if (cx !== P.x) vel.x = 0; if (cz !== P.z) vel.y = 0; P.x = cx; P.z = cz; P.y = EYE;
}
const world = buildWorld(scene);
if (MOBILE && QUALITY !== 'low') { // sharper textures at grazing angles (cobbles, walls) on phones
  const an = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  scene.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) if (m.map && m.map.anisotropy < an) { m.map.anisotropy = an; m.map.needsUpdate = true; } });
}
const puffs = new Puffs(scene);
let roasts = null; // created after groundY is defined
const sfx = new Sfx(() => settings.sound);

// view model (separate scene so it never clips into walls)
const vmScene = new THREE.Scene();
const vmCam = new THREE.PerspectiveCamera(60, 16 / 9, 0.3, 200);
vmScene.add(new THREE.HemisphereLight(0xffffff, 0x665544, 1.6));
const vmSun = new THREE.DirectionalLight(0xfff0d2, 2.2); vmSun.position.set(-3, 5, 2); vmScene.add(vmSun);
const vmRim = new THREE.DirectionalLight(0xbfe6ff, 0.9); vmRim.position.set(4, 2, -3); vmScene.add(vmRim);
{ // cheap studio environment for metal reflections
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g2 = c.getContext('2d');
  const gr = g2.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#cfe3f5'); gr.addColorStop(0.45, '#f2e6cf'); gr.addColorStop(0.55, '#8a7558'); gr.addColorStop(1, '#3a3026');
  g2.fillStyle = gr; g2.fillRect(0, 0, 256, 128); g2.fillStyle = 'rgba(255,255,255,.9)'; g2.fillRect(40, 18, 60, 14); g2.fillRect(170, 26, 40, 10);
  const et = new THREE.CanvasTexture(c); et.mapping = THREE.EquirectangularReflectionMapping; et.colorSpace = THREE.SRGBColorSpace;
  const pm = new THREE.PMREMGenerator(renderer); vmScene.environment = pm.fromEquirectangular(et).texture; et.dispose(); pm.dispose();
}
const VM = { scale: 0.27, x: 7.2, y: -5.4, z: -13, rx: -0.2, ry: -0.03, rz: 0 };
let gun = buildGun(W); vmScene.add(gun.root);

function buildGun(w) {
  const { model, flash } = buildGunModel(w.id);
  const root = new THREE.Group(); root.add(model);
  model.scale.setScalar(VM.scale); model.position.set(0, 0, 0);
  root.position.set(VM.x, VM.y, VM.z); root.rotation.set(VM.rx, VM.ry, VM.rz);
  return { root, flash, base: root.position.clone(), kick: 0 };
}
// ---------------- Crosshair overlay ----------------
const xc = $('xh'), xctx = xc.getContext('2d');
let hitMarker = { t: 0, kill: false };
function resize() {
  const w = VW(), h = VH();
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  vmCam.aspect = w / h; vmCam.updateProjectionMatrix();
  const dpr = devicePixelRatio || 1;
  xc.width = Math.round(w * dpr); xc.height = Math.round(h * dpr);
  if (MOBILE) { // scale menus/HUD to small landscape screens
    const r = document.documentElement.style;
    r.setProperty('--uiz', Math.max(0.5, Math.min(1, h / 560, w / 1120)).toFixed(3));
    r.setProperty('--hudz', Math.max(0.6, Math.min(1, h / 640)).toFixed(3));
  }
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
let showcaseCam = null;
let yaw = 0, pitch = 3; // degrees
let G = null;            // run state
const chickens = [];
let timeScale = 1;
let rawInput = null;

const CH_SCALE = 1.45; // touch mode chicken size
// Difficulty curve v32 (researched pacing): geometric ramp from L1 to L15 (p = 0..1).
// L15 = ~1.2 chickens/s sustained (interval 0.85 s), max 3 alive, each shootable ~2.7 s:
// hard for 250 ms reaction + flick + 1-2 taps, but humanly doable (old L15: 0.45 s / 2.1 s / unlimited).
const ramp = (L, a, b) => a * Math.pow(b / a, Math.min(1, Math.max(0, (L - 1) / 14)));
function levelCfg(L) {
  return {
    count: 6 + 2 * (L - 1),
    interval: ramp(L, 2.2, 0.85),                             // spawn gap (s), +-25 % jitter
    warn: ramp(L, 0.9, 0.45),                                // crouch / wind-up before the jump
    look: ramp(L, 0.6, 0.32),                                // each head turn (look right, look left)
    jump: ramp(L, 1.35, 0.95),
    maxAlive: L < 4 ? 2 : 3,                                 // cap simultaneous threats
    spawnCount: Math.min(world.spawns.length, 5 + 3 * (L - 1)),
    outChance: L < 4 ? 0 : Math.min(0.15, 0.02 * (L - 3)),   // occasional spawn just outside the view (challenge)
  };
}
// Spawn direction: pick spawn points inside the current horizontal view (frontal arc around camera yaw).
function hHalfFov() { return Math.atan(Math.tan(camera.fov * Math.PI / 360) * camera.aspect) * 180 / Math.PI; }
function signedOff(sp) { // horizontal degrees from camera forward to the spawn's perch (+ = left)
  const dx = sp.perch.x - camera.position.x, dz = sp.perch.z - camera.position.z;
  const d = Math.atan2(-dx, -dz) * 180 / Math.PI - yaw; return ((d % 360) + 540) % 360 - 180;
}
const offAngle = (sp) => Math.abs(signedOff(sp));
function pickSpawn(cfg) {
  const busy = new Set(chickens.filter((c) => !c.dead && c.state !== 'jump').map((c) => c.sp));
  let pool = world.spawns.slice(0, cfg.spawnCount); if (G.level >= 3) pool = pool.concat(world.sideSpawns);
  const free = pool.filter((x) => !busy.has(x)); if (free.length) pool = free;
  const half = hHalfFov(), inner = half * 0.85;
  const inView = pool.filter((x) => offAngle(x) <= inner);
  const edge = pool.filter((x) => { const a = offAngle(x); return a > inner && a <= half + 30; });
  const any = (a) => a[Math.floor(Math.random() * a.length)];
  if (edge.length && Math.random() < cfg.outChance) return any(edge);
  if (inView.length) return any(inView);
  return pool.slice().sort((a, b) => offAngle(a) - offAngle(b))[0]; // nothing in view (sky / mural): nearest to where you look
}

function newRun(level = 1) {
  roasts.clear();
  for (const c of chickens) scene.remove(c.root);
  chickens.length = 0;
  G = { mode: 'chickens', level, score: 0, kills: 0, hsKills: 0, shots: 0, hits: 0, ammo: W.mag, reloadT: 0, nextShot: 0, burst: 0, lastShot: -9,
    trigger: false, time: 0, over: false };
  startLevel(level);
}
function startLevel(L) {
  const cfg = levelCfg(L);
  Object.assign(G, { level: L, cfg, spawned: 0, spawnT: 1.6, timeLeft: cfg.count * cfg.interval + 12, between: 0 });
  showBanner(t('levelBanner', { n: L }), t('chickensN', { n: cfg.count }));
  updateHud();
}

const PHASES = ['emerge', 'lookR', 'lookL', 'out', 'crouch', 'jump'];
function spawnChicken(opts = {}) {
  const cfg = G.cfg;
  const parts = createChicken();
  if (MOBILE) parts.model.scale.multiplyScalar(CH_SCALE); // touch mode: bigger chickens (hit zones are children, so they scale too)
  let sp = opts.spawn;
  if (!sp) sp = pickSpawn(cfg); // in-view spawn point (no two chickens in the same window)
  const s = world.site;
  let land;
  for (let k = 0; k < 20; k++) {
    land = new THREE.Vector3(s.x0 + Math.random() * (s.x1 - s.x0), s.y, s.z0 + Math.random() * (s.z1 - s.z0));
    if (!world.blockers.some((b) => land.x > b.x0 && land.x < b.x1 && land.z > b.z0 && land.z < b.z1)) break;
  }
  if (sp.side) { // side windows: land in the plaza in front of that building (clear of the wall, inside the square)
    const d = 130 + Math.random() * 110;
    land = sp.perch.clone().addScaledVector(sp.fwd, d); land.z += (Math.random() - 0.5) * 120;
    land.x = Math.max(-400, Math.min(400, land.x)); land.z = Math.max(-440, Math.min(100, land.z)); land.y = groundY(land);
  }
  if (opts.land) land = opts.land;
  const vary = 0.9 + Math.random() * 0.2;
  const hidden = sp.kind === 'roof' ? -60 : -38, peek = sp.kind === 'roof' ? -27 : -9;
  const c = { ...parts, sp, hp: 100, armor: 100, helmet: true, state: 'emerge', t: 0, land,
    pHide: sp.face.clone().addScaledVector(sp.emerge, hidden), pPeek: sp.face.clone().addScaledVector(sp.emerge, peek), p0: sp.perch.clone(),
    dur: { emerge: 0.35, lookR: cfg.look * vary, lookL: cfg.look * vary, out: sp.kind === 'door' ? 0.4 : 0.3, crouch: cfg.warn * vary, jump: cfg.jump * vary },
    look: 1, arc: 50 + Math.random() * 50, dead: false, phase: Math.random() * 6 };
  c.root.position.copy(c.pHide);
  c.root.rotation.y = Math.atan2(sp.fwd.x, sp.fwd.z);
  c.root.__c = c; scene.add(c.root); chickens.push(c);
  if (!opts.state && offAngle(sp) > hHalfFov() * 0.85) sfx.peek(signedOff(sp) > 0 ? -0.8 : 0.8); // subtle off-screen cue (panned to that side)
  if (opts.state) { c.state = opts.state; c.t = (opts.u ?? 0.5) * c.dur[c.state]; updateChicken(c, 0); }
  return c;
}
function faceTo(c, target) {
  const dx = target.x - c.root.position.x, dz = target.z - c.root.position.z;
  c.root.rotation.y = Math.atan2(dx, dz);
}
const ease = (u) => u * u * (3 - 2 * u);
function nextPhase(c) {
  c.t -= c.dur[c.state]; c.state = PHASES[PHASES.indexOf(c.state) + 1];
  if (c.state === 'crouch') faceTo(c, c.land);
  if (c.state === 'jump') sfx.cluck();
}

function updateChicken(c, dt) {
  c.t += dt; c.phase += dt;
  const P = c.root.position;
  if (c.state !== 'dead') while (c.t >= c.dur[c.state] && c.state !== 'jump') nextPhase(c);
  const u = c.state === 'dead' ? 0 : Math.min(1, c.t / c.dur[c.state]);
  const H = c.headG.rotation;
  if (c.state === 'emerge') { // pop out (head first out of a roof edge, head + chest out of a window/door)
    P.lerpVectors(c.pHide, c.pPeek, ease(u)); H.set(0, 0, 0);
  } else if (c.state === 'lookR' || c.state === 'lookL') { // clear, readable head turns
    P.copy(c.pPeek);
    const dir = (c.state === 'lookR' ? -1 : 1) * c.look, k = Math.sin(Math.min(1, u * 1.25) * Math.PI);
    H.set(0.08 * k, dir * 1.05 * k, -dir * 0.12 * k);
    c.model.position.y = 0;
  } else if (c.state === 'out') { // step/hop out onto the sill / railing / edge
    P.lerpVectors(c.pPeek, c.p0, ease(u)); P.y += Math.sin(u * Math.PI) * (c.sp.kind === 'door' ? 14 : 6); H.set(0, 0, 0);
    c.legs.forEach((l, i) => (l.rotation.x = Math.sin(c.t * 30 + i * Math.PI) * 0.6));
  } else if (c.state === 'crouch') { // wind-up: crouch + wing shake = about to jump
    P.copy(c.p0); c.legs.forEach((l) => (l.rotation.x = 0));
    c.model.position.y = -2.5 - Math.abs(Math.sin(c.t * 18)) * 1.5;
    c.model.rotation.x = 0.18;
    c.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (0.2 + Math.abs(Math.sin(c.t * 25)) * 0.5)));
  } else if (c.state === 'jump') {
    P.x = c.p0.x + (c.land.x - c.p0.x) * u;
    P.z = c.p0.z + (c.land.z - c.p0.z) * u;
    P.y = c.p0.y + (c.land.y - c.p0.y) * u + c.arc * 4 * u * (1 - u);
    c.model.position.y = 0;
    c.model.rotation.x = (u - 0.5) * 0.6;
    c.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (0.3 + Math.abs(Math.sin(c.t * 30)) * 1.1)));
    c.legs.forEach((l) => (l.rotation.x = 0.6));
    if (u >= 1 && !G.over) { c.model.rotation.x = 0; puffs.burst(P.clone().setY(P.y + 2), 6, 0xcbb38a, 60); chickenLanded(c); }
  } else if (c.state === 'dead') {
    c.model.rotation.z = Math.min(Math.PI / 2, c.t * 9);
    if (c.fallV !== undefined) { c.fallV -= 600 * dt; P.y = Math.max(groundY(P), P.y + c.fallV * dt); if (c.fallH && P.y > groundY(P)) P.addScaledVector(c.fallH, dt); }
    const onGround = P.y <= groundY(P) + 0.5;
    if (!c.roasted && ((onGround && c.t > 0.45) || c.t > 1.8)) { // fallen chicken -> roast for the chef
      c.roasted = true; const at = roastSpot(P); puffs.burst(P.clone().setY(groundY(at) + 6), 8, 0xffffff, 70); roasts.add(at);
      scene.remove(c.root); c.removed = true;
    }
  }
}
const groundY = (P) => (Math.abs(P.x) < 310 && P.z > -440 && P.z < -140 ? world.site.y : 0);
roasts = new RoastSystem(scene, world.tavern, groundY);
// keep roasts inside the square (in front of the facades)
const roastSpot = (P) => new THREE.Vector3(Math.max(-500, Math.min(520, P.x)), 0, Math.max(-540, Math.min(330, P.z)));

function chickenLanded(c) { // a chicken that reaches the ground ends the run
  G.over = true; c.state = 'landed';
  sfx.alarm();
  endRun('landed');
}

// ---------------- Shooting ----------------
const ray = new THREE.Raycaster();
const decals = []; let decalI = 0;
{
  const geo = new THREE.CircleGeometry(1.6, 8), mat = new THREE.MeshBasicMaterial({ color: 0x1a1410, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  for (let i = 0; i < 40; i++) { const d = new THREE.Mesh(geo, mat); d.visible = false; scene.add(d); decals.push(d); }
}
// CS2-style recoil: deterministic per-weapon kick table -> aim punch (bullets go to view + 2*punch),
// plus random inaccuracy (standing + per-shot penalty that recovers over the weapon's recovery time).
const punch = new Punch();
let kickTable = recoilTable(W);
let recoilIndex = 0, accPenalty = 0;
function recoveryTime() {
  const t = Math.min(1, Math.max(0, (recoilIndex - 2) / 3)); // transition bullets 2..5
  return W.inacc.recStand + (W.inacc.recFinal - W.inacc.recStand) * t;
}
function updateRecoil(dt) {
  punch.update(dt);
  const k = Math.exp(-dt * Math.LN10 / recoveryTime());
  accPenalty *= k;
  if (G && G.time - G.lastShot > W.cycle * 1.5) recoilIndex *= k;
}
// touch mode: no recoil/inaccuracy at all - bullets go exactly to the crosshair (spray mode is desktop-only)
const noRecoil = () => MOBILE;
let lastDir = null; // debug only
function shotDirection(noSpread) {
  if (noRecoil()) return new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(pitch * Math.PI / 180, yaw * Math.PI / 180, 0, 'YXZ'));
  let dp = punch.y * RECOIL.scale, dy = -punch.x * RECOIL.scale; // degrees
  if (!noSpread) {
    const mv = MOBILE ? 0 : Math.max(0, (moveFrac() - 0.34) / 0.66), inacc = W.inacc.stand + accPenalty + W.inacc.stand * 1.5 * mv, r1 = Math.random() * inacc, a1 = Math.random() * Math.PI * 2;
    const r2 = Math.random() * W.inacc.spread, a2 = Math.random() * Math.PI * 2;
    const ox = Math.cos(a1) * r1 + Math.cos(a2) * r2, oy = Math.sin(a1) * r1 + Math.sin(a2) * r2; // radians
    dy += ox * 180 / Math.PI; dp += oy * 180 / Math.PI;
  }
  const e = new THREE.Euler((pitch + dp) * Math.PI / 180, (yaw + dy) * Math.PI / 180, 0, 'YXZ');
  return new THREE.Vector3(0, 0, -1).applyEuler(e);
}
function applyKick() {
  if (noRecoil()) { punch.reset(); recoilIndex = 0; accPenalty = 0; return; }
  punch.kick(kickTable[Math.min(kickTable.length - 1, Math.floor(recoilIndex))]);
  recoilIndex += 1;
  accPenalty = Math.min(accPenalty + W.inacc.perShot, 0.05);
}
function fire(dirOverride) {
  if (G.mode === 'spray') G.ammo--; // chicken mode: infinite ammo
  G.shots++; G.lastShot = G.time;
  const dir = dirOverride || shotDirection();
  if (DEBUG) lastDir = dir.clone();
  G.burst++; applyKick();
  gun.kick = 1; gun.flash.visible = true; gun.flash.rotation.z = Math.random() * 3; setTimeout(() => (gun.flash.visible = false), 45);
  sfx.shot(W.id);
  ray.set(camera.position, dir); ray.far = W.range;
  if (G.mode === 'spray') { const sh = ray.intersectObject(sprayWall.mesh, false)[0]; if (sh) sprayHit(sh.point); updateHud(); return; }
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
  let dmg = W.damage * Math.pow(W.rangeMod, dist / 500);
  if (zone === 'head') dmg *= W.hsMult; else if (zone === 'leg') dmg *= W.legMult;
  const armored = c.armor > 0 && (zone === 'body' || (zone === 'head' && c.helmet));
  let health = dmg;
  if (armored) {
    health = dmg * (W.armorRatio * 0.5);
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
    const inside = c.state === 'emerge' || c.state === 'lookR' || c.state === 'lookL';
    c.dead = true; c.state = 'dead'; c.t = 0; c.fallV = c.root.position.y > 20 ? (inside ? 70 : 0) : undefined;
    c.fallH = inside ? c.sp.fwd.clone().multiplyScalar(90) : null; // shot mid-peek: tumble forward out of the window / over the edge
    G.kills++;
    const hs = zone === 'head';
    if (hs) G.hsKills++;
    const pts = (hs ? 100 : 40) + 10 * (G.level - 1);
    G.score += pts;
    puffs.burst(point, 14, 0xffffff, 140);
    feed(hs ? `${W.name} ▸ ${t('chicken')}  <b>HEADSHOT</b> +${pts}` : `${W.name} ▸ ${t('chicken')} +${pts}`, hs);
    sfx.cluckDie();
  }
}

const _v = new THREE.Vector3();
function floatDamage(point, d, hs, kill) {
  _v.copy(point).project(camera);
  const el = document.createElement('div');
  el.className = 'dmg' + (hs ? ' hs' : '') + (kill ? ' kill' : '');
  el.textContent = (hs ? '⌖ ' : '') + d;
  el.style.left = ((_v.x + 1) / 2 * VW() + 18) + 'px';
  el.style.top = ((1 - _v.y) / 2 * VH() - 14) + 'px';
  $('fx').appendChild(el); setTimeout(() => el.remove(), 850);
}
function feed(html, hs) {
  const el = document.createElement('div'); el.innerHTML = html; if (hs) el.className = 'hs';
  const f = $('feed'); f.prepend(el); while (f.children.length > 5) f.lastChild.remove();
  setTimeout(() => el.remove(), 3000);
}
function reload() {
  if (G.reloadT > 0 || G.ammo === W.mag) return;
  G.reloadT = W.reload; G.trigger = false; sfx.reload(); $('h-reload').classList.remove('hidden');
}

// ---------------- Main loop ----------------
let last = performance.now(), fpsAcc = 0, fpsN = 0;
let lastDraw = 0;
// Auto quality (touch): if the frame rate stays under 40 fps for ~4 s of play, step down (High -> Medium -> Low) for this session; never back up
const QA = { acc: 0, n: 0 };
function autoQuality(ms) {
  if (settings.quality !== 'auto' || document.hidden || ms > 500) return;
  QA.acc += ms; QA.n++;
  if (QA.acc < 4000) return;
  const fps = QA.n * 1000 / QA.acc; QA.acc = 0; QA.n = 0;
  if (fps >= 40) return;
  const cur = document.documentElement.dataset.q, next = cur === 'high' ? 'medium' : cur === 'medium' ? 'low' : null;
  if (!next) return;
  document.documentElement.dataset.q = next; try { sessionStorage.setItem('fa_aim_qauto', next); } catch {}
  renderer.setPixelRatio(Math.min(devicePixelRatio, QDPR[next])); world.sun.castShadow = false; resize();
}
function tick(now) {
  requestAnimationFrame(tick);
  if (MOBILE && now - lastDraw < 1000 / 61) return; // phones: cap at 60 fps (120 Hz screens would double the GPU work)
  if (MOBILE && state === 'play') autoQuality(now - lastDraw);
  lastDraw = now;
  let dt = Math.min(0.05, (now - last) / 1000); last = now;
  fpsAcc += dt; fpsN++; if (fpsAcc > 0.5) { $('h-fps').textContent = settings.fps ? `${Math.round(fpsN / fpsAcc)} FPS` : ''; fpsAcc = 0; fpsN = 0; }
  const sdt = dt * timeScale;
  if (state === 'play' && G && sdt > 0) step(sdt);
  else if (state !== 'play') { // idle camera sway on menu
    if (state === 'menu') { yaw = Math.sin(now / 7000) * 8; pitch = 6 + Math.sin(now / 5000) * 2; }
  }
  if (state === 'over-anim') for (const c of chickens) if (!c.removed && c.dead) updateChicken(c, sdt);
  puffs.update(sdt);
  roasts.update(sdt);
  world.update(now / 1000);
  // view punch: the camera follows part of the aim punch (CS view_recoil_tracking 0.45)
  const vt = RECOIL.scale * RECOIL.viewTracking;
  camera.rotation.set((pitch + punch.y * vt) * Math.PI / 180, (yaw - punch.x * vt) * Math.PI / 180, 0);
  // gun kick recovery
  gun.kick = Math.max(0, gun.kick - dt * 12);
  gun.root.position.set(gun.base.x, gun.base.y + gun.kick * 0.3, gun.base.z + gun.kick * 1.4);
  gun.root.rotation.x = VM.rx + gun.kick * 0.05;
  if (G && G.reloadT > 0) { const r = G.reloadT / W.reload; gun.root.rotation.x = VM.rx - Math.sin(r * Math.PI) * 0.5; gun.root.position.y -= Math.sin(r * Math.PI) * 3; }
  renderer.clear(); renderer.render(scene, camera);
  if (showcaseCam) { gun.root.position.copy(gun.base); gun.root.rotation.set(0, 0, 0); renderer.setClearColor(0x0b0e19); renderer.clear(); renderer.render(vmScene, showcaseCam); return; }
  if (state === 'play' || state === 'pause') { renderer.clearDepth(); renderer.render(vmScene, vmCam); }
  drawOverlay(dt);
}
function step(dt) {
  if (G.countdown > 0) { updateMove(dt); updateRecoil(dt); countdownStep(dt); updateHud(); return; }
  G.time += dt;
  updateRecoil(dt);
  updateMove(dt);
  if (G.time - G.lastShot > 0.38) G.burst = 0;
  if (G.reloadT > 0) {
    G.reloadT -= dt;
    if (G.reloadT <= 0) { G.reloadT = 0; G.ammo = W.mag; $('h-reload').classList.add('hidden'); }
  } else if (G.trigger && G.time >= G.nextShot) {
    if (G.ammo > 0) { fire(); G.nextShot = Math.max(G.nextShot + W.cycle, G.time - W.cycle * 0.5); if (G.nextShot < G.time) G.nextShot = G.time + W.cycle; }
    else { reload(); }
  }
  if (G.mode === 'spray') { sprayStep(); updateHud(); return; }
  // spawning
  if (G.between > 0) {
    G.between -= dt; if (G.between <= 0) startLevel(G.level + 1);
  } else {
    G.timeLeft -= dt;
    G.spawnT -= dt;
    const aliveN = chickens.filter((c) => !c.dead).length;
    if (G.spawned < G.cfg.count && G.spawnT <= 0) {
      if (aliveN >= G.cfg.maxAlive) { G.spawnT = 0.3; G.timeLeft += dt; } // capped: wait (and don't burn the level clock)
      else { spawnChicken(); G.spawned++; G.spawnT = G.cfg.interval * (0.75 + Math.random() * 0.5); }
    }
    const alive = aliveN > 0;
    if (G.spawned >= G.cfg.count && !alive) levelCleared();
    else if (G.timeLeft <= 0 && !G.over) { G.over = true; endRun('timeUp'); }
  }
  for (const c of chickens) if (!c.removed) updateChicken(c, dt);
  // watchdog (ranked + practice): a live chicken that has finished its jump always ends the run
  if (!G.over && G.mode === 'chickens') { const lost = chickens.find((c) => !c.dead && !c.removed && (c.state === 'landed' || (c.state === 'jump' && c.t >= c.dur.jump))); if (lost) chickenLanded(lost); }
  for (let i = chickens.length - 1; i >= 0; i--) if (chickens[i].removed) chickens.splice(i, 1);
  updateHud();
}
function levelCleared() {
  const bonus = Math.round(Math.max(0, G.timeLeft) * 5);
  G.score += bonus;
  showBanner(t('levelDone', { n: G.level }), t('timeBonus', { n: bonus }));
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
  $('h-left').textContent = G.between > 0 ? t('getReady') : t('remaining', { n: remaining });
  $('h-kills').textContent = G.kills;
  $('h-hs').textContent = G.kills ? Math.round(G.hsKills / G.kills * 100) + '%' : '0%';
  $('h-score').textContent = G.score;
  const inf = G.mode !== 'spray'; $('h-ammo').textContent = inf ? '∞' : G.ammo; $('h-mag').textContent = inf ? '∞' : W.mag; $('h-wname').textContent = W.name;
  if (G.mode === 'spray') sprayHud();
  document.querySelector('.ammo').classList.toggle('low', !inf && G.ammo <= 6);
  $('h-sens').textContent = sensText();
}
let bannerTimer;
function showBanner(t, sub) {
  const b = $('banner'); b.innerHTML = `${t}<small>${sub || ''}</small>`; b.classList.remove('hidden');
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.add('hidden'), 1900);
}
const screens = ['menu', 'settings', 'editor', 'pause', 'over', 'practice'];
let modalReturn = 'menu';
function show(id) {
  for (const s of screens) $(s).classList.toggle('hidden', s !== id);
  if (MOBILE) { $('touch').classList.toggle('hidden', !(state === 'play' && !id)); if (G && (state !== 'play' || id)) G.trigger = false; }
  $('hud').classList.toggle('hidden', !(state === 'play' || state === 'pause' || state === 'over-anim'));
}
function goMenu() {
  resetPos();
  $('countdown').className = 'countdown hidden';
  practice = false; $('h-prac').classList.add('hidden');
  state = 'menu'; G = null; for (const c of chickens) scene.remove(c.root); chickens.length = 0; roasts.clear();
  renderMenu(); show('menu'); loadLb();
}
const bestRank = () => { const v = parseInt(localStorage.getItem(LS.rank), 10); return Number.isFinite(v) ? Math.min(v, RANKS.length - 1) : -1; };
function renderMenu() {
  renderWeaponPick();
  const best = load(LS.best, { level: 0, score: 0, hs: 0 });
  const ri = best.level ? Math.max(bestRank(), rankFor(best.level, best.hs)) : -1;
  $('pb').innerHTML = best.level
    ? t('pbText', { level: best.level, score: best.score, rank: RANKS[ri].name })
    : t('pbNone');
  $('ranks').innerHTML = RANKS.map((r, i) => `<li class="${i === ri ? 'me' : ''}${i === TOP ? ' top' : ''}">${rankIcon(i)}<div><div class="rn">${r.name}</div><div class="rl">${i === TOP ? t('topReq', { n: r.minLevel, hs: TOP_HS }) : t('fromLevel', { n: r.minLevel })}</div></div></li>`).join('');
  $('menu-sens').textContent = sensText();
}

// ---------------- Online leaderboard ----------------
let lbPeriod = 'all', lbDevice = DEVICE, lastRows = null, lbErr = false;
const devTag = (d) => (d === 'mobile' ? 'MOBILE' : 'PC');
const myNick = () => (localStorage.getItem(LS.nick) || '').toLowerCase();
// small rank emblem of the run that made the board (same artwork as the in-game ranks); rank name as tooltip
function lbRankImg(i) {
  if (!Number.isInteger(i) || i < 0 || i > TOP) return '<span class="ri"></span>';
  const n = esc(RANKS[i].name);
  return `<img class="ri${i === TOP ? ' top' : ''}" src="img/ranks/rank${i + 1}-96.webp?v=34" width="96" height="96" alt="${n}" title="${n}" decoding="async">`;
}
function lbRowsHtml(rows) {
  if (lbErr) return `<li class="msg">${t('lbOffline')}</li>`;
  if (!rows) return `<li class="msg">${t('lbLoading')}</li>`;
  if (!rows.length) return `<li class="msg">${t('lbEmpty')}</li>`;
  const me = myNick();
  return rows.slice(0, 8).map((r) => `<li class="${r.nick.toLowerCase() === me ? 'me' : ''}"><span class="p">${r.pos}.</span>${flagHtml(r.country)}${lbRankImg(r.rank_idx)}<span class="n">${esc(r.nick)}</span>` +
    `<span class="w w-${esc(r.weapon || '')}" title="${t('lbWpn')}: ${esc(wpnName(r.weapon))}">${esc(wpnShort(r.weapon))}</span>` +
    `<span class="l" title="${t('lbLvl')} ${r.level}">L${r.level}</span><span class="s">${r.score}</span><span class="h">${r.hs_pct}%</span></li>`).join('');
}
function renderLb() { $('lb').innerHTML = lbRowsHtml(lastRows); $('lb-tag').textContent = devTag(lbDevice); }
let boardRows = null;
async function loadLb(force = false) {
  const period = lbPeriod, dev = lbDevice, same = period === 'all' && dev === DEVICE, age = force ? 0 : 30000;
  if (force) lastRows = null;
  renderLb();
  try { // the map whiteboard always shows this device's all-time board; the menu list follows the period + PC/Mobile toggles
    const [rows, board] = await Promise.all([fetchTop(period, 20, age, dev), same ? null : fetchTop('all', 20, age, DEVICE)]);
    boardRows = same ? rows : board; world.setBoard(boardRows, t('boardEmpty'), devTag(DEVICE));
    if (period !== lbPeriod || dev !== lbDevice) return;
    lbErr = false; lastRows = rows; renderLb();
  } catch (e) { if (period === lbPeriod && dev === lbDevice) { lbErr = true; lastRows = null; renderLb(); } }
}
document.querySelectorAll('.stab').forEach((b) => (b.onclick = () => {
  document.querySelectorAll('.stab').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
  $('tab-lb').classList.toggle('hidden', b.dataset.tab !== 'lb'); $('tab-ranks').classList.toggle('hidden', b.dataset.tab !== 'ranks');
}));
document.querySelectorAll('.lbd').forEach((b) => { b.classList.toggle('on', b.dataset.d === lbDevice); b.onclick = () => {
  lbDevice = b.dataset.d; document.querySelectorAll('.lbd').forEach((x) => x.classList.toggle('on', x === b)); loadLb(); }; });
document.querySelectorAll('.lbp').forEach((b) => (b.onclick = () => {
  lbPeriod = b.dataset.p; document.querySelectorAll('.lbp').forEach((x) => x.classList.toggle('on', x === b)); loadLb();
}));
function fillCountries() {
  const { pinned, rest } = countryList(), sel = $('o-country');
  const cur = sel.value || localStorage.getItem(LS.country) || guessCountry();
  const opt = (c) => `<option value="${c.code}">${esc(c.name)}</option>`;
  sel.innerHTML = pinned.map(opt).join('') + '<option disabled>──────────</option>' + rest.map(opt).join('');
  sel.value = cur; if (!sel.value) sel.value = 'LV';
}
let lastRun = null;
function setupSubmit() {
  const box = $('o-submit');
  const can = G && G.mode === 'chickens' && G.kills > 0 && !practice;
  box.classList.toggle('hidden', !can);
  if (!can) { lastRun = null; return; }
  lastRun = { level: G.level, score: G.score, kills: G.kills, hs: Math.round(G.hsKills / G.kills * 100), weapon: W.id, device: DEVICE, sent: false };
  $('o-nick').value = localStorage.getItem(LS.nick) || '';
  $('o-country').value = '';
  fillCountries();
  $('o-send').disabled = false; $('o-send').textContent = t('subBtn');
  const m = $('o-msg'); m.textContent = ''; m.className = 'sb-msg';
}
$('o-submit').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!lastRun || lastRun.sent) return;
  const nick = $('o-nick').value.replace(/[\u0000-\u001f\u007f]/g, '').trim().replace(/\s+/g, ' '), country = $('o-country').value, m = $('o-msg');
  const fail = (k) => { m.textContent = t('subErr.' + k); m.className = 'sb-msg err'; $('o-send').disabled = false; $('o-send').textContent = t('subBtn'); };
  if (nick.length < 2 || nick.length > 16) return fail('nick');
  if (!/^[A-Z]{2}$/.test(country)) return fail('country');
  localStorage.setItem(LS.nick, nick); localStorage.setItem(LS.country, country);
  $('o-send').disabled = true; $('o-send').textContent = t('subSending');
  try {
    const r = await submitScore({ ...lastRun, nick, country });
    if (!r || !r.ok) return fail((r && r.error) || 'bad');
    lastRun.sent = true; m.textContent = t('subOk', { n: r.position, w: wpnName(lastRun.weapon) }); m.className = 'sb-msg ok'; $('o-send').textContent = '✓';
    loadLb(true);
  } catch { fail('net'); }
});

// ---------------- Pointer lock / input ----------------
async function lock() {
  if (MOBILE) { if (state === 'pause') { state = 'play'; show(null); } return; } // touch mode: no pointer lock
  if (DEBUG && Q.has('nolock')) return;
  try {
    const p = canvas.requestPointerLock({ unadjustedMovement: true });
    if (p && p.then) { await p; rawInput = true; }
  } catch (e) {
    try { rawInput = false; const p2 = canvas.requestPointerLock(); if (p2 && p2.catch) p2.catch(() => $('clicklock').classList.remove('hidden')); }
    catch { $('clicklock').classList.remove('hidden'); }
  }
  $('s-raw').textContent = rawInput ? t('rawYes') : (rawInput === false ? t('rawNo') : '—');
}
const locked = () => document.pointerLockElement === canvas;
document.addEventListener('pointerlockchange', () => {
  if (locked()) { $('clicklock').classList.add('hidden'); if (state === 'pause') { state = 'play'; show(null); } }
  else if (state === 'play') { state = 'pause'; if (G) G.trigger = false; keys.clear(); show('pause'); }
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
addEventListener('keydown', (e) => {
  if (state !== 'play') return;
  if (!MOBILE && MOVE_KEYS[e.code]) { keys.add(MOVE_KEYS[e.code]); if (e.code.startsWith('Arrow')) e.preventDefault(); }
  if (!MOBILE && (e.code === 'ShiftLeft' || e.code === 'ShiftRight')) keys.add('walk');
  // infinite ammo: R does nothing outside spray mode
  const i = ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code); if (i >= 0) switchWeapon(WEAPON_ORDER[i]);
});
addEventListener('keyup', (e) => { if (MOVE_KEYS[e.code]) keys.delete(MOVE_KEYS[e.code]); if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.delete('walk'); });
addEventListener('blur', () => keys.clear());
$('clicklock').addEventListener('click', lock);

function goFull() { // phones: fullscreen + landscape where the browser allows it (Android); iOS Safari just ignores it
  if (!MOBILE || DEBUG) return;
  try { const d = document.documentElement, p = !document.fullscreenElement && d.requestFullscreen && d.requestFullscreen({ navigationUI: 'hide' });
    Promise.resolve(p).then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape')).catch(() => {}); } catch {}
}
let practice = false; // unranked practice run: no score submission, no PB/rank saving
const PRAC_MAX = 15;
function startGame(level = 1, countdown = true, prac = false) {
  practice = prac; $('h-prac').classList.toggle('hidden', !prac);
  sfx.unlock(); goFull();
  yaw = 0; pitch = 3; resetPos();
  setMode('chickens');
  state = 'play'; newRun(level); show(null); lock();
  if (countdown) { G.countdown = 5; G.cdShown = 0; clearTimeout(bannerTimer); $('banner').classList.add('hidden'); } // 5 s get-ready before the first level
}
// get-ready countdown: look around / switch weapons allowed, no shooting, level timer and spawns frozen (pause pauses it)
function countdownStep(dt) {
  G.countdown -= dt;
  const n = Math.ceil(G.countdown), el = $('countdown');
  if (G.countdown > 0 && n !== G.cdShown) {
    G.cdShown = n; el.textContent = n; el.className = 'countdown'; void el.offsetWidth; el.className = 'countdown tick'; sfx.tick();
  } else if (G.countdown <= 0) {
    G.countdown = 0; G.trigger = false; el.textContent = t('go'); el.className = 'countdown'; void el.offsetWidth; el.className = 'countdown go'; sfx.go();
    setTimeout(() => { if (!G || !G.countdown) el.className = 'countdown hidden'; }, 900);
    setTimeout(() => { if (G && G.mode === 'chickens' && state === 'play') showBanner(t('levelBanner', { n: G.level }), t('chickensN', { n: G.cfg.count })); }, 750);
  }
}
function setMode(mode) {
  document.body.classList.toggle('mode-spray', mode === 'spray');
  sprayWall.mesh.visible = mode === 'spray';
  punch.reset(); recoilIndex = 0; accPenalty = 0;
}
function switchWeapon(id) {
  if (!WEAPONS[id] || (W.id === id && gun)) { if (W.id === id) return; }
  W = WEAPONS[id]; settings.weapon = id; saveSettings();
  vmScene.remove(gun.root); gun = buildGun(W); vmScene.add(gun.root);
  kickTable = recoilTable(W); punch.reset(); recoilIndex = 0; accPenalty = 0;
  if (G) { G.ammo = W.mag; G.reloadT = 0; G.trigger = false; $('h-reload').classList.add('hidden'); if (G.mode === 'spray') { sprayWall.clearNext = true; sprayWall.redraw(); } }
  showBanner(W.name, t('wBanner', { dmg: W.damage, rpm: Math.round(60 / W.cycle), mag: W.mag }));
  renderWeaponPick(); updateHud();
}
// ---------------- Spray training ----------------
const SPRAY_D = 300; // units from the wall (~7.6 m)
const sprayWall = (() => {
  const Wu = 340, Hu = 260, cw = 1024, ch = Math.round(1024 * Hu / Wu);
  const c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(Wu, Hu), new THREE.MeshBasicMaterial({ map: tex }));
  const target = new THREE.Vector3(0, EYE, PLAYER.z - SPRAY_D);
  mesh.position.set(0, Hu / 2, target.z); mesh.visible = false; scene.add(mesh);
  const toPx = (x, y) => [(x + Wu / 2) / Wu * cw, (Hu / 2 - (y - mesh.position.y)) / Hu * ch];
  const S = { mesh, tex, target, holes: [], result: null, best: {}, clearNext: true, showOverlay: false };
  S.toPx = toPx;
  S.redraw = () => {
    g.fillStyle = '#e9e2d3'; g.fillRect(0, 0, cw, ch);
    g.strokeStyle = 'rgba(0,0,0,.06)'; g.lineWidth = 1;
    for (let x = 0; x < cw; x += cw / 18) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, ch); g.stroke(); }
    for (let y = 0; y < ch; y += cw / 18) { g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke(); }
    const [tx, ty] = toPx(0, EYE), k = cw / Wu;
    for (const [r, col] of [[40, 'rgba(0,240,255,.10)'], [20, 'rgba(0,240,255,.18)'], [8, 'rgba(176,0,255,.30)']]) { g.fillStyle = col; g.beginPath(); g.arc(tx, ty, r * k, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(20,20,30,.5)'; g.lineWidth = 2; for (const r of [8, 20, 40]) { g.beginPath(); g.arc(tx, ty, r * k, 0, 7); g.stroke(); }
    g.fillStyle = '#111'; g.beginPath(); g.arc(tx, ty, 1.6 * k, 0, 7); g.fill();
    g.font = 'bold 30px Oswald, Inter, sans-serif'; g.fillStyle = 'rgba(20,20,30,.75)'; g.textAlign = 'left';
    g.fillText(`${t('sp.wall')} · ${W.name}`, 24, ch - 50);
    g.font = '20px Inter, sans-serif'; g.fillStyle = 'rgba(20,20,30,.55)';
    g.fillText(tm('sp.hint'), 24, ch - 22);
    if (S.showOverlay) {
      const ideal = idealSpray(W);
      const wpos = (o, sgn) => toPx(sgn * SPRAY_D * Math.tan(o.x * Math.PI / 180), EYE + sgn * SPRAY_D * Math.tan(o.y * Math.PI / 180));
      // uncompensated pattern (where bullets go if you don't move the mouse)
      g.fillStyle = 'rgba(176,0,255,.55)';
      ideal.forEach((o, i) => { const [x, y] = wpos(o, 1); g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); if (i % 5 === 4) { g.font = '15px Inter'; g.fillText(i + 1, x + 7, y - 4); } });
      // ideal crosshair path (mirror): drag your aim along this
      g.strokeStyle = 'rgba(0,200,230,.9)'; g.lineWidth = 3; g.beginPath();
      ideal.forEach((o, i) => { const [x, y] = wpos(o, -1); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
    }
    for (const h of S.holes) {
      const [x, y] = toPx(h.x, h.y), q = h.score;
      g.fillStyle = q > 0.66 ? '#1fbf5b' : q > 0.33 ? '#e0a000' : '#d33';
      g.beginPath(); g.arc(x, y, 6.5, 0, 7); g.fill();
      g.fillStyle = '#111'; g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill();
    }
    tex.needsUpdate = true;
  };
  S.redraw();
  return S;
})();
function sprayHit(p) {
  const s = sprayWall;
  if (s.clearNext) { s.holes = []; s.clearNext = false; s.showOverlay = false; s.result = null; $('spray-card').classList.remove('has'); }
  const d = Math.hypot(p.x - s.target.x, p.y - s.target.y);
  const score = Math.max(0, Math.min(1, 1 - (d - 3) / 27)); // full credit within 3u (~0.6°), zero beyond 30u (~5.7°)
  s.holes.push({ x: p.x, y: p.y, d, score });
  G.hits++;
  s.redraw();
}
function sprayStep() {
  const s = sprayWall;
  const done = s.holes.length && !s.clearNext && ((!G.trigger && G.time - G.lastShot > 0.25) || G.ammo === 0);
  if (!done) return;
  const n = s.holes.length, pct = Math.round(s.holes.reduce((a, h) => a + h.score, 0) / n * 100);
  s.result = { n, pct };
  const key = W.id + (n >= W.mag ? ':full' : '');
  if (n >= 10 && pct > (s.best[W.id] || 0)) { s.best[W.id] = pct; localStorage.setItem('fa_aim_spray', JSON.stringify(s.best)); }
  s.showOverlay = true; s.clearNext = true; s.redraw(); drawSprayCard(); $('spray-card').classList.add('has');
  G.ammo = W.mag; G.reloadT = 0; $('h-reload').classList.add('hidden');
  punch.reset(); recoilIndex = 0;
}
try { Object.assign(sprayWall.best, JSON.parse(localStorage.getItem('fa_aim_spray')) || {}); } catch {}
function drawSprayCard() {
  const cv = $('spray-card'); if (!cv) return; const g = cv.getContext('2d'), w = cv.width, h = cv.height;
  const s = sprayWall, ideal = idealSpray(W);
  g.clearRect(0, 0, w, h);
  const deg = (u) => Math.atan(u / SPRAY_D) * 180 / Math.PI;
  const holes = s.holes.map((o) => ({ x: deg(o.x - s.target.x), y: deg(o.y - s.target.y), q: o.score }));
  const all = ideal.concat(holes, ideal.map((o) => ({ x: -o.x, y: -o.y })));
  const ext = Math.max(4, ...all.map((o) => Math.max(Math.abs(o.x), Math.abs(o.y)))) * 1.1;
  const k = Math.min(w, h - 40) / 2 / ext, cx = w / 2, cy = 20 + (h - 40) / 2;
  const P = (o) => [cx + o.x * k, cy - o.y * k];
  g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1;
  for (let d = -Math.floor(ext); d <= ext; d += 2) { g.beginPath(); g.moveTo(cx + d * k, 20); g.lineTo(cx + d * k, h - 20); g.stroke(); g.beginPath(); g.moveTo(0, cy - d * k); g.lineTo(w, cy - d * k); g.stroke(); }
  g.strokeStyle = 'rgba(0,240,255,.9)'; g.lineWidth = 2.5; g.beginPath(); ideal.forEach((o, i) => { const [x, y] = P({ x: -o.x, y: -o.y }); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
  ideal.forEach((o, i) => { const [x, y] = P(o); g.fillStyle = 'rgba(176,0,255,.75)'; g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); });
  holes.forEach((o) => { const [x, y] = P(o); g.fillStyle = o.q > 0.66 ? '#2ee27a' : o.q > 0.33 ? '#ffc21a' : '#ff4d4d'; g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill(); });
  g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, 5, 0, 7); g.stroke();
  g.font = '600 12px Inter, sans-serif'; g.textAlign = 'left';
  g.fillStyle = '#b07cff'; g.fillText(t('sp.raw'), 8, 14);
  g.fillStyle = '#00f0ff'; g.fillText(tm('sp.ideal'), 150, 14);
  g.fillStyle = '#2ee27a'; g.fillText(t('sp.yours'), 8, h - 6);
  g.fillStyle = '#9aa3b8'; g.textAlign = 'right'; g.fillText(t('sp.grid'), w - 8, h - 6);
}
function sprayHud() {
  const s = sprayWall, r = s.result;
  $('h-spray').innerHTML = `<div class="sp-t">${t('spray')} · <b>${W.name}</b></div>
    <div class="sp-row"><div><span>${t('sp.result')}</span><b>${r ? r.pct + '%' : '—'}</b></div><div><span>${t('sp.bullets')}</span><b>${r ? r.n : s.holes.length}/${W.mag}</b></div><div><span>${t('sp.best')}</span><b>${s.best[W.id] ? s.best[W.id] + '%' : '—'}</b></div></div>
    <div class="sp-k">${tm('sp.keys')}</div>`;
}
function startSpray() {
  resetPos();
  if (MOBILE) return; // spray training is desktop-only
  sfx.unlock(); $('spray-card').classList.remove('has');
  setMode('spray');
  for (const c of chickens) scene.remove(c.root); chickens.length = 0;
  G = { mode: 'spray', level: 1, cfg: levelCfg(1), score: 0, kills: 0, hsKills: 0, shots: 0, hits: 0, ammo: W.mag, reloadT: 0, nextShot: 0, burst: 0, lastShot: -9, trigger: false, time: 0, over: false, timeLeft: 0, between: 0, spawned: 0 };
  sprayWall.holes = []; sprayWall.result = null; sprayWall.showOverlay = false; sprayWall.clearNext = false; sprayWall.redraw();
  yaw = 0; pitch = 0; state = 'play'; show(null); updateHud(); lock();
}
function renderWeaponPick() {
  const el = $('weapons'); if (!el) return;
  el.innerHTML = WEAPON_ORDER.map((id) => { const w = WEAPONS[id];
    const hs = Math.floor(w.damage * w.hsMult * w.armorRatio * 0.5);
    return `<button class="wpick ${w.id === W.id ? 'on' : ''}" data-w="${id}"><b>${w.key} · ${w.name}</b><span>${t('wCard', { dmg: w.damage, rpm: Math.round(60 / w.cycle), mag: w.mag })}</span><span>${t('wHs', { n: hs })}${hs >= 100 ? t('oneTap') : ''}</span>${MOBILE ? `<span class="nr">${t('noRecoil')}</span>` : ''}</button>`; }).join('');
  el.querySelectorAll('[data-w]').forEach((b) => (b.onclick = () => switchWeapon(b.dataset.w)));
}
function endRun(reason) {
  state = 'over-anim'; G.trigger = false;
  if (document.pointerLockElement) document.exitPointerLock();
  setTimeout(() => showOver(reason), DEBUG ? 0 : 900);
}
function showOver(reason) {
  state = 'over';
  const best = load(LS.best, { level: 0, score: 0, hs: 0 });
  const isPB = !practice && (G.level > best.level || (G.level === best.level && G.score > best.score));
  if (isPB) localStorage.setItem(LS.best, JSON.stringify({ level: G.level, score: G.score, hs: G.kills ? Math.round(G.hsKills / G.kills * 100) : 0 }));
  const hsPct = G.kills ? Math.round(G.hsKills / G.kills * 100) : 0;
  const ri = rankFor(G.level, hsPct);
  if (!practice && ri > bestRank()) localStorage.setItem(LS.rank, JSON.stringify(ri));
  $('o-reason').textContent = t(reason);
  $('o-rankicon').innerHTML = rankIcon(ri, true);
  $('o-rank').textContent = RANKS[ri].name;
  const capped = ri === TOP - 1 && G.level >= RANKS[TOP].minLevel;
  $('o-level').textContent = t('reached', { n: G.level }) + (ri === TOP ? t('topRank') : capped ? '' : t('nextRank', { n: RANKS[ri + 1].minLevel }));
  $('o-hint').textContent = capped ? t('hsNeed', { hs: TOP_HS, rank: RANKS[TOP].name, cur: hsPct }) : '';
  $('o-hint').classList.toggle('hidden', !capped);
  document.querySelector('#over .card').classList.toggle('top-rank', ri === TOP);
  $('o-score').textContent = G.score; $('o-kills').textContent = G.kills;
  $('o-hs').textContent = G.kills ? Math.round(G.hsKills / G.kills * 100) + '%' : '0%';
  $('o-acc').textContent = G.shots ? Math.round(G.hits / G.shots * 100) + '%' : '0%';
  $('o-pb').textContent = practice ? t('pracBadge') : isPB ? t('newPB') : t('yourPB', { level: best.level, score: best.score });
  $('o-again').textContent = practice ? t('pracRetry', { n: practice }) : t('again');
  $('o-prac').textContent = practice ? t('pracOther') : t('pracBtn');
  $('o-ranked').classList.toggle('hidden', !practice);
  setupSubmit();
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
$('o-again').onclick = () => (practice ? startGame(practice, true, practice) : startGame(1));
$('o-ranked').onclick = () => startGame(1);
let pracFrom = 'over';
const openPicker = (from) => { pracFrom = from; $('lvl-grid').innerHTML = Array.from({ length: PRAC_MAX }, (_, i) => `<button type="button" class="btn ghost" data-l="${i + 1}">${i + 1}</button>`).join('');
  $('lvl-grid').querySelectorAll('[data-l]').forEach((b) => (b.onclick = () => startGame(+b.dataset.l, true, +b.dataset.l))); show('practice'); };
$('o-prac').onclick = () => openPicker('over');
$('btn-prac').onclick = () => openPicker('menu');
$('lvl-back').onclick = () => show(pracFrom);
$('o-menu').onclick = goMenu;
// share the game link: Web Share sheet on touch devices, else copy to clipboard + toast
const SHARE_URL = 'https://flowathletiq.com/aim/';
let toastT = 0;
function toast(msg) { const el = $('toast'); el.textContent = msg; el.classList.remove('hidden'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.add('hidden'), 2200); }
function manualCopy() { // last resort: popup with the link selected so the user can copy it by hand
  const pop = $('share-pop'), inp = $('share-url'); pop.classList.remove('hidden'); inp.value = SHARE_URL;
  setTimeout(() => { try { inp.focus(); inp.select(); inp.setSelectionRange(0, 999); } catch {} }, 30);
}
function execCopy() {
  const ta = document.createElement('textarea'); ta.value = SHARE_URL; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
  document.body.appendChild(ta); ta.focus(); ta.select(); try { ta.setSelectionRange(0, 999); } catch {}
  let ok = false; try { ok = document.execCommand('copy'); } catch {} ta.remove(); return ok;
}
function copyLink() {
  const done = (ok) => { if (ok) toast(t('copied')); else { manualCopy(); toast(t('shareManual')); } };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(SHARE_URL).then(() => done(true), () => done(execCopy()));
  else done(execCopy());
}
function shareLink() { // navigator.share is called synchronously inside the user gesture (no await before it)
  if (navigator.share && (MOBILE || matchMedia('(pointer:coarse)').matches)) {
    let p; try { p = navigator.share({ title: 'FlowAthletiq Aim Trainer', text: t('shareText'), url: SHARE_URL }); } catch { copyLink(); return; }
    Promise.resolve(p).then(() => toast(t('shared')), (e) => { if (!(e && e.name === 'AbortError')) copyLink(); });
    return;
  }
  copyLink();
}
let shareTouchT = 0;
document.querySelectorAll('[data-share]').forEach((b) => {
  b.addEventListener('pointerdown', (e) => e.stopPropagation());
  b.addEventListener('touchend', (e) => { e.preventDefault(); e.stopPropagation(); shareTouchT = Date.now(); shareLink(); }); // fires even if a parent eats the click
  b.addEventListener('click', (e) => { e.stopPropagation(); if (Date.now() - shareTouchT < 800) return; shareLink(); });
});
$('share-close').onclick = () => $('share-pop').classList.add('hidden');
document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => { show(modalReturn); if (modalReturn === 'menu') renderMenu(); }));
function openModal(id, from) { modalReturn = from; if (id === 'editor') syncEditor(); if (id === 'settings') syncSettings(); show(id); }

// Settings
function syncSettings() {
  $('s-sens').value = settings.sens; $('s-dpi').value = settings.dpi; $('s-sound').checked = settings.sound; $('s-fps').checked = settings.fps;
  $('s-cm').textContent = cm360().toFixed(2);
  $('s-quality').value = settings.quality; $('s-fire').value = settings.fire; $('s-fire-v').textContent = settings.fire;
  $('s-forcerot').checked = forced(); $('s-touch').checked = MOBILE;
  $('s-tsens').value = settings.tsens; $('s-tsens-v').textContent = settings.tsens.toFixed(2); $('s-gyro').checked = settings.gyro;
  if (rawInput === null) $('s-raw').textContent = t('rawLater');
}
for (const id of ['s-sens', 's-dpi', 's-sound', 's-fps']) $(id).addEventListener('input', () => {
  const sens = parseFloat($('s-sens').value), dpi = parseInt($('s-dpi').value, 10);
  if (sens > 0 && sens <= 20) settings.sens = sens;
  if (dpi >= 100) settings.dpi = dpi;
  settings.sound = $('s-sound').checked; settings.fps = $('s-fps').checked;
  saveSettings(); $('s-cm').textContent = cm360().toFixed(2); updateHud();
});

$('s-quality').addEventListener('change', () => { settings.quality = $('s-quality').value; saveSettings(); try { sessionStorage.removeItem('fa_aim_qauto'); } catch {} location.reload(); });
const applyFire = () => document.documentElement.style.setProperty('--fire', settings.fire + 'px'); applyFire();
$('s-fire').addEventListener('input', () => { settings.fire = parseInt($('s-fire').value, 10) || 104; $('s-fire-v').textContent = settings.fire; applyFire(); saveSettings(); });
$('s-forcerot').addEventListener('change', () => { if (!$('s-forcerot').checked) forceOff(); });
$('p-rot').onclick = () => forceOff();
$('s-tsens').addEventListener('input', () => { const v = parseFloat($('s-tsens').value); if (v > 0) settings.tsens = v; $('s-tsens-v').textContent = settings.tsens.toFixed(2); saveSettings(); updateHud(); });
$('s-gyro').addEventListener('change', async () => {
  const on = $('s-gyro').checked; $('s-gyro-msg').textContent = '';
  if (on && typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') { // iOS asks only now, on the toggle
    let ok = false; try { ok = (await DeviceMotionEvent.requestPermission()) === 'granted'; } catch {}
    if (!ok) { $('s-gyro').checked = false; settings.gyro = false; $('s-gyro-msg').textContent = t('gyroDenied'); return; }
  }
  if (on && typeof DeviceMotionEvent === 'undefined') { $('s-gyro').checked = false; $('s-gyro-msg').textContent = t('gyroNone'); return; }
  settings.gyro = on; updateHud();
});

// ---------------- Touch mode switch (menu + settings), saved; reload so renderer/scene use the right profile ----------------
function setTouchMode(on) {
  try { localStorage.setItem('fa_aim_touch', on ? '1' : '0'); } catch {}
  const u = new URL(location.href); u.searchParams.delete('mobile'); location.replace(u.toString());
}
$('btn-touch').onclick = () => setTouchMode(!MOBILE);
$('s-touch').addEventListener('change', () => setTouchMode($('s-touch').checked));
if (!MOBILE) { // desktop mode but the first input is a finger (no real mouse moved yet): switch to touch mode, or offer it on big screens
  let mouseSeen = false;
  addEventListener('mousemove', (e) => { if (!e.sourceCapabilities || !e.sourceCapabilities.firesTouchEvents) mouseSeen = true; }, { passive: true });
  addEventListener('touchstart', function first(e) {
    if (mouseSeen || document.pointerLockElement || (e.target.closest && e.target.closest('a[href]'))) return;
    removeEventListener('touchstart', first); // links (menu logo) navigate normally
    const short = Math.min(screen.width || 0, screen.height || 0);
    if (short && short <= 900) setTouchMode(true);
    else $('touch-offer').classList.remove('hidden');
  }, { passive: true });
  $('touch-offer').onclick = () => setTouchMode(true);
}

// ---------------- Touch controls (phones / tablets) ----------------
if (MOBILE) {
  const look = new Map(); // pointerId -> last x/y (several fingers can aim; the FIRE finger can aim too)
  const touchK = () => settings.tsens * 100 / Math.max(320, VW()); // ° per CSS px: at 1.00 a full-width swipe turns ~100°
  const aim = (e) => {
    const p = look.get(e.pointerId); if (!p) return;
    let dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (forced()) { const sx = dx; dx = dy; dy = -sx; } // #app is rotated 90° clockwise: screen ↓ = game →, screen → = game ↑
    if (state !== 'play') return;
    const k = touchK(); yaw -= dx * k; pitch = Math.max(-89, Math.min(89, pitch - dy * k));
  };
  const down = (e) => { e.preventDefault(); sfx.unlock(); look.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} };
  const up = (e) => { look.delete(e.pointerId); };
  const area = $('t-look'), fireB = $('t-fire');
  area.addEventListener('pointerdown', down); area.addEventListener('pointermove', aim);
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) area.addEventListener(ev, up);

  fireB.addEventListener('pointerdown', (e) => { down(e); fireB.classList.add('on'); if (state === 'play' && G) G.trigger = true; });
  fireB.addEventListener('pointermove', aim);
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) fireB.addEventListener(ev, (e) => { up(e); fireB.classList.remove('on'); if (G) G.trigger = false; });
  document.querySelectorAll('#touch [data-w]').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); switchWeapon(WEAPON_ORDER[+b.dataset.w]); }));
  $('t-pause').addEventListener('pointerdown', (e) => { e.preventDefault(); if (state === 'play') { state = 'pause'; show('pause'); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') { state = 'pause'; show('pause'); } });
  addEventListener('contextmenu', (e) => e.preventDefault());
  // optional gyro aim (off by default): integrates the rotation rate, mapped to the current landscape orientation
  addEventListener('devicemotion', (e) => {
    if (!settings.gyro || state !== 'play' || !e.rotationRate) return;
    const r = e.rotationRate, dt = Math.min(0.05, (e.interval > 1 ? e.interval / 1000 : e.interval) || 0.016);
    // forced landscape: the phone is held top-left while the OS still reports portrait
    const ang = forced() ? 90 : ((screen.orientation && screen.orientation.angle) ?? window.orientation ?? 90), s = ang === 270 || ang === -90 ? -1 : 1;
    const g = 0.9 * settings.tsens;
    yaw += s * (r.beta || 0) * dt * g; pitch = Math.max(-89, Math.min(89, pitch - s * (r.gamma || 0) * dt * g));
  });
}

// Crosshair editor
const prev = $('xh-prev'), pctx = prev.getContext('2d');
const XF = ['length', 'thickness', 'gap', 'outline', 'red', 'green', 'blue', 'alpha'];
const XB = ['outlineEnabled', 'centerDotEnabled', 'tStyleEnabled'];
const fillColors = () => { $('x-color').innerHTML = COLOR_PRESETS.map((c, i) => `<option value="${i}">${c.name}</option>`).join(''); $('x-color').value = xhair.color; };
fillColors();
onLang(() => {
  fillColors(); document.title = t('title');
  if (state === 'menu') renderMenu();
  renderLb(); world.setBoard(boardRows, t('boardEmpty'), devTag(DEVICE));
  if (state === 'over' && lastRun) fillCountries();
  if (!$('settings').classList.contains('hidden')) syncSettings();
  if (G && G.mode === 'spray') { sprayWall.redraw(); if (sprayWall.result) drawSprayCard(); }
  updateHud();
});
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
  const screenH = VH() * (devicePixelRatio || 1);
  drawCrosshair(pctx, xhair, w / 2, h / 2, screenH * (prev.width / prev.clientWidth || 1) / (devicePixelRatio || 1));
}
for (const f of XF) $('x-' + f).addEventListener('input', (e) => { xhair[f] = parseFloat(e.target.value); if (['red', 'green', 'blue'].includes(f)) xhair.color = 5; saveXhair(); syncEditor(); });
for (const f of XB) $('x-' + f).addEventListener('change', (e) => { xhair[f] = e.target.checked; saveXhair(); syncEditor(); });
$('x-color').addEventListener('change', (e) => { xhair.color = parseInt(e.target.value, 10); const p = COLOR_PRESETS[xhair.color].rgb; if (p) [xhair.red, xhair.green, xhair.blue] = p; saveXhair(); syncEditor(); });
const msg = (t, cls) => { const m = $('x-msg'); m.textContent = t; m.className = 'muted small ' + (cls || ''); };
$('x-import').onclick = () => {
  try { applyDecoded(decodeCrosshair($('x-code').value)); saveXhair(); syncEditor(); msg(t('ed.ok'), 'ok'); }
  catch { msg(t('ed.bad'), 'err'); }
};
const copy = async (t, ok) => { try { await navigator.clipboard.writeText(t); msg(ok, 'ok'); } catch { $('x-code').select(); msg(t('ed.manual')); } };
$('x-copy').onclick = () => copy(encodeCrosshair(xhair, xhairRaw), t('ed.copied'));
$('x-link').onclick = () => { const u = new URL(location.href); u.search = ''; u.searchParams.set('xhair', encodeCrosshair(xhair, xhairRaw)); copy(u.toString(), t('ed.linkCopied')); };
$('x-reset').onclick = () => { xhair = { ...DEFAULT_XHAIR }; xhairRaw = null; saveXhair(); syncEditor(); msg(t('ed.resetDone')); };

// ---------------- Boot ----------------
goMenu();
requestAnimationFrame(tick);

// ---------------- Debug API (for screenshots/tests only, ?debug) ----------------
if (DEBUG) {
  window.__aim = {
    THREE, camera, chickens, world, get roasts() { return roasts; },
    get G() { return G; }, get state() { return state; }, keys, vel, updateMove, MOVE,
    startGame(level = 1, cd = false, prac = false) { startGame(level, cd, prac); }, get practice() { return practice; },
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
    shoot(exact = true) { G.burst = 0; G.nextShot = 0; if (exact) { punch.reset(); recoilIndex = 0; accPenalty = 0; } camera.updateMatrixWorld(); for (const c of chickens) c.root.updateMatrixWorld(true); fire(shotDirection(exact)); },
    QUALITY, settings,
    weapon(id) { switchWeapon(id); }, get yaw() { return yaw; }, get pitch() { return pitch; }, MOBILE, get W() { return W; }, get lastDir() { return lastDir; }, punch, idealSpray,
    sprayAuto(comp = 1, n) { // simulate holding fire; comp = fraction of ideal compensation applied by the 'player'
      const ideal = idealSpray(W); const y0 = yaw, p0 = pitch; n = n || W.mag; G.trigger = false; sprayWall.clearNext = true;
      for (let i = 0; i < n; i++) { yaw = y0 + ideal[i].x * comp * 1; pitch = p0 - ideal[i].y * comp; camera.rotation.set(pitch * Math.PI / 180, yaw * Math.PI / 180, 0); camera.updateMatrixWorld();
        fire(); step(W.cycle); }
      yaw = y0; pitch = p0; G.lastShot = -9; step(0.5); step(0.5);
    },
    startSpray() { startSpray(); }, end(r) { endRun(r); },
    hideGun(v = true) { gun.root.visible = !v; },
    vm(o) { Object.assign(VM, o); vmScene.remove(gun.root); gun = buildGun(W); vmScene.add(gun.root); },
    showcase(id, on = true) { // side-view render of a weapon model for previews
      if (!on) { showcaseCam = null; return; }
      switchWeapon(id); showcaseCam = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 1, 500);
      gun.root.position.copy(gun.base); gun.root.rotation.set(0, 0, 0); gun.root.updateMatrixWorld(true);
      const h = gun.root.getObjectByName('hands'); if (h) h.visible = false;
      const bb = new THREE.Box3(); gun.root.traverse(o => { if (o.isMesh) { let v = true; for (let q = o; q; q = q.parent) if (q.visible === false) v = false; if (v) bb.expandByObject(o); } });
      const c = bb.getCenter(new THREE.Vector3()); const sz = bb.getSize(new THREE.Vector3());
      showcaseCam.position.set(c.x + sz.z * 1.5, c.y + sz.z * 0.12, c.z + sz.z * 0.1); showcaseCam.lookAt(c);
    },
    calcDamage, openEditor() { openModal('editor', 'menu'); }, openSettings() { openModal('settings', 'menu'); },
    over(reason = 'landed') { G.over = true; endRun(reason); },
  };
}
