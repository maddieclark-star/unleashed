import { onScroll } from '../scroll.js';

/* Stacking cards — the CSS half of this (sticky cards in normal flow, the
   per-card top offsets, and the reduced-motion media query this is scoped
   to match) is the "Stacking cards" block in css/sections/page-cards.css.

   All this adds is the reference's scaleMultiplier: the card underneath
   shrinks slightly as the card above rises over it. Position and clipping
   are entirely CSS — nothing here moves a card, so nothing here can crop
   one. */

const DOG_END_SCALE = 0.92;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, t) => from + (to - from) * t;

export function initPageCards() {
  const stack = document.querySelector('.page-cards__stack');
  const dog = document.querySelector('.page-cards__card--dog');
  const cat = document.querySelector('.page-cards__card--cat');

  if (!stack || !dog || !cat) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const update = () => {
    /* Read the geometry from CSS rather than duplicating it, so the two
       can't drift apart: the cat's own sticky offset is where it comes to
       rest, and the stack's gap is how far it rises to get there. */
    const restingTop = parseFloat(getComputedStyle(cat).top) || 0;
    const travel = parseFloat(getComputedStyle(stack).rowGap) || 0;

    /* How far the cat still has to climb. 0 once it's stuck. */
    const remaining = cat.getBoundingClientRect().top - restingTop;
    const progress = travel > 0 ? clamp(1 - remaining / travel, 0, 1) : 0;

    dog.style.transform = `scale(${lerp(1, DOG_END_SCALE, progress)})`;
  };

  onScroll(update);
}
