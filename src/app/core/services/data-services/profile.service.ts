import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { CommonDataService } from './common-data.service';
import { SharedComponent } from '@shared/shared.component';

export interface IuserProfile {
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
    mobileInternet: null
  };
  private profileSubscription: any;

  private dataSvcURL = this.commonData.getLocation();

  private _profile = new BehaviorSubject<IuserProfile>(this.userProfile);
  private dataStore: { profile: IuserProfile } = { profile: this.userProfile }
  readonly profile = this._profile.asObservable();

  constructor(private commonData: CommonDataService,
              private shared: SharedComponent,
              private http: HttpClient) { }

  getProfile(reset?: boolean) {
    if (reset) {
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
      this._profile.next(Object.assign({}, this.dataStore).profile);
    } else {
      this.profileSubscription = this.http.get<IuserProfile>(`${this.dataSvcURL}/profile`,
      { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }})
      .subscribe(data => {
        this.dataStore.profile = data;
        this._profile.next(Object.assign({}, this.dataStore).profile);
      }, (error) => {
        console.warn('ERROR loading profile: ', error);
        if (error.message.includes('Unknown Error')) {
          this.shared.openSnackBar('Oops! Having trouble connecting to the Internet.  Please check your connectivity settings.','error', 5000);
        }
      });
    }
  }

  addProfile(userProfile: IuserProfile): Observable<any> {
    return this.http.post(`${this.dataSvcURL}/profile`, userProfile,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }});
  }

  distributeProfileUpdate(userProfile: IuserProfile) {
    this.dataStore.profile = userProfile;
    this._profile.next(Object.assign({}, this.dataStore).profile);
  }

  updateProfile(userProfile: IuserProfile): Observable<any> {
    return this.http.put(`${this.dataSvcURL}/profile`, userProfile,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }});
  }

  uploadProfileImage(fd: FormData) {
    return this.http.post(`${this.dataSvcURL}/upload-image`, fd,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` },
    reportProgress: true,
    observe: 'events'
    });
  }

  uploadProfileImageBase64(image: string) {
    let imagePackage = {'image': image}
    return this.http.post(`${this.dataSvcURL}/upload-image`, imagePackage,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` },
    reportProgress: true,
    observe: 'events'
    });
  }

  public dispose() {
    this.profileSubscription.unsubscribe();
  }
}
