import { NgModule }      from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule }   from "@angular/forms";

import { RoutesModule }     from "./routes.module";
import { AppComponent }     from "./app.component";
import { WebSocketService } from "./websocket.service";

@NgModule( {
	declarations: [ AppComponent ],
	imports: [
		BrowserModule,
		FormsModule,
		RoutesModule
	],
	providers: [ WebSocketService ],
	bootstrap: [ AppComponent ]
} )

export class AppModule {}
