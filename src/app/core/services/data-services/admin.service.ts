import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  extractRVBrands(jsonFileName: string): Observable<any> {
    let params = '{"jsonFileName":"' + jsonFileName + '"}';

    return this.http.post(`/api/admin-extract-brands`, params, {});
  }

  loadRvData(jsonFileName: string): Observable<any> {
    let params = '{"jsonFileName":"' + jsonFileName + '"}';

    return this.http.post(`/api/admin-load-rv-data`, params, {});
  }
}