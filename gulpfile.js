var fs = require('fs');

var browserSync = require('browser-sync');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var mergeStream = require('merge-stream');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var uglifyify = require('uglifyify');
var babelify = require("babelify");
var assign = require('lodash/object/assign');
var runSequence = require('run-sequence');  // Temporary solution until Gulp 4
                                            // https://github.com/gulpjs/gulp/issues/355

var reload = browserSync.reload;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('clean', function (done) {
  require('del')(['build'], done);
});

var pageData;
gulp.task('get-page-data', function(done) {
  pageData = JSON.parse(fs.readFileSync("./src/config.json"));
  pageData.changelog = JSON.parse(fs.readFileSync("./src/changelog.json"));
  pageData.plugins.forEach(function(plugin) {
    plugin.active = require('svgo/plugins/' + plugin.id).active;
  });
  done();
});

gulp.task('css', function () {
  return gulp.src('src/css/*.scss')
    .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({ outputStyle: 'compressed' }))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('build/css/'))
    .pipe(plugins.filter('**/*.css'))
    .pipe(reload({stream: true}));
});

gulp.task('html', ['get-page-data', 'css'], function () {
  return gulp.src([
    // Copy all `.html` files
    'src/*.html',
  ])
  .pipe(plugins.swig({
    defaults: { cache: false },
    data: pageData
  }))
  .pipe(plugins.htmlmin({
    removeComments: true,
    removeCommentsFromCDATA: true,
    removeCDATASectionsFromCDATA: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeRedundantAttributes: true,
    minifyJS: true
  })).pipe(gulp.dest('build'))
    .pipe(reload({stream: true}));
});

gulp.task('copy', function () {
  return gulp.src([
    // Copy all files
    'src/**',
    // Exclude the following files
    // (other tasks will handle the copying of these files)
    '!src/*.html',
    '!src/{css,css/**}',
    '!src/{js,js/**}'
  ]).pipe(gulp.dest('build'));
});

function createBundle(src) {
  var customOpts = {
    entries: [src],
    debug: true
  };
  var opts = assign({}, watchify.args, customOpts);
  var b;

  // this is a quick hack. Figure out what's really happening
  if (plugins.util.env.production) {
    b = browserify(opts);
  }
  else {
    b = watchify(browserify(opts));
  }

  b.transform(babelify.configure({
    stage: 1
  }));

  if (plugins.util.env.production) {
    b.transform({
      global: true
    }, 'uglifyify');
  }

  b.on('log', plugins.util.log);
  return b;
}

function bundle(b, outputPath) {
  var splitPath = outputPath.split('/');
  var outputFile = splitPath[splitPath.length - 1];
  var outputDir = splitPath.slice(0, -1).join('/');

  return b.bundle()
    // log errors if they happen
    .on('error', plugins.util.log.bind(plugins.util, 'Browserify Error'))
    .pipe(source(outputFile))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(plugins.sourcemaps.init({loadMaps: true})) // loads map from browserify file
       // Add transformation tasks to the pipeline here.
    .pipe(plugins.sourcemaps.write('./')) // writes .map file
    .pipe(plugins.size({ gzip: true, title: outputFile }))
    .pipe(gulp.dest('build/' + outputDir))
    .pipe(reload({ stream: true }));
}

var jsBundles = {
  'js/page.js': createBundle('./src/js/page/index.js'),
  'js/svgo-worker.js': createBundle('./src/js/svgo-worker/index.js'),
  'js/gzip-worker.js': createBundle('./src/js/gzip-worker/index.js'),
  'js/prism-worker.js': createBundle('./src/js/prism-worker/index.js'),
  'js/promise-polyfill.js': createBundle('./src/js/promise-polyfill/index.js'),
  'js/fastclick.js': createBundle('./src/js/fastclick/index.js'),
  'sw.js': plugins.util.env['disable-sw'] ? createBundle('./src/js/sw-null/index.js') : createBundle('./src/js/sw/index.js')
};

gulp.task('js', function() {
  return mergeStream.apply(null,
    Object.keys(jsBundles).map(function(key) {
      return bundle(jsBundles[key], key);
    })
  );
});

gulp.task('browser-sync', function() {
  browserSync({
    notify: false,
    port: 8000,
    server: "build",
    open: false
  });
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*.scss'], ['css']);
  gulp.watch(['src/*.html', 'src/plugin-data.json', 'src/changelog.json'], ['copy', 'html']);

  Object.keys(jsBundles).forEach(function(key) {
    var b = jsBundles[key];
    b.on('update', function() {
      return bundle(b, key);
    });
  });
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('build', function (done) {
  runSequence('clean', ['copy', 'html', 'js', 'css'], done);
});

gulp.task('default', ['build']);

gulp.task('serve', function (done) {
  runSequence( 'build', ['browser-sync', 'watch'], done);
});
