const STICKER_SELECTORS = [
  '.hero__sticker--paw .hero__sticker__pill',
  '.hero__sticker--woof .hero__sticker__pill',
  '.hero__rosette',
];

const PULL_RADIUS = 130; // px from sticker centre at which the pull starts
const MAX_PULL = 16; // px the sticker travels at the centre of the radius

function resetSticker(el) {
  el.style.setProperty('--magnet-x', '0px');
  el.style.setProperty('--magnet-y', '0px');
}

function initHeroMagneticStickers() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const stickers = STICKER_SELECTORS.map((selector) => hero.querySelector(selector)).filter(Boolean);
  if (!stickers.length) return;

  hero.addEventListener('pointermove', (event) => {
    for (const el of stickers) {
      const rect = el.getBoundingClientRect();
      const centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;
      const dx = event.clientX - centreX;
      const dy = event.clientY - centreY;
      const distance = Math.hypot(dx, dy);

      if (distance >= PULL_RADIUS) {
        resetSticker(el);
        continue;
      }

      const strength = (PULL_RADIUS - distance) / PULL_RADIUS;
      const angle = Math.atan2(dy, dx);
      el.style.setProperty('--magnet-x', `${(Math.cos(angle) * strength * MAX_PULL).toFixed(2)}px`);
      el.style.setProperty('--magnet-y', `${(Math.sin(angle) * strength * MAX_PULL).toFixed(2)}px`);
    }
  });

  hero.addEventListener('pointerleave', () => stickers.forEach(resetSticker));
}

initHeroMagneticStickers();
