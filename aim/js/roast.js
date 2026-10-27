// Shot chickens turn into a small roast (cepetis); a chef walks out of the "Vistu krogs" door, picks it up and carries it in.
// Purely cosmetic: nothing here is added to the raycast targets, and it never touches scoring or the landing/game-over logic.
import * as THREE from '../vendor/three.module.min.js';

const lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const MAX_CHEFS = 3, MAX_ROASTS = 12, REACH = 760, WAIT = 2.2;
const M = {
  roast: lam(0xa4561f), roastDark: lam(0x7a3a12), bone: lam(0xf4eee0), plate: lam(0xf2f2f2),
  coat: lam(0xf7f7f4), pants: lam(0x2b2d33), skin: lam(0xe7b48f), shoe: lam(0x1a1a1a), button: lam(0x222222), hair: lam(0x4a3322),
};
const GEO = {
  body: new THREE.SphereGeometry(1, 14, 10), leg: new THREE.CylinderGeometry(1.2, 1.6, 7, 8), bone: new THREE.SphereGeometry(1.1, 6, 5),
  plate: new THREE.CylinderGeometry(11, 9, 1.2, 18),
  limb: new THREE.CylinderGeometry(2.6, 2.3, 30, 8), torso: new THREE.CylinderGeometry(9, 10.5, 30, 12), head: new THREE.SphereGeometry(6.5, 14, 10),
  hatBand: new THREE.CylinderGeometry(6.4, 6.4, 6, 14), hatPuff: new THREE.SphereGeometry(8.2, 14, 10), arm: new THREE.CylinderGeometry(2.3, 2, 22, 8),
  shoe: new THREE.BoxGeometry(5, 3, 9), button: new THREE.SphereGeometry(0.8, 6, 4), nose: new THREE.SphereGeometry(1.2, 6, 4),
};
const mesh = (g, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; return o; };

function makeRoast() {
  const g = new THREE.Group();
  g.add(mesh(GEO.plate, M.plate, 0, 0.6, 0));
  g.add(mesh(GEO.body, M.roast, 0, 6, 0, 8, 5.2, 6.2));
  for (const s of [-1, 1]) {
    const leg = mesh(GEO.leg, M.roastDark, 6.5, 7.5, s * 3.6); leg.rotation.z = -1.0; g.add(leg);
    g.add(mesh(GEO.bone, M.bone, 9.6, 10, s * 3.6));
    const w = mesh(GEO.body, M.roastDark, -1, 6.5, s * 5.6, 3.6, 2, 1.4); g.add(w);
  }
  g.visible = false; return g;
}
function makeChef() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const legs = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(0, 30, s * 4.5); p.add(mesh(GEO.limb, M.pants, 0, -15, 0)); p.add(mesh(GEO.shoe, M.shoe, 2, -30, 0)); body.add(p); return p; });
  body.add(mesh(GEO.torso, M.coat, 0, 45, 0));                                // white chef coat
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) body.add(mesh(GEO.button, M.button, 9.6, 52 - i * 7, s * 3));
  body.add(mesh(GEO.head, M.skin, 0, 67, 0)); body.add(mesh(GEO.nose, M.skin, 6.6, 67, 0));
  body.add(mesh(GEO.hatBand, M.coat, 0, 74, 0)); body.add(mesh(GEO.hatPuff, M.coat, 0, 81, 0, 1, 0.8, 1));   // white toque
  const arms = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(0, 57, s * 11); p.add(mesh(GEO.arm, M.coat, 0, -10, 0)); body.add(p); return p; });
  const hold = new THREE.Group(); hold.position.set(13, 44, 0); body.add(hold);
  root.visible = false;
  return { root, body, legs, arms, hold, busy: false };
}

