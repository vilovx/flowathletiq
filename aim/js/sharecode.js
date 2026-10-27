// CS2 / CS:GO crosshair share code (CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx).
// Public format, same approach as the open-source "csgo-sharecode" library (MIT).
const DICT = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789';
const DLEN = BigInt(DICT.length);
const PATTERN = /^CSGO(-?[\w]{5}){5}$/;
const int8 = (n) => (n << 24) >> 24;

export function codeToBytes(code) {
  code = String(code).trim();
  if (!PATTERN.test(code)) throw new Error('bad-format');
  const chars = Array.from(code.replace(/CSGO|-/g, '')).reverse();
  let big = 0n;
  for (const c of chars) {
    const i = DICT.indexOf(c);
    if (i < 0) throw new Error('bad-char');
    big = big * DLEN + BigInt(i);
  }
  const hex = big.toString(16).padStart(36, '0');
  const bytes = [];
  for (let i = 0; i < 36; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
  return bytes;
}

function bytesToCode(bytes) {
  let total = BigInt('0x' + bytes.map((b) => ('0' + (b & 255).toString(16)).slice(-2)).join(''));
  let s = '';
  for (let i = 0; i < 25; i++) { s += DICT[Number(total % DLEN)]; total /= DLEN; }
  return `CSGO-${s.slice(0, 5)}-${s.slice(5, 10)}-${s.slice(10, 15)}-${s.slice(15, 20)}-${s.slice(20, 25)}`;
}

export function decodeCrosshair(code) {
  const b = codeToBytes(code);
  const sum = b.slice(1).reduce((a, v) => a + v, 0) % 256;
  if (b[0] !== sum) throw new Error('bad-checksum');
  return {
    raw: b,
    gap: int8(b[2]) / 10,
    outline: b[3] / 2,
    red: b[4], green: b[5], blue: b[6], alpha: b[7],
    color: b[10] & 7,
    outlineEnabled: (b[10] & 8) === 8,
    thickness: b[12] / 10,
    centerDotEnabled: ((b[13] >> 4) & 1) === 1,
    alphaEnabled: ((b[13] >> 4) & 4) === 4,
    tStyleEnabled: ((b[13] >> 4) & 8) === 8,
    style: (b[13] & 0xf) >> 1,
    length: (((b[15] & 0x1f) << 8) | b[14]) / 10,
  };
}

// Encodes our crosshair settings; unknown bytes are kept from the imported code (or CS2 defaults).
export function encodeCrosshair(x, raw) {
  const b = raw ? raw.slice() : [0, 1, 0, 2, 50, 250, 50, 200, 3, 30, 1, 16, 10, 0, 50, 0, 0, 0];
  b[1] = b[1] || 1;
  b[2] = Math.round(x.gap * 10) & 0xff;
  b[3] = Math.round(x.outline * 2) & 0xff;
  b[4] = x.red & 0xff; b[5] = x.green & 0xff; b[6] = x.blue & 0xff; b[7] = x.alpha & 0xff;
  b[10] = (b[10] & 0xf0) | (x.color & 7) | (x.outlineEnabled ? 8 : 0);
  b[12] = Math.round(x.thickness * 10) & 0xff;
  const flags = (x.centerDotEnabled ? 1 : 0) | (b[13] >> 4 & 2) | 4 /* alpha on */ | (x.tStyleEnabled ? 8 : 0);
  b[13] = (flags << 4) | (((x.style ?? 4) << 1) & 0xf);
  const len = Math.round(x.length * 10);
  b[14] = len & 0xff;
  b[15] = (b[15] & 0xe0) | ((len >> 8) & 0x1f);
  b[0] = b.slice(1).reduce((a, v) => a + v, 0) % 256;
  return bytesToCode(b);
}
