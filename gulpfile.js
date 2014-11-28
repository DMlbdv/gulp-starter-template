var fs = require('graceful-fs');
var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var cssmin = require('gulp-minify-css');

/**
 * Handler for errors. Shows the notification in the browser and the console.
 *
 * @param {Object|String} e
 * @returns {boolean}
 */
var browserSyncErrorHandler = function (e) {
  var message = null;

  if (typeof e === 'object') message = e.message;
  if (typeof e === 'string') message = e;

  browserSync.notify(message);
  console.log(message);
  return true;
};

// Browser Sync
// ---------------------------------------------------
gulp.task('browser-sync', ['sass', 'scripts'], function () {
  browserSync({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('browser-reload', function () {
  browserSync.reload();
});

// Sass
// ---------------------------------------------------
// Takes main.scss, add the prefixes and set the compiled file in the css folder.
gulp.task('sass', function () {
  gulp.src('_scss/main.scss')
    .pipe(sass({
      includePaths: ['scss'],
      onError: browserSyncErrorHandler
    }))
    .pipe(prefix(['last 3 versions', '> 1%'], { cascade: true }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({stream: true}));
});


// Compile files from _scss into minified css
gulp.task('sassmin', function () {
  gulp.src('_scss/main.scss')
    .pipe(sass({ includePaths: ['scss'] }))
    .pipe(prefix(['last 3 versions', '> 1%'], { cascade: true }))
    .pipe(cssmin())
    .pipe(gulp.dest('css/'));
});


// Scripts
// ---------------------------------------------------
// Concat the scripts in the src folder.
gulp.task('scripts', function () {
  gulp
    .src(['scripts/src/**/*.js'])
    .pipe(concat('main.js'))
    .pipe(ngAnnotate()).on('error', browserSyncErrorHandler)
    .pipe(gulp.dest('scripts/'));
});

// Minifies main.js
gulp.task('uglify', function () {
  gulp
    .src(['scripts/src/**/*.js'])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('scripts/'));
});


// Watch
// ---------------------------------------------------
gulp.task('watch', function () {
  gulp.watch('_scss/**/*', ['sass']);
  gulp.watch('scripts/src/**/*.js', ['scripts']);
  gulp.watch(['*.html', 'scripts/main.js'], ['browser-reload']);
});


// Tasks
// ---------------------------------------------------
gulp.task('default', ['browser-sync', 'watch']);
gulp.task('build', ['sass', 'scripts']);
gulp.task('production', ['sassmin', 'uglify']);
