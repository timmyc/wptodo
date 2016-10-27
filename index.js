#!/usr/bin/env node
'use strict';

/* Config Options */
const authKey = 'Bearer YOURSUPERLONGTOKENHERE';
const WordPressComUrl = 'YOURAWESOMESITE.wordpress.com';
/* End Config */
const apiPath = 'https://public-api.wordpress.com/wp/v2/sites/' + WordPressComUrl;

// Program Modules
const program = require( 'commander' );
const co = require( 'co' );
const prompt = require( 'co-prompt' );
const request = require( 'superagent' );
const chalk = require( 'chalk' );
const ent = require( 'ent' );
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner();
spinner.setSpinnerString( 26 );

// Spit out an error message and exit
const errorAndExit = ( error ) => {
	console.error( chalk.red( error ) );
	process.exit( 1 );
}

// Pesky HTML entities don't look good on the cmd line
const decodeTitle = ( title ) => {
	return ent.decode( title );
}

// Add a new todo item ( post )
program
	.description( 'create a new todo item' )
	.command( 'add' )
	.action( () => {
		co( function* () {
			const todo = yield prompt( 'What do you need todo? ' );
			spinner.start();

			// Send the request to WP REST API
			request
				.post( apiPath + '/posts' )
				.send( { title: todo, status: 'publish' } )
				.set( 'Authorization', authKey )
				.end( ( error, result ) => {
					spinner.stop( true );
					if ( error ) {
						errorAndExit( error )
					}
					const post = result.body;
					const title = decodeTitle( post.title.raw );
					console.log( chalk.bold.yellow( '\n\ncreated todo #' + post.id + ': ' + title + '\n\n' ) );
					process.exit( 1 );
				} );
		} )
	} );

// Mark todo item as done ( trash post )
program
	.description( 'mark an item as done' )
	.command( 'done [todoNumber]' )
	.action( ( todoNumber ) => {
		spinner.start();

		// Make sure we have a number
		if ( ! isNaN( parseInt( todoNumber ) ) ) {
			// Send the DELETE request to WP REST API
			request
				.delete( apiPath + '/posts/' + todoNumber )
				.set( 'Authorization', authKey )
				.end( ( error, result ) => {
					spinner.stop( true );
					if ( error ) {
						const message = error.status === 404 ? 'Invalid Todo Number, try `wptodo list` to get a valid number.' : error;
						errorAndExit( message );
					}
					const post = result.body;
					const title = decodeTitle( post.title.raw );
					console.log( chalk.bold.green( '\n\nDONE! #' + post.id + ': ' + title + '\n\n' ) );
					process.exit( 1 );
				} );
		} else {
			errorAndExit( 'wat? that wasn\'t a number!' );
		}
	} );

// List all todos ( post titles )
program
	.description( 'list todo items' )
	.command( 'list' )
	.action( () => {
		// Send the request to WP REST API
		spinner.start();

		// Request posts from our site, if we have so many todos
		// that we need pagination, well that is just unfortunate for us
		// Using auth key here for edit context, and our site is private
		request
			.get( apiPath + '/posts?context=edit' )
			.set( 'Authorization', authKey )
			.end( ( error, result ) => {
				spinner.stop( true );
				if ( error ) {
					errorAndExit( error )
				}

				// If we have posts, list them
				if ( result.body.length ) {
					console.log( chalk.bold.yellow( '\n\nYour Todo Items:' ) );
					result.body.forEach( ( post ) => {
						const { id, title } = post;
						const decodedTitle = decodeTitle( title.raw );
						console.log( chalk.yellow( '#' + id + ' - ' + decodedTitle ) );
					} );
				console.log( '\n' );
				} else {
					// Otherwise show a celebratory message
					console.log( chalk.bold.green( '\n\nOMG NO TODOS!\n\n' ) );
				}
				process.exit( 1 );
			} );
	} );

program.parse( process.argv );

if ( program.args.length === 0 ) {
	program.help();
}