import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hashtags',
  templateUrl: './hashtags.component.html',
  styleUrls: ['./hashtags.component.css']
})
export class HashtagsComponent {
  @Input() hashtags;
}
