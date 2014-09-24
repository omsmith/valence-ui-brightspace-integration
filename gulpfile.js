var clean = require('gulp-rimraf'),
	concat = require('gulp-concat'),
	cssmin = require('gulp-cssmin'),
	gulp = require('gulp'),
	jsmin = require('gulp-jsmin'),
	rename = require('gulp-rename');

gulp.task( 'clean', function() {
	return gulp.src('./dist')
		.pipe( clean() );
} );

gulp.task( 'css', function() {
	return gulp.src( [
			'node_modules/vui-focus/dist/focus.css',
			/* icons */
			/* accordion */
			/* breadcrumbs */
			'node_modules/vui-button/dist/button.css',
			/* change tracking */
			/* checkbox/radio */
			/* collapsible section */
			/* field */
			/* input attachments */
			'node_modules/vui-link/dist/link.css'
			/* list */
			/* more/less */
			/* select */
			/* textarea */
			/* textInput */
			/* typography */
		] )
		.pipe( concat('valenceui.css') )
		.pipe( gulp.dest('./dist') )
		.pipe( cssmin() )
		.pipe( rename( { suffix: '.min' } ) )
		.pipe( gulp.dest('./dist') );
} );

gulp.task( 'javascript', function() {
	return gulp.src( [
			/* accordion */
			/* button */
			/* change tracking */
			/* collapsible section */
			/* field */
			/* link */
			/* list */
			/* more/less */
			/* textarea */
		] )
		.pipe( concat('valenceui.js') )
		.pipe( gulp.dest('./dist') )
		.pipe( jsmin() )
		.pipe( rename( { suffix: '.min' } ) )
		.pipe( gulp.dest('./dist') );
} );

gulp.task( 'default', [ 'clean' ], function() {
	gulp.start( 'css' );
} );