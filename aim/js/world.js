// Low-poly Mediterranean plaza with an "A" site. 1 unit = 1 CS unit (inch). All assets procedural/original.
import * as THREE from '../vendor/three.module.min.js';

function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function makeTextures() {
  const R = rnd(7);
  const stone = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#cdb48c'; g.fillRect(0, 0, w, h);
    const rowH = 32;
    for (let y = 0; y < h; y += rowH) {
      const off = (y / rowH) % 2 ? 32 : 0;
      for (let x = -64; x < w; x += 64) {
        const l = 70 + R() * 12;
        g.fillStyle = `hsl(${34 + R() * 6},${30 + R() * 10}%,${l}%)`;
        g.fillRect(x + off + 2, y + 2, 60, rowH - 4);
      }
    }
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(90,60,30,${R() * 0.12})`; g.fillRect(R() * w, R() * h, 2, 2); }
  });
  const plaster = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#e2cfa8'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const v = R(); g.fillStyle = `rgba(${v > .5 ? '255,245,220' : '120,90,50'},${R() * 0.12})`; g.fillRect(R() * w, R() * h, 3, 3); }
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(150,110,60,.08)'; g.beginPath(); g.ellipse(R() * w, R() * h, 30 + R() * 50, 20 + R() * 30, 0, 0, 7); g.fill(); }
  });
  const roof = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#a94a2a'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) {
      g.fillStyle = `hsl(${12 + R() * 8},${55 + R() * 10}%,${36 + R() * 10}%)`;
      g.beginPath(); g.ellipse(x + 8, y + 9, 8, 9, 0, 0, Math.PI); g.fill();
    }
    g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 2);
  });
  const ground = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#8f7b5e'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) {
      g.fillStyle = `hsl(${30 + R() * 8},${20 + R() * 10}%,${48 + R() * 12}%)`;
      g.fillRect(x + 1.5, y + 1.5, 29, 29);
    }
    for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(40,30,20,${R() * .15})`; g.fillRect(R() * w, R() * h, 2, 2); }
  });
  const wood = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#9a6b3c'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) { g.fillStyle = `hsl(28,${40 + R() * 10}%,${32 + R() * 8}%)`; g.fillRect(0, y + 1, w, 14); }
    g.strokeStyle = '#5b3b1d'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    g.beginPath(); g.moveTo(8, 8); g.lineTo(w - 8, h - 8); g.stroke();
  });
  const sky = canvasTex(4, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#5f9fd8'); gr.addColorStop(0.55, '#a9cdea'); gr.addColorStop(1, '#f1dfc0');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const aSign = canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.font = 'bold 220px Oswald, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(190,30,25,.9)'; g.fillText('A', w / 2, h / 2 + 12);
    for (let i = 0; i < 400; i++) { g.clearRect(R() * w, R() * h, 2, 2); }
  });
  return { stone, plaster, roof, ground, wood, sky, aSign };
}

// Box with UVs scaled to world size (texture repeats every `tile` units)
function boxGeo(w, h, d, tile = 128) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) {
    const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile);
  }
  return g;
}

