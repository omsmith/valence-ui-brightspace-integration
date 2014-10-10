var concat = require('gulp-concat'),
	cssmin = require('gulp-cssmin'),
	del = require('del'),
	flatten = require('gulp-flatten'),
	gulp = require('gulp'),
	gutil = require('gutil'),
	jsmin = require('gulp-jsmin'),
	rename = require('gulp-rename'),
	request = require('request'),
	s3 = require('gulp-s3');

function tryGetDeployLocation() {

	var sha = process.env.COMMIT_SHA;
	var tag = process.env.TRAVIS_TAG;
	if( !sha && !tag ) {
		gutil.log( 'Unable to access COMMIT_SHA or TRAVIS_TAG.' );
		return null;
	}

	var version = ( tag && tag.length > 0 ) ? tag : 'dev/' + sha;

	// Need the trailing slash, otherwise the version is prepended to the filename.
	var location = 'lib/vui/' + version + '/';
	return location;

}

gulp.task( 'clean', function( cb ) {
	del( ['dist'], cb );
} );

gulp.task( 'css', function() {
	return gulp.src( [
			'node_modules/vui-focus/focus.css',
			'node_modules/vui-icons/icons.css',
			/* accordion */
			'node_modules/vui-breadcrumbs/breadcrumbs.css',
			'node_modules/vui-button/button.css',
			/* change tracking */
			/* checkbox/radio */
			/* collapsible section */
			'node_modules/vui-field/field.css',
			/* input attachments */
			'node_modules/vui-link/link.css',
			/* list */
			/* more/less */
			/* select */
			/* textarea */
			/* textInput */
			'node_modules/vui-typography/typography.css'
			/* offscreen */
			/* hidden */
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

gulp.task( 'icons', function() {
	return gulp.src( [ 'node_modules/vui-icons/images/**/*.png' ] )
		.pipe( flatten() )
		.pipe( gulp.dest('./dist/images') );
} );

gulp.task( 'publish-s3', function() {

	var location = tryGetDeployLocation();
	if( location === null ) {
		gutil.log( 'Skipping publish.' );
		return;
	}

	var aws = {
			"key": "AKIAI57KI4WTS3WMRZWQ",
			"secret": process.env.S3_SECRET,
			"bucket": "d2lprodcdn"
		};

	var options = {
			uploadPath: location,
			headers: {
				'cache-control': 'public, max-age=31536000'
			}
		};

	gutil.log( 'Publishing to \'' + location + '\'...' );

	return gulp.src('./dist/**')
		.pipe( s3( aws, options ) );

});

gulp.task( 'update-github', function( cb ) {

	var location = tryGetDeployLocation();
	if( location === null ) {
		gutil.log( 'Skipping update-github.' );
		cb();
		return;
	}
	
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
				'body': '[Deployment available online](https://d2660orkic02xl.cloudfront.net/' + location + 'valenceui.css)'
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
	gulp.start( 'css', 'icons' );
} );