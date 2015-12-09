'use strict';

var gulp = require('gulp'),
	concat = require('gulp-concat'),
	sass = require('gulp-sass'),
	sassMaps = require('gulp-sourcemaps');

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
	
	
	gulp.src(nodeScripts)
		.pipe(concat('app.js'))
		.pipe(gulp.dest('src/dist'));
});

gulp.task('concatAngularScripts', function() {
	var angularScripts = [
		'src/angular/js/factories/socket.js',
		'src/angular/js/directives/directives.js',
		'src/angular/js/controllers/controllers.js',
		'src/angular/js/module.js'
	];
	
	
	gulp.src(angularScripts)
		.pipe(concat('app.js'))
		.pipe(gulp.dest('src/dist/public/js'));
});

gulp.task('copyPartials', function() {
	var partials = [
		'src/angular/js/directives/partials/_gameSelector.html',
		'src/angular/js/directives/partials/_gameStack.html',
		'src/angular/js/directives/partials/_picker.html',
		'src/angular/js/directives/partials/_playerList.html',
		'src/angular/js/directives/partials/_usernameInput.html'
	];
	
	gulp.src(partials)
		.pipe(gulp.dest('src/dist/public/js/partials'));
});

gulp.task('copyHtml', function() {
	var html = [
		'src/angular/index.html'
	];
	
	gulp.src(html)
		.pipe(gulp.dest('src/dist/public/'));
});

gulp.task('compileSass', function(){
	gulp.src('src/scss/application.scss')
		.pipe(sassMaps.init())
		.pipe(sass())
		.pipe(sassMaps.write('./')) // Path is relative to dest directory
		.pipe(gulp.dest('src/dist/public/css'));
});

gulp.task('default', ['concatNodeScripts', 'concatAngularScripts', 'copyPartials', 'copyHtml', 'compileSass'], function() {
	console.log("Tasks completed!");
});