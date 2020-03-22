import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

import { CommonDataService } from './common-data.service';
import { SharedComponent } from '@shared/shared.component';

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  private dataSvcURL = this.commonData.getLocation();

  constructor(private commonData: CommonDataService,
              private shared: SharedComponent,
              private http: HttpClient) { }

  getGroup(keyValues: string): Observable<any> {
    return this.http.get(`${this.dataSvcURL}/forum-group`,
    {
      headers: { Authorization: `Bearer ${this.commonData.getToken()}` },
      params: { keyValues }
    });
  }

  addGroup(keyValues: string): Observable<any> {
    return this.http.post(`${this.dataSvcURL}/forum-group`, keyValues,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }});
  }
}
