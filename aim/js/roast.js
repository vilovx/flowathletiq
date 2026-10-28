// Shot chickens turn into a small roast (cepetis) that stays where it fell; between levels the cook comes out of "Vistu krogs" with a tray and collects them all.
// Purely cosmetic: nothing here is added to the raycast targets, and it never touches scoring or the landing/game-over logic.
import * as THREE from '../vendor/three.module.min.js';

const lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const MAX_ROASTS = 40; // a whole level's chickens stay on the ground until the cook collects them between levels
const M = {
  roast: lam(0xa4561f), roastDark: lam(0x7a3a12), bone: lam(0xf4eee0), plate: lam(0xf2f2f2),
  coat: lam(0xf7f7f4), pants: lam(0x2b2d33), skin: lam(0xe7b48f), shoe: lam(0x1a1a1a), button: lam(0x222222), hair: lam(0x4a3322), tray: lam(0xd9dde2), trayRim: lam(0xb8bec6),
};
const GEO = {
  body: new THREE.SphereGeometry(1, 14, 10), leg: new THREE.CylinderGeometry(1.2, 1.6, 7, 8), bone: new THREE.SphereGeometry(1.1, 6, 5),
  plate: new THREE.CylinderGeometry(11, 9, 1.2, 18),
  limb: new THREE.CylinderGeometry(2.6, 2.3, 30, 8), torso: new THREE.CylinderGeometry(9, 10.5, 30, 12), head: new THREE.SphereGeometry(6.5, 14, 10),
  hatBand: new THREE.CylinderGeometry(6.4, 6.4, 6, 14), hatPuff: new THREE.SphereGeometry(8.2, 14, 10), arm: new THREE.CylinderGeometry(2.3, 2, 22, 8),
  tray: new THREE.CylinderGeometry(25, 23, 1.6, 28), trayRim: new THREE.TorusGeometry(24, 1, 6, 28).rotateX(Math.PI / 2),
  shoe: new THREE.BoxGeometry(5, 3, 9), button: new THREE.SphereGeometry(0.8, 6, 4), nose: new THREE.SphereGeometry(1.2, 6, 4),
};
const mesh = (g, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; return o; };

// One merged, vertex-coloured mesh per roast (1 draw call): plated version on the cobbles, plate-less version on the cook's tray.
function mergeParts(parts) {
  const pos = [], nor = [], col = [], c = new THREE.Color();
  for (const [geo, hex, m] of parts) {
    let g = geo.clone().applyMatrix4(m); if (g.index) g = g.toNonIndexed();
    pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); c.setHex(hex);
    for (let i = 0; i < g.attributes.position.count; i++) col.push(c.r, c.g, c.b);
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return out;
}
const TRS = (x, y, z, sx = 1, sy = 1, sz = 1, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, rz)), new THREE.Vector3(sx, sy, sz));
function roastParts(plate) {
  const P = plate ? [[GEO.plate, 0xf2f2f2, TRS(0, 0.6, 0)]] : [];
  P.push([GEO.body, 0xa4561f, TRS(0, 6, 0, 8, 5.2, 6.2)]);
  for (const s of [-1, 1]) { P.push([GEO.leg, 0x7a3a12, TRS(6.5, 7.5, s * 3.6, 1, 1, 1, -1.0)], [GEO.bone, 0xf4eee0, TRS(9.6, 10, s * 3.6)], [GEO.body, 0x7a3a12, TRS(-1, 6.5, s * 5.6, 3.6, 2, 1.4)]); }
  return P;
}
const ROAST_GEO = mergeParts(roastParts(true)), TRAY_ROAST_GEO = mergeParts(roastParts(false)).translate(0, -2, 0);
const ROAST_MAT = new THREE.MeshLambertMaterial({ vertexColors: true });
function makeRoast() { const g = new THREE.Mesh(ROAST_GEO, ROAST_MAT); g.castShadow = true; g.visible = false; return g; }
function makeChef() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const legs = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(0, 30, s * 4.5); p.add(mesh(GEO.limb, M.pants, 0, -15, 0)); p.add(mesh(GEO.shoe, M.shoe, 2, -30, 0)); body.add(p); return p; });
  body.add(mesh(GEO.torso, M.coat, 0, 45, 0));                                // white chef coat
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) body.add(mesh(GEO.button, M.button, 9.6, 52 - i * 7, s * 3));
  body.add(mesh(GEO.head, M.skin, 0, 67, 0)); body.add(mesh(GEO.nose, M.skin, 6.6, 67, 0));
  body.add(mesh(GEO.hatBand, M.coat, 0, 74, 0)); body.add(mesh(GEO.hatPuff, M.coat, 0, 81, 0, 1, 0.8, 1));   // white toque
  const arms = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(0, 57, s * 11); p.add(mesh(GEO.arm, M.coat, 0, -10, 0)); body.add(p); return p; });
  const hold = new THREE.Group(); hold.position.set(24, 47, 0); body.add(hold);
  const tray = new THREE.Group(); hold.add(tray);                                                     // big oval serving platter
  const plate = mesh(GEO.tray, M.tray, 0, 0, 0, 1, 1, 0.72); tray.add(plate); tray.add(mesh(GEO.trayRim, M.trayRim, 0, 0.9, 0, 1, 1, 0.72));
  root.visible = false;
  return { root, body, legs, arms, hold, tray, busy: false };
}

