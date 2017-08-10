import { NgModule }             from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AppComponent }   from "./app.component";

const routes: Routes = [
	{ "path": "", "redirectTo": "active", "pathMatch": "full" },
	{ "path": "active", "component": AppComponent },
	{ "path": "active/:queue", "component": AppComponent },
	{ "path": "waiting", "component": AppComponent },
	{ "path": "waiting/:queue", "component": AppComponent },
	{ "path": "delayed", "component": AppComponent },
	{ "path": "delayed/:queue", "component": AppComponent },
	{ "path": "failed", "component": AppComponent },
	{ "path": "failed/:queue", "component": AppComponent },
	{ "path": "completed", "component": AppComponent },
	{ "path": "completed/:queue", "component": AppComponent },
	{ "path": "queues", "component": AppComponent }
];

@NgModule( {
	imports: [ RouterModule.forRoot( routes, { "useHash": true } ) ],
	exports: [ RouterModule ]
} )

export class RoutesModule {}