export function buildWorld(scene) {
  const T = makeTextures();
  const worldMeshes = [];
  const mat = (opts) => new THREE.MeshLambertMaterial(opts);
  const M = {
    stone: mat({ map: T.stone }), plaster: mat({ map: T.plaster }), plaster2: mat({ map: T.plaster, color: 0xf3dcc0 }),
    plaster3: mat({ map: T.plaster, color: 0xf0c9a0 }), ground: mat({ map: T.ground }), wood: mat({ map: T.wood }),
    dark: mat({ color: 0x1d1712 }), window: mat({ color: 0x2b2a2e }), shutter: mat({ color: 0x3f7a55 }),
    shutter2: mat({ color: 0x2f6f8a }), rail: mat({ color: 0x2a2623 }), slab: mat({ map: T.stone, color: 0xe8dcc6 }),
    pot: mat({ color: 0xb55b33 }), plant: mat({ color: 0x4f8a3a, flatShading: true }), trunk: mat({ color: 0x5a4330 }),
    cypress: mat({ color: 0x2f5a2c, flatShading: true }),
  };
  const roofMat = mat({ map: T.roof.clone() }); roofMat.map.repeat.set(1 / 64, 1 / 64);
  const stoneX = mat({ map: T.stone.clone() }); stoneX.map.repeat.set(1 / 128, 1 / 128);

  scene.background = T.sky;
  scene.fog = new THREE.Fog(0xe9dcc6, 1800, 5000);

  const add = (geo, m, x, y, z, { shoot = true, cast = true, recv = true, parent = scene } = {}) => {
    const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z);
    mesh.castShadow = cast; mesh.receiveShadow = recv; parent.add(mesh);
    if (shoot) worldMeshes.push(mesh);
    return mesh;
  };
  const box = (w, h, d, m, x, y, z, o) => add(boxGeo(w, h, d), m, x, y, z, o);

  // Ground
  const gGeo = new THREE.PlaneGeometry(4000, 4000); gGeo.rotateX(-Math.PI / 2);
  const uv = gGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 4000 / 160, uv.getY(i) * 4000 / 160);
  add(gGeo, M.ground, 0, 0, 0, { cast: false });
  // A-site raised platform
  box(620, 8, 300, M.slab, 0, 4, -290, { cast: false });

  // Pitched roof (triangular prism) along X or Z
  const roof = (len, width, rise, x, y, z, alongZ = false) => {
    const s = new THREE.Shape(); s.moveTo(-width / 2 - 14, 0); s.lineTo(width / 2 + 14, 0); s.lineTo(0, rise); s.lineTo(-width / 2 - 14, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: len + 20, bevelEnabled: false });
    geo.translate(0, 0, -(len + 20) / 2);
    if (!alongZ) geo.rotateY(Math.PI / 2);
    return add(geo, roofMat, x, y, z);
  };
  const windowAt = (x, y, z, facing, shutterMat = M.shutter, w = 36, h = 56) => {
    // facing: 'z' => wall normal +z; 'x' => +x; '-x' => -x
    const g = new THREE.Group(); scene.add(g); g.position.set(x, y, z);
    if (facing === 'x') g.rotation.y = Math.PI / 2; if (facing === '-x') g.rotation.y = -Math.PI / 2;
    add(boxGeo(w, h, 4), M.window, 0, 0, 0, { parent: g, cast: false });
    add(boxGeo(w / 2 + 2, h + 4, 3), shutterMat, -w / 2 - w / 4 - 2, 0, 2, { parent: g });
    add(boxGeo(w / 2 + 2, h + 4, 3), shutterMat, w / 2 + w / 4 + 2, 0, 2, { parent: g });
    add(boxGeo(w + 10, 5, 7), M.slab, 0, -h / 2 - 3, 3, { parent: g });
    return g;
  };
  const balcony = (x, y, z, facing, w = 96, d = 40) => {
    const g = new THREE.Group(); scene.add(g); g.position.set(x, y, z);
    if (facing === 'x') g.rotation.y = Math.PI / 2; if (facing === '-x') g.rotation.y = -Math.PI / 2;
    add(boxGeo(w, 8, d), M.slab, 0, -4, d / 2, { parent: g });
    add(boxGeo(w, 3, 3), M.rail, 0, 34, d - 2, { parent: g });
    for (let i = 0; i <= 8; i++) add(new THREE.BoxGeometry(2, 34, 2), M.rail, -w / 2 + i * w / 8, 17, d - 2, { parent: g, shoot: false });
    for (const sx of [-1, 1]) { add(boxGeo(3, 3, d), M.rail, sx * w / 2, 34, d / 2, { parent: g }); }
    add(new THREE.CylinderGeometry(6, 4.5, 10, 8), M.pot, -w / 2 + 12, 5, 10, { parent: g });
    add(new THREE.IcosahedronGeometry(9, 0), M.plant, -w / 2 + 12, 16, 10, { parent: g });
    // door behind balcony
    add(boxGeo(34, 70, 4), M.window, 0, 35, 1, { parent: g, cast: false });
    return g;
  };

  // --- Back apartment building (front face z=-560)
  box(860, 420, 160, M.plaster, 0, 210, -640);
  box(870, 14, 170, M.slab, 0, 140, -640); // cornice lines
  box(870, 14, 170, M.slab, 0, 262, -640);
  roof(860, 160, 70, 0, 420, -640);
  box(880, 10, 180, M.slab, 0, 422, -640, { cast: false });
  for (const x of [-300, -100, 100, 300]) { balcony(x, 150, -560, 'z'); balcony(x, 272, -560, 'z'); }
  for (const x of [-200, 0, 200, -390, 390]) { windowAt(x, 200, -558, 'z'); windowAt(x, 325, -558, 'z'); }
  for (const x of [-340, -260, 390]) windowAt(x, 70, -558, 'z', M.shutter2, 30, 48);
  // Ground arches (decor, dark recess)
  for (const x of [-150, -50, 50, 150]) {
    box(72, 96, 6, M.dark, x, 48, -558, { cast: false });
    const a = add(new THREE.CylinderGeometry(36, 36, 6, 16, 1, false, 0, Math.PI), M.dark, x, 96, -558, { cast: false });
    a.rotation.x = Math.PI / 2; a.rotation.y = Math.PI / 2;
  }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), new THREE.MeshLambertMaterial({ map: T.aSign, transparent: true, depthWrite: false }));
  sign.position.set(290, 80, -557.5); scene.add(sign);
  // --- Left building (face x=-520), with balconies facing +x
  box(200, 300, 780, M.plaster2, -620, 150, -70);
  box(210, 12, 790, M.slab, -620, 120, -70);
  roof(780, 200, 60, -620, 300, -70, true);
  for (const z of [-360, -200, -60]) { balcony(-520, 130, z, 'x', 84, 36); balcony(-520, 220, z, 'x', 84, 36); }
  for (const z of [-280, -130, 20, 140, 240]) windowAt(-518, 240, z, 'x', M.shutter, 32, 50);
  for (const z of [40, 140, 240]) windowAt(-518, 160, z, 'x', M.shutter2, 32, 50);
  // Cypress trees near left wall
  for (const z of [80, 200]) { add(new THREE.CylinderGeometry(4, 5, 30, 6), M.trunk, -480, 15, z); add(new THREE.ConeGeometry(26, 190, 7), M.cypress, -480, 120, z); }

  // --- Right building with arcade (arch wall at x=520..540)
  box(180, 260, 900, M.plaster3, 640, 130, -150);
  roof(900, 180, 55, 640, 260, -150, true);
  box(190, 10, 910, M.slab, 640, 262, -150, { cast: false });
  {
    const s = new THREE.Shape(); const z0 = -600, z1 = 300, H = 170;
    s.moveTo(z0, 0); s.lineTo(z1, 0); s.lineTo(z1, H); s.lineTo(z0, H); s.lineTo(z0, 0);
    for (const zc of [-450, -300, -150, 0, 150]) {
      const p = new THREE.Path(); p.moveTo(zc - 45, 0); p.lineTo(zc + 45, 0); p.lineTo(zc + 45, 95);
      p.absarc(zc, 95, 45, 0, Math.PI, false); p.lineTo(zc - 45, 0); s.holes.push(p);
    }
    const geo = new THREE.ExtrudeGeometry(s, { depth: 24, bevelEnabled: false });
    geo.rotateY(-Math.PI / 2); // shape x -> world z, extrusion -> world -x
    add(geo, stoneX, 544, 0, 0);
  }
  box(20, 170, 900, M.dark, 556, 85, -150, { cast: false, recv: false }); // dark arcade interior
  for (const z of [-450, -300, -150, 0, 150]) windowAt(552 - 34, 215, z, '-x', M.shutter2, 34, 52);

  // Wall behind the player & corner fillers
  box(1500, 260, 40, M.stone, 0, 130, 720);
  box(40, 260, 300, M.stone, -540, 130, 520);
  box(40, 260, 300, M.stone, 545, 130, 520);
  // far alley backdrops (seen through the exits)
  box(300, 380, 40, M.plaster3, -700, 190, -760);
  box(40, 300, 400, M.plaster2, -900, 150, -560);

  // Crates on site
  const crate = (s, x, y, z, ry = 0) => { const c = box(s, s, s, M.wood, x, y + s / 2, z); c.rotation.y = ry; return c; };
  crate(64, -230, 8, -380); crate(64, -166, 8, -380); crate(56, -200, 72, -380, 0.2);
  crate(60, 230, 8, -190, 0.4);
  crate(48, -330, 0, -80); crate(48, 330, 0, 40, 0.3);
  // barrels
  for (const [x, z] of [[-420, 120], [-440, 160], [430, 200]]) add(new THREE.CylinderGeometry(16, 16, 44, 12), M.wood, x, 22, z);

  // Lights
  scene.add(new THREE.HemisphereLight(0xd7ecff, 0x9c7a52, 1.25));
  const sun = new THREE.DirectionalLight(0xfff0d2, 2.1);
  sun.position.set(-700, 1100, 500); sun.target.position.set(0, 0, -200);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -1100, right: 1100, top: 1100, bottom: -1100, near: 100, far: 3000 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 1.5;
  scene.add(sun, sun.target);

  // Spawn points, ordered roughly by difficulty. dir = facing toward the plaza.
  const SP = [];
  for (const x of [-300, -100, 100, 300]) SP.push({ p: new THREE.Vector3(x, 150, -540), kind: 'balkons' });
  for (const x of [-350, 350, -150, 150]) SP.push({ p: new THREE.Vector3(x, 422, -556), kind: 'jumts' });
  for (const z of [-360, -200, -60]) SP.push({ p: new THREE.Vector3(-500, 130, z), kind: 'balkons' });
  for (const x of [-300, 300, -100, 100]) SP.push({ p: new THREE.Vector3(x, 272, -540), kind: 'balkons' });
  for (const z of [-400, -230, -80]) SP.push({ p: new THREE.Vector3(-512, 302, z), kind: 'jumts' });
  for (const z of [-360, -200, -60]) SP.push({ p: new THREE.Vector3(-500, 220, z), kind: 'balkons' });
  for (const z of [-450, -280, -60]) SP.push({ p: new THREE.Vector3(522, 264, z), kind: 'jumts' });
  // reorder for gradual unlocking: easy first
  const order = [0, 1, 2, 3, 11, 12, 4, 5, 8, 9, 10, 13, 14, 6, 7, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const spawns = order.filter((i) => SP[i]).map((i) => SP[i]);

  const exits = [
    { path: [new THREE.Vector3(-470, 0, -505), new THREE.Vector3(-660, 0, -520)], name: 'kreisā aleja' },
    { path: [new THREE.Vector3(480, 0, -150), new THREE.Vector3(552, 0, -150)], name: 'arka' },
    { path: [new THREE.Vector3(480, 0, -300), new THREE.Vector3(552, 0, -300)], name: 'arka' },
  ];
  const site = { x0: -270, x1: 270, z0: -420, z1: -170, y: 8 };
  const blockers = [{ x0: -270, x1: -130, z0: -420, z1: -340 }, { x0: 190, x1: 270, z0: -230, z1: -150 }];
  return { worldMeshes, spawns, exits, site, blockers };
}
