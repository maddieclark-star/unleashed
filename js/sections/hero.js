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
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
}

/* ==========================================================================
   Unleashed — Quote widget reveal
   Figma: 13295:31875 -> 13295:32002, the two frames after the grow finishes.
   The copy block (and the real widget with it) has scrolled away above; a
   mirror of the widget rises out from behind the expanded image's clipped
   bottom edge and comes to rest overlapping the photo.

   THE HOLD IS CSS, NOT ScrollTrigger's pin — see .hero__image-sticky in
   hero.css. pin:true sizes its spacer once at refresh, while the band is
   still collapsed, and the grow then makes the band 406px taller than the
   reserved space, so the USPs section rides up over the image and collides
   with the widget. Do not "simplify" this back to pin:true.

   That leaves this trigger as a pure scrub driver: it owns no layout, it
   only maps scroll distance onto the slide. The hold it scrubs against is
   the sticky wrapper's padding-bottom, so the two stay in step by both
   deriving from --hero-reveal-distance rather than from a number repeated
   in two files.

   Triggered off the WRAPPER, not the band. The band is the sticky element,
   and a stuck element reports its stuck position to getBoundingClientRect,
   which is not a stable thing to measure a start/end against. The wrapper
   never moves relative to the document and its top edge is the band's top
   edge (no padding-top), so the geometry is identical and the measurement
   is honest. The grow above is pointed at it for the same reason.

   ease:'none' for the same reason it is used on the Flip above: any other
   ease double-eases against the scrub and reads as lag, and the brand's
   overshoot has nowhere to go in a scrubbed animation anyway.
   ========================================================================== */

const FALLBACK_REVEAL_DISTANCE = 500;

function revealDistance(hero) {
  const declared = parseFloat(
    getComputedStyle(hero).getPropertyValue('--hero-reveal-distance')
  );
  return Number.isFinite(declared) ? declared : FALLBACK_REVEAL_DISTANCE;
}

export function initHeroWidgetReveal() {
  const hero = document.querySelector('.hero');
  const sticky = document.querySelector('[data-hero-sticky]');
  const slot = document.querySelector('[data-hero-widget-reveal]');

  if (!hero || !sticky || !slot) return;

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('[hero] GSAP/ScrollTrigger not loaded — skipping widget reveal.');
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // `y: 0` in BOTH states is load-bearing, not noise. GSAP reads the element's
  // existing computed transform as a matrix, so the parked translateY(100%) in
  // hero.css comes back as a resolved pixel y (200px), not as yPercent — and
  // then yPercent:100 stacks on top of it for 400px, double the slot height.
  // The widget parks twice as far down as it should and never fully arrives.
  // Declaring yPercent and y together makes GSAP the only author of the
  // transform, so the CSS value is a fallback and nothing more.
  gsap.fromTo(
    slot,
    { yPercent: 100, y: 0 },
    {
      yPercent: 0,
      y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: sticky,
        start: 'top top',
        // Matches the wrapper's reserved padding-bottom exactly, so the slide
        // finishes on the same scroll pixel the band stops sticking.
        end: () => `+=${revealDistance(hero)}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    }
  );
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
