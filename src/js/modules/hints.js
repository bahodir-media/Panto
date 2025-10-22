export function initHints() {
	const infoBtns = document.querySelectorAll('.info-dot');
	const infoHints = document.querySelectorAll('.info-hint');

	if (!infoBtns.length || !infoHints.length) return;

	// Click on hint buttons
	for (let btn of infoBtns) {
		btn.addEventListener('click', function (e) {
			e.stopPropagation();

			// Hide all other hints
			for (let hint of infoHints) {
				if (this.parentNode.querySelector('.info-hint') !== hint) {
					hint.classList.add('none');
				}
			}

			// Toggle current hint
			this.parentNode.querySelector('.info-hint').classList.toggle('none');
		});
	}

	// Close all hints on document click
	document.addEventListener('click', function () {
		for (let hint of infoHints) {
			hint.classList.add('none');
		}
	});

	// Prevent click bubbling on hints
	for (let hint of infoHints) {
		hint.addEventListener('click', (e) => e.stopPropagation());
	}
}
