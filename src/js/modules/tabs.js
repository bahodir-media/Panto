function productTabs(swiper) {
	const tabsBtns = document.querySelectorAll('[data-tab]');
	const tabsProducts = document.querySelectorAll('[data-tab-value]');

	for (let btn of tabsBtns) {

		btn.addEventListener('click', function () {

			// remove active class from all buttons
			for (let btn of tabsBtns) {
				btn.classList.remove('tab-controls__btn--active');
			}
			// add active class to clicked
			this.classList.add('tab-controls__btn--active');

			for (let product of tabsProducts) {

				if (this.dataset.tab === 'all') {
					product.classList.remove('none');
				} else {
					// show correct products
					if (product.dataset.tabValue === this.dataset.tab) {
						product.classList.remove('none');
					} else {
						//hide all products
						product.classList.add('none');
					}
				}



			}

			if (swiper) swiper.update();
		})
	}
}

export default productTabs;