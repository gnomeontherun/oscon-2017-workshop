import { Component, OnInit } from '@angular/core';

import { TermService } from '../services/term.service';

declare const webkitSpeechRecognition: any;

@Component({
  selector: 'app-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.css'],
  providers: [ TermService ]
})
export class TermComponent implements OnInit {
  private recognizer = new webkitSpeechRecognition();
  term: string = '';

  constructor(private termService: TermService) {}

  ngOnInit() {
    this.recognizer.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      this.term = transcript;
      this.changeTerm();
     };

     this.getTerm();
  }

  private getTerm() {
    this.termService.getTerm().subscribe(response => {
      this.term = response.json().term;
    });
  }

  private changeTerm() {
    this.termService.setTerm(this.term).subscribe(response => {
      this.term = response.json().term;
    });
  }

  onKeyUp(event) {
    if (event.keyCode.toString() === '13') {
      this.changeTerm();
    }
  }

  startTalking() {
    this.recognizer.start();
  }
}
