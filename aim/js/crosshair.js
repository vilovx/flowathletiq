// CS2-style crosshair (classic static) drawn in 2D.
// CS scales crosshair values against a 480px-tall virtual screen (YRES), so sizes grow with resolution.
import { t } from './i18n.js?v=18';
export const COLOR_PRESETS = [
  { get name() { return t('colors')[0]; }, rgb: [250, 50, 50] },
  { get name() { return t('colors')[1]; }, rgb: [50, 250, 50] },
  { get name() { return t('colors')[2]; }, rgb: [250, 250, 50] },
  { get name() { return t('colors')[3]; }, rgb: [50, 50, 250] },
  { get name() { return t('colors')[4]; }, rgb: [50, 250, 250] },
  { get name() { return t('colors')[5]; }, rgb: null },
];

export const DEFAULT_XHAIR = {
  length: 2, thickness: 0.8, gap: -2.5, outlineEnabled: true, outline: 1,
  color: 5, red: 0, green: 240, blue: 255, alpha: 255,
  centerDotEnabled: false, tStyleEnabled: false, style: 4,
};

export function xhairRGB(x) {
  const p = COLOR_PRESETS[x.color];
  return p && p.rgb ? p.rgb : [x.red, x.green, x.blue];
}

// Draw centred at (cx, cy); screenH = real render height in CSS pixels * DPR.
export function drawCrosshair(ctx, x, cx, cy, screenH) {
  const s = screenH / 480;
  const len = Math.round(x.length * s);
  const thick = Math.max(1, Math.round(x.thickness * s));
  const gap = Math.round((4 + x.gap) * s * 0.5);
  const ol = x.outlineEnabled ? Math.max(1, Math.round(x.outline * s * 0.5)) : 0;
  const [r, g, b] = xhairRGB(x);
  const a = (x.alpha ?? 255) / 255;
  cx = Math.round(cx); cy = Math.round(cy);
  const half = Math.floor(thick / 2);
  const rects = [];
  if (len > 0) {
    rects.push([cx + gap + half + 1, cy - half, len, thick]); // right
    rects.push([cx - gap - half - len, cy - half, len, thick]); // left
    rects.push([cx - half, cy + gap + half + 1, thick, len]); // bottom
    if (!x.tStyleEnabled) rects.push([cx - half, cy - gap - half - len, thick, len]); // top
  }
  if (x.centerDotEnabled) rects.push([cx - half, cy - half, thick, thick]);
  if (ol) {
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    for (const [rx, ry, w, h] of rects) ctx.fillRect(rx - ol, ry - ol, w + ol * 2, h + ol * 2);
  }
  ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
  for (const [rx, ry, w, h] of rects) ctx.fillRect(rx, ry, w, h);
}
