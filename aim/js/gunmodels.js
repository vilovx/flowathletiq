// Procedural first-person rifle models (original geometry, built from side profiles). Units ≈ cm, forward = -z.
import * as THREE from '../vendor/three.module.min.js';

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
let MATS = null;
function mats() {
  if (MATS) return MATS;
  let s = 11; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const wood = canvasTex(512, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a2a14'); gr.addColorStop(0.5, '#6e3519'); gr.addColorStop(1, '#4a210e');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { // grain lines
      const y0 = R() * h, amp = 2 + R() * 6, f = 0.005 + R() * 0.02, ph = R() * 6;
      g.strokeStyle = `rgba(${R() > 0.5 ? '40,14,4' : '170,90,45'},${0.12 + R() * 0.22})`; g.lineWidth = 0.6 + R() * 1.6;
      g.beginPath(); for (let x = 0; x <= w; x += 8) { const y = y0 + Math.sin(x * f + ph) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    }
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(45,15,5,.35)'; g.beginPath(); g.ellipse(R() * w, R() * h, 6 + R() * 10, 2 + R() * 3, 0, 0, 7); g.fill(); }
  });
  wood.repeat.set(1 / 40, 1 / 10);
  const grain = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const v = 100 + R() * 60; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(R() * w, R() * h, 1, 1); } });
  grain.colorSpace = THREE.NoColorSpace; grain.repeat.set(0.25, 0.25);
  MATS = {
    wood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.5, metalness: 0.0 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x2b2d31, roughness: 0.38, metalness: 0.75, bumpMap: grain, bumpScale: 0.15 }),
    blued: new THREE.MeshStandardMaterial({ color: 0x1d2026, roughness: 0.3, metalness: 0.85 }),
    parker: new THREE.MeshStandardMaterial({ color: 0x2f3236, roughness: 0.62, metalness: 0.45, bumpMap: grain, bumpScale: 0.2 }),
    polymer: new THREE.MeshStandardMaterial({ color: 0x1a1b1e, roughness: 0.78, metalness: 0.0, bumpMap: grain, bumpScale: 0.35 }),
    magAK: new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.5, metalness: 0.6 }),
    can: new THREE.MeshStandardMaterial({ color: 0x232528, roughness: 0.55, metalness: 0.5, bumpMap: grain, bumpScale: 0.25 }),
    glove: new THREE.MeshStandardMaterial({ color: 0x2c3a2a, roughness: 0.9, metalness: 0 }),
    gloveDark: new THREE.MeshStandardMaterial({ color: 0x1f241d, roughness: 0.9, metalness: 0 }),
    sleeve: new THREE.MeshStandardMaterial({ color: 0x3b4726, roughness: 0.95, metalness: 0 }),
  };
  return MATS;
}

// Extrude a side profile [u,v] (u forward, v up) with width w, centred on x
function prof(points, w, mat, { bevel = 0.35, holes = [], curveSegs = 6 } = {}) {
  const sh = new THREE.Shape(points.map(([u, v]) => new THREE.Vector2(u, v)));
  for (const h of holes) sh.holes.push(new THREE.Path(h.map(([u, v]) => new THREE.Vector2(u, v))));
  const b = Math.min(bevel, w * 0.4);
  const g = new THREE.ExtrudeGeometry(sh, { depth: w - 2 * b, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: curveSegs });
  g.translate(0, 0, -(w - 2 * b) / 2); g.rotateY(Math.PI / 2); // shape u -> world -z ; width -> x
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.castShadow = false; return m;
}
// smooth curve helper: sample a quadratic between points
const quad = (a, c, b, n = 8) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / n; return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]; });
// cylinder along the barrel axis from u0 to u1 at height v
function tube(r, u0, u1, v, mat, x = 0, seg = 20, r2 = r) {
  const g = new THREE.CylinderGeometry(r2, r, u1 - u0, seg); g.rotateX(-Math.PI / 2); // +y -> -z
  const m = new THREE.Mesh(g, mat); m.position.set(x, v, -(u0 + u1) / 2); return m;
}
const box = (w, h, l, mat, x, v, u) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), mat); m.position.set(x, v, -u); return m; };

