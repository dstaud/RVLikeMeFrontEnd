import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';

import { CommonDataService } from './common-data.service';

export interface IuserProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  yearOfBirth: number;
  homeCountry: string;
  homeState: string;
  language: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // private user: IuserProfile;
  private user: IuserProfile = {
    firstName: null,
    lastName: null,
    displayName: null,
    yearOfBirth: null,
    homeCountry: null,
    homeState: null,
    language: 'en'
  };

  private dataSvcURL = this.commonData.getLocation();

  private _profilePersonal = new BehaviorSubject<IuserProfile>(this.user);
  private dataStore: { profilePersonal: IuserProfile } = { profilePersonal: this.user }
  readonly profilePersonal = this._profilePersonal.asObservable();

  constructor(private commonData: CommonDataService,
              private http: HttpClient) { }

  public getProfilePersonal() {
    console.log('getProfilePersonal');
    this.http.get<IuserProfile>(`${this.dataSvcURL}/profile-personal`,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }})
    .subscribe(data => {
      this.dataStore.profilePersonal = data;
      console.log('Service profile=', this.dataStore.profilePersonal);
      this._profilePersonal.next(Object.assign({}, this.dataStore).profilePersonal);
    }, error =>
        console.log('error loading profile personal'));
  }
}