// Tray slots: inner ring, outer ring, then the next layer on top (heap of roasts)
const SLOT = (i) => { const L = Math.floor(i / 14), j = i % 14, r = j < 5 ? 7 : 16, n = j < 5 ? 5 : 9, a = (j < 5 ? j : j - 5) / n * Math.PI * 2 + L * 0.4;
  return new THREE.Vector3(Math.cos(a) * r * 0.9, 1.4 + L * 4.2, Math.sin(a) * r * 0.62); };

// The cook comes out ONLY between levels (collect()), walks a nearest-neighbour tour over every roast on the ground, puts each on the
// tray and carries the lot back into the tavern. During a level nobody comes out; roasts just pile up where the chickens fell.
export class RoastSystem {
  constructor(scene, tavern, groundY) {
    this.scene = scene; this.tavern = tavern; this.groundY = groundY;
    this.roasts = []; this.free = []; for (let i = 0; i < MAX_ROASTS; i++) { const r = makeRoast(); scene.add(r); this.free.push(r); }
    this.chef = makeChef(); scene.add(this.chef.root);
    this.doorOpen = 0;
    this.inside = tavern.door.clone().add(new THREE.Vector3(0, 0, -18));
    this.step = tavern.door.clone().add(new THREE.Vector3(0, 0, 22));
  }
  get busy() { return this.chef.busy; }
  get count() { return this.roasts.length; }
  // a shot chicken has fallen to the ground at p
  add(p) {
    let g = this.free.pop();
    if (!g) { const old = this.roasts.find((r) => !r.onTray); if (!old) return; this._drop(old); g = this.free.pop(); }
    g.geometry = ROAST_GEO; g.position.set(p.x, this.groundY(p), p.z); g.rotation.set(0, Math.random() * 6.28, 0); g.scale.setScalar(0.01); g.visible = true;
    this.roasts.push({ g, age: 0, onTray: false });
  }
  _drop(r) { r.g.visible = false; if (r.g.parent !== this.scene) this.scene.attach(r.g); this.free.push(r.g); this.roasts.splice(this.roasts.indexOf(r), 1); }
  clear() {
    for (const r of this.roasts.slice()) this._drop(r);
    const c = this.chef; c.busy = false; c.root.visible = false; c.tour = null;
    this.doorOpen = 0; this.tavern.hinge.rotation.y = 0;
  }
  // start the between-level collection; returns the expected duration in seconds (0 = nothing to collect)
  collect() {
    const c = this.chef, left = this.roasts.filter((r) => !r.onTray);
    if (c.busy || !left.length) return 0;
    const tour = []; let at = this.step.clone(), D = this.step.distanceTo(this.inside);
    while (left.length) { let bi = 0, bd = 1e9; left.forEach((r, i) => { const d = Math.hypot(r.g.position.x - at.x, r.g.position.z - at.z); if (d < bd) { bd = d; bi = i; } }); const r = left.splice(bi, 1)[0]; tour.push(r); D += bd; at = r.g.position; }
    D += Math.hypot(at.x - this.step.x, at.z - this.step.z) + this.step.distanceTo(this.inside);
    const v = Math.min(800, Math.max(320, D / 2.0));                       // brisk walk; long tours become a run (~2.5-3.5 s total)
    Object.assign(c, { busy: true, tour, ti: 0, phase: 'out', t: 0, v, pick: 0, stage: null, n: 0 });
    c.root.position.copy(this.inside); c.root.visible = true;
    return D / v + tour.length * 0.06 + 0.3;
  }
  update(dt) {
    if (dt <= 0) return;
    for (const r of this.roasts) if (!r.onTray) { r.age += dt; r.g.scale.setScalar(Math.min(1, r.g.scale.x + dt * 6)); }
    let anyNear = false; const c = this.chef;
    if (c.busy) {
      c.t += dt;
      const P = c.root.position, walk = (to) => {
        const dx = to.x - P.x, dz = to.z - P.z, d = Math.hypot(dx, dz), s = c.v * dt;
        if (d > 0.5) c.root.rotation.y = Math.atan2(-dz, dx);
        if (d <= s) { P.x = to.x; P.z = to.z; return true; }
        P.x += dx / d * s; P.z += dz / d * s; return false;
      };
      const swing = Math.sin(c.t * c.v / 9);
      c.legs[0].rotation.z = swing * 0.6; c.legs[1].rotation.z = -swing * 0.6;
      c.arms.forEach((a) => (a.rotation.z = 1.35)); c.body.rotation.z = 0;           // both hands under the tray
      if (c.phase === 'out') {
        const r = c.tour[c.ti];
        if (!r || r.g.parent === null) { c.ti++; if (c.ti >= c.tour.length) c.phase = 'back'; }
        else if (c.pick > 0) { c.pick -= dt; c.body.rotation.z = -Math.sin((1 - c.pick / 0.06) * Math.PI) * 0.35; c.legs.forEach((l) => (l.rotation.z = 0)); if (c.pick <= 0) { c.ti++; if (c.ti >= c.tour.length) c.phase = 'back'; } }
        else {
          const goal = P.z < this.step.z - 4 && c.ti === 0 ? this.step : r.g.position;
          if (walk(goal) && goal !== this.step) { // onto the tray
            r.onTray = true; c.tray.attach(r.g); r.g.geometry = TRAY_ROAST_GEO; r.g.scale.setScalar(0.5); r.g.position.copy(SLOT(c.n++)); r.g.rotation.set(0, Math.random() * 6.28, 0); c.pick = 0.06;
          }
        }
      } else if (c.phase === 'back') {
        const goal = Math.hypot(P.x - this.step.x, P.z - this.step.z) > 2 && c.stage !== 'in' ? this.step : this.inside;
        if (goal === this.inside) c.stage = 'in';
        if (walk(goal) && goal === this.inside) { for (const r of this.roasts.filter((x) => x.onTray)) this._drop(r); c.busy = false; c.stage = null; c.root.visible = false; c.tour = null; }
      }
      P.y = this.groundY(P);
      if (Math.hypot(P.x - this.tavern.door.x, P.z - this.tavern.door.z) < 60) anyNear = true;
    }
    this.doorOpen += ((anyNear ? 1 : 0) - this.doorOpen) * Math.min(1, dt * 10);
    this.tavern.hinge.rotation.y = -this.doorOpen * 1.6;
  }
}
