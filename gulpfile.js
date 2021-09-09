const fs = require('fs/promises');
const path = require('path');
const svgoPkg = require('svgo/package.json');

const readJSON = async (path) => {
  const content = await fs.readFile(path, 'utf-8');
  return JSON.parse(content);
}

const sass = require('sass');
const gulp = require('gulp');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpSass = require('gulp-sass');
const gulpNunjucks = require('gulp-nunjucks');
const gulpHtmlmin = require('gulp-htmlmin');
const rollup = require('rollup');
const { nodeResolve: rollupResolve } = require('@rollup/plugin-node-resolve');
const rollupCommon = require('@rollup/plugin-commonjs');
const rollupReplace = require('@rollup/plugin-replace');
const { terser: rollupTerser } = require('rollup-plugin-terser');

function css() {
  const boundSass = gulpSass(sass)
  return gulp.src('src/css/*.scss', { sourcemaps: true })
    .pipe(boundSass.sync().on('error', boundSass.logError))
    .pipe(gulpSourcemaps.init())
    .pipe(boundSass({ outputStyle: 'compressed' }))
    .pipe(gulpSourcemaps.write('./'))
    .pipe(gulp.dest('build/css/'));
}


async function html() {
  const [config, changelog, headCSS] = await Promise.all([
    readJSON(`${__dirname}/src/config.json`),
    readJSON(`${__dirname}/src/changelog.json`),
    fs.readFile(`${__dirname}/build/css/head.css`)
  ]);

  return gulp.src('src/*.html')
    .pipe(gulpNunjucks.compile({
      plugins: config.plugins,
      headCSS,
      changelog,
      SVGO_VERSION: svgoPkg.version,
    }))
    .pipe(gulpHtmlmin({
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: false,
      collapseWhitespace: true,
      decodeEntities: true,
      minifyJS: true,
      removeAttributeQuotes: true,
      removeComments: true,
    }))
    .pipe(gulp.dest('build'));
}

const rollupCaches = new Map();

const rollupFixes = {
  name: 'rollup-fixes',
  transform(code, id) {
    if (id.endsWith('node_modules/prismjs/prism.js')) {
      return `${code}\nexport default Prism;`;
    }
  }
};

async function js(entry, outputPath) {
  const parsedPath = path.parse(entry);
  const name = /[^\/]+$/.exec(parsedPath.dir)[0];
  const changelog = await readJSON(`${__dirname}/src/changelog.json`);
  const bundle = await rollup.rollup({
    cache: rollupCaches.get(entry),
    input: `src/${entry}`,
    plugins: [
      rollupFixes,
      rollupReplace({
        preventAssignment: true,
        SVGOMG_VERSION: JSON.stringify(changelog[0].version),
      }),
      rollupResolve({ preferBuiltins: false, browser: true }),
      rollupCommon({ include: /node_modules/ }),
      rollupTerser()
    ]
  });
  rollupCaches.set(entry, bundle.cache);
  await bundle.write({
    sourcemap: true,
    format: 'iife',
    file: `build/${outputPath}/${name}.js`
  })
}

const allJs = gulp.parallel(
  js.bind(null, 'js/prism-worker/index.js', 'js/'),
  js.bind(null, 'js/gzip-worker/index.js', 'js/'),
  js.bind(null, 'js/svgo-worker/index.js', 'js/'),
  js.bind(null, 'js/sw/index.js', ''),
  js.bind(null, 'js/page/index.js', 'js/')
);

function copy() {
  return gulp.src([
    // Copy all files
    'src/**',
    // Include the .well-known folder
    'src/.**/*',
    // Exclude the following files
    // (other tasks will handle the copying of these files)
    '!src/*.html',
    '!src/{css,css/**}',
    '!src/{js,js/**}'
  ]).pipe(gulp.dest('build'));
}

function clean() {
  return fs.rm('build', { force: true, recursive: true });
}

module.exports.clean = clean;
module.exports.allJs = allJs;
module.exports.css = css;
module.exports.html = html;
module.exports.copy = copy;

const mainBuild = gulp.parallel(
  gulp.series(css, html),
  allJs,
  copy
);

module.exports['clean-build'] = gulp.series(
  clean,
  mainBuild
);

module.exports.build = gulp.series(
  mainBuild
);

module.exports.watch = gulp.series(module.exports.build, () => {
  gulp.watch(['src/css/**/*.scss'], gulp.series(css, html));
  gulp.watch(['src/js/**/*.js'], allJs);
  gulp.watch(['src/*.html', 'src/plugin-data.json', 'src/changelog.json'], gulp.parallel(html, copy, allJs));
});
