var gulp = require('gulp');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var plugins = require('gulp-load-plugins')({ camelize: true });

var paths = {
  reload: {
    watch: ['*.html']
  },

  scss: {
    src: ['_scss/**/[!_]*.scss'],
    watch: '_scss/**/*',
    dest: 'css'
  },

  js: {
    src: ['./scripts/main.js'],
    compiled: 'bundle.js',
    minified: 'bundle.min.js',
    dest: 'build'
  }
};

// Main Tasks
// ---------------------------------------------------
gulp.task('default', ['watch']);
gulp.task('watch', ['browser-sync', 'watch-files', 'styles', 'scripts']);
gulp.task('build', ['styles:production', 'scripts:production']);

// Watch
// ---------------------------------------------------
gulp.task('watch-files', function () {
  gulp.watch(paths.scss.watch, ['styles']);
  gulp.watch(paths.reload.watch, ['browser-reload']);
});


// Sub Tasks
// -----------------------------------
// Browser Sync
gulp.task('browser-sync', ['styles', 'scripts'], function () {
  browserSync({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('browser-reload', function () {
  browserSync.reload();
});

/**
 * Takes main.scss, add the prefixes and set the compiled file in the css folder.
 */
function compileStyles(develop) {
  return gulp.src(paths.scss.src)
    // Sass with sourcemaps
    .pipe(plugins.sass({
      onError: handleErrors,
      sourceComments: 'map',
      sourceMap: true,
      includePaths: ['bower_components/bootstrap-sass/assets/stylesheets']
    }))
    .pipe(plugins.sourcemaps.init({loadMaps: true}))
    .pipe(plugins.autoprefixer(['last 3 versions', '> 1%'], { cascade: true }));
}

gulp.task('styles', function () {
  compileStyles()
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(plugins.filter('**/*.css')) // Only inject css files to the browser
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('styles:production', function () {
  compileStyles()
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(plugins.minifyCss())
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest(paths.scss.dest));
});


// Concat the scripts in the src folder.
gulp.task('scripts', function () {
  compileScripts(true);
});


// Utils
// -----------------------------------
/**
 * Handles scripts task for development and production.
 *
 * @param watch
 * @returns {*}
 */
function compileScripts(watch) {
  // Create the browserify instance
  var bundler = browserify({
    // THIS IS REQUIRED
    cache: {},
    packageCache: {},
    fullPaths: true,
    // DEBUG MODE: Creates the sourcemaps. TODO: set false in production
    debug: true,
    entries: ['./scripts/main.js'] // TODO: set this in a object with all the paths
  });

  // Use watchify if watch is true and rerun rebundle on update
  if (watch) {
    bundler = watchify(bundler);
    bundler.transform(babelify); // 6to5 compiler

    bundler.on('update', function () {
      rebundle();
      plugins.util.log('Rebundle...')
    });
  }

  function rebundle() {
    return bundler
      .bundle()
      .on('error', handleErrors)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('./scripts/build')) // Set the destiny
      .pipe(browserSync.reload({stream: true})); // Reload browsers!!!
  }

  return rebundle();
}


/**
 * Handler for errors. Shows the notification in the browser and the console.
 *
 * @param {Object|String} e
 * @returns {boolean}
 */
 function handleErrors(e) {
  var message = null;

  if (typeof e === 'object') message = e.message;
  if (typeof e === 'string') message = e;

  browserSync.notify(message);
  console.log(message);
  return true;
}
