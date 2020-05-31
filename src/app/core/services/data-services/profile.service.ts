import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { SharedComponent } from '@shared/shared.component';

export interface Iblog {
  _id: string,
  link: string,
  linkDesc: string,
  linkTitle: string,
  linkImage: string
}

export interface IforumList {
  _id: string
}

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
  helpNewbies: boolean;
  rvUse: string;
  worklife: string;
  campsWithMe: string;
  boondocking: string;
  traveling: string;
  rigType: string;
  rigLength: number;
  rigManufacturer: string;
  rigBrandID: string;
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
  forums: Array<IforumList>;
  notifySubscription: string;
  rigImageUrls: Array<string>;
  lifestyleImageUrls: Array<string>;
  sendMessageEmails: boolean;
  blogLinks: Array<Iblog>,
  hideInstall: boolean
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
    helpNewbies: false,
    rvUse: null,
    worklife: null,
    campsWithMe: null,
    boondocking: null,
    traveling: null,
    rigType: null,
    rigLength: null,
    rigManufacturer: null,
    rigBrandID: null,
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
    lifestyleImageUrls: [],
    sendMessageEmails: true,
    blogLinks: [],
    hideInstall: false
  };

  ngOnDestroy() {}


  private profileSubscription: any;

  private _profile = new BehaviorSubject<IuserProfile>(this.userProfile);
  private dataStore: { profile: IuserProfile } = { profile: this.userProfile }
  readonly profile = this._profile.asObservable();

  constructor(private shared: SharedComponent,
              private http: HttpClient) { }


  addBlogLinkToProfile(profileID: string, blogLink: string, blogDesc: string, blogTitle: string, blogImage: string): Observable<any> {
    let params = {
      profileID: profileID,
      blogDesc: blogDesc,
      blogTitle: blogTitle,
      blogImage: blogImage,
      blogLink: blogLink
    }

    return this.http.put(`/api/profile-blog-link`, params, {});
  }

  addGroupToProfile(profileID: string, groupID: string): Observable<any> {
    let params = {
      profileID: profileID,
      groupID: groupID
    }

    return this.http.put(`/api/profile-forums`, params, {});
  }

  addLifestyleImageUrlToProfile(profileID: string, lifestyleImageUrl: string): Observable<any> {
    let params = {
      profileID: profileID,
      lifestyleImageUrl: lifestyleImageUrl
    }

    return this.http.put(`/api/profile-lifestyle-image`, params, {});
  }

  addRigImageUrlToProfile(profileID: string, rigImageUrl: string): Observable<any> {
    let params = {
      profileID: profileID,
      rigImageUrl: rigImageUrl
    }

    return this.http.put(`/api/profile-rig-image`, params, {});
  }

  deleteBlogLinkFromProfile(profileID: string, blogID: string): Observable<any> {
    let params = {
      profileID: profileID,
      blogID: blogID
    }

    return this.http.put(`/api/profile-blog-link-delete`, params, {});
  }

  deleteLifestyleImageUrlFromProfile(profileID: string, lifestyleImageUrl: string): Observable<any> {
    let params = {
      profileID: profileID,
      lifestyleImageUrl: lifestyleImageUrl
    }

    return this.http.put(`/api/profile-lifestyle-image-delete`, params, {});
  }

  deleteRigImageUrlFromProfile(profileID: string, rigImageUrl: string): Observable<any> {
    let params = {
      profileID: profileID,
      rigImageUrl: rigImageUrl
    }

    return this.http.put(`/api/profile-rig-image-delete`, params, {});
  }

  deleteTempProfileImage(imageUrl: string): Observable<any> {
    let params = {
      imageUrl: imageUrl
    }

    return this.http.put(`/api/profile-delete-temp-image`, params, {});
  }

  distributeProfileUpdate(userProfile: IuserProfile) {
    this.dataStore.profile = userProfile;
    this._profile.next(Object.assign({}, this.dataStore).profile);
  }

  getProfile(reset?: boolean) {
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
      this.dataStore.profile.helpNewbies = false;
      this.dataStore.profile.rvUse = null;
      this.dataStore.profile.worklife = null;
      this.dataStore.profile.campsWithMe = null;
      this.dataStore.profile.boondocking = null;
      this.dataStore.profile.traveling = null;
      this.dataStore.profile.rigType = null;
      this.dataStore.profile.rigLength = null;
      this.dataStore.profile.rigManufacturer = null;
      this.dataStore.profile.rigBrandID = null;
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
      this.dataStore.profile.sendMessageEmails = true;
      this.dataStore.profile.blogLinks = [];
      this.dataStore.profile.hideInstall = false;
      this._profile.next(Object.assign({}, this.dataStore).profile);
    } else {
      this.profileSubscription = this.http.get<IuserProfile>(`/api/profile`)
      .pipe(untilComponentDestroyed(this))
      .subscribe(data => {
        this.dataStore.profile = data;
        this._profile.next(Object.assign({}, this.dataStore).profile);
      }, (error) => {
        this.shared.notifyUserMajorError();
        throw new Error(error);
      });
    }
  }

  getNewBrands(): Observable<any> {
    return this.http.get(`/api/profile-new-brands`);
  }

  getUserProfile(userID: string): Observable<any> {
    let params = new HttpParams().set('userID', userID);

    return this.http.get(`/api/profile-user`, { params: params });
  }

  updateProfileAttribute(profileID: string, attribute: string, value: any): Observable<any> {
    let params = {
      profileID: profileID,
      attribute: attribute,
      value: value
    }

    return this.http.put(`/api/profile-attribute-update`, params, {});
  }

  dispose() {
    this.profileSubscription.unsubscribe();
  }

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    return newString;
  }
}
