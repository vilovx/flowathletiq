// Forced landscape for phones that will not rotate (rotation lock / iOS): first try fullscreen + orientation lock,
// otherwise rotate the whole #app 90° with CSS. The choice lasts for this session; turning the phone to landscape drops it.
const KEY = 'fa_aim_forcerot', root = document.documentElement;
export const forced = () => root.classList.contains('forcerot');
const portrait = () => innerHeight > innerWidth;
function set(on) {
  on = !!on && portrait();
  if (on === forced()) return;
  root.classList.toggle('forcerot', on);
  try { on ? sessionStorage.setItem(KEY, '1') : sessionStorage.removeItem(KEY); } catch {}
  dispatchEvent(new Event('resize')); // renderer/camera/HUD scale pick up the rotated size
  dispatchEvent(new CustomEvent('forcerot', { detail: on }));
}
export function forceOff() { set(false); }
async function rotateNow() {
  try { // Android Chrome: real fullscreen + landscape lock
    const d = document.documentElement;
    if (!document.fullscreenElement && d.requestFullscreen) await d.requestFullscreen({ navigationUI: 'hide' });
    if (!screen.orientation || !screen.orientation.lock) throw new Error('no lock');
    await screen.orientation.lock('landscape');
    await new Promise((r) => setTimeout(r, 350));
    if (!portrait()) return;
  } catch {}
  set(true); // iOS / rotation lock / no permission: CSS rotation
}
export function initRot() {
  if (!root.classList.contains('mobile')) return;
  const b = document.getElementById('rot-btn'); if (b) b.addEventListener('click', rotateNow);
  try { if (sessionStorage.getItem(KEY) === '1') set(true); } catch {}
  const check = () => { if (forced() && !portrait()) set(false); }; // physically turned to landscape: drop the CSS rotation
  addEventListener('resize', check); addEventListener('orientationchange', () => setTimeout(check, 300));
}
