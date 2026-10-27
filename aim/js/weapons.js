// CS2 weapon values (from the game's weapons.vdata as listed on cs2.gs) + deterministic recoil.
// Recoil: CS2 generates each weapon's fixed pattern from its recoil seed, angle, angle variance and magnitude.
// We re-implement that with a Numerical-Recipes "ran1" uniform stream (the generator family Source uses) and the
// Source aim-punch model (punch velocity kicks, exp+linear decay, weapon_recoil_scale 2). See README for caveats.
export const WEAPONS = {
  ak47: {
    id: 'ak47', name: 'AK-47', key: '1', damage: 36, armorRatio: 1.55, hsMult: 4, legMult: 0.75, rangeMod: 0.98,
    cycle: 0.1, mag: 30, reload: 2.467,
    recoil: { seed: 223, angle: 0, angleVar: 70, mag: 30, magVar: 0 },
    inacc: { stand: 0.0064, spread: 0.0006, perShot: 0.0078, recStand: 0.368, recFinal: 0.506 },
    look: { wood: 0x8a4f25, metal: 0x2b2d31, silencer: false },
  },
  m4a4: {
    id: 'm4a4', name: 'M4A4', key: '2', damage: 33, armorRatio: 1.4, hsMult: 4, legMult: 0.75, rangeMod: 0.97,
    cycle: 0.09, mag: 30, reload: 3.067,
    recoil: { seed: 38965, angle: 0, angleVar: 70, mag: 23, magVar: 0 },
    inacc: { stand: 0.0049, spread: 0.0006, perShot: 0.007, recStand: 0.339, recFinal: 0.466 },
    look: { wood: 0x3a3d42, metal: 0x24262a, silencer: false },
  },
  m4a1s: {
    id: 'm4a1s', name: 'M4A1-S', key: '3', damage: 38, armorRatio: 1.4, hsMult: 3.48, legMult: 0.75, rangeMod: 0.94,
    cycle: 0.1, mag: 20, reload: 3.067,
    recoil: { seed: 38965, angle: 0, angleVar: 65, mag: 21, magVar: 0 }, // silenced (default) mode
    inacc: { stand: 0.0049, spread: 0.0005, perShot: 0.007, recStand: 0.339, recFinal: 0.466 },
    look: { wood: 0x4a4f55, metal: 0x1f2124, silencer: true },
  },
};
export const WEAPON_ORDER = ['ak47', 'm4a4', 'm4a1s'];

// Source-style recoil constants (CS:GO/CS2 cvar defaults)
export const RECOIL = { scale: 2.0, decayExp: 8, decayLin: 18, velDecay: 4.5, suppShots: 4, suppFactor: 0.75, viewTracking: 0.45 };

class UniformStream { // Numerical Recipes ran1
  constructor(seed) { this.idum = seed < 0 ? seed : -seed; this.iy = 0; this.iv = new Array(32).fill(0); }
  next() {
    const IA = 16807, IM = 2147483647, IQ = 127773, IR = 2836, NTAB = 32, NDIV = 1 + Math.floor((IM - 1) / NTAB);
    let j, k;
    if (this.idum <= 0 || !this.iy) {
      this.idum = -this.idum < 1 ? 1 : -this.idum;
      for (j = NTAB + 7; j >= 0; j--) {
        k = Math.trunc(this.idum / IQ); this.idum = IA * (this.idum - k * IQ) - IR * k;
        if (this.idum < 0) this.idum += IM; if (j < NTAB) this.iv[j] = this.idum;
      }
      this.iy = this.iv[0];
    }
    k = Math.trunc(this.idum / IQ); this.idum = IA * (this.idum - k * IQ) - IR * k; if (this.idum < 0) this.idum += IM;
    j = Math.trunc(this.iy / NDIV); if (j >= NTAB || j < 0) j = (j % NTAB) & 0x7fffffff;
    this.iy = this.iv[j]; this.iv[j] = this.idum; return this.iy;
  }
  float(lo, hi) { let f = this.next() / 2147483647; if (f > 1 - 1.2e-7) f = 1 - 1.2e-7; return f * (hi - lo) + lo; }
}

// Per-shot kick table [{yaw, pitch}] in degrees/second of punch velocity
export function recoilTable(w, n = 64) {
  const r = new UniformStream(w.recoil.seed), out = [];
  for (let j = 0; j < n; j++) {
    const a = w.recoil.angle + r.float(-w.recoil.angleVar, w.recoil.angleVar);
    let m = w.recoil.mag + r.float(-w.recoil.magVar, w.recoil.magVar);
    if (j < RECOIL.suppShots) m *= RECOIL.suppFactor + (1 - RECOIL.suppFactor) * j / RECOIL.suppShots;
    const rad = a * Math.PI / 180;
    out.push({ yaw: -Math.sin(rad) * m, pitch: Math.cos(rad) * m });
  }
  return out;
}

// Aim punch state integrator
export class Punch {
  constructor() { this.reset(); }
  reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; }
  kick(k) { this.vx += k.yaw; this.vy += k.pitch; }
  update(dt) {
    const steps = Math.max(1, Math.ceil(dt / (1 / 256))), h = dt / steps;
    for (let s = 0; s < steps; s++) {
      this.x += this.vx * h; this.y += this.vy * h;
      const e = Math.exp(-RECOIL.decayExp * h); this.x *= e; this.y *= e;
      const len = Math.hypot(this.x, this.y);
      if (len > 0) { const d = Math.min(len, RECOIL.decayLin * h); this.x -= this.x / len * d; this.y -= this.y / len * d; }
      const ev = Math.exp(-RECOIL.velDecay * h); this.vx *= ev; this.vy *= ev;
    }
  }
}

// Ideal full-auto spray (no inaccuracy): bullet offsets in degrees {x: yaw (+ = right), y: pitch (+ = up)}
export function idealSpray(w, mirror = 1) {
  const t = recoilTable(w), p = new Punch(), pts = [];
  for (let i = 0; i < w.mag; i++) {
    pts.push({ x: p.x * RECOIL.scale * mirror, y: p.y * RECOIL.scale });
    p.kick(t[i]); p.update(w.cycle);
  }
  return pts;
}
