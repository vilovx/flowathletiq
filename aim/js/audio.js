// Tiny synthesized sound effects (WebAudio, no audio files).
export class Sfx {
  constructor(enabled) { this.enabled = enabled; this.ctx = null; }
  unlock() {
    if (this.ctx) { this.ctx.resume?.(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.noise = this.makeNoise(); } catch { this.ctx = null; }
  }
  makeNoise() {
    const c = this.ctx, b = c.createBuffer(1, c.sampleRate * 1, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  ok() { return this.ctx && this.enabled(); }
  env(node, t, a, peak, dec) { const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); node.connect(g); g.connect(this.ctx.destination); return g; }
  tone(type, f0, f1, dur, vol) {
    if (!this.ok()) return; const c = this.ctx, t = c.currentTime, o = c.createOscillator();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    this.env(o, t, 0.004, vol, dur); o.start(t); o.stop(t + dur + 0.05);
  }
  burst(dur, freq, vol, q = 0.7) {
    if (!this.ok()) return; const c = this.ctx, t = c.currentTime, s = c.createBufferSource(); s.buffer = this.noise;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq; f.Q.value = q; s.connect(f);
    this.env(f, t, 0.002, vol, dur); s.start(t); s.stop(t + dur + 0.05);
  }
  // Per-weapon gunshots, synthesized (original, no sampled game audio). One shared noise buffer, a compressor bus
  // and a voice cap keep it cheap at 600+ RPM.
  bus() {
    if (this._bus) return this._bus; const c = this.ctx;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 6; comp.attack.value = 0.002; comp.release.value = 0.12;
    const g = c.createGain(); g.gain.value = 0.9; g.connect(comp); comp.connect(c.destination); this.voices = 0;
    return (this._bus = g);
  }
  // filtered noise layer: start offset `at` (s), filter type/freq/Q, attack, decay, peak volume
  nz(t, type, freq, q, a, dec, vol, rate = 1) {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noise; s.playbackRate.value = rate;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; s.connect(f);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
    f.connect(g); g.connect(this.bus()); const off = Math.random() * (this.noise.duration - a - dec - 0.1);
    s.start(t, Math.max(0, off)); s.stop(t + a + dec + 0.03);
  }
  osc(t, type, f0, f1, a, dec, vol) {
    const c = this.ctx, o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + a + dec);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
    o.connect(g); g.connect(this.bus()); o.start(t); o.stop(t + a + dec + 0.03);
  }
  shot(id = 'ak47') {
    if (!this.ok()) return; const t = this.ctx.currentTime; this.bus();
    const v = 0.94 + Math.random() * 0.12;             // small per-shot variation
    const tail = this.voices < 5;                       // skip long tails when many shots overlap
    if (tail) { this.voices++; setTimeout(() => this.voices--, 450); }
    if (id === 'm4a1s') {                               // suppressed: soft low "thup", air puff, bolt click
      this.nz(t, 'lowpass', 650 * v, 0.9, 0.003, 0.08, 0.3, v);
      this.nz(t, 'bandpass', 2300 * v, 1.6, 0.002, 0.035, 0.05, v);
      this.osc(t, 'sine', 105 * v, 42, 0.002, 0.07, 0.24);
      this.nz(t + 0.028, 'highpass', 4800, 6, 0.001, 0.016, 0.1);   // mechanical action click
      this.osc(t + 0.03, 'square', 1700 * v, 1500, 0.001, 0.012, 0.025);
      this.nz(t + 0.06, 'bandpass', 3200, 5, 0.001, 0.014, 0.05);    // bolt returning
    } else if (id === 'm4a4') {                         // sharper, lighter, snappier crack
      this.nz(t, 'highpass', 2800 * v, 0.8, 0.001, 0.07, 0.42, v);
      this.nz(t, 'bandpass', 1300 * v, 0.9, 0.002, 0.11, 0.32, v);
      this.osc(t, 'sine', 175 * v, 60, 0.002, 0.08, 0.34);
      this.osc(t, 'triangle', 2100 * v, 1900, 0.001, 0.03, 0.03);
      if (tail) this.nz(t + 0.02, 'lowpass', 1500, 0.6, 0.02, 0.26, 0.07);
    } else {                                            // AK-47: heavier, punchy, metallic
      this.nz(t, 'bandpass', 1700 * v, 0.7, 0.001, 0.15, 0.5, v);
      this.nz(t, 'lowpass', 520 * v, 0.9, 0.003, 0.22, 0.5, v);
      this.osc(t, 'sine', 120 * v, 36, 0.002, 0.15, 0.55);
      this.osc(t, 'square', 860 * v, 700, 0.001, 0.04, 0.035);       // metallic clank
      this.osc(t, 'triangle', 3100 * v, 2950, 0.001, 0.05, 0.03);
      if (tail) this.nz(t + 0.03, 'lowpass', 900, 0.6, 0.03, 0.4, 0.1);
    }
  }
  dink() { this.tone('triangle', 2400, 1900, 0.18, 0.25); }
  thud() { this.burst(0.05, 900, 0.25); }
  peek(pan = 0) { // soft wooden shutter creak + tiny cluck, panned toward the flank
    if (!this.ok()) return; const c = this.ctx, t = c.currentTime, p = c.createStereoPanner ? c.createStereoPanner() : null;
    const o = c.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(320, t); o.frequency.exponentialRampToValueAtTime(210, t + 0.16);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g); if (p) { p.pan.value = pan; g.connect(p); p.connect(c.destination); } else g.connect(c.destination); o.start(t); o.stop(t + 0.22);
  }
  cluck() { this.tone('square', 700, 380, 0.07, 0.04); }
  cluckDie() { this.tone('square', 900, 200, 0.22, 0.06); }
  reload() { if (!this.ok()) return; this.burst(0.05, 3000, 0.15, 4); setTimeout(() => this.burst(0.05, 2400, 0.18, 4), 1200); setTimeout(() => this.burst(0.06, 3500, 0.2, 4), 2100); }
  alarm() { this.tone('sawtooth', 500, 250, 0.5, 0.12); }
  tick() { this.tone('sine', 880, 880, 0.12, 0.14); }
  go() { this.tone('square', 660, 1320, 0.38, 0.12); setTimeout(() => this.tone('triangle', 1320, 1760, 0.3, 0.12), 90); }
  level() { this.tone('triangle', 520, 1040, 0.25, 0.15); }
}
