var gulp = require('gulp');
var path = require('path');
var root = path.resolve('./');
var dist = path.resolve(root, "dist");

var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');

gulp.task('release', ['js-min','copyfile'],function () {

});

gulp.task('copyfile',function(){
    gulp.src('Http.js')
       .pipe(gulp.dest('dist/'));
})
gulp.task('js-min',function(){
    gulp.src('Http.js')
       .pipe(uglify())       
       .pipe(rename({suffix:'.min'}))
       .pipe(gulp.dest('dist/'));
})