export class RoastSystem {
  constructor(scene, tavern, groundY) {
    this.scene = scene; this.tavern = tavern; this.groundY = groundY;
    this.roasts = []; this.free = []; for (let i = 0; i < MAX_ROASTS; i++) { const r = makeRoast(); scene.add(r); this.free.push(r); }
    this.chefs = []; for (let i = 0; i < MAX_CHEFS; i++) { const c = makeChef(); scene.add(c.root); this.chefs.push(c); }
    this.doorOpen = 0;
    this.inside = tavern.door.clone().add(new THREE.Vector3(0, 0, -18));
    this.step = tavern.door.clone().add(new THREE.Vector3(0, 0, 22));
  }
  // a shot chicken has fallen to the ground at p
  add(p) {
    let g = this.free.pop();
    if (!g) { const old = this.roasts.find((r) => !r.chef); if (!old) return; this._drop(old); g = this.free.pop(); }
    g.position.set(p.x, this.groundY(p), p.z); g.rotation.y = Math.random() * 6.28; g.scale.setScalar(0.01); g.visible = true;
    this.roasts.push({ g, age: 0, chef: null, fade: 0 });
  }
  _drop(r) { r.g.visible = false; r.g.parent !== this.scene && this.scene.attach(r.g); this.free.push(r.g); this.roasts.splice(this.roasts.indexOf(r), 1); }
  clear() {
    for (const r of this.roasts.slice()) this._drop(r);
    for (const c of this.chefs) { c.busy = false; c.root.visible = false; }
    this.doorOpen = 0; this.tavern.hinge.rotation.y = 0;
  }
  _dispatch(r) {
    const c = this.chefs.find((x) => !x.busy); if (!c) return false;
    const target = r.g.position, d = Math.hypot(target.x - this.step.x, target.z - this.step.z);
    if (d > REACH) return false;
    const v = Math.min(430, Math.max(170, (2 * d) / 2.1));                       // whole trip ~2–3 s
    Object.assign(c, { busy: true, r, phase: 'out', t: 0, v, from: this.inside.clone() });
    c.root.position.copy(this.inside); c.root.visible = true; r.chef = c;
    return true;
  }
  update(dt) {
    if (dt <= 0) return;
    for (const r of this.roasts.slice()) {
      r.age += dt;
      if (!r.chef) {
        r.g.scale.setScalar(Math.min(1, r.g.scale.x + dt * 6));
        if (r.age > 0.35) this._dispatch(r);
        if (!r.chef && r.age > WAIT) { r.fade += dt * 2.5; r.g.scale.setScalar(Math.max(0.01, 1 - r.fade)); if (r.fade >= 1) this._drop(r); }
      }
    }
    let anyNear = false;
    for (const c of this.chefs) {
      if (!c.busy) continue;
      c.t += dt;
      const P = c.root.position, walk = (to) => {
        const dx = to.x - P.x, dz = to.z - P.z, d = Math.hypot(dx, dz), s = c.v * dt;
        c.root.rotation.y = Math.atan2(-dz, dx);
        if (d <= s) { P.x = to.x; P.z = to.z; return true; }
        P.x += dx / d * s; P.z += dz / d * s; return false;
      };
      const swing = Math.sin(c.t * c.v / 9);
      c.legs[0].rotation.z = swing * 0.6; c.legs[1].rotation.z = -swing * 0.6;
      if (c.phase === 'out') {
        const tgt = c.r.g.position; const goal = P.z < this.step.z - 4 ? this.step : tgt;
        const arrived = walk(goal);
        c.arms.forEach((a, i) => (a.rotation.z = (i ? -swing : swing) * 0.5));
        if (arrived && goal === tgt) { c.phase = 'pick'; c.t = 0; }
      } else if (c.phase === 'pick') {
        c.legs.forEach((l) => (l.rotation.z = 0));
        const u = Math.min(1, c.t / 0.3); c.body.rotation.z = -Math.sin(u * Math.PI) * 0.5;
        c.arms.forEach((a) => (a.rotation.z = 1.2 * u));
        if (u >= 1) { c.body.rotation.z = 0; c.hold.attach(c.r.g); c.r.g.position.set(4, 0, 0); c.r.g.rotation.set(0, 0, 0); c.phase = 'back'; c.t = 0; }
      } else if (c.phase === 'back') {
        c.arms.forEach((a) => (a.rotation.z = 1.25));
        const goal = Math.hypot(P.x - this.step.x, P.z - this.step.z) > 2 && c.stage !== 'in' ? this.step : this.inside;
        if (goal === this.inside) c.stage = 'in';
        if (walk(goal) && goal === this.inside) { c.busy = false; c.stage = null; c.root.visible = false; c.r.g.visible = false; this.scene.attach(c.r.g); this.free.push(c.r.g); this.roasts.splice(this.roasts.indexOf(c.r), 1); c.r = null; continue; }
      }
      P.y = this.groundY(P);
      if (Math.hypot(P.x - this.tavern.door.x, P.z - this.tavern.door.z) < 60) anyNear = true;
    }
    this.doorOpen += ((anyNear ? 1 : 0) - this.doorOpen) * Math.min(1, dt * 10);
    this.tavern.hinge.rotation.y = -this.doorOpen * 1.6;
  }
}
