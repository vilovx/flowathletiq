// Kuldīga theme: procedural textures + the backdrop (red-brick arched bridge over the Venta, Ventas rumba waterfall,
// green river banks with trees, cumulus sky). Everything is original procedural geometry/canvas art; nothing here is shootable.
import * as THREE from '../vendor/three.module.min.js';

function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
export function tex(w, h, draw, { srgb = true, repeat = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function kuldigaTextures() {
  const R = rnd(11);
  // red brick (running bond), 8 bricks across, 16 courses per tile
  const brick = tex(256, 256, (g, w, h) => {
    g.fillStyle = '#b8a48c'; g.fillRect(0, 0, w, h);
    const bw = 32, bh = 16;
    for (let y = 0; y < h; y += bh) {
      const off = (y / bh) % 2 ? bw / 2 : 0;
      for (let x = -bw; x < w + bw; x += bw) {
        g.fillStyle = `hsl(${9 + R() * 9},${52 + R() * 14}%,${31 + R() * 11}%)`;
        g.fillRect(x + off + 1.5, y + 1.5, bw - 3, bh - 3);
        if (R() < 0.25) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x + off + 1.5, y + bh - 5, bw - 3, 3.5); }
      }
    }
    for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(${R() > .5 ? '255,220,190' : '40,15,5'},${R() * 0.1})`; g.fillRect(R() * w, R() * h, 2, 2); }
  });
  // cobblestones: rounded grey-brown stones with dark joints
  const cobble = tex(256, 256, (g, w, h) => {
    g.fillStyle = '#4a4540'; g.fillRect(0, 0, w, h);
    const n = 12, s = w / n;
    for (let r = 0; r < n; r++) for (let k = -1; k <= n; k++) {
      const x = k * s + (r % 2) * s / 2 + (R() - 0.5) * 3, y = r * s + s / 2 + (R() - 0.5) * 3;
      const l = 48 + R() * 20, hue = 25 + R() * 20, sat = 6 + R() * 12;
      const gr = g.createRadialGradient(x - s * 0.15, y - s * 0.18, 1, x, y, s * 0.55);
      gr.addColorStop(0, `hsl(${hue},${sat}%,${l + 12}%)`); gr.addColorStop(0.7, `hsl(${hue},${sat}%,${l}%)`); gr.addColorStop(1, `hsl(${hue},${sat}%,${l - 14}%)`);
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, s * 0.46, s * 0.42, R() * 0.6, 0, 7); g.fill();
    }
    for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(30,25,20,${R() * .18})`; g.fillRect(R() * w, R() * h, 2, 2); }
  });
  // painted horizontal wooden boards (Kuldīga wooden house)
  const boards = tex(128, 128, (g, w, h) => {
    g.fillStyle = '#8a5434'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) {
      g.fillStyle = `hsl(${20 + R() * 6},${42 + R() * 10}%,${33 + R() * 6}%)`; g.fillRect(0, y + 1, w, 14);
      g.fillStyle = 'rgba(255,230,200,.10)'; g.fillRect(0, y + 1, w, 2);
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y + 14, w, 2);
      for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(40,20,10,.12)'; g.fillRect(R() * w, y + 3 + R() * 10, 10 + R() * 30, 1); }
    }
  });
  const grass = tex(128, 128, (g, w, h) => {
    g.fillStyle = '#4f7f35'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { g.fillStyle = `hsl(${85 + R() * 30},${40 + R() * 20}%,${25 + R() * 22}%)`; g.fillRect(R() * w, R() * h, 2, 2 + R() * 3); }
  });
  const water = tex(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3f6372'); gr.addColorStop(1, '#4d7584'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 380; i++) { g.fillStyle = `rgba(${R() > .4 ? '200,225,235' : '20,40,50'},${0.06 + R() * 0.14})`; g.fillRect(R() * w, R() * h, 8 + R() * 40, 1.5); }
  });
  const foam = tex(256, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const y = R() * h, a = 0.25 + R() * 0.6 * (1 - y / h * 0.6);
      g.fillStyle = `rgba(245,250,252,${a})`; g.fillRect(R() * w, y, 2 + R() * 10, 2 + R() * 14);
    }
  });
  return { brick, cobble, boards, grass, water, foam };
}

