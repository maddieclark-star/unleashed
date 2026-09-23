/* ==========================================================================
   Unleashed — Custom cursor
   Replaces the native pointer sitewide with the paw print icon. Hotspot
   (top-centre of the paw shape) is aligned via a static percentage
   transform, so tracking only ever touches `transform` — no layout reflow.
   ========================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  document.documentElement.classList.add('custom-cursor-active');

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.innerHTML = '<img src="assets/icons/paw-print-cursor.svg" alt="" />';
  document.body.appendChild(cursor);

  const setPosition = (x, y) => {
    cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -6.69%)`;
  };

  window.addEventListener('mousemove', (event) => {
    if (cursor.style.opacity !== '1') cursor.style.opacity = '1';
    setPosition(event.clientX, event.clientY);
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
}
