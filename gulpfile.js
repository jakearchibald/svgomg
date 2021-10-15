const fs = require('fs/promises');
const path = require('path');
const sirv = require('sirv-cli');
const svgoPkg = require('svgo/package.json');
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

const readJSON = async path => {
  const content = await fs.readFile(path, 'utf-8');
  return JSON.parse(content);
};

function css() {
  const boundSass = gulpSass(sass);
  return gulp.src('src/css/*.scss')
    .pipe(gulpSourcemaps.init())
    .pipe(boundSass.sync({ outputStyle: 'compressed' }).on('error', boundSass.logError))
    .pipe(gulpSourcemaps.write('./'))
    .pipe(gulp.dest('build/'));
}

async function html() {
  const [config, changelog, headCSS] = await Promise.all([
    readJSON(path.join(__dirname, 'src', 'config.json')),
    readJSON(path.join(__dirname, 'src', 'changelog.json')),
    fs.readFile(path.join(__dirname, 'build', 'head.css'), 'utf-8')
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
      minifyCSS: false,
      minifyJS: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      sortAttributes: true,
      sortClassName: true
    }))
    .pipe(gulp.dest('build'));
}

const rollupCaches = new Map();

async function js(entry, outputPath) {
  const name = path.basename(path.dirname(entry));
  const changelog = await readJSON(path.join(__dirname, 'src', 'changelog.json'));
  const bundle = await rollup.rollup({
    cache: rollupCaches.get(entry),
    input: `src/${entry}`,
    plugins: [
      rollupReplace({
        preventAssignment: true,
        SVGOMG_VERSION: JSON.stringify(changelog[0].version),
      }),
      rollupResolve({ browser: true }),
      rollupCommon({ include: /node_modules/ }),
      rollupTerser()
    ]
  });
  rollupCaches.set(entry, bundle.cache);
  await bundle.write({
    sourcemap: true,
    format: 'iife',
    file: `build/${outputPath}/${name}.js`
  });
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
    'src/{.well-known,imgs,test-svgs,fonts}/**',
    // Exclude the test-svgs files except for `car-lite.svg`
    // which is used in the demo
    '!src/test-svgs/!(car-lite.svg)',
    'src/*.json'
  ]).pipe(gulp.dest('build'));
}

function clean() {
  return fs.rm('build', { force: true, recursive: true });
}

const mainBuild = gulp.parallel(
  gulp.series(css, html),
  allJs,
  copy
);

function watch() {
  gulp.watch(['src/css/**/*.scss'], gulp.series(css, html));
  gulp.watch(['src/js/**/*.js'], allJs);
  gulp.watch(['src/*.{html,json}', 'src/**/*.svg'], gulp.parallel(html, copy, allJs));
}

function serve() {
  sirv('build', {
    host: 'localhost',
    port: 8080,
    dev: true,
    clear: false
  });
}

exports.clean = clean;
exports.allJs = allJs;
exports.css = css;
exports.html = html;
exports.copy = copy;
exports.build = mainBuild;

exports['clean-build'] = gulp.series(
  clean,
  mainBuild
);

exports.dev = gulp.series(
  clean,
  mainBuild,
  gulp.parallel(
    watch,
    serve
  )
);
