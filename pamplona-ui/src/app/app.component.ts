import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription }      from "rxjs/Subscription";

import { WebSocketService } from "./websocket.service";
import { Queue }            from "./queue";
import { QueueStats }       from "./queuestats";

@Component( {
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: [ "./app.component.css" ],
	providers: [ WebSocketService ]
} )

export class AppComponent implements OnInit, OnDestroy {
	private wsSubscription: Subscription;
	private websocket: WebSocketService;

	title = "Pamplona";
	systemStats: QueueStats;
	queues: Queue[];


	constructor( private wss: WebSocketService ) {
		console.log( "AppComponent::constructor;" );
		this.websocket = wss;
	}

	ngOnInit(): void {
		console.log( "AppComponent::ngOnInit;" );
		this.wsSubscription = this.websocket.getStats().subscribe( ( stats ) => {
			return this.onStats( stats );
		} );
	}

	ngOnDestroy(): void {
		this.wsSubscription.unsubscribe();
	}

	private onStats( stats: any ): void {
		this.systemStats = stats.system;
		this.queues = stats.queues;
		this.updateTitle();
	}

	updateTitle(): void {
		document.title = `[ ${this.systemStats.active} ][ ${this.systemStats.waiting} ][ ${this.systemStats.delayed} ] ${this.title}`;
	}


}
