import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

export interface IrigData {
  _id: string;
  brand: string;
}

@Injectable({
  providedIn: 'root'
})
export class RigService {

  constructor(private http: HttpClient) { }

  // Get profile for a user based on user ID
  getRigData(): Observable<any> {
    return this.http.get(`/api/rig-data`);
  }
}
