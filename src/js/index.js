//import mobileNav from './modules/mobile-nav.js';
// mobileNav();

//import preloader from './modules/preloader.js';
// preloader();

// import toTop from './modules/toTop.js';
// toTop(); 

import swiperFunc from './modules/swiper-slides.js';
const swiper = swiperFunc(); // store the instance

import productTabs from './modules/tabs.js';
productTabs(swiper); // pass it in

//import scrollReveal from './modules/scrollReveal.js';
//scrollReveal();

import { initHints } from './modules/hints.js';
initHints();

