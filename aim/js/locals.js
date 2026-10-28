// "Vietējie iedzīvotāji": low-poly locals who walk out of the arcade arches as the player reaches higher levels (desktop only).
// Purely cosmetic: never added to the raycast targets (bullets pass through), never touch scoring, spawning or the game-over logic.
// Reactions: idle sway + sip/puff, clap when a level is cleared, a pair whispers and points at the player on a headshot streak,
// hands on heads when the run is lost.
import * as THREE from '../vendor/three.module.min.js';

const lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const M = {
  skin: [lam(0xe9b996), lam(0xd9a27a), lam(0xf0c6a6)], shoe: lam(0x1d1b1a), hair: [lam(0x3a2a1c), lam(0x7a5a36), lam(0x9a9a96), lam(0x1c1c1e)],
  glass: lam(0x9fd3ff, { transparent: true, opacity: 0.6 }), cap: lam(0x2b6fd6), water: lam(0x5fb3ff, { transparent: true, opacity: 0.55 }),
  beer: lam(0x5b3a12), label: lam(0xe9dcb0), foam: lam(0xffffff), pipe: lam(0x4a2a14), pipeDark: lam(0x1c120a), vape: lam(0x34363c),
  vapeTip: lam(0x7fd3ff, { emissive: 0x1d6f9a }), cup: lam(0xf3efe6), coffee: lam(0x3a2414), scarfR: lam(0x9e3039), scarfW: lam(0xf4f1ea), eye: lam(0x161616),
};
const GEO = {
  leg: new THREE.CylinderGeometry(3.2, 2.8, 32, 8), shoe: new THREE.BoxGeometry(5.5, 3, 9), torso: new THREE.CylinderGeometry(8.5, 9.5, 27, 12),
  belly: new THREE.SphereGeometry(9.4, 12, 8), head: new THREE.SphereGeometry(6.4, 14, 10), hair: new THREE.SphereGeometry(6.7, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
  neck: new THREE.CylinderGeometry(2.6, 3, 4, 8), upper: new THREE.CylinderGeometry(2.6, 2.3, 13, 8), fore: new THREE.CylinderGeometry(2.3, 2, 12, 8),
  hand: new THREE.SphereGeometry(2.4, 8, 6), nose: new THREE.SphereGeometry(1.1, 6, 4), eye: new THREE.SphereGeometry(0.75, 6, 4),
  cap: new THREE.CylinderGeometry(6.9, 6.9, 2.4, 14), brim: new THREE.BoxGeometry(9, 0.8, 6), beanie: new THREE.SphereGeometry(7, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
  bottle: new THREE.CylinderGeometry(1.9, 1.9, 9, 10), neckB: new THREE.CylinderGeometry(0.8, 1.6, 3.5, 8), capB: new THREE.CylinderGeometry(0.95, 0.95, 1.2, 8),
  label: new THREE.CylinderGeometry(1.95, 1.95, 3.5, 10), bowl: new THREE.CylinderGeometry(1.4, 1.1, 2.6, 8), stem: new THREE.CylinderGeometry(0.35, 0.35, 6, 5),
  vape: new THREE.BoxGeometry(1.6, 6.5, 2.6), vapeTip: new THREE.BoxGeometry(1.1, 1.2, 1.4), cup: new THREE.CylinderGeometry(2, 1.6, 4.4, 10), coffee: new THREE.CircleGeometry(1.8, 10),
  scarf: new THREE.TorusGeometry(4.6, 1.9, 6, 14), scarfEnd: new THREE.BoxGeometry(4, 13, 1.4), puff: new THREE.IcosahedronGeometry(1, 1),
};
const mesh = (g, m, x = 0, y = 0, z = 0, sh = false) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = sh; return o; };

// The six locals in the order they come out (level = first level they appear on), with where they stand (arch z + side offset).
export const LOCALS = [
  { item: 'water', level: 3, arch: -300, dz: -30, shirt: 0x2f7fbf, pants: 0x2a3140, hair: 1, hat: null, belly: false },
  { item: 'beer', level: 5, arch: -300, dz: 30, shirt: 0x8a3b2e, pants: 0x3b3a34, hair: 2, hat: 'cap', hatC: 0x2c4b2c, belly: true },
  { item: 'pipe', level: 7, arch: -450, dz: -30, shirt: 0x5b5246, pants: 0x30302c, hair: 2, hat: 'cap', hatC: 0x3c3328, belly: false, old: true },
  { item: 'vape', level: 9, arch: -450, dz: 30, shirt: 0x1f1f24, pants: 0x4a5260, hair: 3, hat: 'beanie', hatC: 0x7b2fb5, belly: false },
  { item: 'coffee', level: 11, arch: -150, dz: -30, shirt: 0xc9a227, pants: 0x2d3446, hair: 0, hat: null, belly: false },
  { item: 'scarf', level: 13, arch: -150, dz: 30, shirt: 0x9e3039, pants: 0x23262e, hair: 0, hat: 'beanie', hatC: 0x9e3039, belly: false },
];
export const localsForLevel = (L) => LOCALS.filter((d) => L >= d.level).length;

function makeItem(kind) {
  const g = new THREE.Group();
  if (kind === 'water') { g.add(mesh(GEO.bottle, M.glass, 0, 3, 0)); g.add(mesh(GEO.bottle, M.water, 0, 2.2, 0)).scale.set(0.85, 0.8, 0.85); g.add(mesh(GEO.neckB, M.glass, 0, 9.2, 0)); g.add(mesh(GEO.capB, M.cap, 0, 11.4, 0)); }
  else if (kind === 'beer') { g.add(mesh(GEO.bottle, M.beer, 0, 3, 0)); g.add(mesh(GEO.label, M.label, 0, 2.5, 0)); g.add(mesh(GEO.neckB, M.beer, 0, 9.2, 0)); g.add(mesh(GEO.capB, M.label, 0, 11.3, 0)); }
  else if (kind === 'pipe') { const st = mesh(GEO.stem, M.pipeDark, 0, 0, 2.6); st.rotation.x = Math.PI / 2; g.add(st); g.add(mesh(GEO.bowl, M.pipe, 0, 1, -0.6)); }
  else if (kind === 'vape') { g.add(mesh(GEO.vape, M.vape, 0, 2, 0)); g.add(mesh(GEO.vapeTip, M.vapeTip, 0, 5.8, 0)); }
  else if (kind === 'coffee') { g.add(mesh(GEO.cup, M.cup, 0, 1.6, 0)); const c = mesh(GEO.coffee, M.coffee, 0, 3.7, 0); c.rotation.x = -Math.PI / 2; g.add(c); }
  return g;
}

function makeLocal(d, i) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); root.visible = false;
  const shirt = lam(d.shirt), pants = lam(d.pants), skin = M.skin[i % 3];
  const legs = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(s * 4.2, 33, 0); p.add(mesh(GEO.leg, pants, 0, -16, 0, true)); p.add(mesh(GEO.shoe, M.shoe, 0, -31.5, 1.8)); body.add(p); return p; });
  const torso = mesh(GEO.torso, shirt, 0, 46.5, 0, true); body.add(torso);
  if (d.belly) { const b = mesh(GEO.belly, shirt, 0, 42, 2.2, true); b.scale.set(1, 0.8, 0.85); body.add(b); }
  const headG = new THREE.Group(); headG.position.set(0, 60, 0); body.add(headG);
  headG.add(mesh(GEO.neck, skin, 0, 1, 0)); headG.add(mesh(GEO.head, skin, 0, 8.5, 0, true)); headG.add(mesh(GEO.nose, skin, 0, 8, 6.3));
  for (const s of [-1, 1]) headG.add(mesh(GEO.eye, M.eye, s * 2.3, 9.6, 5.7));
  headG.add(mesh(GEO.hair, M.hair[d.hair], 0, 9.3, -0.4));
  if (d.hat === 'cap') { const hm = lam(d.hatC); headG.add(mesh(GEO.cap, hm, 0, 13.6, 0)); headG.add(mesh(GEO.brim, hm, 0, 12.6, 6)); }
  if (d.hat === 'beanie') headG.add(mesh(GEO.beanie, lam(d.hatC), 0, 11, 0));
  if (d.item === 'scarf') { const sc = mesh(GEO.scarf, M.scarfR, 0, 59.5, 0); sc.rotation.x = Math.PI / 2; body.add(sc); const e = mesh(GEO.scarfEnd, M.scarfR, 3, 52, 8.2); e.add(mesh(new THREE.BoxGeometry(4.1, 2.2, 1.5), M.scarfW, 0, 0, 0)); body.add(e); }
  const arms = [-1, 1].map((s) => {
    const sh = new THREE.Group(); sh.rotation.order = 'YXZ'; sh.position.set(s * 11, 58, 0); body.add(sh);
    sh.add(mesh(GEO.upper, shirt, 0, -6.5, 0)); const el = new THREE.Group(); el.position.set(0, -13, 0); sh.add(el);
    el.add(mesh(GEO.fore, d.item === 'scarf' ? shirt : skin, 0, -6, 0)); const hand = new THREE.Group(); hand.position.set(0, -12.5, 0); el.add(hand); hand.add(mesh(GEO.hand, skin));
    return { sh, el, hand, s };
  });
  let item = null;
  if (d.item !== 'scarf') { item = makeItem(d.item); arms[0].hand.add(item); }
  return { d, i, root, body, legs, arms, headG, item, state: 'hidden', t: 0, act: 0, actT: 2 + Math.random() * 3, react: null, rt: 0, yaw: -Math.PI / 2, sway: Math.random() * 6 };
}

