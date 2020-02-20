import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { CommonDataService } from './common-data.service';

export interface IuserProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  yearOfBirth: number;
  homeCountry: string;
  homeState: string;
  language: string;
  aboutMe: string;
  rvUse: string;
  worklife: string;
  campsWithMe: string;
  boondocking: string;
  traveling: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // private user: IuserProfile;
  private userProfile: IuserProfile = {
    firstName: null,
    lastName: null,
    displayName: null,
    yearOfBirth: null,
    homeCountry: null,
    homeState: null,
    language: 'en',
    aboutMe: null,
    rvUse: null,
    worklife: null,
    campsWithMe: null,
    boondocking: null,
    traveling: null
  };
  private profileSubscription: any;

  private dataSvcURL = this.commonData.getLocation();

  private _profile = new BehaviorSubject<IuserProfile>(this.userProfile);
  private dataStore: { profile: IuserProfile } = { profile: this.userProfile }
  readonly profile = this._profile.asObservable();

  constructor(private commonData: CommonDataService,
              private http: HttpClient) { }

  public getProfile() {
    console.log('getProfile');
    this.profileSubscription = this.http.get<IuserProfile>(`${this.dataSvcURL}/profile`,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }})
    .subscribe(data => {
      console.log('subscribed', data);
      this.dataStore.profile = data;
      console.log('Service profile=', this.dataStore.profile);
      this._profile.next(Object.assign({}, this.dataStore).profile);
    }, error =>
        console.log('error loading profile'));
  }

  public addProfile(userProfile: IuserProfile): Observable<any> {
    console.log('http add profile=', userProfile);
    return this.http.post(`${this.dataSvcURL}/profile`, userProfile,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }});
  }

  public updateProfile(userProfile: IuserProfile): Observable<any> {
    console.log('http update profile=', userProfile);
    return this.http.put(`${this.dataSvcURL}/profile`, userProfile,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }});
  }

  public dispose() {
    this.profileSubscription.unsubscribe();
  }
}
