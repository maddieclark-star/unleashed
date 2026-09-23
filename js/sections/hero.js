/* ==========================================================================
   Unleashed — Hero image scale-on-scroll
   Reference: osmo.supply "Scaling element on scroll with Flip" + the Figma
   sequence at node 13239:24172. Scrubs the container from its default
   (small) CSS state to its expanded state 1:1 with scroll distance, via
   GSAP Flip.

   Capture the small state, toggle the expanded class (which is what actually
   changes the box model — see .hero__image-container--expanded in hero.css),
   then let Flip.from() animate the visual gap between the two. ease:'none'
   plus scrub:true is what gives the direct, non-bouncy scrub in the brief —
   any other ease double-eases against the scrub and reads as laggy.

   NOT PINNED (2026-09-22 feedback). pin:true freezes the element at whatever
   position it was in when the trigger fired — with start:'top 75%' that
   meant the image was locked 3/4 down the viewport for the whole animation,
   leaving a few hundred px of blank band background above it the entire
   time (the "huge gap" bug). Tying the scrub to the band's own natural
   scroll instead — start when its top reaches the bottom of the viewport,
   end when its top reaches the very top — means it grows while it scrolls
   normally into place, with no frozen position and no pin-spacer to get out
   of sync with the surrounding background. Growth starts on the very first
   scroll pixel (band is already close to the fold) and finishes right as it
   reaches the top of the viewport, before the USPS section (which follows
   immediately after, 120px below) is more than a sliver into view.
   ========================================================================== */

export function initHeroImageFlip() {
  // The sticky wrapper, not the band itself: the band is position:sticky, and
  // a stuck element reports its stuck position rather than its document
  // position. The wrapper's top edge IS the band's top edge (it has no
  // padding-top), so start/end resolve to the same scroll positions as before
  // while staying measurable. Growth behaviour is unchanged.
  const band = document.querySelector('[data-hero-sticky]');
  const container = document.querySelector('[data-hero-flip]');

  if (!band || !container) return;

  if (!window.gsap || !window.ScrollTrigger || !window.Flip) {
    console.warn('[hero] GSAP/ScrollTrigger/Flip not loaded — skipping image scale animation.');
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger, Flip);

  const state = Flip.getState(container);
  container.classList.add('hero__image-container--expanded');

  Flip.from(state, {
    ease: 'none',
    scrollTrigger: {
      trigger: band,
      // clamp() because the band's top is ALREADY above the fold at scroll 0
      // (it crests the viewport by design, 40px under the callout row), so a
      // bare 'top bottom' resolves to a negative scroll position and the page
      // loads with ~8% of the grow already applied — the image renders
      // oversize and 18px lower than the 40px gap it is supposed to sit at.
      // clamp() pins the start to scroll 0 instead, so the collapsed state is
      // the state you actually see on load. end is unaffected: the band top
      // reaching the viewport top is a positive scroll position either way.
      start: 'clamp(top bottom)',
      end: 'top top',
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
}

/* ==========================================================================
   Unleashed — Condensed quote widget reveal
   Figma: "Sticky Scroll" (13309:33155). Once the image above has finished
   growing — the same "band has stopped growing" instant initHeroImageFlip's
   scrollTrigger ends on — a condensed quote widget slides up and pins to the
   bottom of the viewport. This is a single on/off toggle, not a scrub: the
   band either has finished growing or it hasn't, so onEnter/onLeaveBack is
   the right tool here, not a scroll-mapped gsap.to.

   Reduced motion still gets the widget, just without the slide-in: unlike
   the Flip/parallax above, this isn't decorative — it's the only way to
   reach the quote form once the hero's own widget has scrolled out of view,
   so the correct static fallback is "present without animating in", not
   "absent". */

export function initHeroCondensedWidget() {
  const wrapper = document.querySelector('[data-hero-condensed]');
  const trigger = document.querySelector('[data-hero-sticky]');

  if (!wrapper || !trigger) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    wrapper.classList.add('hero__condensed--visible');
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('[hero] GSAP/ScrollTrigger not loaded — showing condensed widget without the reveal.');
    wrapper.classList.add('hero__condensed--visible');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Triggered off the WRAPPER, not the band, for the same reason the Flip
  // above is: the band is the sticky element, and a stuck element reports
  // its stuck position to getBoundingClientRect rather than its document
  // position — not a stable thing to measure start/end against.
  ScrollTrigger.create({
    trigger,
    start: 'top top',
    end: 'top top',
    invalidateOnRefresh: true,
    onEnter: () => wrapper.classList.add('hero__condensed--visible'),
    onLeaveBack: () => wrapper.classList.remove('hero__condensed--visible'),
  });
}

/* ==========================================================================
   Unleashed — Full-screen quote modal
   Figma: "Quote Modal" (13309:33130). Opened by clicking the condensed
   widget above; closed via its own close button, Escape, or a click on the
   backdrop outside the card. `inert` (already on the modal in the markup)
   is toggled alongside the open state so its fields can't be tabbed or
   read into while hidden — same technique the old widget mirror used. */

export function initHeroQuoteModal() {
  const trigger = document.querySelector('[data-hero-condensed-trigger]');
  const modal = document.querySelector('[data-hero-modal]');
  const closeBtn = document.querySelector('[data-hero-modal-close]');

  if (!trigger || !modal || !closeBtn) return;

  function open() {
    modal.inert = false;
    modal.classList.add('hero__quote-modal--open');
    trigger.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  }

  function close() {
    modal.classList.remove('hero__quote-modal--open');
    modal.inert = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  }

  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('hero__quote-modal--open')) close();
  });
}

