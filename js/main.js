import './scroll.js';
import './cursor.js';
import { initHeroImageFlip, initHeroCondensedWidget, initHeroQuoteModal, initHeroParallax } from './sections/hero.js';
import { initPageCards } from './sections/page-cards.js';
import { initCtaMagneticStickers } from './sections/cta.js';

initHeroImageFlip();
initHeroCondensedWidget();
initHeroQuoteModal();
initHeroParallax(0.4);
initPageCards();
initCtaMagneticStickers();
