var gulp         = require("gulp");
var browserify   = require("browserify");
var source       = require("vinyl-source-stream");
var buffer       = require("vinyl-buffer");
var reactify     = require("reactify");
var htmlMinifier = require("gulp-html-minifier");
var uglify       = require("gulp-uglify");
var connect      = require("gulp-connect");
var path         = require("path");
var less         = require("gulp-less");
var sourcemaps   = require("gulp-sourcemaps");


gulp.task("browserify", function() {
	return browserify('./source/js/app.js')
		.transform(reactify)
		.bundle()
		.pipe(source('invite.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./build/js/'));
});

gulp.task('html', function() {
	return gulp.src('./source/*.html')
		.pipe(htmlMinifier({collapseWhitespace: true}))
		.pipe(gulp.dest('./build'))
});

gulp.task('less', function() {
	return gulp.src('./source/less/**/*.less')
		.pipe(less({
			paths: [ path.join(__dirname, 'less', 'includes') ]
		}))
		.pipe(gulp.dest('./build/css'));
});

gulp.task('images', function() {
	return gulp.src('./source/img/**/*')
		.pipe(gulp.dest("./build/img"));
});

gulp.task('serve', function() {
	connect.server({
		root:       'build',
		livereload: true
	});
})

gulp.task('watch', function() {
	gulp.watch('./source/js/**/*.js', ['browserify']);
	gulp.watch('./source/less/**/*.less', ['less']);
	gulp.watch('./source/img/*', ['images']);
	gulp.watch('./source/**/*.html', ['html']);
});

gulp.task('build', ['browserify', 'html']);

gulp.task('default', ['watch', 'browserify', 'html', 'less', 'images', 'serve']);