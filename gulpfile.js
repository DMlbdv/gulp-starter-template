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
  gulp.watch('scripts/src/**/*.js', ['scripts']);
  gulp.watch(['*.html', 'scripts/main.js'], ['browser-reload']);
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

// Takes main.scss, add the prefixes and set the compiled file in the css folder.
gulp.task('styles', function () {
  gulp.src('_scss/main.scss')
    .pipe(plugins.sass({
      includePaths: ['_scss'],
      onError: browserSyncErrorHandler
    }))
    .pipe(plugins.autoprefixer(['last 3 versions', '> 1%'], { cascade: true }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({stream: true}));
});

// Concat the scripts in the src folder.
gulp.task('scripts', function () {
  gulp
    .src(['scripts/src/**/*.js'])
    .pipe(plugins.concat('main.js'))
    .pipe(plugins.ngAnnotate()).on('error', browserSyncErrorHandler)
    .pipe(gulp.dest('scripts/'));
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

  plugins.browserSync.notify(message);
  console.log(message);
  return true;
}
