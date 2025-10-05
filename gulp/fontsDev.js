const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const fs = require('fs');
const gulp = require('gulp');
const fonter = require('gulp-fonter-fix');
const ttf2woff2 = require('gulp-ttf2woff2');

const srcFolder = './src';
const destFolder = './build';

// Convert .otf → .ttf
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

// Convert .ttf → .woff & .woff2 (with subfolder support)
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

// Auto-generate SCSS font includes
gulp.task('fontsStyle', (done) => {
	let fontsFile = `${srcFolder}/scss/base/_fontsAutoGen.scss`;

	fs.readdir(`${destFolder}/fonts/`, function (err, fontsFolders) {
		if (!fontsFolders) return done();

		// Recursive read helper
		function readFonts(dir) {
			let files = [];
			fs.readdirSync(dir).forEach((item) => {
				let fullPath = `${dir}/${item}`;
				if (fs.lstatSync(fullPath).isDirectory()) {
					files = files.concat(readFonts(fullPath));
				} else if (/\.(woff2|woff)$/i.test(item)) {
					files.push(fullPath.replace(`${destFolder}/fonts/`, ''));
				}
			});
			return files;
		}

		let allFonts = readFonts(`${destFolder}/fonts`);
		fs.writeFileSync(fontsFile, '');

		let addedFonts = new Set();

		allFonts.forEach((fontPath) => {
			let fontFileName = fontPath.split('/').pop().split('.')[0];
			if (addedFonts.has(fontFileName)) return;
			addedFonts.add(fontFileName);

			let fontName = fontFileName.split('-')[0] || fontFileName;
			let fontWeight = fontFileName.split('-')[1] || 'regular';

			const weightMap = {
				thin: 100,
				extralight: 200,
				light: 300,
				regular: 400,
				medium: 500,
				semibold: 600,
				bold: 700,
				extrabold: 800,
				heavy: 800,
				black: 900,
			};

			fontWeight = weightMap[fontWeight.toLowerCase()] || 400;

			fs.appendFileSync(
				fontsFile,
				`@font-face {\n\tfont-family: '${fontName}';\n\tfont-display: swap;\n\tsrc: url("../fonts/${fontPath.replace(
					/\\/g,
					'/'
				)}.woff2") format("woff2"), url("../fonts/${fontPath.replace(
					/\\/g,
					'/'
				)}.woff") format("woff");\n\tfont-weight: ${fontWeight};\n\tfont-style: normal;\n}\n\n`
			);
		});

		done();
	});
});

// Combined font build task
gulp.task('fontsDev', gulp.series('otfToTtf', 'ttfToWoff', 'fontsStyle'));