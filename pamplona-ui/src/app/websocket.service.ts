import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import * as io from "socket.io-client";
import * as Promise from "bluebird";
import { Queue } from "./queue";
import { QueueStats } from "./queuestats";

@Injectable()

export class WebSocketService implements OnDestroy {
	private subject = new Subject<any>();
	private didInit: Promise<void>;
	private socket: any;

	constructor() {
		// if( ! this.didInit ) {
		// 	this.didInit = Promise.resolve()
		// 		.then( () => {
					console.log( "WebSocketService::constructor;" );
					this.subject = new Subject<any>();
					this.socket = io( { "transports": [ "websocket" ] } );
					this.socket.on( "connect", () => {
						return this.didConnect();
					} );
					this.socket.on( "disconnect", () => {
						return this.didDisconnect();
					} );
					this.socket.on( "stats", ( data ) => {
						return this.stats( data );
					} );
		// 		} );
		// }
	}

	didConnect(): void {
		console.log( "CONNECTED" );
		// const self = this;
		// setTimeout( () => {
		// 	self.socket.emit( "stats", {}, ( stats ) => {
		// 		self.subject.next( stats );
		// 	} );
		// }, 1000 );
	}

	didDisconnect(): void {
		console.log( "DISCONNECTED" );
	}

	stats( stats: any ): void {
		this.subject.next( stats );
	}

	getStats(): Observable<any> {
		console.log( "WebSocketService::getStats;" );
		return this.subject.asObservable();
	}

	getStatsP(): Promise<QueueStats> {
		return new Promise( ( resolve, reject ) => {
			console.log( "getStats;" );
			this.socket.emit( "stats", {}, ( stats ) => {
				console.log( "stats: %j", stats );
				return resolve( stats );
			} );
		} );
	}

	getQueues(): Promise<Queue[]> {
		return this.socket.emit( "queues" ).toPromise()
		  .then( ( response ) => {
			  return response.json().queues as Queue[];
		  } );
	}

	ngOnDestroy(): void {
		console.log( "WebSocketService::ngOnDestroy;" );
		this.socket.removeListener( "connect", this.didConnect );
		this.socket.removeListener( "disconnect", this.didDisconnect );
	}

}
