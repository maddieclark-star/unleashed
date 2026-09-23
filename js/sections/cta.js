/* ==========================================================================
   Unleashed — CTA banner sticker magnetic pull
   Same behaviour as the hero's headline stickers (js/sections/hero.js) —
   stickers stay still until the pointer comes near, then pull toward it and
   ease back with a slight overshoot when it moves away. Kept as its own file
   rather than reusing the hero's, since the two sections' stickers are
   separate DOM subtrees and the hero file is scoped to `.hero`.
   ========================================================================== */

const STICKER_SELECTORS = [
  '.cta__sticker--paw .cta__sticker-pill',
  '.cta__sticker--meow .cta__sticker-pill',
  '.cta__rosette',
];

const PULL_RADIUS = 130; // px from sticker centre at which the pull starts
const MAX_PULL = 16; // px the sticker travels at the centre of the radius

function resetSticker(el) {
  el.style.setProperty('--magnet-x', '0px');
  el.style.setProperty('--magnet-y', '0px');
}

export function initCtaMagneticStickers() {
  const cta = document.querySelector('.cta');
  if (!cta) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const stickers = STICKER_SELECTORS.map((selector) => cta.querySelector(selector)).filter(Boolean);
  if (!stickers.length) return;

  cta.addEventListener('pointermove', (event) => {
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

  cta.addEventListener('pointerleave', () => stickers.forEach(resetSticker));
}
