import { Component, Input } from '@angular/core';
import { Tweet } from '../services/models';

@Component({
  selector: 'app-tweets',
  templateUrl: './tweets.component.html',
  styleUrls: ['./tweets.component.css']
})
export class TweetsComponent {
  @Input() tweet: Tweet;
}
