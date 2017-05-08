import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.css']
})
export class LanguagesComponent implements OnChanges {
  @Input() languages;

  ngOnChanges() {
    this.languages.sort((a, b) => (b.value - a.value));
  }
}
