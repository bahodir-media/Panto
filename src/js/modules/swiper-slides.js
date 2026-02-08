import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

function swiperFunc() {
	const swiper = new Swiper('.swiper', {
		slidesPerView: 1,
		spaceBetween: 42,
		loop: true,
		freeMode: true,
		navigation: {
			nextEl: '#sliderNext',
			prevEl: '#sliderPrev',
		},
		breakpoints: {
			600: {
				slidesPerView: 2,
				spaceBetween: 20,
			},
			920: {
				slidesPerView: 3,
				spaceBetween: 20,
			},
			1230: {
				slidesPerView: 4,
				spaceBetween: 42,
			}
		},
	});

	return swiper;
}

export default swiperFunc;