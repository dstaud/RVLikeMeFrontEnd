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
  colorThemePreference: string;
  aboutMe: string;
  rvUse: string;
  worklife: string;
  campsWithMe: string;
  boondocking: string;
  traveling: string;
  rigType: string;
  rigManufacturer: string;
  rigBrand: string;
  rigModel: string;
  rigYear: number;
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
    colorThemePreference: 'light-theme',
    aboutMe: null,
    rvUse: null,
    worklife: null,
    campsWithMe: null,
    boondocking: null,
    traveling: null,
    rigType: null,
    rigManufacturer: null,
    rigBrand: null,
    rigModel: null,
    rigYear: null
  };
  private profileSubscription: any;

  private dataSvcURL = this.commonData.getLocation();

  private _profile = new BehaviorSubject<IuserProfile>(this.userProfile);
  private dataStore: { profile: IuserProfile } = { profile: this.userProfile }
  readonly profile = this._profile.asObservable();

  constructor(private commonData: CommonDataService,
              private http: HttpClient) { }

  getProfile(reset?: boolean) {
    console.log('getProfile, reset=', reset);
    if (reset) {
      console.log('resetting');
      this.dataStore.profile.firstName = null;
      this.dataStore.profile.lastName = null;
      this.dataStore.profile.displayName =null;
      this.dataStore.profile.yearOfBirth = null;
      this.dataStore.profile.homeCountry = null;
      this.dataStore.profile.homeState = null;
      this.dataStore.profile.language = 'en';
      this.dataStore.profile.colorThemePreference = 'light-theme';
      this.dataStore.profile.aboutMe = null;
      this.dataStore.profile.rvUse = null;
      this.dataStore.profile.worklife = null;
      this.dataStore.profile.campsWithMe = null;
      this.dataStore.profile.boondocking = null;
      this.dataStore.profile.traveling = null;
      this.dataStore.profile.rigType = null;
      this.dataStore.profile.rigManufacturer = null;
      this.dataStore.profile.rigBrand = null;
      this.dataStore.profile.rigModel = null;
      this.dataStore.profile.rigYear = null;
      console.log('Service profile=', this.dataStore.profile);
      this._profile.next(Object.assign({}, this.dataStore).profile);
    } else {
      console.log('getting data');
      this.profileSubscription = this.http.get<IuserProfile>(`${this.dataSvcURL}/profile`,
      { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }})
      .subscribe(data => {
        console.log('subscribed', this.dataStore.profile);
        this.dataStore.profile = data;
        console.log('Service profile=', this.dataStore.profile);
        this._profile.next(Object.assign({}, this.dataStore).profile);
      }, error =>
          console.log('error loading profile'));
    }
  }

  addProfile(userProfile: IuserProfile): Observable<any> {
    console.log('http add profile=', userProfile);
    return this.http.post(`${this.dataSvcURL}/profile`, userProfile,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }});
  }

/*   distributeProfileUpdate(userProfile: IuserProfile) {
    console.log('distribute profile=', userProfile);
    this.dataStore.profile = userProfile;
    this._profile.next(Object.assign({}, this.dataStore).profile);
  } */

  updateProfile(userProfile: IuserProfile): Observable<any> {
    console.log('http update profile=', userProfile, this.dataStore.profile);
    return this.http.put(`${this.dataSvcURL}/profile`, userProfile,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }});
  }

  public dispose() {
    console.log('dispose of subscription');
    this.profileSubscription.unsubscribe();
  }
}