class Smoke {
  constructor(scene) {
    this.items = []; for (let i = 0; i < 28; i++) { const m = new THREE.Mesh(GEO.puff, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, opacity: 0 })); m.visible = false; scene.add(m); this.items.push({ m, v: new THREE.Vector3(), life: 0, max: 1, s0: 1, s1: 3 }); }
    this.i = 0;
  }
  emit(p, dir, n, { color = 0xdddddd, speed = 10, life = 1.8, s0 = 1.2, s1 = 4, op = 0.5 } = {}) {
    for (let k = 0; k < n; k++) {
      const it = this.items[this.i++ % this.items.length];
      it.m.position.copy(p).addScaledVector(dir, k * 0.8); it.m.material.color.setHex(color); it.m.visible = true;
      it.v.copy(dir).multiplyScalar(speed * (0.6 + Math.random() * 0.6)); it.v.y += 4 + Math.random() * 3; it.v.x += (Math.random() - 0.5) * 3; it.v.z += (Math.random() - 0.5) * 3;
      Object.assign(it, { life: life * (0.8 + Math.random() * 0.4), s0, s1, op }); it.max = it.life;
    }
  }
  update(dt) {
    for (const it of this.items) {
      if (it.life <= 0) continue;
      it.life -= dt; const u = 1 - it.life / it.max;
      it.v.multiplyScalar(1 - 1.6 * dt); it.v.y += 3 * dt; it.m.position.addScaledVector(it.v, dt);
      it.m.scale.setScalar(it.s0 + (it.s1 - it.s0) * u); it.m.material.opacity = it.op * (1 - u) * Math.min(1, u * 6);
      if (it.life <= 0) it.m.visible = false;
    }
  }
  clear() { for (const it of this.items) { it.life = 0; it.m.visible = false; } }
}

