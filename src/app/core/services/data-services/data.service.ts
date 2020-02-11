import { Iuser } from './../../../interfaces/user';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { CommonDataService } from './common-data.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private token: string;

  constructor(private commonData: CommonDataService,
              private http: HttpClient) { }

  public getProfilePersonal(): Observable<any> {
    const dataSvcURL = this.commonData.getLocation();
    return this.http.get(`${dataSvcURL}/profile-personal`,
    { headers: { Authorization: `Bearer ${this.getToken()}` }});
  }

  public addProfilePersonal(user: Iuser): Observable<any> {
    const dataSvcURL = this.commonData.getLocation();
    return this.http.post(`${dataSvcURL}/profile-personal`, user,
    { headers: { Authorization: `Bearer ${this.getToken()}` }});
  }

  public updateProfilePersonal(user: Iuser): Observable<any> {
    const dataSvcURL = this.commonData.getLocation();
    return this.http.put(`${dataSvcURL}/profile-personal`, user,
    { headers: { Authorization: `Bearer ${this.getToken()}` }});
  }

  private getToken(): string {
    // Get from local storage everytime in cae different people register on same machine and this.token is from previous
    this.token = localStorage.getItem('rvlikeme-token');
    console.log('get token=', this.token);
    return this.token;
  }
}
