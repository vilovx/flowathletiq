// Low-poly Kuldīga (Latvia) old-town square with an "A" site; backdrop: the red-brick bridge over the Venta and Ventas rumba.
// 1 unit = 1 CS unit (inch). All assets procedural/original.
import * as THREE from '../vendor/three.module.min.js';
import { kuldigaTextures, buildBackdrop, tex } from './kuldiga.js?v=37';

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

const ROOT = document.documentElement, LITE = ROOT.classList.contains('q-low'); // touch mode, Low quality: no shadows, fewer trees
const NOSHADOW = ROOT.classList.contains('mobile') && !ROOT.classList.contains('q-high'); // phones: shadows only on High
export function buildWorld(scene) {
  const T = makeTextures();
  const K = kuldigaTextures();
  const worldMeshes = [];
  const mat = (opts) => new THREE.MeshLambertMaterial(opts);
  const M = {
    // Kuldīga palette: yellow plaster, white trims, red brick, painted wooden boards, cobblestones, red clay roofs
    stone: mat({ map: K.brick }), plaster: mat({ map: T.plaster, color: 0xf6dc8c }), plaster2: mat({ map: K.boards }),
    plaster3: mat({ map: K.brick, color: 0xf2e2da }), ground: mat({ map: K.cobble }), wood: mat({ map: T.wood }),
    dark: mat({ color: 0x1d1712 }), window: mat({ color: 0x232c35 }), shutter: mat({ color: 0x6e3b26 }),
    shutter2: mat({ color: 0x3e5e52 }), rail: mat({ color: 0x24221f }), slab: mat({ map: T.plaster, color: 0xfbf8f0 }),
    pot: mat({ color: 0xb55b33 }), plant: mat({ color: 0x4f8a3a, flatShading: true }), trunk: mat({ color: 0x5a4330 }),
    cypress: mat({ color: 0x2e5a30, flatShading: true }), frame: mat({ color: 0xf4f1e8 }), platform: mat({ map: T.stone, color: 0xd6d2ca }),
  };
  const roofMat = mat({ map: T.roof.clone() }); roofMat.map.repeat.set(1 / 64, 1 / 64);
  const stoneX = mat({ map: K.brick.clone(), color: 0xf2e2da }); stoneX.map.repeat.set(1 / 128, 1 / 128);

  scene.background = new THREE.Color(0xa9cdea);
  scene.fog = new THREE.Fog(0xd3e2ee, 2600, 9000);

  const add = (geo, m, x, y, z, { shoot = true, cast = true, recv = true, parent = scene } = {}) => {
    const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z);
    mesh.castShadow = cast; mesh.receiveShadow = recv; parent.add(mesh);
    if (shoot) worldMeshes.push(mesh);
    return mesh;
  };
  const box = (w, h, d, m, x, y, z, o) => add(boxGeo(w, h, d), m, x, y, z, o);

  // Ground
  const gGeo = new THREE.PlaneGeometry(4000, 2760); gGeo.rotateX(-Math.PI / 2); // cobbled square, ends at the riverside (z=-760)
  const uv = gGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 4000 / 110, uv.getY(i) * 2760 / 110);
  add(gGeo, M.ground, 0, 0, 620, { cast: false });
  // A-site raised platform
  box(620, 8, 300, M.platform, 0, 4, -290, { cast: false });

  // Pitched roof (triangular prism) along X or Z
  const roof = (len, width, rise, x, y, z, alongZ = false) => {
    const s = new THREE.Shape(); s.moveTo(-width / 2 - 14, 0); s.lineTo(width / 2 + 14, 0); s.lineTo(0, rise); s.lineTo(-width / 2 - 14, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: len + 20, bevelEnabled: false });
    geo.translate(0, 0, -(len + 20) / 2);
    if (!alongZ) geo.rotateY(Math.PI / 2);
    return add(geo, roofMat, x, y, z);
  };
  const windowAt = (x, y, z, facing, shutterMat = M.shutter, w = 36, h = 56) => {
    if (ROOT.classList.contains('mobile')) { const h2 = Math.round(h * 1.38); y += (h2 - h) / 2; h = h2; w = Math.round(w * 1.3); } // touch mode: taller/wider openings (same sill) for the bigger chickens
    // facing: 'z' => wall normal +z; 'x' => +x; '-x' => -x
    const g = new THREE.Group(); scene.add(g); g.position.set(x, y, z);
    if (facing === 'x') g.rotation.y = Math.PI / 2; if (facing === '-x') g.rotation.y = -Math.PI / 2;
    add(boxGeo(w, h, 4), M.window, 0, 0, 0, { parent: g, cast: false });
    add(boxGeo(w / 2 + 2, h + 4, 3), shutterMat, -w / 2 - w / 4 - 2, 0, 2, { parent: g });
    add(boxGeo(w / 2 + 2, h + 4, 3), shutterMat, w / 2 + w / 4 + 2, 0, 2, { parent: g });
    add(boxGeo(w + 10, 5, 7), M.slab, 0, -h / 2 - 3, 3, { parent: g });
    add(boxGeo(w + 6, 3, 3), M.frame, 0, h / 2 + 1.5, 1.5, { parent: g, cast: false });            // white window frame (outside the opening)
    for (const sx of [-1, 1]) add(boxGeo(3, h, 3), M.frame, sx * (w / 2 + 1.5), 0, 1.5, { parent: g, cast: false });
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

  // --- Back of the square (front face z=-560): two old-town houses with a wide street between them that opens onto the
  // Venta riverside, so the brick bridge and the rumba are in view straight ahead. Left: 3-storey yellow house (Vistu krogs),
  // right: lower 2-storey pastel house. Wings span x 150..440 (mirrored), 120 deep (z -560..-680).
  const WX = 295, WW = 290, WZ = -620, WD = 120;
  const plasterR = mat({ map: T.plaster, color: 0xf3c8a2 });
  box(WW, 420, WD, M.plaster, -WX, 210, WZ);                                // left house, 3 floors
  box(WW + 10, 14, WD + 10, M.slab, -WX, 140, WZ); box(WW + 10, 14, WD + 10, M.slab, -WX, 262, WZ);
  roof(WW, WD, 70, -WX, 420, WZ); box(WW + 20, 10, WD + 20, M.slab, -WX, 422, WZ, { cast: false });
  box(WW, 300, WD, plasterR, WX, 150, WZ);                                  // right house, 2 floors
  box(WW + 10, 14, WD + 10, M.slab, WX, 140, WZ);
  roof(WW, WD, 70, WX, 300, WZ); box(WW + 20, 10, WD + 20, M.slab, WX, 302, WZ, { cast: false });
  for (const y of [150, 272]) balcony(-305, y, -560, 'z', 84);
  balcony(305, 150, -560, 'z', 84);
  for (const x of [-395, -205]) { windowAt(x, 200, -558, 'z'); windowAt(x, 325, -558, 'z'); }
  for (const x of [205, 395]) windowAt(x, 200, -558, 'z', M.shutter2);
  windowAt(-148, 200, -615, 'x'); windowAt(-148, 325, -615, 'x'); windowAt(148, 200, -615, '-x', M.shutter2); // street-side windows
  for (const [x, y] of [[-148, 70], [148, 70]]) windowAt(x, y, -640, x < 0 ? 'x' : '-x', M.shutter2, 30, 48);
  for (const x of [-230, 200, 395]) windowAt(x, 70, -558, 'z', M.shutter2, 30, 48);
  // --- "Vistu krogs" tavern (generic Latvian name, original sign) in the back house's ground floor, door at x=-385 (left of the A-site crates, visible from spawn)
  const tavern = (() => {
    const DX = -385, DW = 44, DH = 86;
    box(DW + 14, DH + 8, 5, M.frame, DX, (DH + 8) / 2, -558, { cast: false });            // door surround
    box(DW, DH, 4, M.dark, DX, DH / 2, -556.5, { cast: false, shoot: false });          // dark doorway (inside)
    const hinge = new THREE.Group(); hinge.position.set(DX - DW / 2, 0, -554); scene.add(hinge);
    const leaf = add(boxGeo(DW, DH, 3, 64), M.wood, DW / 2, DH / 2, 0, { parent: hinge, cast: false, shoot: false });
    add(new THREE.SphereGeometry(1.6, 8, 6), M.rail, DW - 6, DH / 2, 2.5, { parent: hinge, cast: false, shoot: false });
    // painted sign board above the door
    const drawSign = (g, w, h) => {
      g.fillStyle = '#3b2416'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d9b25c'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
      g.fillStyle = '#f3dfa6'; g.font = '700 64px Oswald, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('VISTU KROGS', w / 2, h / 2 + 4);
      g.fillStyle = '#d9b25c'; for (const x of [44, w - 44]) { g.beginPath(); g.arc(x, h / 2, 9, 0, 7); g.fill(); }
    };
    const signT = tex(512, 128, drawSign, { repeat: false });
    if (document.fonts) document.fonts.load('700 64px Oswald').then(() => { drawSign(signT.image.getContext('2d'), 512, 128); signT.needsUpdate = true; }).catch(() => {});
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(96, 24), new THREE.MeshLambertMaterial({ map: signT }));
    sign.position.set(DX + 6, DH + 24, -557); scene.add(sign);
    // hanging bracket sign with a roast chicken + mug (perpendicular to the facade)
    const hangT = tex(128, 128, (g, w, h) => {
      g.fillStyle = '#efe2c0'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#3b2416'; g.lineWidth = 6; g.stroke();
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(64, 86, 44, 9, 0, 0, 7); g.fill(); g.strokeStyle = '#b9b2a2'; g.lineWidth = 2; g.stroke(); // plate
      g.fillStyle = '#a65a22'; g.beginPath(); g.ellipse(58, 68, 30, 18, 0, 0, 7); g.fill();                                       // roast body
      g.fillStyle = '#c47a3a'; g.beginPath(); g.ellipse(52, 62, 14, 6, -0.2, 0, 7); g.fill();                                     // glaze highlight
      g.fillStyle = '#7d3f15'; g.beginPath(); g.ellipse(88, 70, 13, 7, -0.5, 0, 7); g.fill();                                     // drumstick
      g.fillStyle = '#fff'; g.beginPath(); g.arc(100, 63, 4, 0, 7); g.fill(); g.beginPath(); g.arc(103, 67, 4, 0, 7); g.fill();     // bone end
      g.fillStyle = '#3b2416'; g.font = '700 18px Georgia, serif'; g.textAlign = 'center'; g.fillText('KROGS', 64, 112);
    }, { repeat: false });
    const hang = new THREE.Mesh(new THREE.CircleGeometry(16, 20), new THREE.MeshLambertMaterial({ map: hangT, side: THREE.DoubleSide }));
    hang.position.set(DX + 82, 112, -536); hang.rotation.y = Math.PI / 2 - 0.55; scene.add(hang);
    add(new THREE.BoxGeometry(2, 2, 26), M.rail, DX + 82, 130, -546, { cast: false, shoot: false });
    // barrel by the door
    add(new THREE.CylinderGeometry(12, 12, 32, 12), M.wood, DX + 56, 16, -544, { shoot: false });
    return { door: new THREE.Vector3(DX, 0, -560), hinge, leaf };
  })();
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
  const ARCH_Z = [-450, -300, -150, 0, 150];
  const torches = ROOT.classList.contains('mobile') ? null : buildTorches(scene, ARCH_Z, canvasTex); // desktop only: torch-lit arches
  for (const z of [-450, -300, -150, 0, 150]) windowAt(548, 215, z, '-x', M.shutter2, 34, 52);

  // Wall behind the player & corner fillers
  box(1500, 260, 40, M.stone, 0, 130, 720);
  box(40, 260, 300, M.stone, -540, 130, 520);
  box(40, 260, 300, M.stone, 545, 130, 520);
  // riverside promenade edge + the Venta backdrop (bridge, rumba, banks, trees, sky) - decorative only
  box(4000, 10, 8, M.platform, 0, 5, -756, { cast: false, shoot: false });
  const backdrop = buildBackdrop(scene, K);

  // Crates on site
  const crate = (s, x, y, z, ry = 0) => { const c = box(s, s, s, M.wood, x, y + s / 2, z); c.rotation.y = ry; return c; };
  crate(64, -230, 8, -380); crate(64, -166, 8, -380); crate(56, -200, 72, -380, 0.2);
  crate(60, 230, 8, -190, 0.4);
  crate(48, -330, 0, -80); crate(48, 330, 0, 40, 0.3);
  // barrels
  for (const [x, z] of [[-420, 120], [-440, 160], [430, 200]]) add(new THREE.CylinderGeometry(16, 16, 44, 12), M.wood, x, 22, z);

  // --- FlowAthletiq logo mural on the wall behind the spawn (visible when turning 180°), with a blinking red wolf eye
  const mural = (() => {
    const g = new THREE.Group(); g.position.set(-150, 132, 700); g.rotation.y = Math.PI; scene.add(g); // local +z faces the player; shifted so the leaderboard fits on its left
    const LW = 480, LH = Math.round(LW * 561 / 1113);
    box(590, 246, 4, mat({ color: 0x14161d }), 0, 0, 2, { parent: g, cast: false });           // dark painted board
    for (const y of [-125, 125]) box(606, 8, 8, M.wood, 0, y, 4, { parent: g, cast: false });  // wooden frame
    for (const x of [-299, 299]) box(8, 258, 8, M.wood, x, 0, 4, { parent: g, cast: false });
    const tex = new THREE.TextureLoader().load('img/logo-wall.webp?v=37');
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(LW, LH), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
    logo.position.set(0, 0, 4.6); logo.renderOrder = 2; g.add(logo);
    const ex = (0.9043 - 0.5) * LW, ey = (0.5 - 0.2184) * LH;
    // eyelid: dark almond that closes over the eye during a blink
    const lidTex = canvasTex(64, 32, (c, w, h) => { c.fillStyle = '#07070a'; c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, 0, 0, 7); c.fill(); });
    const lid = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 6.5), new THREE.MeshBasicMaterial({ map: lidTex, transparent: true, depthWrite: false, toneMapped: false }));
    lid.position.set(ex, ey, 4.8); lid.rotation.z = -0.42; lid.scale.y = 0.001; lid.renderOrder = 3; g.add(lid);
    // red glow (additive) on top of the eye
    const glowTex = canvasTex(64, 64, (c, w, h) => {
      const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gr.addColorStop(0, 'rgba(255,235,225,1)'); gr.addColorStop(0.12, 'rgba(255,60,40,1)'); gr.addColorStop(0.35, 'rgba(255,0,0,.45)'); gr.addColorStop(1, 'rgba(255,0,0,0)');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    glow.position.set(ex, ey, 5); glow.renderOrder = 4; g.add(glow);
    const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    lid.scale.y = 1; lid.material.opacity = 0;
    const sm = (x) => x * x * (3 - 2 * x);
    return {
      lid, glow,
      update(t) { // t in seconds: 9 s cycle, red -> slow fade to dark -> dark -> relight
        if (still) { glow.material.opacity = 0.8; lid.material.opacity = 0; return; }
        const p = (t % 9) / 9;
        let k; // 1 = red, 0 = dark
        if (p < 0.2) k = 1; else if (p < 0.6) k = 1 - sm((p - 0.2) / 0.4); else if (p < 0.75) k = 0; else if (p < 0.88) k = sm((p - 0.75) / 0.13); else k = 1;
        glow.material.opacity = 0.85 * k;
        lid.material.opacity = 1 - k;
        glow.scale.setScalar(0.85 + 0.15 * k);
      },
    };
  })();

  // --- Leaderboard board (vilov's chicken + whiteboard artwork) left of the logo as seen from spawn after turning 180°.
  // Results are written in marker style inside the artwork's whiteboard (x 443-1110, y 100-640 of 1168x784).
  const board = (() => {
    // transparent cutout (1128x733), mounted flat on the wall like a poster/standee with a soft shadow; whiteboard area x 432-1100, y 80-621
    const IW = 1128, IH = 733, PAD = 28, BW = 340, S = BW / IW;
    const CW = IW + PAD * 2, CH = IH + PAD * 2;
    // standee: rooster's feet (image y ~724 of 733) rest on the cobbles (y 0), cutout stands a few units in front of the wall
    const FEET = (PAD + 724 - CH / 2) * S;
    const g = new THREE.Group(); g.position.set(345, FEET + 0.5, 700); g.rotation.y = Math.PI; scene.add(g);
    const c = document.createElement('canvas'); c.width = CW; c.height = CH; const x = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(CW * S, CH * S), new THREE.MeshBasicMaterial({ map: tex, color: 0xe6e6e6, transparent: true, alphaTest: 0.02, depthWrite: false, toneMapped: false }));
    plane.position.set(0, 0, 5); plane.renderOrder = 1; g.add(plane);
    { // soft contact shadow on the ground under the rooster's feet
      const sc = document.createElement('canvas'); sc.width = 128; sc.height = 64; const sx = sc.getContext('2d');
      const gr = sx.createRadialGradient(64, 32, 2, 64, 32, 62); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.55, 'rgba(0,0,0,.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      sx.fillStyle = gr; sx.fillRect(0, 0, 128, 64);
      const sh = new THREE.Mesh(new THREE.PlaneGeometry(96, 22), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      sh.rotation.x = -Math.PI / 2; sh.position.set((PAD + 220 - CW / 2) * S, -FEET - 0.5 + 0.3, 7); sh.renderOrder = 1; g.add(sh);
    }
    const img = new Image(); let ready = false, rows = null, empty = '', tag = '';
    const MK = "'Caveat', 'Segoe Print', 'Comic Sans MS', 'Klee One', 'HGMaruGothicMPRO', 'Hiragino Maru Gothic ProN', 'Kaiti SC', 'STKaiti', 'KaiTi', 'Hiragino Sans', 'Yu Gothic UI', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', cursive";  // CJK nicks: Caveat has no kana/hanzi
    // small rank emblems (same artwork as the game's ranks) drawn next to each nick
    const RI = [1, 2, 3, 4, 5, 6].map((n) => { const im = new Image(); im.onload = () => draw(); im.src = `img/ranks/rank${n}-96.webp?v=37`; return im; });
    const fit = (txt, max) => { let s = String(txt); if (x.measureText(s).width <= max) return s; while (s.length > 1 && x.measureText(s + '…').width > max) s = s.slice(0, -1); return s + '…'; };
    function draw() {
      if (!ready) return;
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, CW, CH);
      // soft drop shadow on the wall (silhouette of the cutout, blurred, offset down-right)
      x.save(); x.globalAlpha = 0.45; x.filter = 'blur(10px) brightness(0)'; x.drawImage(img, PAD + 8, PAD + 12, IW, IH); x.restore();
      x.drawImage(img, PAD, PAD, IW, IH);
      x.setTransform(1, 0, 0, 1, PAD - 11, PAD - 20); // text layout below uses the original whiteboard coordinates (x 443-1110, y 100-640)
      x.textBaseline = 'alphabetic';
      x.fillStyle = '#c4161c'; x.font = `700 64px ${MK}`; x.textAlign = 'center'; x.fillText('TOP 8', 776, 160);
      x.fillStyle = '#1d58c9'; x.font = `700 30px ${MK}`; x.textAlign = 'right'; x.fillText('FlowAthletiq', 1092, 160);
      if (tag) { x.font = '800 18px Inter, sans-serif'; x.textAlign = 'left'; const tw = x.measureText(tag).width; x.strokeStyle = '#1a7f3b'; x.lineWidth = 2.5; x.strokeRect(470, 132, tw + 16, 28); x.fillStyle = '#1a7f3b'; x.fillText(tag, 478, 153); } // which board: PC / MOBILE
      x.strokeStyle = 'rgba(196,22,28,.75)'; x.lineWidth = 4; x.beginPath(); x.moveTo(680, 172); x.quadraticCurveTo(776, 166, 872, 174); x.stroke();
      if (!rows || !rows.length) {
        x.fillStyle = '#334'; x.font = `700 40px ${MK}`; x.textAlign = 'center'; x.fillText(rows ? empty : '…', 776, 340);
      } else {
        rows.slice(0, 8).forEach((r, i) => {
          const y = 222 + i * 48;                                   // 8 rows: tighter text, bigger rank emblems
          x.font = `700 36px ${MK}`;
          x.fillStyle = ['#c4161c', '#1d58c9', '#1a7f3b'][i] || '#14204a'; x.textAlign = 'right'; x.fillText(`${r.pos}.`, 500, y);
          x.strokeStyle = '#14204a'; x.lineWidth = 2.5; x.strokeRect(508, y - 24, 40, 26);
          x.fillStyle = '#14204a'; x.font = '800 16px Inter, sans-serif'; x.textAlign = 'center'; x.fillText(String(r.country || '').toUpperCase(), 528, y - 5);
          const ri = RI[r.rank_idx]; if (ri && ri.complete && ri.naturalWidth) x.drawImage(ri, 553, y - 43, 64, 64);   // 1.6x the v15 size
          x.font = `700 34px ${MK}`; x.textAlign = 'left'; x.fillStyle = '#14204a'; x.fillText(fit(r.nick, 136), 622, y);
          const wl = { ak47: 'AK', m4a4: 'M4A4', m4a1s: 'M4A1-S' }[r.weapon] || '';       // weapon of that best run
          if (wl) { const wc = { ak47: '#7a2a12', m4a4: '#1d4f9a', m4a1s: '#2f5d3a' }[r.weapon]; x.font = '800 16px Inter, sans-serif'; const tw = x.measureText(wl).width;
            x.strokeStyle = wc; x.lineWidth = 2; x.strokeRect(764, y - 21, tw + 12, 23); x.fillStyle = wc; x.fillText(wl, 770, y - 4); }
          x.font = `700 36px ${MK}`; x.fillStyle = '#1d58c9'; x.fillText('L' + r.level, 858, y);
          x.fillStyle = '#14204a'; x.textAlign = 'right'; x.fillText(String(r.score), 1018, y);
          x.fillStyle = '#1a7f3b'; x.font = `700 26px ${MK}`; x.fillText(r.hs_pct + '%', 1094, y);
        });
      }
      x.fillStyle = 'rgba(20,32,74,.55)'; x.font = `700 26px ${MK}`; x.textAlign = 'right'; x.fillText('flowathletiq.com/aim', 1094, 630);
      tex.needsUpdate = true;
    }
    img.onload = () => { ready = true; draw(); (document.fonts ? document.fonts.load('700 40px Caveat').catch(() => {}) : Promise.resolve()).then(draw); };
    img.src = 'img/leaderboard-board.webp?v=37';
    return { plane, set(r, e, tg) { if (r !== undefined && r !== null) rows = r; if (e) empty = e; if (tg !== undefined) tag = tg; draw(); } };
  })();

  // Lights
  scene.add(new THREE.HemisphereLight(0xdcecff, 0x7a7a62, 1.25));
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.15);
  sun.position.set(-700, 1100, 500); sun.target.position.set(0, 0, -200);
  sun.castShadow = !NOSHADOW; const SM = ROOT.classList.contains('mobile') ? 1024 : 2048; sun.shadow.mapSize.set(SM, SM);
  Object.assign(sun.shadow.camera, { left: -1100, right: 1100, top: 1100, bottom: -1100, near: 100, far: 3000 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 1.5;
  scene.add(sun, sun.target);

  // Spawn points: chickens emerge from windows / balcony doors / behind roof edges (hidden by the wall until they come out).
  // face = point on the emerge plane at standing height, emerge = direction it comes out, fwd = facing, perch = where it winds up.
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const SP = {};
  const win = (k, x, y, z, fwd) => (SP[k] = { kind: 'window', face: V(x, y, z), emerge: fwd.clone(), fwd, perch: V(x, y, z).addScaledVector(fwd, 9) });
  const door = (k, x, y, z, fwd, rail) => (SP[k] = { kind: 'door', face: V(x, y, z), emerge: fwd.clone(), fwd, perch: V(x, y + 35.5, z).addScaledVector(fwd, rail) });
  const roofE = (k, x, y, z, fwd) => (SP[k] = { kind: 'roof', face: V(x, y, z), emerge: V(0, 1, 0), fwd, perch: V(x, y, z).addScaledVector(fwd, 16) });
  const roofR = (k, x, y, z) => { roofE(k, x, y, z, NX); SP[k].perch = V(566, 272, z); }; // sit on the roof slope, not the eave
  const PZ = V(0, 0, 1), PX = V(1, 0, 0), NX = V(-1, 0, 0);
  for (const x of [-395, -205]) { win('w1' + x, x, 172, -556, PZ); win('w2' + x, x, 297, -556, PZ); }
  for (const x of [205, 395]) win('w1' + x, x, 172, -556, PZ);
  door('d1-305', -305, 150, -557, PZ, 35); door('d2-305', -305, 272, -557, PZ, 35); door('d1305', 305, 150, -557, PZ, 35);
  for (const x of [-380, -295, -210]) roofE('r' + x, x, 426, -562, PZ);
  for (const x of [210, 295, 380]) roofE('r' + x, x, 306, -562, PZ);
  // street-side windows of the two back houses (corner peeks into the riverside street)
  win('iL1', -146, 172, -615, PX); win('iL2', -146, 297, -615, PX); win('iR1', 146, 172, -615, NX);
  // side-building windows (flank surprise pool): left apartment (+x facing) and right arcade building (-x facing)
  const side = [];
  for (const z of [-280, -130, 20, 140]) side.push(win('lw' + z, -516, 215, z, PX));
  for (const z of [40, 140]) side.push(win('lwl' + z, -516, 135, z, PX));
  for (const z of [-450, -300, -150, 0, 150]) side.push(win('rw' + z, 546, 189, z, NX));
  side.forEach((x) => (x.side = true));
  for (const z of [-360, -200, -60]) { door('ld1' + z, -517, 130, z, PX, 31); door('ld2' + z, -517, 220, z, PX, 31); }
  for (const z of [-400, -230, -80]) roofE('lr' + z, -542, 305, z, PX);
  for (const z of [-450, -280, -60]) roofR('rr' + z, 572, 267, z);
  // ordered for gradual unlocking: central/easy first
  const order = ['w1-205', 'w1205', 'd1-305', 'd1305', 'r-210', 'r210', 'iL1', 'iR1', 'w1-395', 'w1395', 'ld1-200', 'rr-280',
    'w2-205', 'd2-305', 'lr-230', 'ld2-360', 'rr-450', 'r-295', 'r295', 'iL2', 'w2-395', 'r-380', 'r380',
    'ld1-60', 'ld2-200', 'ld1-360', 'ld2-60', 'lr-400', 'lr-80', 'rr-60'];
  const spawns = order.map((k) => SP[k]);
  const sideSpawns = side;
  const exits = [
    { path: [new THREE.Vector3(-470, 0, -505), new THREE.Vector3(-660, 0, -520)], name: 'kreisā aleja' },
    { path: [new THREE.Vector3(480, 0, -150), new THREE.Vector3(552, 0, -150)], name: 'arka' },
    { path: [new THREE.Vector3(480, 0, -300), new THREE.Vector3(552, 0, -300)], name: 'arka' },
  ];
  const site = { x0: -270, x1: 270, z0: -420, z1: -170, y: 8 };
  const blockers = [{ x0: -270, x1: -130, z0: -420, z1: -340 }, { x0: 190, x1: 270, z0: -230, z1: -150 }];
  return { arches: ARCH_Z.map((z) => ({ x: 544, z })), torches, sun, worldMeshes, spawns, sideSpawns, exits, site, blockers, mural, board, tavern, update: (t) => { mural.update(t); backdrop.update(t); if (torches) torches.update(t); }, setBoard: (rows, empty, tag) => board.set(rows, empty, tag) };
}

// Wall torches in the arcade arches (desktop only). Each torch hangs on the arch's side reveal: riveted iron wall plate + bracket + collar,
// tapered wooden handle, pitch wrap in an iron cage, and a shader flame. No real lights and no particles: the warm light on the stone is
// faked with "light cards" that MULTIPLY the brick underneath (dst * (1 + glow), so mortar stays dark and brick turns warm, like real
// light), plus an additive ember wash on the dark back wall and a soot smudge above the flame. Everything is merged: all five torches
// render in 7 draw calls total, with one shared flicker value (flames also get a per-torch phase in the shader).
function mergeGeos(list) { // [{ geo, m: Matrix4, c: hex }] -> one BufferGeometry with position/normal/uv/color
  const pos = [], nor = [], uv = [], col = [], c = new THREE.Color();
  for (const it of list) {
    let g = it.geo.clone(); if (it.m) g.applyMatrix4(it.m); if (g.index) g = g.toNonIndexed();
    pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array);
    if (g.attributes.uv) uv.push(...g.attributes.uv.array); else for (let k = 0; k < g.attributes.position.count; k++) uv.push(0, 0);
    c.setHex(it.c ?? 0xffffff); for (let k = 0; k < g.attributes.position.count; k++) col.push(c.r, c.g, c.b);
  }
  const o = new THREE.BufferGeometry();
  o.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); o.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  o.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); o.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return o;
}
function buildTorches(scene, archZ, canvasTex) {
  const O = new THREE.Object3D(), M4 = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { O.position.set(x, y, z); O.rotation.set(rx, ry, rz); O.scale.set(sx, sy, sz); O.updateMatrix(); return O.matrix.clone(); };
  const radial = (stops, w = 128, h = 128) => canvasTex(w, h, (g) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); for (const [o, c] of stops) gr.addColorStop(o, c); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const lightT = radial([[0, 'rgb(255,170,80)'], [0.25, 'rgb(190,95,35)'], [0.55, 'rgb(70,30,8)'], [1, 'rgb(0,0,0)']]);  // black = no change (multiply card)
  const emberT = radial([[0, 'rgba(255,150,60,1)'], [0.4, 'rgba(200,80,25,.5)'], [1, 'rgba(120,40,10,0)']]);
  const sootT = canvasTex(64, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.75, 2, w / 2, h * 0.6, h * 0.55); gr.addColorStop(0, 'rgba(10,8,6,.75)'); gr.addColorStop(0.5, 'rgba(15,10,8,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  for (const t of [lightT, emberT, sootT]) { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; }
  const IRON = 0x26231f, IRON2 = 0x3a342d, WOOD = 0x6a4527, WOOD2 = 0x4e321c, PITCH = 0x17110c;
  const hw = [], lit = [], ember = [], soot = [], flames = [];
  const plane = new THREE.PlaneGeometry(1, 1), boxG = new THREE.BoxGeometry(1, 1, 1);
  archZ.forEach((zc, i) => {
    const z0 = zc - 45, X = 532, Y = 80;                                     // torch-side reveal face (faces +z, toward the spawn)
    hw.push({ geo: boxG, m: M4(X, Y + 2, z0 + 0.7, 0, 0, 0, 9, 15, 1.4), c: IRON });                        // wall plate
    for (const [dx, dy] of [[-3, 6], [3, 6], [-3, -2], [3, -2]]) hw.push({ geo: new THREE.SphereGeometry(0.7, 6, 4), m: M4(X + dx, Y + 2 + dy, z0 + 1.5), c: IRON2 }); // rivets
    hw.push({ geo: boxG, m: M4(X, Y - 3.5, z0 + 5, 0, 0, 0, 1.6, 1.6, 9), c: IRON });                     // bracket arm
    hw.push({ geo: boxG, m: M4(X, Y - 0.5, z0 + 3.5, 0.75, 0, 0, 1.2, 1.2, 8), c: IRON });                // diagonal strut
    // handle tilted out of the reveal (toward +z) and toward the plaza (-x) so the flame sits in the opening
    O.position.set(X, Y - 3, z0 + 9.5); O.rotation.set(0.38, 0, 0.28); O.scale.set(1, 1, 1); O.updateMatrix(); const H = O.matrix.clone();
    const at = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => H.clone().multiply(M4(x, y, z, rx, ry, rz, sx, sy, sz));
    hw.push({ geo: new THREE.TorusGeometry(2.1, 0.55, 5, 12), m: at(0, 0, 0, Math.PI / 2), c: IRON });     // collar ring
    hw.push({ geo: new THREE.CylinderGeometry(1.45, 0.95, 22, 8), m: at(0, 4, 0), c: WOOD });              // wooden handle
    hw.push({ geo: new THREE.CylinderGeometry(1.3, 1.3, 2, 8), m: at(0, -6, 0), c: WOOD2 });              // worn end
    hw.push({ geo: new THREE.CylinderGeometry(2.3, 1.7, 5.5, 9), m: at(0, 16.5, 0), c: PITCH });           // pitch-soaked wrap
    hw.push({ geo: new THREE.TorusGeometry(2.7, 0.4, 4, 12), m: at(0, 15, 0, Math.PI / 2), c: IRON });     // cage rings
    hw.push({ geo: new THREE.TorusGeometry(3.0, 0.4, 4, 12), m: at(0, 19, 0, Math.PI / 2), c: IRON });
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; hw.push({ geo: boxG, m: at(Math.cos(a) * 2.85, 17, Math.sin(a) * 2.85, 0, -a, 0, 0.6, 6, 0.6), c: IRON }); } // cage bars
    const top = new THREE.Vector3(0, 18.5, 0).applyMatrix4(H);              // flame base (inside the cage)
    flames.push({ c: top, ph: i * 2.3 });
    // light on the stone: facade around the arch edge, torch-side reveal (strong), far reveal (weak), cobbles; soot above the flame
    lit.push({ geo: plane, m: M4(519.4, top.y, top.z, 0, -Math.PI / 2, 0, 190, 190) });
    lit.push({ geo: plane, m: M4(532, top.y - 4, z0 + 0.35, 0, 0, 0, 24, 150) });
    lit.push({ geo: plane, m: M4(532, top.y - 10, zc + 44.65, 0, Math.PI, 0, 24, 110), c: 0x777777 });
    lit.push({ geo: plane, m: M4(510, 0.45, top.z + 8, -Math.PI / 2, 0, 0, 120, 120), c: 0xbbbbbb });
    ember.push({ geo: plane, m: M4(545.4, top.y - 8, top.z + 12, 0, -Math.PI / 2, 0, 150, 160) });
    soot.push({ geo: plane, m: M4(531, top.y + 17, z0 + 0.45, 0, 0, 0, 13, 32) });
  });
  const hwMesh = new THREE.Mesh(mergeGeos(hw), new THREE.MeshLambertMaterial({ vertexColors: true })); hwMesh.castShadow = true; scene.add(hwMesh);
  const card = (geo, o) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, ...o })); m.renderOrder = 3; scene.add(m); return m; };
  const litM = card(mergeGeos(lit), { map: lightT, vertexColors: true, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.DstColorFactor, blendDst: THREE.OneFactor });
  const emberM = card(mergeGeos(ember), { map: emberT, blending: THREE.AdditiveBlending });
  const sootM = card(mergeGeos(soot), { map: sootT }); sootM.renderOrder = 2;
  // flames + halo: one merged billboard mesh (per-vertex centre, corner, kind, phase); fragment shader draws a licking flame
  const P = [], C = [], K = [], F = [];
  for (const f of flames) for (const kind of [1, 0]) for (const [cx, cy] of [[-1, 0], [1, 0], [1, 1], [-1, 0], [1, 1], [-1, 1]]) { P.push(f.c.x, f.c.y, f.c.z); C.push(cx, cy); K.push(kind); F.push(f.ph); }
  const fg = new THREE.BufferGeometry();
  fg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); fg.setAttribute('aCorner', new THREE.Float32BufferAttribute(C, 2));
  fg.setAttribute('aKind', new THREE.Float32BufferAttribute(K, 1)); fg.setAttribute('aPh', new THREE.Float32BufferAttribute(F, 1));
  fg.boundingSphere = new THREE.Sphere(new THREE.Vector3(532, 100, -150), 400);
  const U = { uT: { value: 0 }, uF: { value: 1 } };
  const flameMat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    vertexShader: `attribute vec2 aCorner; attribute float aKind; attribute float aPh; uniform float uT; uniform float uF; varying vec2 vUv; varying float vK; varying float vPh;
      void main(){ vUv = vec2(aCorner.x * .5 + .5, aCorner.y); vK = aKind; vPh = aPh;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float fl = uF * (0.9 + 0.1 * sin(uT * 13.0 + aPh * 3.0));
        vec2 sz = aKind > 0.5 ? vec2(17.0, 34.0) * (0.9 + 0.12 * fl) : vec2(4.6, 15.0) * (0.85 + 0.2 * fl);
        mv.xy += vec2(aCorner.x * sz.x, (aCorner.y - (aKind > 0.5 ? 0.42 : 0.12)) * sz.y);
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uT; uniform float uF; varying vec2 vUv; varying float vK; varying float vPh;
      void main(){
        float y = vUv.y, t = uT;
        if (vK > 0.5) { vec2 d = vec2((vUv.x - .5) * 1.0, (y - .42) * .5); float r = length(d) * 2.0; float a = pow(max(0.0, 1.0 - r), 2.2) * (0.42 + 0.22 * uF);
          gl_FragColor = vec4(vec3(1.0, .55, .2) * a, a); return; }
        float x = (vUv.x - .5) * 2.0;
        x += (sin(y * 7.0 - t * 10.0 + vPh) * .16 + sin(y * 15.0 - t * 17.0 + vPh * 2.0) * .07) * y;   // licking sideways sway, stronger at the tip
        float w = mix(.95, .04, pow(y, .9)) * (0.88 + .12 * sin(t * 8.0 + vPh));
        float s = (1.0 - smoothstep(w * .45, w, abs(x))) * smoothstep(.0, .1, y) * (1.0 - smoothstep(.55 + .2 * uF, 1.0, y));
        float tongue = smoothstep(.55, .95, y) * (.5 + .5 * sin(t * 21.0 + vPh * 5.0 + y * 9.0));
        s *= 1.0 - tongue * .6;
        float core = (1.0 - smoothstep(0.0, w * .5, abs(x))) * (1.0 - smoothstep(.12, .5, y));
        vec3 c = mix(vec3(.85, .18, .02), vec3(1.0, .62, .16), smoothstep(0.0, .7, s));
        c = mix(c, vec3(1.0, .93, .7), core);
        gl_FragColor = vec4(c * s * 1.25, s); }`,
  });
  const flameMesh = new THREE.Mesh(fg, flameMat); flameMesh.renderOrder = 5; flameMesh.frustumCulled = false; scene.add(flameMesh);
  return {
    hwMesh, flameMesh, U,
    update(t) {
      // one shared flicker: a few incommensurate sines (gusts + fast flutter)
      const f = 0.8 + 0.1 * Math.sin(t * 7.3) + 0.07 * Math.sin(t * 17.1 + 1.3) + 0.05 * Math.sin(t * 31.7 + 0.4) + 0.04 * Math.sin(t * 2.1);
      U.uT.value = t; U.uF.value = f;
      litM.material.color.setScalar(0.85 * f); emberM.material.opacity = 0.55 + 0.35 * f;
    },
  };
}
