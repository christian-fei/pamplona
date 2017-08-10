"use strict";

( function () {

	const debug = require( "debug" )( "pamplona:api" );
	const Promise = require( "bluebird" );
	const Queue = require( "bull" );
	const express = require( "express" );
	const router = express.Router();
	const api = { "router": router };
	var redisClient;
	var keyPrefix;
	const states = [ "delayed", "waiting", "active", "failed", "completed" ];

	module.exports = function pamplonaApi( settings ) {
		redisClient = settings.redisClient;
		keyPrefix = settings.keyPrefix;
		return api;
	};

	function FauxQueue( params ) {
		this.client = params.client;
		this.keyPrefix = params.keyPrefix;
		if( params.hasOwnProperty( "name" ) ) {
			this.name = params.name;
		}
	}
	FauxQueue.prototype = Queue.prototype;

	router.get( "/stats", stats );
	router.get( "/stats/:queue", stats );
	router.get( "/queues", queues );


	function stats( req, res ) {
		debug( "%s %j", req.url, req.params );
		var statusCode = 500;
		var response = {};
		const queuePromise = ( req.params.hasOwnProperty( "queue" ) ? Promise.resolve( [ req.params.queue ] ) : api.getQueues() );
		queuePromise
			.then( ( queueList ) => {
				console.log( "stats; queueList:", queueList );
				return queueList;
			} )
			.then( api.getStats )
			.then( ( queueStats ) => {
				statusCode = 200;
				response = queueStats;
			} )
			.catch( ( err ) => {
				statusCode = 500;
				response = { "error": err };
			} )
			.finally( () => {
				res.status( statusCode ).json( response );
			} );
	}


	function queues( req, res ) {
		debug( "%s %j", req.url, req.params );
		var statusCode = 500;
		var response = {};
		api.getQueues()
			.then( ( queues ) => {
				response.queues = [];
				const promises = [];
				queues.forEach( ( queueName ) => {
					// console.log( "queues; queueName: %s", queueName );
					const statPromise = api.getStats( [ queueName ] )
						.then( ( queueStats ) => {
							response.queues.push( { "name": queueName, "stats": queueStats } );
						} );
					promises.push( statPromise );
				} );
				return Promise.all( promises )
				.then( () => {
					statusCode = 200;
				} );
			} )
			.catch( ( err ) => {
				statusCode = 500;
				response = { "error": err };
			} )
			.finally( () => {
				res.status( statusCode ).json( response );
			} );
	}


	api.getQueues = function getQueues() {
		const queues = [];
		const keySearch = keyPrefix + ":*:id";
		// debug( "searching: %s", keySearch );
		return redisClient.keys( keySearch )
			.then( ( keyList ) => {
				// debug( "queue keys: %j", keyList );
				keyList.forEach( ( keyItem ) => {
					const matches = keyItem.match( /^[^:]{1,}[:]{1}(.*)[:id]{3}$/i );
					// debug( "queue: %s", matches[ 1 ] );
					queues.push( matches[ 1 ] );
				} );
				// debug( "queues: %j", queues );
				return queues.sort();
			} );
	};


	api.getStats = function getStats( queues ) {
		const queueStats = { "system": { "active": 0, "waiting": 0, "delayed": 0, "failed": 0, "completed": 0 }, "queues": [] };
		const fauxq = new FauxQueue( { "client": redisClient, "keyPrefix": keyPrefix } );
		const promises = [];
		if( ! Array.isArray( queues ) ) {
			// return Promise.reject( new Error( "invalid parameter: queues" ) );
			queues = [];
		}
		queues.forEach( ( queueName ) => {
			fauxq.name = queueName;
			const qstat = fauxq.getJobCounts()
				.then( ( counts ) => {
					debug( "getStats; job counts: '%s' %j", queueName, counts );
					queueStats.queues.push ( { "name": queueName, "stats": counts } );
					states.forEach( ( state ) => {
						queueStats.system[ state ] += counts[ state ];
					} );
				} );
			promises.push( qstat );
		} );
		return Promise.all( promises )
			.then( () => {
				return queueStats;
			} );
	};

} )();
