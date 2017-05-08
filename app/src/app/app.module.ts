import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from 'clarity-angular';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppComponent } from './app.component';
import { TweetsComponent } from './tweets/tweets.component';
import { StatsComponent } from './stats/stats.component';
import { TimeComponent } from './time/time.component';
import { LanguagesComponent } from './languages/languages.component';
import { HashtagsComponent } from './hashtags/hashtags.component';
import { LinksComponent } from './links/links.component';
import { TermComponent } from './term/term.component';

@NgModule({
  declarations: [
    AppComponent,
    TweetsComponent,
    StatsComponent,
    TimeComponent,
    LanguagesComponent,
    HashtagsComponent,
    LinksComponent,
    TermComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    ClarityModule.forRoot(),
    AngularFireModule.initializeApp(environment.config),
    AngularFireDatabaseModule,
    NgxChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