function hands(g0, M, gripU, gripV, foreU, foreV, foreR) {
  const g = new THREE.Group(); g.name = 'hands'; g0.add(g);
  // trigger hand wrapped round the pistol grip
  const palm = new THREE.Mesh(new THREE.CapsuleGeometry(2.4, 4.5, 6, 12), M.glove); palm.position.set(1.6, gripV - 3, -gripU); palm.rotation.set(0.35, 0, 0.15); g.add(palm);
  for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.85, 2.6, 4, 8), M.gloveDark); f.position.set(-0.4, gripV - 2.4 - i * 1.9, -(gripU + 2.6 - i * 0.5)); f.rotation.set(0, 0, Math.PI / 2); g.add(f); }
  const index = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 3.2, 4, 8), M.gloveDark); index.position.set(1.7, gripV + 0.4, -(gripU + 4.2)); index.rotation.set(Math.PI / 2 - 0.1, 0, 0); g.add(index);
  const arm = (from, dir, len, r0, r1) => { const d = new THREE.Vector3(...dir).normalize(); const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, len, 14), M.sleeve);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d); m.position.copy(new THREE.Vector3(...from).addScaledVector(d, len / 2)); g.add(m); };
  arm([1.8, gripV - 5, -(gripU - 1)], [0.35, -0.55, 0.75], 30, 3.0, 4.2);
  // support hand under the handguard
  const sp = new THREE.Mesh(new THREE.CapsuleGeometry(2.6, 5.5, 6, 12), M.glove); sp.position.set(-1.8, foreV - foreR - 1.2, -foreU); sp.rotation.set(Math.PI / 2, 0, 0.5); g.add(sp);
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 3.4, 4, 8), M.gloveDark); f.position.set(1.9, foreV - 0.6, -(foreU - 2.7 + i * 1.8)); f.rotation.set(0, 0, 0.9); g.add(f); }
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 3.5, 4, 8), M.gloveDark); thumb.position.set(-2.6, foreV + 0.4, -(foreU + 1)); thumb.rotation.set(Math.PI / 2 - 0.3, 0, 0); g.add(thumb);
  arm([-2.2, foreV - foreR - 3, -foreU], [-0.45, -0.75, 0.5], 32, 2.8, 4.0);
}

