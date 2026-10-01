import { prefersReducedMotion } from './utils';

export function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const viewport = root.querySelector('[class$="__viewport"]') || root.children[0];
    const list = viewport?.querySelector('[class$="__list"]') || viewport?.firstElementChild;
    const prev = root.querySelector('[data-carousel-prev]');
    const next = root.querySelector('[data-carousel-next]');

    if (!viewport || !list) return;

    let index = 0;
    const reduceMotion = prefersReducedMotion();
    const label = root.getAttribute('aria-label') || 'carousel';

    const status = document.createElement('div');
    status.className = 'visually-hidden';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    root.appendChild(status);

    const getStep = () => {
      const item = list.children[0];
      if (!item) return viewport.clientWidth;
      const styles = window.getComputedStyle(list);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return item.getBoundingClientRect().width + gap;
    };

    const maxIndex = () => {
      const step = getStep();
      if (!step) return 0;
      const visible = Math.max(1, Math.floor(viewport.clientWidth / step));
      return Math.max(0, list.children.length - visible);
    };

    const announce = () => {
      const total = maxIndex() + 1;
      status.textContent = `${label}: slide ${index + 1} of ${total}`;
    };

    const updateControls = () => {
      const atStart = index <= 0;
      const atEnd = index >= maxIndex();
      if (prev) prev.disabled = atStart;
      if (next) next.disabled = atEnd;
    };

    const render = ({ silent = false } = {}) => {
      index = Math.min(Math.max(index, 0), maxIndex());
      list.style.transition = reduceMotion ? 'none' : '';
      list.style.transform = `translate3d(${-index * getStep()}px, 0, 0)`;
      updateControls();
      if (!silent) announce();
    };

    prev?.addEventListener('click', () => {
      index -= 1;
      render();
    });

    next?.addEventListener('click', () => {
      index += 1;
      render();
    });

    root.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      event.preventDefault();
      index += event.key === 'ArrowRight' ? 1 : -1;
      render();
    });

    let startX = 0;
    let currentX = 0;
    let dragging = false;
    let base = 0;

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      currentX = startX;
      base = index * getStep();
      list.style.transition = 'none';
      viewport.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!dragging) return;
      currentX = event.clientX;
      const delta = currentX - startX;
      list.style.transform = `translate3d(${-(base - delta)}px, 0, 0)`;
    };

    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      list.style.transition = reduceMotion ? 'none' : '';
      const delta = currentX - startX;
      if (Math.abs(delta) > 40) {
        index += delta < 0 ? 1 : -1;
      }
      render();
    };

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('resize', () => render({ silent: true }));
    render({ silent: true });
  });
}
