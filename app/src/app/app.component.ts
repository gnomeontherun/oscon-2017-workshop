import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import { Tweet, Aggregates, Hashtag, Link } from './services/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loading: boolean = true;
  tweets: Tweet[];
  aggregates: Aggregates;
  hashtags: Hashtag[];
  links: Link[];

  constructor(private db: AngularFireDatabase) {}

  ngOnInit() {
    this.loading = true;
    this.loadTweets();
    this.loadAggregates();
    this.loadHashtags();
    this.loadLinks();
  }

  private loadTweets() {
    this.db.list('tweets', {
      query: {
        orderByChild: 'timestamp_ms',
        limitToLast: 100
      }
    }).subscribe(tweets => {
      this.tweets = tweets.sort((a, b) => b.timestamp_ms - a.timestamp_ms);
      this.loading = false;
    });
  }

  private loadAggregates() {
    this.db.object('/aggregates').subscribe(aggregates => {
      this.aggregates = aggregates;
    });
  }

  private loadHashtags() {
    this.db.list('hashtags', {
      query: {
        orderByChild: 'count',
        limitToLast: 100
      }
    }).subscribe(hashtags => {
      this.hashtags = hashtags.sort((a, b) => b.count - a.count);
    });
  }

  private loadLinks() {
    this.db.list('links', {
      query: {
        orderByChild: 'count',
        limitToLast: 100
      }
    }).subscribe(links => {
      this.links = links.sort((a, b) => b.count - a.count);
    });
  }
}
