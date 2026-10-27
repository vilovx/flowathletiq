// Entry: translations first; no game on touch-only devices (no fine pointer) - show a notice instead.
import { applyDom } from './i18n.js?v=5';
applyDom();
const Q = new URLSearchParams(location.search);
const fine = matchMedia('(any-pointer: fine)').matches;
if (Q.get('mobile') === '1' || (!fine && Q.get('mobile') !== '0')) {
  document.getElementById('mobile').classList.remove('hidden');
} else {
  import('./game.js?v=5');
}
