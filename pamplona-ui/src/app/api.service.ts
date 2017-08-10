import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Queue } from './queue';
import { QueueStats } from './queuestats';
import 'rxjs/add/operator/toPromise';

@Injectable()

export class ApiService {
	constructor( private http: Http ) {}

	getStats(): Promise<QueueStats> {
		return this.http.get( 'stats' ).toPromise()
		  .then( ( response ) => {
			  return response.json() as QueueStats;
		  } );
	}

	getQueues(): Promise<Queue[]> {
		return this.http.get( 'queues' ).toPromise()
		  .then( ( response ) => {
			  return response.json().queues as Queue[];
		  } );
	}

}
