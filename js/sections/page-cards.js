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
    /* Read the resting point from CSS rather than duplicating it, so the
       two can't drift apart: the cat's own sticky offset is where it comes
       to rest. */
    const restingTop = parseFloat(getComputedStyle(cat).top) || 0;

    /* The shrink runs across the rise the cat is actually visible for —
       bottom edge of the viewport down to its resting offset — not across
       the stack's gap. The gap is now viewport-derived and much smaller
       than that rise, so measuring against it would hold the dog at full
       size for most of the climb and then snap it at the end. */
    const travel = window.innerHeight - restingTop;

    /* How far the cat still has to climb. 0 once it's stuck. */
    const remaining = cat.getBoundingClientRect().top - restingTop;
    const progress = travel > 0 ? clamp(1 - remaining / travel, 0, 1) : 0;

    dog.style.transform = `scale(${lerp(1, DOG_END_SCALE, progress)})`;
  };

  onScroll(update);
}