function ak47(M) {
  const g = new THREE.Group();
  // stamped receiver with rounded dust cover
  g.add(prof([[0, -2.2], [31, -2.2], [31, 2.0], [29.5, 2.9], ...quad([24, 3.4], [12, 3.9], [2, 3.2], 6), [0, 2.4]], 3.3, M.steel));
  g.add(prof([[0.5, 2.0], [29.5, 2.0], [29.5, 2.6], ...quad([24, 3.0], [12, 3.45], [1.5, 2.9], 6)], 3.5, M.blued, { bevel: 0.2 })); // dust cover ribs
  // wooden buttstock
  g.add(prof([[0, 2.2], ...quad([-12, 1.8], [-24, 1.4], [-35, 0.4], 6), [-37, 0.6], [-37.6, -2], [-37.2, -10.5], [-35, -11], ...quad([-24, -7.2], [-12, -4], [0, -2.1], 6)], 3.6, M.wood, { bevel: 0.7 }));
  g.add(prof([[-37.2, 0.8], [-38.2, 0.6], [-38.6, -10.8], [-37.6, -11.1]], 3.8, M.steel, { bevel: 0.2 })); // buttplate
  // pistol grip
  g.add(prof([[5.5, -2.1], [10, -2.1], ...quad([9.6, -6], [8.5, -10], [7.3, -12.8], 5), [4.3, -12.9], ...quad([4.6, -9], [5.0, -5], [5.5, -2.1], 4)], 2.9, M.wood, { bevel: 0.6 }));
  // trigger guard + trigger
  g.add(prof([[10, -2.1], [19.5, -2.1], [19.5, -2.9], [18.8, -5.3], [12.2, -5.6], [10.3, -4.3]], 1.2, M.steel, { bevel: 0.15, holes: [[[11, -2.7], [18.6, -2.7], [18.1, -4.7], [12.6, -4.9], [11.2, -4.0]]] }));
  g.add(prof([[14.4, -2.2], [15.3, -2.2], [15.0, -4.2], [14.0, -4.4]], 0.5, M.steel, { bevel: 0.1 }));
  // curved "banana" magazine with ribs
  const magPts = [[19.6, -2.2], [27.4, -2.2], ...quad([29.5, -12], [32, -19], [35.2, -25], 10), [27.6, -27.2], ...quad([25.2, -21], [22.4, -13], [19.6, -4.5], 10)];
  g.add(prof(magPts, 2.7, M.magAK, { bevel: 0.35 }));
  for (let i = 0; i < 3; i++) { const t = 0.3 + i * 0.22; g.add(prof([[20.5 + t * 9, -5 - t * 18], [27 + t * 7.5, -5 - t * 18.5], [27.1 + t * 7.5, -5.8 - t * 18.5], [20.6 + t * 9, -5.8 - t * 18]], 3.0, M.magAK, { bevel: 0.1 })); }
  // lower wooden handguard + upper handguard over gas tube
  g.add(prof([[31, -2.2], [49, -2.0], [50, -1.2], [50, 1.4], [31, 1.4]], 4.4, M.wood, { bevel: 0.9 }));
  for (let i = 0; i < 3; i++) g.add(box(4.5, 0.25, 0.4, M.blued, 0, -1.9, 36 + i * 4)); // finger grooves (shading)
  g.add(prof([[33.5, 2.4], [48, 2.4], [48.6, 3.2], ...quad([47, 5.0], [40, 5.3], [34, 4.9], 4), [33.5, 3.4]], 3.6, M.wood, { bevel: 0.8 }));
  g.add(box(4.6, 1.2, 1.6, M.steel, 0, -0.2, 50.6)); // handguard retainer
  g.add(box(3.4, 1.2, 4.2, M.steel, 0, 3.0, 31.5)); // rear sight block
  g.add(prof([[29.8, 3.0], [37.5, 3.6], [37.5, 4.3], [30, 3.9]], 1.6, M.blued, { bevel: 0.1 })); // rear sight leaf
  // barrel, gas tube, gas block, cleaning rod
  g.add(tube(0.95, 31, 82, 0.6, M.blued));
  g.add(tube(1.05, 48, 56, 3.7, M.steel));
  g.add(prof([[54, 0.0], [58, 0.0], [58, 4.8], [56.5, 5.0], [54, 4.6]], 2.6, M.steel, { bevel: 0.3 })); // gas block
  g.add(tube(0.28, 38, 79, -0.9, M.steel));
  // front sight block with protective ears
  g.add(prof([[74, -0.6], [79, -0.6], [79, 2.0], [77.6, 2.3], [74.8, 2.0]], 2.6, M.steel, { bevel: 0.3 }));
  for (const x of [-0.9, 0.9]) g.add(prof([[75.6, 1.8], [78.2, 1.8], [77.6, 5.4], [76.4, 5.4]], 0.45, M.steel, { bevel: 0.05 }).translateX(x));
  g.add(box(0.35, 2.6, 0.35, M.steel, 0, 3.4, 77));
  g.add(tube(1.15, 80, 84, 0.6, M.steel)); // muzzle nut
  // charging handle + selector (right side)
  const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.2, 10), M.steel); ch.rotation.z = Math.PI / 2; ch.position.set(2.6, 1.0, -26); g.add(ch);
  g.add(prof([[8, 0.2], [23, 1.0], [23, 1.8], [8, 1.0]], 0.3, M.steel, { bevel: 0.05 }).translateX(1.85));
  hands(g, M, 7.5, -4, 41, 0, 2.4);
  return { g, muzzleU: 84, muzzleV: 0.6, sightV: 4.5 };
}

