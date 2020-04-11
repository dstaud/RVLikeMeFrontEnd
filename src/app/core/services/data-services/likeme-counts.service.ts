import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

import { SharedComponent } from '@shared/shared.component';

export interface IlikeMeCounts {
  allUsersCount: number;
  aboutMe: number;
  rvUse: number;
  rigType: number;
  worklife: number;
  yearOfBirth: number;
  rigManufacturer: number;
  rigBrand: number;
  rigModel: number;
  campsWithMe: number;
  boondocking: number;
  traveling: number;
  atv: number;
  motorcycle: number;
  travel: number;
  quilting: number;
  cooking: number;
  painting: number;
  blogging: number;
  livingFrugally: number;
  gaming: number;
  musicalInstrument: number;
  programming: number;
  mobileInternet: number;
  homeCountry: number;
  homeState: number;
  gender: number;
  rigYear: number;
  allCounts: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LikemeCountsService {
  private likeMeUserCounts: IlikeMeCounts = {
    allUsersCount: 0,
    aboutMe: 0,
    rvUse: 0,
    rigType: 0,
    worklife: 0,
    yearOfBirth: 0,
    rigManufacturer: 0,
    rigBrand: 0,
    rigModel: 0,
    campsWithMe: 0,
    boondocking: 0,
    traveling: 0,
    atv: 0,
    motorcycle: 0,
    travel: 0,
    quilting: 0,
    cooking: 0,
    painting: 0,
    blogging: 0,
    livingFrugally: 0,
    gaming: 0,
    musicalInstrument: 0,
    programming: 0,
    mobileInternet: 0,
    homeCountry: 0,
    homeState: 0,
    gender: 0,
    rigYear: 0,
    allCounts: false
  };

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private likeMeCountsSubscription: any;
  private _likeMeCounts = new BehaviorSubject<IlikeMeCounts>(this.likeMeUserCounts);
  private dataStore: { likeMeCounts: IlikeMeCounts } = { likeMeCounts: this.likeMeUserCounts }
  readonly likeMeCounts = this._likeMeCounts.asObservable();

  constructor(private http: HttpClient,
              private profileSvc: ProfileService,
              private shared: SharedComponent) { }

  getLikeMeCountsPriority() {
    console.log('getLikeMeCountsPriority:');
    this.likeMeCountsSubscription = this.http.get<IlikeMeCounts>(`/api/user-counts-priority`)
    .subscribe(counts => {
      this.dataStore.likeMeCounts.allUsersCount = counts.allUsersCount;
      this.dataStore.likeMeCounts.aboutMe = counts.aboutMe;
      this.dataStore.likeMeCounts.rvUse = counts.rvUse;
      this.dataStore.likeMeCounts.rigType = counts.rigType;
      console.log('getLikeMeCountsPriority:, counts returned=', this.dataStore.likeMeCounts);

      this._likeMeCounts.next(Object.assign({}, this.dataStore).likeMeCounts);

    }, error => {
      console.log('LikeMeCountsService:getLikeMeCountsPriority: throw error ', error);
      throw new Error(error);
    });
  }

  getLikeMeCountsSecondary() {
    console.log('getLikeMeCountsSecondary:');
    this.likeMeCountsSubscription = this.http.get<IlikeMeCounts>(`/api/user-counts-secondary`)
    .subscribe(counts => {
      this.dataStore.likeMeCounts.allUsersCount = counts.allUsersCount;
      this.dataStore.likeMeCounts.aboutMe = counts.aboutMe;
      this.dataStore.likeMeCounts.rvUse = counts.rvUse;
      this.dataStore.likeMeCounts.rigType = counts.rigType;
      this.dataStore.likeMeCounts.atv = counts.atv;
      this.dataStore.likeMeCounts.blogging = counts.blogging;
      this.dataStore.likeMeCounts.boondocking = counts.boondocking;
      this.dataStore.likeMeCounts.campsWithMe = counts.campsWithMe;
      this.dataStore.likeMeCounts.cooking = counts.cooking;
      this.dataStore.likeMeCounts.gaming = counts.gaming;
      this.dataStore.likeMeCounts.gender = counts.gender;
      this.dataStore.likeMeCounts.homeCountry = counts.homeCountry;
      this.dataStore.likeMeCounts.homeState = counts.homeState;
      this.dataStore.likeMeCounts.livingFrugally = counts.livingFrugally;
      this.dataStore.likeMeCounts.mobileInternet = counts.mobileInternet;
      this.dataStore.likeMeCounts.motorcycle = counts.motorcycle;
      this.dataStore.likeMeCounts.musicalInstrument = counts.musicalInstrument;
      this.dataStore.likeMeCounts.painting = counts.painting;
      this.dataStore.likeMeCounts.programming = counts.programming;
      this.dataStore.likeMeCounts.quilting = counts.quilting;
      this.dataStore.likeMeCounts.rigBrand = counts.rigBrand;
      this.dataStore.likeMeCounts.rigManufacturer = counts.rigManufacturer;
      this.dataStore.likeMeCounts.rigModel = counts.rigModel;
      this.dataStore.likeMeCounts.rigYear = counts.rigYear;
      this.dataStore.likeMeCounts.travel = counts.travel;
      this.dataStore.likeMeCounts.traveling = counts.traveling;
      this.dataStore.likeMeCounts.worklife = counts.worklife;
      this.dataStore.likeMeCounts.yearOfBirth = counts.yearOfBirth;
      this.dataStore.likeMeCounts.allCounts = true;

      console.log('getLikeMeCountsSecondary: counts returned=', this.dataStore.likeMeCounts);

      this._likeMeCounts.next(Object.assign({}, this.dataStore).likeMeCounts);

    }, (error) => {
      console.log('LikeMeCountsService:getLikeMeCountsSecondary: throw error ', error);
      throw new Error(error);
    });
  }

  getUserQueryCounts(query): Observable<any> {

    // Append the user's multiple query profile attributes into name/value delimited strings
    let name = query[0].name;
    let value = query[0].value;

    for (let i=1; i < query.length; i++) {
      name = name + '|' + query[i].name;
      value = value + '|' + query[i].value;
    }

    return this.http.get(`/api/user-query`, { params: {name, value}});
  }
}
