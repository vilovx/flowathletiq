// Entry: translations first, then pick the control mode. Touch mode (drag to aim, FIRE button, landscape) when:
// ?mobile=1|0 forces; otherwise the saved choice (localStorage fa_aim_touch, set by the Touch mode toggle); otherwise detection.
import { applyDom } from './i18n.js?v=30';
export function isPhoneLike() { // same rule as the main site's Aim Trainer card (js/app.js)
  const n = navigator, mm = (q) => { try { return matchMedia(q).matches; } catch { return false; } };
  const tp = n.maxTouchPoints || 0, ua = n.userAgent || '';
  if (n.userAgentData && n.userAgentData.mobile) return true;
  if (/Android|iPhone|iPad|iPod|Mobile|Silk|Opera Mini|IEMobile/i.test(ua)) return true;
  if (n.platform === 'MacIntel' && tp > 1) return true;                                  // iPadOS "desktop" Safari
  if (mm('(any-pointer: coarse)') && tp > 0 && !mm('(pointer: fine)')) return true;       // touch-first device
  const short = Math.min(screen.width || 0, screen.height || 0);
  if (tp > 0 && short > 0 && short <= 900 && mm('(pointer: coarse)')) return true;         // phone in "desktop site" mode
  return false;
}
const Q = new URLSearchParams(location.search);
let saved = null; try { saved = localStorage.getItem('fa_aim_touch'); } catch {}
const touch = Q.get('mobile') === '1' ? true : Q.get('mobile') === '0' ? false : saved === '1' ? true : saved === '0' ? false : isPhoneLike();
document.documentElement.classList.toggle('mobile', touch);
if (touch) { // graphics quality for touch mode: Low / Medium / High, Auto = High on capable phones (game.js drops it if fps stays low)
  let q = 'auto'; try { q = (JSON.parse(localStorage.getItem('fa_aim_settings')) || {}).quality || 'auto'; } catch {}
  if (!['low', 'medium', 'high'].includes(q)) {
    let down = null; try { down = sessionStorage.getItem('fa_aim_qauto'); } catch {}
    const weak = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    q = down || (weak ? 'medium' : 'high');
  }
  document.documentElement.classList.add('q-' + q); document.documentElement.dataset.q = q;
}
applyDom();
import('./rot.js?v=30').then((m) => m.initRot());
import('./game.js?v=30');
