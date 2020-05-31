import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

export interface Isystem {
  _id: string;
  useEmail: boolean;
  textOnlyEmails: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  addSuggestion(suggestion: string, suggestionType: string, displayName: string, profileImageUrl: string): Observable<any> {
    let params = {
      suggestion: suggestion,
      suggestionType: suggestionType,
      displayName: displayName,
      profileImageUrl: profileImageUrl
    }

    return this.http.post(`/api/suggestion`, params, {});
  }

  loadRvData(jsonFileName: string): Observable<any> {
    let params = {
      jsonFileName: jsonFileName
    }

    return this.http.post(`/api/admin-load-rv-data`, params, {});
  }

  getSystemData(): Observable<Isystem[]> {
    return this.http.get<Isystem[]>(`/api/admin-system-data`);
  }

  setSystemData(useEmail: boolean, textOnlyEmails: boolean): Observable<any> {
    let params = {
      useEmail: useEmail,
      textOnlyEmails: textOnlyEmails
    }

    return this.http.post(`/api/admin-system-data`, params, {});
  }

  updateSystemData(useEmail: boolean, systemID: string, textOnlyEmails: boolean): Observable<any> {
    let params = {
      systemID: systemID,
      useEmail: useEmail,
      textOnlyEmails: textOnlyEmails
    }

    return this.http.put(`/api/admin-system-data`, params, {});
  }
}