// Equirectangular painted sky: deep blue zenith, pale horizon, big white cumulus clouds (like a Latvian summer day).
function skyTexture() {
  const R = rnd(29), W = 2048, H = 1024;
  return tex(W, H, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, H / 2);
    gr.addColorStop(0, '#2c6fc6'); gr.addColorStop(0.55, '#5f9ee0'); gr.addColorStop(0.9, '#b7d5ef'); gr.addColorStop(1, '#dbe9f4');
    g.fillStyle = gr; g.fillRect(0, 0, W, H / 2); g.fillStyle = '#dbe9f4'; g.fillRect(0, H / 2, W, H / 2);
    const yOf = (elev) => H / 2 - elev / 180 * H;
    const cloud = (cx, elev, cw, ch) => {
      const by = yOf(elev), parts = 14 + Math.floor(R() * 10);
      const blobs = [];
      for (let i = 0; i < parts; i++) {
        const u = R() * 2 - 1, r = (0.22 + R() * 0.3) * ch * (1 - Math.abs(u) * 0.45);
        blobs.push({ x: cx + u * cw * 0.5, y: by - r * 0.6 - R() * ch * 0.55 * (1 - Math.abs(u)), r });
      }
      for (const dx of [-W, 0, W]) {
        for (const b of blobs) { g.fillStyle = 'rgba(150,168,192,.16)'; g.beginPath(); g.arc(b.x + dx, b.y + b.r * 0.25, b.r * 1.02, 0, 7); g.fill(); }
        for (const b of blobs) {
          const q = g.createRadialGradient(b.x + dx - b.r * 0.3, b.y - b.r * 0.4, b.r * 0.1, b.x + dx, b.y, b.r);
          q.addColorStop(0, 'rgba(255,255,255,.95)'); q.addColorStop(0.55, 'rgba(246,248,252,.85)'); q.addColorStop(0.85, 'rgba(225,233,243,.45)'); q.addColorStop(1, 'rgba(210,222,236,0)');
          g.fillStyle = q; g.beginPath(); g.arc(b.x + dx, b.y, b.r, 0, 7); g.fill();
        }
        g.fillStyle = 'rgba(170,186,208,.35)'; g.fillRect(cx + dx - cw * 0.42, by - 3, cw * 0.84, 4); // flat-ish base
      }
    };
    for (let i = 0; i < 9; i++) cloud(R() * W, 4 + R() * 8, 260 + R() * 260, 70 + R() * 50);    // low, near the horizon
    for (let i = 0; i < 8; i++) cloud(R() * W, 16 + R() * 20, 220 + R() * 320, 90 + R() * 90);  // big cumulus in the visible band
    for (let i = 0; i < 5; i++) cloud(R() * W, 38 + R() * 18, 200 + R() * 260, 60 + R() * 60);
  }, { repeat: false });
}

