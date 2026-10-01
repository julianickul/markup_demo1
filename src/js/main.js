import '../scss/main.scss';
import { initScrollAnimations } from './scrollAnimations';
import { initParallax } from './parallax';
import { initCarousels } from './carousel';
import { initHeader, initHeroTabs, initFeaturedFilter } from './ui';

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroTabs();
  initFeaturedFilter();
  initScrollAnimations();
  initParallax();
  initCarousels();
});
