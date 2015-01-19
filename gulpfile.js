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
var to5ify = require("6to5ify");
var runSequence = require('run-sequence');  // Temporary solution until Gulp 4
                                            // https://github.com/gulpjs/gulp/issues/355

var reload = browserSync.reload;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('clean', function (done) {
  require('del')(['build'], done);
});

var svgoConfig;
gulp.task('get-svgo-config', function(done) {
  svgoConfig = JSON.parse(fs.readFileSync("./src/config.json"));
  svgoConfig.plugins.forEach(function(plugin) {
    plugin.active = require('svgo/plugins/' + plugin.id).active;
  });
  done();
});

gulp.task('copy', [
  'copy:css',
  'copy:html',
  'copy:js',
  'copy:misc'
]);

gulp.task('copy:css', function () {
  return gulp.src('src/css/all.scss')
    .pipe(plugins.rubySass({ style: 'compressed' }))
    .pipe(gulp.dest('build/css'))
    .pipe(plugins.filter('**/*.css'))
    .pipe(reload({stream: true}));
});

gulp.task('copy:html', ['get-svgo-config'], function () {
  return gulp.src([
    // Copy all `.html` files
    'src/*.html',
  ])
  .pipe(plugins.swig({
    defaults: { cache: false },
    data: svgoConfig
  }))
  .pipe(plugins.htmlmin({
    // In-depth information about the options:
    // https://github.com/kangax/html-minifier#options-quick-reference
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    // Prevent html-minifier from breaking the SVGs
    // https://github.com/kangax/html-minifier/issues/285
    keepClosingSlash: true,
    caseSensitive: true
  })).pipe(gulp.dest('build'))
    .pipe(reload({stream: true}));
});

gulp.task('copy:misc', function () {
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

function createBundler(src) {
  var b;

  if (plugins.util.env.production) {
    b = browserify();
  }
  else {
    b = browserify({
      cache: {}, packageCache: {}, fullPaths: true,
      debug: true
    });
  }

  b.transform(to5ify.configure({
    experimental: true
  }));

  if (plugins.util.env.production) {
    b.transform({
      global: true
    }, 'uglifyify');
  }

  b.add(src);
  return b;
}

function bundle(bundler, outputFile) {
  return bundler.bundle()
    // log errors if they happen
    .on('error', plugins.util.log.bind(plugins.util, 'Browserify Error'))
    .pipe(source(outputFile))
    .pipe(buffer())
    .pipe(plugins.sourcemaps.init({ loadMaps: true })) // loads map from browserify file
    .pipe(plugins.sourcemaps.write('./')) // writes .map file
    .pipe(plugins.size({ gzip: true, title: outputFile }))
    .pipe(gulp.dest('build/js'))
    .pipe(reload({ stream: true }));
}

var bundlers = {
  'page.js': createBundler('./src/js/page/index.js'),
  'svgo-worker.js': createBundler('./src/js/svgo-worker/index.js'),
  'gzip-worker.js': createBundler('./src/js/gzip-worker/index.js'),
  'promise-polyfill.js': createBundler('./src/js/promise-polyfill/index.js')
};

gulp.task('copy:js', function () {
  return mergeStream.apply(null,
    Object.keys(bundlers).map(function(key) {
      return bundle(bundlers[key], key);
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


gulp.task('watch', function () {
  gulp.watch(['src/**/*.scss'], ['copy:css']);
  gulp.watch(['src/*.html', 'src/plugin-data.json'], ['copy:html']);
  gulp.watch(['src/img/**', 'src/demos/**'], ['copy:misc', reload]);

  Object.keys(bundlers).forEach(function(key) {
    var watchifyBundler = watchify(bundlers[key]);
    watchifyBundler.on('update', function() {
      return bundle(watchifyBundler, key);
    });
    bundle(watchifyBundler, key);
  });
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('build', function (done) {
  runSequence('clean', 'copy', done);
});

gulp.task('default', ['build']);

gulp.task('serve', function (done) {
  runSequence( 'build', ['browser-sync', 'watch'], done);
});
