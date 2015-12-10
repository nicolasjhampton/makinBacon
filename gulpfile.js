'use strict';

var gulp = require('gulp'),
	concat = require('gulp-concat'),
	sass = require('gulp-sass'),
	srcMaps = require('gulp-sourcemaps'),
	uglify = require('gulp-uglify');

gulp.task('concatNodeScripts', function() {
	var nodeScripts = [
		'src/node/server.js',
		'src/node/globalVar.js',
		'src/node/routes.js',
		'src/node/gameflow.js',
		'src/node/emitters.js',
		'src/node/dynamics.js',
		'src/node/api.js',
		'src/node/random.js',
		'src/node/objectFunct.js'
	];
	
	
	return gulp.src(nodeScripts)
		.pipe(srcMaps.init())
		.pipe(concat('app.js'))
		.pipe(srcMaps.write('./'))
		.pipe(gulp.dest('src/dist'));
});

gulp.task('concatAngularScripts', function() {
	var angularScripts = [
		'src/angular/js/factories/socket.js',
		'src/angular/js/directives/directives.js',
		'src/angular/js/controllers/controllers.js',
		'src/angular/js/module.js'
	];
	
	
	return gulp.src(angularScripts)
		.pipe(srcMaps.init())
		.pipe(concat('app.js'))
		.pipe(srcMaps.write('./'))
		.pipe(gulp.dest('src/dist/public/js'));
});

/*
gulp.task('minifyAngularScript', ['concatAngularScripts'], function() {
	return gulp.src('src/dist/public/js/app.js')
		.pipe(uglify())
		.pipe(gulp.dest('src/dist/public/js'));
});
*/

gulp.task('copyPartials', function() {
	var partials = [
		'src/angular/js/directives/partials/_gameSelector.html',
		'src/angular/js/directives/partials/_gameStack.html',
		'src/angular/js/directives/partials/_picker.html',
		'src/angular/js/directives/partials/_playerList.html',
		'src/angular/js/directives/partials/_usernameInput.html'
	];
	
	return gulp.src(partials)
		.pipe(gulp.dest('src/dist/public/js/partials'));
});

gulp.task('copyHtml', function() {
	var html = [
		'src/angular/index.html'
	];
	
	return gulp.src(html)
		.pipe(gulp.dest('src/dist/public/'));
});

gulp.task('compileSass', function(){
	return gulp.src('src/scss/application.scss')
		.pipe(srcMaps.init())
		.pipe(sass())
		.pipe(srcMaps.write('./')) // Path is relative to dest directory
		.pipe(gulp.dest('src/dist/public/css'));
});

gulp.task('watchSass', function() {
	return gulp.watch(['src/scss/*.scss'], ['compileSass']);
});

gulp.task('watchAngular', function() {
	return gulp.watch(['src/angular/js/**/*.js'], ['concatAngularScripts']);
});

gulp.task('watchNode', function() {
	return gulp.watch(['src/node/*.js'], ['concatNodeScripts']);
});

gulp.task('watchIndex', function() {
	return gulp.watch(['src/angular/index.html'], ['copyHtml']);
});

gulp.task('watchPartials', function() {
	return gulp.watch(['src/angular/js/directives/partials/*.html'], ['copyPartials']);
});

gulp.task('watch', ['watchSass','watchAngular','watchNode','watchIndex','watchPartials'], function() {
	console.log("Watching project...");
});

gulp.task('default', ['concatNodeScripts', 'concatAngularScripts', 'copyPartials', 'copyHtml', 'compileSass'], function() {
	console.log("Tasks completed!");
});