function arLower(g, M, magCurve = 1.5) {
  // upper receiver + flat-top Picatinny rail
  g.add(prof([[0, 0], [27, 0], [27, 3.6], [26, 4.2], [1, 4.2], [0, 3.4]], 3.2, M.parker));
  for (let i = 0; i < 20; i++) g.add(box(2.2, 0.6, 0.55, M.parker, 0, 4.55, 1.8 + i * 1.25));
  g.add(box(1.6, 0.4, 25, M.parker, 0, 4.4, 14));
  // lower receiver with magwell
  g.add(prof([[2, 0], [25, 0], [25, -1.6], [19.5, -2.6], [18.8, -6.2], [10.6, -6.2], [10.4, -2.6], [4, -2.8], [2, -1.4]], 3.0, M.parker, { bevel: 0.3 }));
  // pistol grip (A2 style with finger bump)
  g.add(prof([[4.2, -2.6], [8.8, -2.6], ...quad([8.0, -7], [7.0, -10], [6.6, -12.6], 5), [3.4, -12.6], [2.8, -11.6], ...quad([3.2, -7], [3.6, -4.5], [4.2, -2.6], 4)], 2.9, M.polymer, { bevel: 0.6 }));
  // trigger guard + trigger
  g.add(prof([[8.6, -2.6], [16.5, -2.6], [16.5, -5.1], [9.4, -5.1], [8.6, -4.0]], 1.1, M.parker, { bevel: 0.12, holes: [[[9.4, -3.1], [15.8, -3.1], [15.8, -4.5], [9.8, -4.5]]] }));
  g.add(prof([[12.2, -2.7], [13.0, -2.7], [12.8, -4.3], [11.9, -4.4]], 0.5, M.steel, { bevel: 0.1 }));
  // STANAG magazine (slight curve)
  g.add(prof([[11, -6.0], [18.3, -6.0], ...quad([18.6, -14], [19.2 + magCurve, -20], [20 + magCurve, -24.5], 8), [12.6 + magCurve, -24.8], ...quad([11.9 + magCurve, -20], [11.3, -14], [11, -6.0], 8)], 2.4, M.parker, { bevel: 0.3 }));
  g.add(prof([[12.4 + magCurve, -24.6], [20.2 + magCurve, -24.3], [20.4 + magCurve, -25.6], [12.2 + magCurve, -25.9]], 2.7, M.polymer, { bevel: 0.2 })); // floorplate
  // buffer tube + collapsible stock
  g.add(tube(1.5, -21, 0, 2.2, M.parker));
  g.add(prof([[-11, 4.0], [-22, 4.4], [-25.5, 4.0], [-26.2, 2.0], [-26.4, -6.5], [-25.0, -7.2], [-22.5, -3.0], [-17, 0.2], [-11, 0.4]], 3.8, M.polymer, { bevel: 0.7 }));
  g.add(prof([[-26.2, 4.0], [-27.2, 3.6], [-27.4, -7.0], [-26.4, -7.3]], 4.0, M.polymer, { bevel: 0.3 })); // butt pad
  g.add(box(0.8, 0.8, 3, M.parker, 0, 4.6, 0.2)); // charging handle
  g.add(box(1.8, 0.4, 0.8, M.parker, 0, 4.7, -1.2));
  const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 10), M.parker); fa.rotation.z = Math.PI / 2; fa.position.set(1.8, 2.6, -24); g.add(fa); // forward assist
  g.add(box(0.3, 1.8, 7, M.steel, 1.62, 1.8, 15)); // ejection port cover
  // rear flip-up sight
  g.add(prof([[1.2, 5.0], [4.0, 5.0], [3.6, 7.4], [2.4, 7.4]], 2.0, M.parker, { bevel: 0.15, holes: [[[2.6, 6.0], [3.3, 6.0], [3.2, 6.9], [2.7, 6.9]]] }));
}

