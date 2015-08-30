// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');
var shell = require('gulp-shell');
var changed = require('gulp-changed');
var watch = require('gulp-watch');
var compass = require('gulp-compass');
var minifyCss = require('gulp-minify-css');

var gutil = require("gulp-util");
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");

gulp.task("webpack", function (callback) {
  // run webpack
  webpack({
    entry: './client/src/js/map.js',
    output: {
      path: './client/dist/js/',
      filename: 'bundle.js'
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/])
    ],
    devtool: 'source-map'
  }, function (err, stats) {
    if (err) {
      throw new gutil.PluginError("webpack", err);
    }
    gutil.log("[webpack]", stats.toString({
        // output options
    }));
    callback();
  });
});

gulp.task('compass', function () {
  gulp.src('client/src/scss/*.scss')
    .pipe(compass({
      css: 'client/dist/css',
      sass: 'client/src/scss',
      sourcemap: true
    }))
    .pipe(minifyCss())
    .pipe(gulp.dest('./client/dist/css'));
});

// Lint Task
gulp.task('lint', function () {
  return gulp.src('client/src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


// Concatenate & Minify JS
gulp.task('scripts', function () {
  return gulp.src('client/src/**/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('all.min.js'))
    .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function () {
  gulp.watch(['client/src/**/*.js', 'client/src/*.js'], ['lint', 'scripts']);
});

gulp.task("monitor-styles", function (callback) {
  gulp.watch('client/src/scss/*.scss', ['compass', 'img']);
});

gulp.task('fonts', function () {
  gulp.src('client/src/css/fonts/*.*')
    .pipe(changed('client/dist/css/fonts'))
    .pipe(gulp.dest('client/dist/css/fonts'));
});

gulp.task('dist', function () {
  gulp.src('client/src/index.html')
    .pipe(changed('client/dist', {
      extension: '.html'
    }))
    .pipe(gulp.dest('client/dist'));
});

gulp.task('img', function () {
  gulp.src('client/src/img/*.*')
    .pipe(changed('client/dist/img'))
    .pipe(gulp.dest('client/dist/img'));
});

gulp.task("nodemon", function () {
  nodemon({
    script: 'index.js'
  });
});

// Default Task
gulp.task('default', ['test', 'scripts']);

gulp.task('dev', ['webpack', 'dist', 'nodemon']);

gulp.task('dev-styles', ['dist', 'fonts', 'img', 'monitor-styles', 'nodemon']);

gulp.task('deploy', ['dist', 'fonts', 'img', 'webpack']);
