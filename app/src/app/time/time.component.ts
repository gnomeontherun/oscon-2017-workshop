import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.css']
})
export class TimeComponent implements OnChanges {
  @Input() time;

  ngOnChanges() {
    if (this.time && this.time[0] && this.time[0] && this.time[0].series && this.time[0].series.length) {
      this.time[0].series.map(minute => {
        minute.name = new Date(minute.name);
        return minute;
      });
    }
  }
}