function m4a4(M) {
  const g = new THREE.Group();
  arLower(g, M);
  // free-float quad rail handguard
  const hg = box(5.0, 5.0, 19, M.parker, 0, 2.1, 37); g.add(hg);
  for (const [x, y, w, h] of [[0, 4.9, 2.2, 0.6], [0, -0.7, 2.2, 0.6], [2.8, 2.1, 0.6, 2.2], [-2.8, 2.1, 0.6, 2.2]])
    for (let i = 0; i < 13; i++) g.add(box(w, h, 0.6, M.parker, x, y, 28.6 + i * 1.4));
  // barrel, A-frame front sight, flash hider
  g.add(tube(0.75, 27, 62, 2.0, M.blued));
  g.add(prof([[50, 1.0], [53, 1.0], [52.6, 3.2], [52.0, 7.0], [51.0, 7.0], [50.2, 3.2]], 1.9, M.parker, { bevel: 0.15, holes: [[[50.8, 3.6], [52.2, 3.6], [51.8, 6.2], [51.2, 6.2]]] }));
  g.add(box(0.3, 1.6, 0.3, M.steel, 0, 5.6, 51.5));
  g.add(tube(0.95, 61, 66, 2.0, M.steel, 0, 6)); // birdcage flash hider (hex)
  for (let i = 0; i < 3; i++) g.add(box(2.0, 0.25, 0.4, M.blued, 0, 2.0 + 0.6, 62.5 + i * 1.1));
  hands(g, M, 6, -4.5, 38, 2.1, 2.6);
  return { g, muzzleU: 66, muzzleV: 2.0, sightV: 7 };
}

function m4a1s(M) {
  const g = new THREE.Group();
  arLower(g, M, 0.6);
  // slim round handguard with vent slots
  g.add(tube(2.25, 27, 44, 2.0, M.parker, 0, 24));
  for (let i = 0; i < 6; i++) for (const a of [0.6, -0.6, Math.PI - 0.6, Math.PI + 0.6]) {
    const s = box(0.35, 0.9, 1.6, M.polymer, Math.sin(a) * 2.2, 2.0 + Math.cos(a) * 2.2, 29 + i * 2.5); s.rotation.z = -a; g.add(s);
  }
  g.add(box(1.8, 0.5, 15, M.parker, 0, 4.4, 35.5)); // top rail section
  g.add(tube(0.7, 27, 50, 2.0, M.blued));
  g.add(tube(1.0, 49, 51.5, 2.0, M.steel));
  // long suppressor with end cap and knurled rings
  g.add(tube(1.75, 51, 78, 2.0, M.can, 0, 28));
  for (const u of [52, 77]) g.add(tube(1.9, u - 0.6, u + 0.6, 2.0, M.steel, 0, 28));
  for (let i = 0; i < 8; i++) g.add(tube(1.8, 54 + i * 0.5, 54.2 + i * 0.5, 2.0, M.steel, 0, 28));
  hands(g, M, 6, -4.5, 36, 2.0, 2.3);
  return { g, muzzleU: 78, muzzleV: 2.0, sightV: 7 };
}

const BUILDERS = { ak47, m4a4, m4a1s };
export function buildGunModel(id) {
  const M = mats();
  const { g, muzzleU, muzzleV } = BUILDERS[id](M);
  const flash = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  flash.position.set(0, muzzleV, -(muzzleU + 1.5)); flash.visible = false; g.add(flash);
  const f2 = flash.clone(); f2.rotation.z = Math.PI / 4; f2.scale.setScalar(0.7); flash.add(f2);
  if (id === 'm4a1s') flash.scale.setScalar(0.35);
  return { model: g, flash };
}
