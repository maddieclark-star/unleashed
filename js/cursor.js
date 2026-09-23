/* ==========================================================================
   Unleashed — Custom cursor
   Replaces the native pointer sitewide with the paw glyph. Hotspot
   (top-centre of the paw shape) is aligned via a static percentage
   transform, so tracking only ever touches `transform` — no layout reflow.
   The artwork and both hotspot offsets live in css/base.css.
   ========================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  document.documentElement.classList.add('custom-cursor-active');

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  const setPosition = (x, y) => {
    cursor.style.transform =
      `translate(${x}px, ${y}px) translate(var(--paw-hotspot-x), var(--paw-hotspot-y))`;
  };

  window.addEventListener('mousemove', (event) => {
    if (cursor.style.opacity !== '1') cursor.style.opacity = '1';
    setPosition(event.clientX, event.clientY);
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
}
