// modules/toTop.js
export default function toTop() {

	let headerHeight = document.querySelector('header').offsetHeight;
	let toTop = document.querySelector('.totop');
	let prevScroll = window.pageYOffset;
	window.onscroll = function () {
		let currentScroll = window.pageYOffset;
		let headerNav = document.querySelector('.header');
		if (headerHeight > prevScroll) {
			headerNav.classList.remove('header__fixed');
			toTop.style.display = 'none';
		} else if (prevScroll > currentScroll) {
			headerNav.classList.add('header__fixed');
			headerNav.style.top = "0";
			toTop.style.display = 'inline-flex';
		} else {
			headerNav.classList.remove('header__fixed');
			headerNav.style.top = "-200px";
			toTop.style.display = 'inline-flex';
		}
		prevScroll = currentScroll;
	}

	toTop.addEventListener('click', function () {
		document.documentElement.scrollTop = 0;
	})
}