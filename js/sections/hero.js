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
  const band = document.querySelector('.hero__image-band');
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
