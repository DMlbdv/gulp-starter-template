var gulp = require('gulp');
var browserSync = require('browser-sync');
var plugins = require('gulp-load-plugins')({ camelize: true });

// Main Tasks
// ---------------------------------------------------
gulp.task('default', ['watch']);
gulp.task('watch', ['browser-sync', 'watch-files']);
gulp.task('build', ['styles', 'scripts']);


// Watch
// ---------------------------------------------------
gulp.task('watch-files', function () {
  gulp.watch('_scss/**/*', ['styles']);
  gulp.watch('scripts/**/*.js', ['scripts']);
  gulp.watch(['*.html', 'scripts/build/bundle.js'], ['browser-reload']);
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

// TODO: add production version
// Takes main.scss, add the prefixes and set the compiled file in the css folder.
gulp.task('styles', function () {
  gulp.src('_scss/main.scss')
    // Sass with sourcemaps
    .pipe(plugins.sass({
      onError: browserSyncErrorHandler,
      sourceComments: 'map',
      sourceMap: true
    }))
    .pipe(plugins.sourcemaps.init({loadMaps: true}))
    .pipe(plugins.autoprefixer(['last 3 versions', '> 1%'], { cascade: true }))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('css'))
    .pipe(plugins.filter('**/*.css')) // Only inject css files to the browser
    .pipe(browserSync.reload({stream: true}));
});

// TODO: Add production flag using args and production version
// Concat the scripts in the src folder.
gulp.task('scripts', function () {
  gulp.src(['scripts/main.js'])
    .pipe(plugins.browserify({
      //insertGlobals: true,
      debug: !gulp.env.production
    }))
    .pipe(plugins.rename('bundle.js'))
    //.pipe(plugins.ngAnnotate()).on('error', browserSyncErrorHandler)
    .pipe(gulp.dest('scripts/build'));
});


// Utils
// -----------------------------------
/**
 * Handler for errors. Shows the notification in the browser and the console.
 *
 * @param {Object|String} e
 * @returns {boolean}
 */
 function browserSyncErrorHandler(e) {
  var message = null;

  if (typeof e === 'object') message = e.message;
  if (typeof e === 'string') message = e;

  browserSync.notify(message);
  console.log(message);
  return true;
}
