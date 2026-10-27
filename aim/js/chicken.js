// Armored chicken: original low-poly model. Hit zones: head (helmet), body (vest), leg (no armor).
import * as THREE from '../vendor/three.module.min.js';

const L = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...o });
const MAT = {
  white: L(0xf4f1ea), helmet: L(0x4a5a2c), helmetRim: L(0x3a4722), vest: L(0x55613a), pouch: L(0x434d2b),
  beak: L(0xf0a020), red: L(0xd8282a), leg: L(0xe8a23a), eye: L(0x111111), strap: L(0x2a2a20),
};
const G = {
  body: new THREE.SphereGeometry(9, 12, 9), head: new THREE.SphereGeometry(5, 10, 8),
  helmet: new THREE.SphereGeometry(6, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
  rim: new THREE.CylinderGeometry(6.8, 6.8, 1.2, 14), vest: new THREE.CylinderGeometry(9.9, 9.6, 12, 12, 1, true),
  pouch: new THREE.BoxGeometry(4, 4, 2.5), beak: new THREE.ConeGeometry(1.7, 4.5, 6), eye: new THREE.SphereGeometry(0.9, 6, 4),
  wattle: new THREE.SphereGeometry(1.4, 6, 4), wing: new THREE.SphereGeometry(6, 8, 6), tail: new THREE.ConeGeometry(4.5, 9, 6),
  leg: new THREE.CylinderGeometry(0.9, 0.9, 8, 5), foot: new THREE.BoxGeometry(3.5, 0.8, 5),
};
G.vest.rotateX(Math.PI / 2);

export function createChicken() {
  const root = new THREE.Group();
  const model = new THREE.Group(); model.scale.setScalar(1.6); root.add(model);
  const hit = [];
  const part = (geo, mat, zone, x, y, z, parent = model) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m);
    if (zone) { m.userData.zone = zone; hit.push(m); }
    return m;
  };
  const body = part(G.body, MAT.white, 'body', 0, 15, 0); body.scale.set(0.95, 0.85, 1.2);
  const vest = part(G.vest, MAT.vest, 'body', 0, 15.5, 0.5); vest.scale.set(1, 0.95, 1);
  part(G.pouch, MAT.pouch, 'body', -3, 13, 11.2); part(G.pouch, MAT.pouch, 'body', 3, 13, 11.2);
  const tail = part(G.tail, MAT.white, 'body', 0, 20, -11); tail.rotation.x = -2.2;
  const headG = new THREE.Group(); headG.position.set(0, 25.5, 8); model.add(headG);
  part(G.head, MAT.white, 'head', 0, 0, 0, headG);
  part(G.helmet, MAT.helmet, 'head', 0, 0.8, -0.3, headG);
  part(G.rim, MAT.helmetRim, 'head', 0, 0.9, -0.3, headG);
  const beak = part(G.beak, MAT.beak, 'head', 0, -1.2, 5.6, headG); beak.rotation.x = Math.PI / 2;
  part(G.wattle, MAT.red, 'head', 0, -3.6, 4.2, headG);
  part(G.eye, MAT.eye, null, -3.2, 0, 3.4, headG); part(G.eye, MAT.eye, null, 3.2, 0, 3.4, headG);
  const strap = part(new THREE.TorusGeometry(4.7, 0.35, 4, 12, Math.PI), MAT.strap, null, 0, 0.6, -0.3, headG); strap.rotation.set(0, Math.PI / 2, Math.PI);
  const wings = [-1, 1].map((s) => {
    const pivot = new THREE.Group(); pivot.position.set(s * 8.5, 18, 0); model.add(pivot);
    const w = part(G.wing, MAT.white, 'body', s * 2.5, -2, -1, pivot); w.scale.set(0.35, 0.7, 1.25);
    return pivot;
  });
  const legs = [-1, 1].map((s) => {
    const pivot = new THREE.Group(); pivot.position.set(s * 3.5, 8, 0); model.add(pivot);
    part(G.leg, MAT.leg, 'leg', 0, -4, 0, pivot); part(G.foot, MAT.leg, 'leg', 0, -8, 1.5, pivot);
    return pivot;
  });
  for (const h of hit) h.userData.root = root;
  return { root, model, hit, wings, legs, headG };
}

// Simple pooled feather/puff particles
export class Puffs {
  constructor(scene) {
    this.items = [];
    const geo = new THREE.TetrahedronGeometry(2.2, 0);
    for (let i = 0; i < 120; i++) {
      const m = new THREE.Mesh(geo, L(0xffffff)); m.visible = false; scene.add(m);
      this.items.push({ m, v: new THREE.Vector3(), life: 0 });
    }
    this.i = 0;
  }
  burst(pos, n, color = 0xffffff, speed = 120) {
    for (let k = 0; k < n; k++) {
      const it = this.items[this.i++ % this.items.length];
      it.m.material.color.setHex(color); it.m.position.copy(pos); it.m.visible = true; it.life = 0.6 + Math.random() * 0.5;
      it.v.set(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5).normalize().multiplyScalar(speed * (0.4 + Math.random()));
    }
  }
  update(dt) {
    for (const it of this.items) {
      if (!it.visible && it.life <= 0) continue;
      if (it.life <= 0) continue;
      it.life -= dt; it.v.y -= 260 * dt; it.v.multiplyScalar(1 - 2.5 * dt);
      it.m.position.addScaledVector(it.v, dt); it.m.rotation.x += dt * 8; it.m.rotation.y += dt * 6;
      if (it.life <= 0) it.m.visible = false;
    }
  }
}