export function buildBackdrop(scene, T) {
  const R = rnd(5);
  const lam = (o) => new THREE.MeshLambertMaterial(o);
  const meshes = [];
  const put = (geo, m, x = 0, y = 0, z = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); scene.add(me); meshes.push(me); return me; };

  // sky dome (no fog, behind everything)
  const sky = new THREE.Mesh(new THREE.SphereGeometry(5400, 48, 24), new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -10; sky.rotation.y = 1.1; scene.add(sky);

  const grassM = lam({ map: T.grass.clone() }); grassM.map.repeat.set(1 / 128, 1 / 128);
  const grassP = (w, d) => { const g = new THREE.PlaneGeometry(w, d); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 160, uv.getY(i) * d / 160); return g; };
  const grassMat = lam({ map: T.grass });
  // riverside: cobbled strip ends at z=-760, then a grassy bank sloping down to the water
  { const g = grassP(8000, 262); g.rotateX(-Math.PI / 2 + Math.atan2(42, 260)); put(g, grassMat, 0, -21, -890); }
  // water: downstream (near) and upstream (beyond the rumba) levels, slowly flowing toward the viewer
  const waterNear = lam({ map: T.water.clone(), color: 0xc8d8de }); waterNear.map.repeat.set(10, 6);
  const waterFar = lam({ map: T.water.clone(), color: 0xd0dfe4 }); waterFar.map.repeat.set(10, 8);
  { const g = new THREE.PlaneGeometry(8000, 450); g.rotateX(-Math.PI / 2); put(g, waterNear, 0, -40, -1235); }
  { const g = new THREE.PlaneGeometry(8000, 2060); g.rotateX(-Math.PI / 2); put(g, waterFar, 0, -12, -2480); }
  // Ventas rumba: wide, low waterfall step across the whole river with foam
  const foamM = new THREE.MeshLambertMaterial({ map: T.foam.clone(), transparent: true, depthWrite: false, color: 0xffffff }); foamM.map.repeat.set(24, 1);
  const foamM2 = new THREE.MeshLambertMaterial({ map: T.foam.clone(), transparent: true, depthWrite: false, opacity: 0.95 }); foamM2.map.repeat.set(20, 1.5);
  { const g = new THREE.PlaneGeometry(3700, 34); put(g, lam({ color: 0x9fb9c2 }), 0, -26, -1450).rotation.x = -Math.atan2(18, 25); } // sloped water face of the 25-unit drop
  { const g = new THREE.PlaneGeometry(3700, 34); const m = put(g, foamM, 0, -25, -1448); m.rotation.x = -0.35; }
  { const g = new THREE.PlaneGeometry(3700, 180); g.rotateX(-Math.PI / 2); put(g, foamM2, 0, -39, -1362); }
  // high green banks left and right of the river (the bridge ends in them)
  const bank = (sx) => {
    const s = new THREE.Shape(); s.moveTo(0, -80); s.lineTo(2400, -80); s.lineTo(2400, 340); s.lineTo(230, 340); s.lineTo(0, -80);
    const g = new THREE.ExtrudeGeometry(s, { depth: 2900, bevelEnabled: false }); g.translate(0, 0, -2900);
    if (sx < 0) g.scale(-1, 1, 1);
    const m = lam({ map: T.grass.clone() }); m.map.repeat.set(1 / 140, 1 / 140); if (sx < 0) m.side = THREE.DoubleSide;
    put(g, m, sx * 1850, 0, -800);
  };
  bank(1); bank(-1);
  // far bank rising behind the bridge
  { const g = new THREE.PlaneGeometry(10000, 900); g.rotateX(-Math.PI / 2 + 0.55); const m = lam({ map: T.grass.clone() }); m.map.repeat.set(40, 4);
    put(g, m, 0, 180, -3850); }

  // --- Kuldīga red-brick bridge: 7 arches, light stone cutwaters, brick parapet with openings
  const Z = -1950, L = 3700, X0 = -L / 2, DECK = 360, BASE = -20, N = 7, PIER = 86, ABUT = 120, WIDTH = 300;
  const span = (L - 2 * ABUT - (N - 1) * PIER) / N, SPRING = 50, RISE = 225;
  const brickM = lam({ map: T.brick.clone(), color: 0xf0d8cc }); brickM.map.repeat.set(1 / 96, 1 / 96);
  const ringM = lam({ map: T.brick.clone(), color: 0xffc7a8 }); ringM.map.repeat.set(1 / 60, 1 / 60);
  const stoneM = lam({ color: 0xc8c0b2, flatShading: true });
  const centers = []; for (let i = 0; i < N; i++) centers.push(X0 + ABUT + span / 2 + i * (span + PIER));
  {
    // one outline: along the water line, up and over every arch, then back along the deck (arches open down to the river)
    const s = new THREE.Shape(); s.moveTo(X0, BASE);
    for (const cx of centers) { s.lineTo(cx - span / 2, BASE); s.lineTo(cx - span / 2, SPRING); s.absellipse(cx, SPRING, span / 2, RISE, Math.PI, 0, true); s.lineTo(cx + span / 2, BASE); }
    s.lineTo(X0 + L, BASE); s.lineTo(X0 + L, DECK); s.lineTo(X0, DECK); s.lineTo(X0, BASE);
    const g = new THREE.ExtrudeGeometry(s, { depth: WIDTH, bevelEnabled: false, curveSegments: 20 }); g.translate(0, 0, -WIDTH / 2);
    put(g, brickM, 0, 0, Z);
    for (const cx of centers) { // lighter arch rings standing out of both faces
      const r = new THREE.Shape(); r.moveTo(cx + span / 2 + 24, SPRING); r.absellipse(cx, SPRING, span / 2 + 24, RISE + 24, 0, Math.PI, false);
      r.lineTo(cx - span / 2, SPRING); r.absellipse(cx, SPRING, span / 2, RISE, Math.PI, 0, true); r.lineTo(cx + span / 2 + 24, SPRING);
      const rg = new THREE.ExtrudeGeometry(r, { depth: WIDTH + 10, bevelEnabled: false, curveSegments: 20 }); rg.translate(0, 0, -(WIDTH + 10) / 2);
      put(rg, ringM, 0, 0, Z);
    }
    for (let i = 0; i < N - 1; i++) { // pointed stone cutwaters + caps on each pier
      const x = centers[i] + span / 2 + PIER / 2;
      const cw = new THREE.CylinderGeometry(PIER * 0.62, PIER * 0.72, 150, 4); cw.rotateY(Math.PI / 4); cw.scale(1, 1, 3.0);
      put(cw, stoneM, x, BASE + 75, Z);
      const cap = new THREE.ConeGeometry(PIER * 0.62, 50, 4); cap.rotateY(Math.PI / 4); cap.scale(1, 1, 3.0); put(cap, stoneM, x, BASE + 175, Z);
    }
    // string course, parapet with openings (alpha texture), coping
    put(new THREE.BoxGeometry(L, 12, WIDTH + 14), ringM, 0, DECK - 6, Z);
    const parT = tex(256, 64, (g, w, h) => {
      g.fillStyle = '#9b4a32'; g.fillRect(0, 0, w, h);
      for (let x = 10; x < w; x += 32) g.clearRect(x, 14, 14, 34);
      g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1);
    });
    parT.repeat.set(L / 220, 1);
    const parM = lam({ map: parT, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
    for (const dz of [-WIDTH / 2 + 4, WIDTH / 2 - 4]) {
      put(new THREE.PlaneGeometry(L, 52), parM, 0, DECK + 26, Z + dz);
      put(new THREE.BoxGeometry(L, 8, 16), stoneM, 0, DECK + 56, Z + dz);
      for (let i = 0; i <= N; i++) { const x = i === 0 ? X0 + 20 : i === N ? X0 + L - 20 : centers[i - 1] + span / 2 + PIER / 2;
        put(new THREE.BoxGeometry(28, 66, 22), brickM, x, DECK + 33, Z + dz); }
    }
    // street lamps on the bridge
    const lampM = lam({ color: 0x1b1d20 });
    for (let i = 0; i < 6; i++) { const x = X0 + 300 + i * (L - 600) / 5; const p = put(new THREE.CylinderGeometry(2.5, 3.5, 110, 6), lampM, x, DECK + 55, Z + WIDTH / 2 - 10);
      put(new THREE.SphereGeometry(8, 8, 6), lam({ color: 0xf1ead2, emissive: 0x332a10 }), x, DECK + 115, Z + WIDTH / 2 - 10); }
  }

  // --- trees: one instanced canopy mesh + one trunk mesh (cheap: 2 draw calls)
  const spots = [];
  const tree = (x, y, z, s) => spots.push({ x, y, z, s });
  for (let i = 0; i < 80; i++) { const x = -3800 + i * 95 + (R() - 0.5) * 60, z = -3520 - R() * 620; tree(x, -60 + (-3467 - z) * Math.tan(0.55), z, 1.6 + R() * 1.2); }   // far bank (on the slope)
  for (const sx of [-1, 1]) for (let i = 0; i < 26; i++) tree(sx * (2000 + R() * 1500), 340, -900 - R() * 1900, 1.4 + R() * 1.1); // side banks
  for (let i = 0; i < 26; i++) tree(-1500 + i * 120 + (R() - 0.5) * 50, 0, 980 + R() * 600, 1.8 + R() * 1.0);                   // behind the back wall
  for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) tree(sx * (950 + R() * 500), 0, -450 + i * 120 + R() * 60, 1.7 + R() * 0.8); // behind side houses
  for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) tree(sx * (900 + R() * 700), -14, -820 - R() * 120, 1.2 + R() * 0.7); // riverside, near
  const BL = 3, canopy = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), lam({ flatShading: true }), spots.length * BL);
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.7, 1, 6), lam({ color: 0x4c3a2a }), spots.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
  spots.forEach((t, i) => {
    const s = t.s * 60;
    m4.compose(v.set(t.x, t.y + s * 0.9, t.z), q.identity(), sc.set(s * 0.18, s * 1.8, s * 0.18)); trunks.setMatrixAt(i, m4);
    for (let k = 0; k < BL; k++) {
      const r = s * (0.9 + R() * 0.5);
      m4.compose(v.set(t.x + (R() - 0.5) * s * 1.1, t.y + s * (2.2 + R() * 1.4), t.z + (R() - 0.5) * s * 1.1), q.setFromEuler(new THREE.Euler(R() * 3, R() * 3, 0)), sc.set(r, r * (0.85 + R() * 0.3), r));
      canopy.setMatrixAt(i * BL + k, m4);
      col.setHSL(0.24 + R() * 0.08, 0.45 + R() * 0.2, 0.22 + R() * 0.12); canopy.setColorAt(i * BL + k, col);
    }
  });
  scene.add(canopy, trunks);

  return {
    update(t) { waterNear.map.offset.y = -t * 0.10; waterFar.map.offset.y = -t * 0.05; foamM.map.offset.y = (t * 0.9) % 1; foamM2.map.offset.y = -t * 0.35; foamM2.map.offset.x = Math.sin(t * 0.3) * 0.02; },
  };
}
