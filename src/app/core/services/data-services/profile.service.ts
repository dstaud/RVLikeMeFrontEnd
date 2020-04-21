import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { SharedComponent } from '@shared/shared.component';

export interface IuserProfile {
  _id: string;
  userID: string;
  firstName: string;
  lastName: string;
  displayName: string;
  yearOfBirth: number;
  gender: string;
  homeCountry: string;
  homeState: string;
  myStory: string;
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
  profileImageUrl: string;
  atv: boolean;
  motorcycle: boolean;
  travel: boolean;
  quilting: boolean;
  cooking: boolean;
  painting: boolean;
  blogging: boolean;
  livingFrugally: boolean;
  gaming: boolean;
  musicalInstrument: boolean;
  programming: boolean;
  mobileInternet: boolean;
  forums: Array<string>;
  notifySubscription: string;
  rigImageUrls: Array<string>;
  lifestyleImageUrls: Array<string>;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // private user: IuserProfile;
  private userProfile: IuserProfile = {
    _id: null,
    userID: null,
    firstName: null,
    lastName: null,
    displayName: null,
    yearOfBirth: null,
    gender: null,
    homeCountry: null,
    homeState: null,
    myStory: null,
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
    rigYear: null,
    profileImageUrl: null,
    atv: null,
    motorcycle: null,
    travel: null,
    quilting: null,
    cooking: null,
    painting: null,
    blogging: null,
    livingFrugally: null,
    gaming: null,
    musicalInstrument: null,
    programming: null,
    mobileInternet: null,
    forums: [],
    notifySubscription: null,
    rigImageUrls: [],
    lifestyleImageUrls: []
  };
  private profileSubscription: any;

  private _profile = new BehaviorSubject<IuserProfile>(this.userProfile);
  private dataStore: { profile: IuserProfile } = { profile: this.userProfile }
  readonly profile = this._profile.asObservable();

  constructor(private shared: SharedComponent,
              private http: HttpClient) { }

  getProfile(reset?: boolean) {
    console.log('ProfileService:getProfile:');
    if (reset) {
      this.dataStore.profile._id = null;
      this.dataStore.profile.userID = null;
      this.dataStore.profile.firstName = null;
      this.dataStore.profile.lastName = null;
      this.dataStore.profile.displayName =null;
      this.dataStore.profile.yearOfBirth = null;
      this.dataStore.profile.gender = null;
      this.dataStore.profile.homeCountry = null;
      this.dataStore.profile.homeState = null;
      this.dataStore.profile.myStory = null;
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
      this.dataStore.profile.profileImageUrl = null;
      this.dataStore.profile.atv = null;
      this.dataStore.profile.motorcycle = null;
      this.dataStore.profile.travel = null;
      this.dataStore.profile.quilting = null;
      this.dataStore.profile.cooking = null;
      this.dataStore.profile.painting = null;
      this.dataStore.profile.blogging = null;
      this.dataStore.profile.livingFrugally = null;
      this.dataStore.profile.gaming = null;
      this.dataStore.profile.musicalInstrument = null;
      this.dataStore.profile.programming = null;
      this.dataStore.profile.mobileInternet = null;
      this.dataStore.profile.forums = [];
      this.dataStore.profile.notifySubscription = null;
      this.dataStore.profile.rigImageUrls = [];
      this.dataStore.profile.lifestyleImageUrls = [];
      this._profile.next(Object.assign({}, this.dataStore).profile);
    } else {
      console.log('ProfileService:getProfile: Getting Profile');
      this.profileSubscription = this.http.get<IuserProfile>(`/api/profile`)
      .subscribe(data => {
        this.dataStore.profile = data;
        console.log('ProfileService:getProfile: Profile=', this.dataStore.profile);
        this._profile.next(Object.assign({}, this.dataStore).profile);
      }, (error) => {
        console.log('ProfileService:getProfile: throw error ', error);
        throw new Error(error);
      });
    }
  }

  // Get profile for a user based on user ID
  getUserProfile(userID: string): Observable<any> {
    let param = JSON.parse('{"userID":"' + userID + '"}');
    console.log('ProfileService:getMyStory: params=', param);

    return this.http.get(`/api/profile-user`, { params: param });
  }

  addProfile(userProfile: IuserProfile): Observable<any> {
    return this.http.post(`/api/profile`, userProfile, {});
  }

  distributeProfileUpdate(userProfile: IuserProfile) {
    this.dataStore.profile = userProfile;
    this._profile.next(Object.assign({}, this.dataStore).profile);
  }

  updateProfile(userProfile: IuserProfile): Observable<any> {
    console.log('updateProfile: for profile ', userProfile)
    return this.http.put(`/api/profile`, userProfile, {});
  }

  addGroupToProfile(profileID: string, groupID: string): Observable<any> {
    let group = '{"profileID":"' + profileID + '","groupID":"' + groupID + '"}';
    let groupJSON = JSON.parse(group);
    console.log('updateProfile: params=', groupJSON)
    return this.http.put(`/api/profile-forums`, groupJSON, {});
  }

  addRigImageUrlToProfile(profileID: string, rigImageUrl: string): Observable<any> {
    let imageUrl = '{"profileID":"' + profileID + '","rigImageUrl":"' + rigImageUrl + '"}';
    let imageUrlJSON = JSON.parse(imageUrl);
    console.log('updateProfile: params=', imageUrlJSON)
    return this.http.put(`/api/profile-rig-image`, imageUrlJSON, {});
  }

  deleteRigImageUrlFromProfile(profileID: string, lifestyleImageUrl: string): Observable<any> {
    let imageUrl = '{"profileID":"' + profileID + '","rigImageUrl":"' + lifestyleImageUrl + '"}';
    let imageUrlJSON = JSON.parse(imageUrl);
    console.log('updateProfile: params=', imageUrlJSON)
    return this.http.put(`/api/profile-rig-image-delete`, imageUrlJSON, {});
  }

  addLifestyleImageUrlToProfile(profileID: string, lifestyleImageUrl: string): Observable<any> {
    let imageUrl = '{"profileID":"' + profileID + '","lifestyleImageUrl":"' + lifestyleImageUrl + '"}';
    let imageUrlJSON = JSON.parse(imageUrl);
    console.log('updateProfile: params=', imageUrlJSON)
    return this.http.put(`/api/profile-lifestyle-image`, imageUrlJSON, {});
  }

  deleteLifestyleImageUrlFromProfile(profileID: string, lifestyleImageUrl: string): Observable<any> {
    let imageUrl = '{"profileID":"' + profileID + '","lifestyleImageUrl":"' + lifestyleImageUrl + '"}';
    let imageUrlJSON = JSON.parse(imageUrl);
    console.log('updateProfile: params=', imageUrlJSON)
    return this.http.put(`/api/profile-lifestyle-image-delete`, imageUrlJSON, {});
  }

  public dispose() {
    this.profileSubscription.unsubscribe();
  }
}
