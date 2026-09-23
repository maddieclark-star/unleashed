import './scroll.js';
import './cursor.js';
import { initHeroImageFlip, initHeroWidgetReveal, initHeroParallax } from './sections/hero.js';
import { initPageCards } from './sections/page-cards.js';

initHeroImageFlip();
initHeroWidgetReveal();
initHeroParallax(0.4);
initPageCards();
