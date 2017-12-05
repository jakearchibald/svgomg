const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const readJSON = path => readFile(path, 'utf-8').then(s => JSON.parse(s));

const del = require('del');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rollup = require('rollup-stream');
const rollupResolve = require('rollup-plugin-node-resolve');
const rollupCommon = require('rollup-plugin-commonjs');
const rollupReplace = require('rollup-plugin-replace');
const rollupBuiltins = require('rollup-plugin-node-builtins');
const rollupBabili = require('rollup-plugin-babel-minify');
const rollupJson = require('rollup-plugin-json');


function css() {
  return gulp.src('src/css/*.scss', { sourcemaps: true })
    .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({ outputStyle: 'compressed' }))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('build/css/'))
    .pipe(plugins.filter('**/*.css'));
}

async function html() {
  const [pluginList, changelog, headCSS] = await Promise.all([
    readJSON(`${__dirname}/src/config.json`).then(config => {
      for (const plugin of config.plugins) {
        plugin.active = require('svgo/plugins/' + plugin.id).active;
      }
      return config.plugins;
    }),
    readJSON(`${__dirname}/src/changelog.json`),
    readFile(`${__dirname}/build/css/head.css`)
  ]);

  return gulp.src([
    'src/*.html',
  ]).pipe(plugins.nunjucks.compile({
    plugins: pluginList,
    headCSS,
    changelog
  }))
  .pipe(plugins.htmlmin({
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: false,
    collapseWhitespace: true,
    decodeEntities: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeComments: true,
  })).pipe(gulp.dest('build'));
}

const rollupCaches = new Map();

async function js(entry, outputPath) {
  const parsedPath = path.parse(entry);
  const name = /[^\/]+$/.exec(parsedPath.dir)[0];
  const changelog = await readJSON(`${__dirname}/src/changelog.json`);
  const cache = rollupCaches.get(entry);

  return rollup({
    cache,
    input: `src/${entry}`,
    sourcemap: true,
    format: 'iife',
    plugins: [
      rollupJson(),
      rollupReplace({
        SVGOMG_VERSION: JSON.stringify(changelog[0].version)
      }),
      rollupBuiltins(),
      rollupResolve({ preferBuiltins: true }),
      rollupCommon(),
      rollupBabili({ comments: false })
    ]
  }).on('error', plugins.util.log.bind(plugins.util, 'Rollup Error'))
    .on('bundle', bundle => rollupCaches.set(entry, bundle))
    .pipe(source(`index.js`, parsedPath.dir))
    .pipe(buffer())
    .pipe(plugins.sourcemaps.init({ loadMaps: true }))
    .pipe(plugins.rename(`${name}.js`))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(plugins.size({ gzip: true, title: name, showFiles: true }))
    .pipe(gulp.dest(`build/${outputPath}`));
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
    // Include the .well-know folder
    'src/.**/*',
    // Exclude the following files
    // (other tasks will handle the copying of these files)
    '!src/*.html',
    '!src/{css,css/**}',
    '!src/{js,js/**}'
  ]).pipe(gulp.dest('build'));
}

function clean() {
  return del('build');
}

module.exports.clean = clean;
module.exports.allJs = allJs;
module.exports.css = css;
module.exports.html = html;
module.exports.copy = copy;

module.exports.build = gulp.series(
  clean,
  gulp.parallel(
    gulp.series(css, html),
    allJs,
    copy
  )
);

module.exports.watch = gulp.series(module.exports.build, () => {
  gulp.watch(['src/css/**/*.scss'], gulp.series(css, html));
  gulp.watch(['src/js/**/*.js'], allJs);
  gulp.watch(['src/*.html', 'src/plugin-data.json', 'src/changelog.json'], gulp.parallel(html, copy, allJs));
});
