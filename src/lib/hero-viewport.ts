/** One-time mobile viewport height for heroes (avoids iOS URL-bar scroll reflow). */
export function initHeroViewportLock() {
  const apply = () => {
    document.documentElement.style.setProperty('--hero-vh', `${window.innerHeight}px`);
  };

  apply();
  window.addEventListener('orientationchange', () => {
    requestAnimationFrame(apply);
  });
}
