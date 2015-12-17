'use strict';

var gulp = require('gulp'),
	concat = require('gulp-concat'),
	sass = require('gulp-sass'),
	srcMaps = require('gulp-sourcemaps'),
	tsc = require('gulp-typescript'),
	merge = require('merge2');
	
	
var options = {
	src: {
		node: 'src/node/',
		angular: 'src/angular/',
		scss: 'src/scss/'
	},
	dist: 'dist/'
}

gulp.task('concatNodeScripts', ['compileNodeScripts'], function() {
	var nodeScripts = [
		options.src.node + 'js/server.js',
		options.src.node + 'js/globalVar.js',
		options.src.node + 'js/routes.js',
		options.src.node + 'js/gameflow.js',
		options.src.node + 'js/emitters.js',
		options.src.node + 'js/dynamics.js',
		options.src.node + 'js/api.js',
		options.src.node + 'js/random.js',
		options.src.node + 'js/objectFunct.js'
	];
	
	return gulp.src(nodeScripts)
		.pipe(srcMaps.init())
		.pipe(concat('app.js'))
		.pipe(srcMaps.write('./'))
		.pipe(gulp.dest(options.dist));
});

gulp.task('compileNodeScripts', function() { ['lib/**.ts', 'definitions/**.ts']
	var tsResult = gulp.src([options.src.node + '/*.ts', 
							 options.src.node + 'definitions/*.ts', 
							 options.src.node + 'definitions/**/*.ts'])
		.pipe(tsc({
			declaration: true,
			noExternalResolve: true,
			removeComments: true
		}));
 
	return merge([
		tsResult.dts.pipe(gulp.dest(options.src.node + 'definitions')),
		tsResult.js.pipe(gulp.dest(options.src.node + 'js'))
	]);
});

gulp.task('concatAngularScripts', function() {
	var angularScripts = [
		options.src.angular + 'js/factories/socket.js',
		options.src.angular + 'js/directives/directives.js',
		options.src.angular + 'js/controllers/controllers.js',
		options.src.angular + 'js/module.js'
	];
	
	
	return gulp.src(angularScripts)
		.pipe(srcMaps.init())
		.pipe(concat('app.js'))
		.pipe(srcMaps.write('./'))
		.pipe(gulp.dest(options.dist + 'public/js'));
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
		options.src.angular + 'js/directives/partials/_gameSelector.html',
		options.src.angular + 'js/directives/partials/_gameStack.html',
		options.src.angular + 'js/directives/partials/_picker.html',
		options.src.angular + 'js/directives/partials/_playerList.html',
		options.src.angular + 'js/directives/partials/_usernameInput.html'
	];
	
	return gulp.src(partials)
		.pipe(gulp.dest(options.dist + 'public/js/partials'));
});

gulp.task('copyHtml', function() {
	var html = [
		options.src.angular + 'index.html'
	];
	
	return gulp.src(html)
		.pipe(gulp.dest(options.dist + 'public/'));
});

gulp.task('compileSass', function(){
	return gulp.src(options.src.scss + 'application.scss')
		.pipe(srcMaps.init())
		.pipe(sass())
		.pipe(srcMaps.write('./')) // Path is relative to dest directory
		.pipe(gulp.dest(options.dist + 'public/css'));
});



gulp.task('watchSass', function() {
	return gulp.watch([options.src.scss + '*.scss'], ['compileSass']);
});

gulp.task('watchAngular', function() {
	return gulp.watch([options.src.angular + 'js/**/*.js'], ['concatAngularScripts']);
});

gulp.task('watchNode', function() {
	return gulp.watch([options.src.node + '*.js'], ['concatNodeScripts']);
});

gulp.task('watchIndex', function() {
	return gulp.watch([options.src.angular + 'index.html'], ['copyHtml']);
});

gulp.task('watchPartials', function() {
	return gulp.watch([options.src.angular + 'js/directives/partials/*.html'], ['copyPartials']);
});

gulp.task('watch', ['watchSass','watchAngular','watchNode','watchIndex','watchPartials'], function() {
	console.log("Watching project...");
});

gulp.task('default', ['concatNodeScripts', 'concatAngularScripts', 'copyPartials', 'copyHtml', 'compileSass'], function() {
	console.log("Tasks completed!");
});