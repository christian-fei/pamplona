"use strict";

const debug = require( "debug" )( "pamplona" );
const path = require( "path" );
const cluster = require( "cluster" );
var redisClient = null;


/**
 * @param {Object} options
 * @param {Object} [options.redis] optional redis settings.
 * @param {Object} [options.redisClient] optional redis client.
 * @param {Object} [options.server] optional http(s) server.
 * @param {Number} [options.serverPort] optional http server port to listen on.
 * @param {String} [options.keyPrefix] Bull key prefix.
 */
module.exports = function( options ) {
	options = ( options || {} );
		if( !options.redis && !options.redisClient ) {
				throw new Error( "Missing redis configuration or client" );
		}
	if( !options.redisClient ) {
		const Redis = require( "ioredis" );
		redisClient = new Redis( options.redis );
	} else {
		redisClient = options.redisClient;
	}
	const keyPrefix = ( options.keyPrefix || "bull" );

	const express = require( "express" );
	const bodyParser = require( "body-parser" );
	const app = express();
	const server = ( options.server || app.listen( options.serverPort || 8100 ) );
	const sioOptions = {
		"pingTimeout": 21000,
		"pingInterval": 10000,
		"transports": [ "websocket" ],
		"jsonp": true,
		"forceJSONP": true
	};

	// api routes
	const api = require( "./api" )( { "redisClient": redisClient, "keyPrefix": keyPrefix } );
	const io = require( "socket.io" ).listen( server, sioOptions );
	const socket = require( "./socket" )( io, api );

	app.use( api.router );
		app.use( bodyParser.urlencoded( { "extended": true } ) );  // application/x-www-form-urlencoded
	app.use( bodyParser.json() ); // application/json

	// pamplona-ui (ng)
	app.use( "/", express.static( path.join( __dirname, "pamplona-ui", "dist" ), { "index": [ "index.html" ] } ) );

	app.use( "*", ( req, res ) => {
		res.sendFile( path.join( __dirname, "pamplona-ui/dist/index.html" ) );
	} );

	// debug( "Okay to go." );
	return app;
};
