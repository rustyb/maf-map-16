var fs = require('fs');
var gulp = require('gulp');
var browserify = require('browserify');



// File paths to various assets are defined here.
var PATHS = {
  assets: [
    'data/*'
    ],
  app: [
  	'index.html',
  	'bundle.js',
    'browser.html'
  ],
  css: [
  'css/*'
  ]
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
gulp.task('copy-data', function() {
  return gulp.src(PATHS.assets)
    .pipe(gulp.dest('dist/data'));
});

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
gulp.task('copy-css', function() {
  return gulp.src(PATHS.css)
    .pipe(gulp.dest('dist/css'));
});

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
gulp.task('copy-app', function() {
  return gulp.src(PATHS.app)
    .pipe(gulp.dest('dist'));
});


// Build the site, run the server, and watch for file changes
gulp.task('default',['copy-app', 'copy-css', 'copy-data'], function() {

});