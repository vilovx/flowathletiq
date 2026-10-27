// Armored chicken: original low-poly model. Hit zones: head (helmet), body (vest), leg (no armor).
import * as THREE from '../vendor/three.module.min.js';

const L = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...o });
const S = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o }); // smooth-shaded (organic parts)

// Procedural feather texture (original, generated at runtime): overlapping scallops with soft shading.
function featherTex(base, edge, rows = 10, cols = 12) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  const cw = 256 / cols, rh = 256 / rows;
  for (let r = 0; r < rows + 1; r++) for (let k = -1; k < cols + 1; k++) {
    const x = k * cw + (r % 2) * cw / 2, y = r * rh;
    const gr = g.createRadialGradient(x, y - rh * 0.2, 1, x, y, cw * 0.75);
    gr.addColorStop(0, base); gr.addColorStop(0.75, base); gr.addColorStop(1, edge);
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, cw * 0.62, rh * 0.95, 0, 0, Math.PI); g.fill();
    g.strokeStyle = edge; g.globalAlpha = 0.35; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - rh * 0.3); g.lineTo(x, y + rh * 0.8); g.stroke(); g.globalAlpha = 1;
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function scaleTex() { // leg scales
  const c = document.createElement('canvas'); c.width = 32; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#e3a032'; g.fillRect(0, 0, 32, 64);
  g.strokeStyle = '#b27419'; g.lineWidth = 1.5; for (let y = 4; y < 64; y += 7) { g.beginPath(); g.moveTo(0, y); g.quadraticCurveTo(16, y + 4, 32, y); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
let MAT = null;
function mats() {
  if (MAT) return MAT;
  const fb = featherTex('#f6f2e9', '#ddd5c6', 12, 14); fb.repeat.set(4, 3);
  const fh = featherTex('#f8f5ee', '#e4ddd0', 14, 16); fh.repeat.set(3, 3);
  const fw = featherTex('#efe9dc', '#cdc2ad', 7, 6);
  MAT = {
    // --- unchanged armor (helmet / vest / pouches / strap) ---
    helmet: L(0x4a5a2c), helmetRim: L(0x3a4722), vest: L(0x55613a), pouch: L(0x434d2b), strap: L(0x2a2a20),
    // --- organic parts ---
    white: S(0xffffff, { map: fb }), head: S(0xffffff, { map: fh }), wing: S(0xffffff, { map: fw }),
    tail: S(0xf1ece1, { map: fw, side: THREE.DoubleSide }),
    beak: S(0xf2a72a), beakLow: S(0xd98b1c), red: S(0xd42a2a), redDark: S(0xb31f22),
    leg: S(0xffffff, { map: scaleTex() }), claw: S(0x8a6a3a), eye: S(0x141008), iris: S(0xd8891e), glint: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  };
  return MAT;
}
const G = {
  body: new THREE.SphereGeometry(9, 28, 20), head: new THREE.SphereGeometry(5, 22, 16), neck: new THREE.SphereGeometry(4.6, 18, 12),
  helmet: new THREE.SphereGeometry(6, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
  rim: new THREE.CylinderGeometry(6.8, 6.8, 1.2, 14), vest: new THREE.CylinderGeometry(9.9, 9.6, 12, 12, 1, true),
  pouch: new THREE.BoxGeometry(4, 4, 2.5),
  beakUp: new THREE.ConeGeometry(1.7, 4.2, 12), beakLow: new THREE.ConeGeometry(1.25, 2.8, 10),
  eye: new THREE.SphereGeometry(0.95, 12, 8), iris: new THREE.TorusGeometry(0.95, 0.32, 6, 14), glint: new THREE.SphereGeometry(0.22, 6, 4),
  wattle: new THREE.SphereGeometry(1.3, 12, 8), comb: new THREE.SphereGeometry(1.0, 10, 8),
  wing: new THREE.SphereGeometry(6, 18, 12), primary: new THREE.SphereGeometry(1, 10, 6),
  tailF: null,
  thigh: new THREE.SphereGeometry(2.6, 14, 10), leg: new THREE.CylinderGeometry(0.75, 0.95, 7, 10),
  toe: new THREE.CylinderGeometry(0.42, 0.55, 3.6, 6), claw: new THREE.ConeGeometry(0.42, 1.1, 6),
};
G.vest.rotateX(Math.PI / 2);
{ // tail feather: curved tapered blade
  const sh = new THREE.Shape(); sh.moveTo(-1.3, 0); sh.quadraticCurveTo(-1.9, 6, -0.2, 11); sh.quadraticCurveTo(1.9, 6, 1.3, 0); sh.lineTo(-1.3, 0);
  const geo = new THREE.ShapeGeometry(sh, 8); const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setZ(i, -0.025 * y * y - Math.abs(pos.getX(i)) * 0.25); }
  geo.computeVertexNormals(); G.tailF = geo;
}

export function createChicken() {
  const M = mats();
  const root = new THREE.Group();
  const model = new THREE.Group(); model.scale.setScalar(1.6); root.add(model);
  const hit = [];
  const part = (geo, mat, zone, x, y, z, parent = model) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m);
    if (zone) { m.userData.zone = zone; hit.push(m); }
    return m;
  };
  // body (same size as before)
  const body = part(G.body, M.white, 'body', 0, 15, 0); body.scale.set(0.95, 0.85, 1.2);
  const vest = part(G.vest, M.vest, 'body', 0, 15.5, 0.5); vest.scale.set(1, 0.95, 1);
  part(G.pouch, M.pouch, 'body', -3, 13, 11.2); part(G.pouch, M.pouch, 'body', 3, 13, 11.2);
  // tail: fan of curved feathers
  const tailG = new THREE.Group(); tailG.position.set(0, 19, -9.5); tailG.rotation.x = -0.55; model.add(tailG);
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.22; const f = part(G.tailF, M.tail, 'body', Math.sin(a) * 1.2, 0, -Math.abs(i - 3) * 0.3, tailG);
    f.rotation.set(-0.35 - Math.abs(i - 3) * 0.08, 0, -a); f.scale.setScalar(1 - Math.abs(i - 3) * 0.07);
  }
  // neck blends body into head
  const neck = part(G.neck, M.head, 'body', 0, 22.6, 6.6); neck.scale.set(0.82, 1.0, 0.8);
  const headG = new THREE.Group(); headG.position.set(0, 25.5, 8); model.add(headG);
  part(G.head, M.head, 'head', 0, 0, 0, headG);
  part(G.helmet, M.helmet, 'head', 0, 0.8, -0.3, headG);
  part(G.rim, M.helmetRim, 'head', 0, 0.9, -0.3, headG);
  // comb lobes peeking out under the front of the helmet rim
  [[0.4, -4.8, 1.0], [-0.3, -5.6, 0.85], [-1.2, -6.1, 0.7]].forEach(([y, z, s]) => { const c = part(G.comb, M.red, 'head', 0, y, z, headG); c.scale.set(0.5 * s, 1.0 * s, 0.9 * s); });
  { const c = part(G.comb, M.red, 'head', 0, 0.2, 5.7, headG); c.scale.set(0.38, 0.55, 0.5); }
  // two-part beak
  const bu = part(G.beakUp, M.beak, 'head', 0, -1.0, 5.6, headG); bu.rotation.x = Math.PI / 2 + 0.18; bu.scale.set(1, 1, 0.75);
  const bl = part(G.beakLow, M.beakLow, 'head', 0, -2.0, 5.1, headG); bl.rotation.x = Math.PI / 2 + 0.35; bl.scale.set(0.9, 1, 0.6);
  // wattles
  [-0.55, 0.55].forEach((x) => { const w = part(G.wattle, M.red, 'head', x, -3.7, 4.3, headG); w.scale.set(0.45, 0.95, 0.55); });
  // eyes: orange iris ring, pupil, glint
  [-1, 1].forEach((sx) => {
    part(G.eye, M.eye, null, sx * 3.25, 0, 3.4, headG);
    const ir = part(G.iris, M.iris, null, sx * 3.35, 0, 3.45, headG); ir.rotation.y = sx * 0.9; ir.scale.setScalar(0.9);
    part(G.glint, M.glint, null, sx * 3.9, 0.35, 3.7, headG);
  });
  const strap = part(new THREE.TorusGeometry(4.7, 0.35, 4, 12, Math.PI), M.strap, null, 0, 0.6, -0.3, headG); strap.rotation.set(0, Math.PI / 2, Math.PI);
  // wings with layered primary feathers
  const wings = [-1, 1].map((s) => {
    const pivot = new THREE.Group(); pivot.position.set(s * 8.5, 18, 0); model.add(pivot);
    const w = part(G.wing, M.wing, 'body', s * 2.5, -2, -1, pivot); w.scale.set(0.35, 0.7, 1.25);
    for (let i = 0; i < 4; i++) { const f = part(G.primary, M.wing, 'body', s * 2.6, -4.2 + i * 0.4, -5.5 - i * 1.3, pivot); f.scale.set(0.5, 1.1, 3.2 - i * 0.3); f.rotation.x = 0.35 + i * 0.08; }
    return pivot;
  });
  // legs: feathered thigh, scaled shank, 3 front toes + hind toe with claws
  const legs = [-1, 1].map((s) => {
    const pivot = new THREE.Group(); pivot.position.set(s * 3.5, 8, 0); model.add(pivot);
    const th = part(G.thigh, M.white, 'leg', 0, 1.6, -0.3, pivot); th.scale.set(0.95, 1.2, 1.05);
    part(G.leg, M.leg, 'leg', 0, -4, 0, pivot);
    const foot = new THREE.Group(); foot.position.set(0, -7.6, 0.3); pivot.add(foot);
    [-0.5, 0, 0.5].forEach((a) => {
      const toe = part(G.toe, M.leg, 'leg', Math.sin(a) * 1.7, 0, Math.cos(a) * 1.7, foot); toe.rotation.set(Math.PI / 2 - 0.08, 0, 0); toe.rotation.order = 'YXZ'; toe.rotation.y = a;
      const cl = part(G.claw, M.claw, null, Math.sin(a) * 3.7, -0.2, Math.cos(a) * 3.7, foot); cl.rotation.order = 'YXZ'; cl.rotation.set(Math.PI / 2 + 0.3, a, 0);
    });
    const hind = part(G.toe, M.leg, 'leg', 0, 0.1, -1.2, foot); hind.rotation.x = -Math.PI / 2 + 0.2; hind.scale.set(1, 0.6, 1);
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
