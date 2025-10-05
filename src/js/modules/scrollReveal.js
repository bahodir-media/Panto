import ScrollReveal from 'scrollreveal';

// Базовые настройки
ScrollReveal({
	distance: '60px',
	duration: 2800,
	// reset: true,
});

function scrollRevealFunc () {
	ScrollReveal().reveal(`.header, .partners`, {
		distance: '0px',
		opacity: 0,
	});

	ScrollReveal().reveal(`.class, .class`, {
		origin: 'top',
	});

	ScrollReveal().reveal(`.class, .class`, {
		origin: 'left',
	});

	ScrollReveal().reveal(
		`.class, .class`,
		{
			origin: 'right',
		}
	);

	ScrollReveal().reveal(`.class, .class`, {
		origin: 'bottom',
	});
}

export default scrollRevealFunc;