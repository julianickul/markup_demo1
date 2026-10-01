function getFocusable(root) {
  return [...root.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((el) => !el.hasAttribute('hidden') && el.offsetParent !== null);
}

export function initHeader() {
  const header = document.getElementById('header');
  const burger = document.querySelector('.site-header__burger');
  const nav = document.getElementById('main-nav');
  const main = document.getElementById('main');
  const footer = document.getElementById('footer');

  const onScroll = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  const isOpen = () => Boolean(nav?.classList.contains('active'));

  const setOpen = (open) => {
    burger?.classList.toggle('active', open);
    nav?.classList.toggle('active', open);
    burger?.setAttribute('aria-expanded', String(open));
    burger?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('overflow-hidden', open);
    main?.toggleAttribute('inert', open);
    footer?.toggleAttribute('inert', open);

    if (open) {
      const firstLink = nav?.querySelector('a');
      firstLink?.focus();
    }
  };

  burger?.addEventListener('click', () => {
    setOpen(!isOpen());
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992) setOpen(false);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      setOpen(false);
      burger?.focus();
      return;
    }

    if (event.key !== 'Tab' || !header || !burger) return;

    const focusables = getFocusable(header);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992 && isOpen()) {
      setOpen(false);
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initRadioGroup(selector, onChange) {
  const buttons = [...document.querySelectorAll(selector)];
  if (!buttons.length) return;

  const select = (btn, { focus = false } = {}) => {
    buttons.forEach((item) => {
      const on = item === btn;
      item.classList.toggle('is-active', on);
      item.setAttribute('aria-checked', String(on));
      item.tabIndex = on ? 0 : -1;
    });
    if (focus) btn.focus();
    onChange?.(btn);
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => select(btn));
    btn.addEventListener('keydown', (event) => {
      const index = buttons.indexOf(btn);
      const last = buttons.length - 1;
      let next = null;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        next = buttons[(index + 1) % buttons.length];
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        next = buttons[(index - 1 + buttons.length) % buttons.length];
      } else if (event.key === 'Home') {
        next = buttons[0];
      } else if (event.key === 'End') {
        next = buttons[last];
      }

      if (!next) return;
      event.preventDefault();
      select(next, { focus: true });
    });
  });
}

export function initHeroTabs() {
  initRadioGroup('.hero__tab');
}

export function initFeaturedFilter() {
  const cards = document.querySelectorAll('#featured-grid > [data-category]');
  const status = document.getElementById('featured-status');

  const applyFilter = (tab) => {
    const filter = tab.dataset.filter || 'all';
    let visible = 0;

    cards.forEach((card) => {
      const category = card.dataset.category;
      const show =
        filter === 'all' ||
        (filter === 'sale' && category === 'sale') ||
        (filter === 'rent' && category === 'rent') ||
        (filter === 'apartment' && true);
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (status) {
      status.textContent = `${visible} listing${visible === 1 ? '' : 's'} shown`;
    }
  };

  initRadioGroup('.featured__tab', applyFilter);
}
