import { prefersReducedMotion } from './utils';

export function initParallax() {
  if (prefersReducedMotion()) return;

  const layers = document.querySelectorAll('[data-parallax]');
  if (!layers.length) return;

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;

    layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.parallaxSpeed || '0.2');
      const rect = layer.getBoundingClientRect();
      const offsetTop = scrollY + rect.top;
      const relative = scrollY - offsetTop;
      const translate = relative * speed;
      layer.style.transform = `translate3d(0, ${translate}px, 0)`;
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}
