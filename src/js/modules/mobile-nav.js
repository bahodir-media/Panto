function mobileNav() {
	// Mobile nav button
	const navBtnOpen = document.querySelector('#open-mobile-nav-btn');
	const navBtnClose = document.querySelector('#close-mobile-nav-btn');
	const nav = document.querySelector('.mobile-nav-wrapper');

	navBtnOpen.onclick = function () {
		nav.classList.toggle('mobile-nav-wrapper--open');
		document.body.classList.add('no-scroll');
	};

	navBtnClose.onclick = function () {
		nav.classList.remove('mobile-nav-wrapper--open');
		document.body.classList.remove('no-scroll');
	};
}

export default mobileNav;