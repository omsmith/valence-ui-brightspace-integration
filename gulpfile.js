var clean = require('gulp-rimraf'),
	concat = require('gulp-concat'),
	cssmin = require('gulp-cssmin'),
	gulp = require('gulp'),
	jsmin = require('gulp-jsmin'),
	rename = require('gulp-rename'),
	request = require('request'),
	s3 = require('gulp-s3');

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
			'node_modules/vui-link/dist/link.css',
			/* list */
			/* more/less */
			/* select */
			/* textarea */
			/* textInput */
			'node_modules/vui-typography/dist/typography.css'
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

gulp.task( 'publish-s3', function() {
	var aws = {
		"key": "AKIAJHECRXPTMLRKXRVQ",
		"secret": process.env.S3_SECRET,
		"bucket": "vui-dev"
	};
	var options = {
		// Need the trailing slash, otherwise the SHA is prepended to the filename.
		uploadPath: process.env.COMMIT_SHA + '/'
	};
	return gulp.src('./dist/**')
		.pipe( s3( aws, options ) );
});

gulp.task( 'update-github', function( cb ) {
	
	var githubUrl = 'https://api.github.com/repos/'
		+ process.env.TRAVIS_REPO_SLUG
		+ '/commits/'
		+ process.env.COMMIT_SHA
		+ '/comments';

	var options = {
		url: githubUrl,
		headers: {
			'Authorization': 'token ' + process.env.GITHUB_TOKEN,
			'User-Agent': 'dlockhart'
		},
		json: {
			'body': '[Deployment available online](https://s3.amazonaws.com/vui-dev/' + process.env.COMMIT_SHA + '/valenceui.css)'
		}
	};

	request.post( options, function( error, response, body ) {
		if( error ) {
			gutil.log( gutil.colors.red( '[FAILED]', error ) );
			cb( error );
		} else if( response.statusCode != 201 ) {
			gutil.log( gutil.colors.red(
				'[FAILED]',
				response.statusCode,
				JSON.stringify(body)
			) );
			cb( response.statusCode );
		} else {
			cb();
		}
	});
});


gulp.task( 'default', [ 'clean' ], function() {
	gulp.start( 'css' );
} );