function bubbleSprite() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.roundRect ? g.roundRect(6, 6, 116, 40, 18) : g.rect(6, 6, 116, 40); g.fill();
  g.beginPath(); g.moveTo(40, 44); g.lineTo(30, 60); g.lineTo(56, 44); g.fill();
  g.fillStyle = '#222'; g.font = 'italic 700 24px Inter, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('psst…', 64, 27);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0 })); s.scale.set(22, 11, 1); s.visible = false; return s;
}

const _v = new THREE.Vector3(), _f = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
const sm = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u;
const angTo = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

export class Locals {
  constructor(scene, arches) {
    this.scene = scene; this.smoke = new Smoke(scene);
    this.people = LOCALS.map((d, i) => { const p = makeLocal(d, i); scene.add(p.root); return p; });
    for (const p of this.people) {
      const a = arches.find((x) => x.z === p.d.arch) || arches[0];
      p.inside = new THREE.Vector3(a.x + 16, 0, a.z); p.door = new THREE.Vector3(a.x - 40, 0, a.z); p.spot = new THREE.Vector3(a.x - 54, 0, a.z + p.d.dz);
      p.bubble = bubbleSprite(); scene.add(p.bubble);
    }
    this.want = 0; this.queueT = 0; this.watch = new THREE.Vector3(0, 64, 250);
  }
  get count() { return this.people.filter((p) => p.state !== 'hidden').length; }
  reset() {
    this.want = 0; this.smoke.clear();
    for (const p of this.people) { p.state = 'hidden'; p.root.visible = false; p.react = null; p.bubble.visible = false; this._pose(p, {}); }
  }
  setLevel(L) { const n = localsForLevel(L); if (n > this.want) { this.want = n; this.queueT = Math.min(this.queueT, 0.6); } }
  // reactions (only locals that are already outside react)
  clap() { for (const p of this.people) if (p.state === 'idle') this._react(p, 'clap', 2.3 + Math.random() * 0.4); }
  sad() { for (const p of this.people) if (p.state === 'idle') this._react(p, 'sad', 2.6); }
  whisper() {
    const out = this.people.filter((p) => p.state === 'idle' && !p.react);
    const pairs = [];
    for (const a of out) for (const b of out) if (a.i < b.i && a.d.arch === b.d.arch) pairs.push([a, b]);
    if (pairs.length) { const [a, b] = pairs[Math.floor(Math.random() * pairs.length)]; this._react(a, 'whisper', 3, b); this._react(b, 'point', 3, a); return true; }
    if (out.length) { this._react(out[Math.floor(Math.random() * out.length)], 'point', 2.6, null); return true; }
    return false;
  }
  _react(p, kind, dur, mate) { p.react = kind; p.rt = 0; p.rdur = dur; p.mate = mate || null; }
  update(dt, watch) {
    if (dt <= 0) return;
    if (watch) this.watch.copy(watch);
    this.smoke.update(dt);
    // walk the next local out (one every ~1.6 s when several are due)
    this.queueT -= dt;
    if (this.queueT <= 0 && this.count < this.want) {
      const p = this.people.find((x) => x.state === 'hidden');
      if (p) { p.state = 'walk'; p.t = 0; p.root.visible = true; p.root.position.copy(p.inside); p.leg = 0; }
      this.queueT = 1.6;
    }
    for (const p of this.people) if (p.state !== 'hidden') this._update(p, dt);
  }
  _update(p, dt) {
    p.t += dt; p.sway += dt;
    const P = p.root.position, pose = {};
    let face = Math.atan2(this.watch.x - P.x, this.watch.z - P.z); // watch the player
    if (p.state === 'walk') {
      const goal = P.x > p.door.x + 1 ? p.door : p.spot, dx = goal.x - P.x, dz = goal.z - P.z, d = Math.hypot(dx, dz), s = 62 * dt;
      face = Math.atan2(dx, dz);
      if (d <= s) { P.x = goal.x; P.z = goal.z; if (goal === p.spot) { p.state = 'idle'; p.t = 0; } } else { P.x += dx / d * s; P.z += dz / d * s; }
      p.leg += dt * 8.5; const sw = Math.sin(p.leg);
      pose.legs = [sw * 0.5, -sw * 0.5]; pose.arms = [-sw * 0.35, sw * 0.35]; pose.bob = Math.abs(Math.cos(p.leg)) * 1.2;
    } else {
      // idle: weight shift + breathing, occasional sip / puff
      pose.sway = Math.sin(p.sway * 1.3 + p.i) * 0.035; pose.breath = Math.sin(p.sway * 2.2) * 0.4;
      if (!p.react) {
        p.actT -= dt;
        if (p.actT <= 0 && p.d.item !== 'scarf') { p.act = 1.8; p.actT = 4 + Math.random() * 4; }
        if (p.act > 0) {
          p.act -= dt; const u = 1 - p.act / 1.8, k = sm(u / 0.3) * (1 - sm((u - 0.7) / 0.3));
          pose.sip = k; pose.headTilt = -0.25 * k * (p.d.item === 'water' || p.d.item === 'beer' ? 1.6 : 0.6);
          if ((p.d.item === 'pipe' || p.d.item === 'vape') && p.act < 0.55 && p.act + dt >= 0.55) this._exhale(p);
          if (p.d.item === 'pipe' && Math.random() < dt * 1.5) this._bowlSmoke(p);
        } else pose.hold = 1;
        if (p.d.item === 'coffee' && Math.random() < dt * 2) this._steam(p);
      } else {
        p.rt += dt; const u = p.rt / p.rdur, k = sm(p.rt / 0.35) * (1 - sm((p.rt - p.rdur + 0.4) / 0.4));
        if (p.react === 'clap') { pose.clap = k; pose.clapPh = p.rt * 26; pose.bob = Math.abs(Math.sin(p.rt * 7)) * 2.2 * k; }
        else if (p.react === 'sad') { pose.sad = k; pose.headTilt = 0.35 * k; pose.headTurn = Math.sin(p.rt * 5) * 0.25 * k; }
        else if (p.react === 'whisper' && p.mate) {
          const m = p.mate.root.position; face = lerp(face, face + angTo(face, Math.atan2(m.x - P.x, m.z - P.z)), k);
          pose.lean = 0.22 * k; pose.headTurn = 0.15 * k; pose.cup = k; this._bubble(p, k);
        } else if (p.react === 'point') {
          if (p.mate) { const m = p.mate.root.position; pose.headTurn = Math.max(-0.9, Math.min(0.9, angTo(p.yaw, Math.atan2(m.x - P.x, m.z - P.z)))) * 0.8 * k; } // body + arm toward the player, head toward the mate
          pose.point = k * (u > 0.2 ? 1 : u / 0.2); pose.nod = Math.sin(p.rt * 9) * 0.08 * k;
        }
        if (p.rt >= p.rdur) { p.react = null; p.bubble.visible = false; }
      }
    }
    p.yaw += angTo(p.yaw, face) * Math.min(1, dt * (p.state === 'walk' ? 10 : 3));
    p.root.rotation.y = p.yaw;
    this._pose(p, pose);
  }
  _pose(p, o) {
    const [R, L] = p.arms; // arms[0] holds the item
    p.body.position.y = (o.bob || 0) + (o.breath || 0) * 0.3; p.body.rotation.z = o.sway || 0; p.body.rotation.x = o.lean || 0;
    p.legs[0].rotation.x = o.legs ? o.legs[0] : 0; p.legs[1].rotation.x = o.legs ? o.legs[1] : 0;
    p.headG.rotation.set((o.headTilt || 0) + (o.nod || 0), o.headTurn || 0, 0);
    for (const a of p.arms) { a.sh.rotation.set(0, 0, a.s * 0.08); a.el.rotation.set(0, 0, 0); }
    if (o.arms) { R.sh.rotation.x = o.arms[0]; L.sh.rotation.x = o.arms[1]; }
    const hasItem = !!p.item, hold = hasItem ? (o.hold ?? 1) : 0;
    // holding the item at waist height (forearm forward), sip = hand to mouth
    if (hasItem && !o.clap && !o.sad && !o.point) {
      const s = o.sip || 0;
      R.sh.rotation.x += lerp(-0.25 * hold, -0.5, s); R.el.rotation.x = lerp(-1.35 * hold, -2.5, s); R.sh.rotation.y = -R.s * lerp(0.12 * hold, 0.55, s);
    }
    if (o.clap) { const c = o.clap, w = Math.sin(o.clapPh) * 0.22 * c;
      for (const a of p.arms) { a.sh.rotation.x = -0.95 * c; a.el.rotation.x = -1.2 * c; a.sh.rotation.y = -a.s * (0.6 + w) * c; } }
    if (o.sad) for (const a of p.arms) { a.sh.rotation.x = -0.6 * o.sad; a.el.rotation.x = -2.35 * o.sad; a.sh.rotation.y = -a.s * 0.62 * o.sad; } // both hands to the face ("ak nē!")
    if (o.cup) { L.sh.rotation.x = -1.2 * o.cup; L.el.rotation.x = -1.9 * o.cup; L.sh.rotation.y = -L.s * 0.6 * o.cup; } // hand cupped at the mouth
    if (o.point) { L.sh.rotation.x = -1.45 * o.point; L.sh.rotation.y = -L.s * 0.1 * o.point; L.el.rotation.x = -0.1 * o.point; }
    if (p.item) { // keep the bottle / cup upright, tilt it when drinking
      const tilt = (p.d.item === 'water' || p.d.item === 'beer') ? 1.9 * (o.sip || 0) : (p.d.item === 'coffee' ? 0.8 * (o.sip || 0) : 0);
      p.item.rotation.set(-(R.sh.rotation.x + R.el.rotation.x) + tilt, 0, 0);
    }
  }
  _mouth(p, fwd = 7) { p.headG.updateWorldMatrix(true, false); _v.set(0, 7, fwd).applyMatrix4(p.headG.matrixWorld); _f.set(0, 0, 1).transformDirection(p.headG.matrixWorld); return _v; }
  _exhale(p) { const at = this._mouth(p); if (p.d.item === 'vape') this.smoke.emit(at, _f, 6, { color: 0xf4f6fa, speed: 16, life: 2.4, s0: 1.4, s1: 6.5, op: 0.55 }); else this.smoke.emit(at, _f, 3, { color: 0xcfcac2, speed: 8, life: 2, s0: 1, s1: 4, op: 0.45 }); }
  _bowlSmoke(p) { p.item.updateWorldMatrix(true, false); _v.set(0, 3, -0.6).applyMatrix4(p.item.matrixWorld); this.smoke.emit(_v, UP, 1, { color: 0xbdb8b0, speed: 3, life: 1.6, s0: 0.5, s1: 2.2, op: 0.35 }); }
  _steam(p) { p.item.updateWorldMatrix(true, false); _v.set(0, 4.5, 0).applyMatrix4(p.item.matrixWorld); this.smoke.emit(_v, UP, 1, { color: 0xffffff, speed: 3, life: 1.3, s0: 0.5, s1: 2, op: 0.3 }); }
  _bubble(p, k) { const b = p.bubble; b.visible = k > 0.05; p.headG.updateWorldMatrix(true, false); _v.set(0, 22, 0).applyMatrix4(p.headG.matrixWorld); b.position.copy(_v); b.material.opacity = k; }
}
