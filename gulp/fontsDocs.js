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
	if (!allFonts.length) return done();

	fs.writeFileSync(fontsFile, ''); // clear file
	const added = new Set();

	allFonts.forEach((fontPath) => {
		// remove extension to avoid .woff.woff2 duplication
		const fileBase = fontPath.replace(/\.(woff2|woff)$/i, '');
		const fileName = fileBase.split('/').pop(); // e.g. Gilroy-BoldItalic
		if (added.has(fileName)) return;
		added.add(fileName);

		let fontName = fileName.split('-')[0] || fileName;
		let descriptor = fileName.replace(fontName, '').replace(/^-/, '').toLowerCase();

		// detect italic/oblique style
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

		const weightKey = descriptor.replace(/[^a-z]/g, '');
		const fontWeight = weightMap[weightKey] || 400;

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

// ----------------------------
// 4. Combined task
// ----------------------------
gulp.task('fontsDocs', gulp.series('otfToTtf', 'ttfToWoff', 'fontsStyle'));