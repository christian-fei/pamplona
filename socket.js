"use strict";

( function () {

	const debug = require( "debug" )( "pamplona:socket" );
	const Promise = require( "bluebird" );

	module.exports = function socket( io, api ) {

		// connect
		io.on( "connect", ( socket ) => {
			// debug( "socket::connect; handshake.url: %j", Object.keys( socket.client.conn.request.connection ) );
			// debug( "socket::connect; handshake.url: %j", socket.client.conn.request.connection );
			debug( "socket::connect;" );

			// event handlers
			socket.on( "stats", (data, callback) => {
				console.log('stats event', data)
				stats(data, callback)
			} );

			api.getQueues()
				.then( api.getStats )
				.then( ( systemStats ) => {
					socket.emit( "stats", systemStats );
				} );
		} );

		function stats( data, callback ) {
			console.log( "socket::stats;" );
			return api.getQueues()
				.then( api.getStats )
				.then( ( systemStats ) => {
					debug( "socket::stats; systemStats: %j", systemStats );
					if( typeof callback === "function" ) {
						callback( systemStats );
					}
				} );
		}

	};

} )();