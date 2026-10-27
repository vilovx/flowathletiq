// Entry: translations first. Touch-only devices (no fine pointer) get the touch mode (drag to aim, FIRE button, landscape).
import { applyDom } from './i18n.js?v=21';
const Q = new URLSearchParams(location.search);
const fine = matchMedia('(any-pointer: fine)').matches;
const touch = Q.get('mobile') === '1' || (!fine && Q.get('mobile') !== '0' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window));
document.documentElement.classList.toggle('mobile', touch);
applyDom();
import('./game.js?v=21');
