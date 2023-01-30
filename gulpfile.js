'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');

function js() {
  return gulp
    .src(['public/js/*.js', '!public/js/*.min.js'])
    .pipe(plumber())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/js/'))
  ;
}

exports.default = js;
exports.build = js;
