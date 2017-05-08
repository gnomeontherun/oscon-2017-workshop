import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class TermService {

  constructor(private http: Http) { }

  getTerm() {
    return this.http.get(environment.api + '/term');
  }

  setTerm(term) {
    let auth = new Headers();
    auth.append('Authorization', 'token ' + localStorage.getItem('key'));
    return this.http.post(environment.api + '/term', { term: term }, { headers: auth});
  }
}