/* ==========================================================================
   Hero image parallax — vanilla JS, no dependencies (IntersectionObserver +
   requestAnimationFrame), ported from the brief for components/ParallaxHero
   (that component doesn't exist in this repo — this project is plain
   HTML/CSS/JS by project rule, no React/TSX/build step — so this is the
   same behaviour, not that file).

   Runs on .hero__image-photo, a CHILD of .hero__image-container (the
   element initHeroImageFlip scales via Flip above) — the two animate
   different elements with independent inline transforms, so they don't
   fight each other: Flip scales the container, this scales+shifts the
   photo inside it. .hero__image-container already has overflow:hidden, so
   the photo's constant scale(1.2) oversize buffer clips cleanly at every
   Flip size without ever exposing an edge.

   speed 0.4 mirrors the prop default from the brief: 0 would be no
   parallax, 1 would move the image at full scroll speed (i.e. no relative
   drift at all — 1:1 with the page, so nothing would read as "slower").
   Lower speed = more drift = more noticeable. Multiplier tuned so speed:0.4
   caps drift at ±4%, comfortably inside the 10%-per-edge buffer scale(1.2)
   provides — first pass, tune by eye.
   ========================================================================== */

export function initHeroParallax(speed = 0.4) {
  const band = document.querySelector('.hero__image-band');
  const photo = document.querySelector('.hero__image-photo');

  if (!band || !photo) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  let inView = false;
  let ticking = false;

  function render() {
    ticking = false;
    if (!inView) return;

    const rect = band.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 = band top just entering at the viewport bottom, 1 = band top has
    // reached the viewport top (fully scrolled past) — same normalised
    // range initHeroImageFlip's ScrollTrigger uses for the grow.
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
    const percent = (progress - 0.5) * speed * 20;

    photo.style.transform = `scale(1.2) translateY(${percent.toFixed(2)}%)`;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      inView = entry.isIntersecting;
      if (inView) onScroll();
    });
  });

  observer.observe(band);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

/* ==========================================================================
   Unleashed — Sticker magnetic pull
   Stickers stay still until the cursor comes near, then pull toward it,
   easing back to rest when it moves away. Sets the --magnet-x/--magnet-y
   custom properties consumed by each sticker's transform in hero.css.
   ========================================================================== */

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
