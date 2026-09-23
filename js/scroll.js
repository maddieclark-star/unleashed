import Lenis from './vendor/lenis.min.mjs';

/* Build step 12 — smooth scroll. Vendored locally (js/vendor/lenis.min.mjs,
   pinned to 1.3.26) rather than a CDN import, so the site keeps working
   fully offline and without a build step.

   Reduced motion gets no Lenis at all — smooth scroll is itself a motion
   effect, so those visitors keep native scroll rather than an easing
   curve laid over it. */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const lenis = prefersReducedMotion
  ? null
  : new Lenis({
      autoRaf: true,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

/* The hero drives its image scale with GSAP ScrollTrigger, which reads
   scroll position off native scroll events. Lenis animates the window on
   its own schedule, so without this the two run a frame or more apart and
   the hero's trigger points drift. This is Lenis's documented GSAP
   integration. Guarded because the hero's GSAP is CDN-loaded — if that
   fails to load the hero already no-ops, and this should too rather than
   throwing and taking the rest of the page's motion down with it. */
if (lenis && window.ScrollTrigger) {
  lenis.on('scroll', () => window.ScrollTrigger.update());
}

/**
 * Shared scroll driver for section animations. Fires once immediately and
 * then on every scroll frame.
 *
 * Both sources are subscribed when Lenis is running, not one or the other:
 * Lenis only emits for scrolls it drives itself, so a scroll it didn't
 * originate — scrollTo from script, an in-page anchor, keyboard paging,
 * find-in-page — would otherwise leave scroll-driven sections frozen at
 * whatever value they last saw. Handlers are expected to be pure functions
 * of scroll position, so being called twice for one frame is harmless.
 */
export function onScroll(callback) {
  lenis?.on('scroll', callback);
  window.addEventListener('scroll', callback, { passive: true });
  callback();
}
