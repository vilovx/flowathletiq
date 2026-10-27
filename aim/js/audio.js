// Tiny synthesized sound effects (WebAudio, no audio files).
export class Sfx {
  constructor(enabled) { this.enabled = enabled; this.ctx = null; }
  unlock() {
    if (this.ctx) { this.ctx.resume?.(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.noise = this.makeNoise(); } catch { this.ctx = null; }
  }
  makeNoise() {
    const c = this.ctx, b = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate), d = b.getChannelData(0);
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
  shot() { this.burst(0.14, 2600, 0.5); this.tone('sine', 140, 45, 0.12, 0.45); }
  dink() { this.tone('triangle', 2400, 1900, 0.18, 0.25); }
  thud() { this.burst(0.05, 900, 0.25); }
  cluck() { this.tone('square', 700, 380, 0.07, 0.04); }
  cluckDie() { this.tone('square', 900, 200, 0.22, 0.06); }
  reload() { if (!this.ok()) return; this.burst(0.05, 3000, 0.15, 4); setTimeout(() => this.burst(0.05, 2400, 0.18, 4), 1200); setTimeout(() => this.burst(0.06, 3500, 0.2, 4), 2100); }
  alarm() { this.tone('sawtooth', 500, 250, 0.5, 0.12); }
  level() { this.tone('triangle', 520, 1040, 0.25, 0.15); }
}
