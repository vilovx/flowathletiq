// Entry: no game on touch-only devices (no fine pointer) - show a notice instead.
const Q = new URLSearchParams(location.search);
const fine = matchMedia('(any-pointer: fine)').matches;
if (Q.get('mobile') === '1' || (!fine && Q.get('mobile') !== '0')) {
  document.getElementById('mobile').classList.remove('hidden');
} else {
  import('./game.js?v=1');
}
