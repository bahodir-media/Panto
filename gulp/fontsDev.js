const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const fs = require('fs');
const gulp = require('gulp');
const fonter = require('gulp-fonter-fix');
const ttf2woff2 = require('gulp-ttf2woff2');

const srcFolder = './src';
const destFolder = './build';

// ---------- Convert .otf → .ttf ----------
gulp.task('otfToTtf', () => {
	return gulp
		.src(`${srcFolder}/fonts/**/*.otf`, {})
		.pipe(
			fonter({
				formats: ['ttf'],
			})
		)
		.pipe(gulp.dest(`${srcFolder}/fonts/`))
		.pipe(
			plumber(
				notify.onError({
					title: 'FONTS',
					message: 'Error: <%= error.message %>. File: <%= file.relative %>!',
				})
			)
		);
});

// ---------- Convert .ttf → .woff & .woff2 ----------
gulp.task('ttfToWoff', () => {
	return gulp
		.src(`${srcFolder}/fonts/**/*.ttf`, { base: `${srcFolder}/fonts/` })
		// Convert to .woff
		.pipe(
			fonter({
				formats: ['woff'],
			})
		)
		.pipe(gulp.dest(`${destFolder}/fonts/`))
		// Convert to .woff2
		.pipe(gulp.src(`${srcFolder}/fonts/**/*.ttf`, { base: `${srcFolder}/fonts/` }))
		.pipe(ttf2woff2())
		.pipe(gulp.dest(`${destFolder}/fonts/`))
		.pipe(
			plumber(
				notify.onError({
					title: 'FONTS',
					message: 'Error: <%= error.message %>',
				})
			)
		);
});

// ---------- Auto-generate SCSS @font-face ----------
gulp.task('fontsStyle', (done) => {
	const fontsFile = `${srcFolder}/scss/base/_fontsAutoGen.scss`;

	if (!fs.existsSync(`${destFolder}/fonts/`)) return done();

	// Recursive reader
	function readFonts(dir) {
		let files = [];
		fs.readdirSync(dir).forEach((item) => {
			const fullPath = `${dir}/${item}`;
			if (fs.lstatSync(fullPath).isDirectory()) {
				files = files.concat(readFonts(fullPath));
			} else if (/\.(woff2|woff)$/i.test(item)) {
				files.push(fullPath.replace(`${destFolder}/fonts/`, ''));
			}
		});
		return files;
	}

	const allFonts = readFonts(`${destFolder}/fonts`);
	if (!allFonts.length) return done();

	fs.writeFileSync(fontsFile, '');

	const addedFonts = new Set();

	allFonts.forEach((fontPath) => {
		// remove extension
		const fileBase = fontPath.replace(/\.(woff2|woff)$/i, '');
		const fontFileName = fileBase.split('/').pop(); // e.g. Gilroy-BoldItalic
		if (addedFonts.has(fontFileName)) return;
		addedFonts.add(fontFileName);

		let fontName = fontFileName.split('-')[0] || fontFileName;
		let descriptor = fontFileName.replace(fontName, '').replace(/^-/, '').toLowerCase();

		// detect italic / oblique style
		let fontStyle = 'normal';
		if (/italic|oblique/.test(descriptor)) {
			fontStyle = 'italic';
			descriptor = descriptor.replace(/italic|oblique/, '');
		}

		// map weights
		const weightMap = {
			thin: 100,
			extralight: 200,
			ultralight: 200,
			light: 300,
			regular: 400,
			normal: 400,
			medium: 500,
			semibold: 600,
			demibold: 600,
			bold: 700,
			extrabold: 800,
			ultrabold: 800,
			heavy: 800,
			black: 900,
		};

		let weightKey = descriptor.replace(/[^a-z]/g, '');
		let fontWeight = weightMap[weightKey] || 400;

		const srcWoff2 = `../fonts/${fileBase}.woff2`.replace(/\\/g, '/');
		const srcWoff = `../fonts/${fileBase}.woff`.replace(/\\/g, '/');

		fs.appendFileSync(
			fontsFile,
			`@font-face {\n` +
			`\tfont-family: '${fontName}';\n` +
			`\tfont-display: swap;\n` +
			`\tsrc: url("${srcWoff2}") format("woff2"), url("${srcWoff}") format("woff");\n` +
			`\tfont-weight: ${fontWeight};\n` +
			`\tfont-style: ${fontStyle};\n` +
			`}\n\n`
		);
	});

	done();
});

// ---------- Combined Task ----------
gulp.task('fontsDev', gulp.series('otfToTtf', 'ttfToWoff', 'fontsStyle'));