const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const fs = require('fs');
const gulp = require('gulp');
const fonter = require('gulp-fonter-fix');
const ttf2woff2 = require('gulp-ttf2woff2');

const srcFolder = './src';
const destFolder = './docs';

// ----------------------------
// 1. OTF → TTF
// ----------------------------
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

// ----------------------------
// 2. TTF → WOFF + WOFF2 (with subfolders)
// ----------------------------
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

// ----------------------------
// 3. Generate SCSS font includes (recursive, nested support)
// ----------------------------
gulp.task('fontsStyle', (done) => {
	const fontsFile = `${srcFolder}/scss/base/_fontsAutoGen.scss`;
	const fontsDir = `${destFolder}/fonts`;

	if (!fs.existsSync(fontsDir)) return done();

	// Recursively find font files
	function getAllFonts(dir) {
		let files = [];
		fs.readdirSync(dir).forEach((item) => {
			const fullPath = `${dir}/${item}`;
			if (fs.lstatSync(fullPath).isDirectory()) {
				files = files.concat(getAllFonts(fullPath));
			} else if (/\.(woff2|woff)$/i.test(item)) {
				files.push(fullPath.replace(`${fontsDir}/`, ''));
			}
		});
		return files;
	}

	const allFonts = getAllFonts(fontsDir);

	fs.writeFileSync(fontsFile, ''); // clear file
	const added = new Set();

	allFonts.forEach((fontPath) => {
		const fileName = fontPath.split('/').pop().split('.')[0];
		if (added.has(fileName)) return; // skip duplicates
		added.add(fileName);

		let [fontName, fontWeight] = fileName.split('-');
		if (!fontWeight) fontWeight = 'regular';

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
		const weight = weightMap[fontWeight.toLowerCase()] || 400;

		fs.appendFileSync(
			fontsFile,
			`@font-face {\n\tfont-family: '${fontName}';\n\tfont-display: swap;\n\tsrc: url("../fonts/${fontPath.replace(
				/\\/g,
				'/'
			)}.woff2") format("woff2"), url("../fonts/${fontPath.replace(
				/\\/g,
				'/'
			)}.woff") format("woff");\n\tfont-weight: ${weight};\n\tfont-style: normal;\n}\n\n`
		);
	});

	done();
});

// ----------------------------
// 4. Combined task
// ----------------------------
gulp.task('fontsDocs', gulp.series('otfToTtf', 'ttfToWoff', 'fontsStyle'));
