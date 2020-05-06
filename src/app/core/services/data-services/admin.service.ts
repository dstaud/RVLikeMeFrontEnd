import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

export interface Isystem {
  _id: string;
  useEmail: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  loadRvData(jsonFileName: string): Observable<any> {
    let params = '{"jsonFileName":"' + jsonFileName + '"}';

    return this.http.post(`/api/admin-load-rv-data`, params, {});
  }

  getSystemData(): Observable<Isystem[]> {
    return this.http.get<Isystem[]>(`/api/admin-system-data`);
  }

  setSystemData(useEmail: boolean): Observable<any> {
    let params = '{"useEmail":"' + useEmail + '"}';

    return this.http.post(`/api/admin-system-data`, params, {});
  }

  updateSystemData(useEmail: boolean, systemID: string): Observable<any> {
    let params = '{"systemID":"' + systemID + '","useEmail":"' + useEmail + '"}';

    return this.http.put(`/api/admin-system-data`, params, {});
  }
}
