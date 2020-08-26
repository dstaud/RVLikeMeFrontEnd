import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { IuserQuery } from '@services/share-data.service';

import { SharedComponent } from '@shared/shared.component';

export interface IgroupByCounts {
  aboutMe: [{
    _id: string;
    count: number;
  }],
  rvUse: [{
    _id: string;
    count: number;
  }],
  rigType: [{
    _id: string;
    count: number;
  }]
}

export interface IlikeMeCounts {
  allUsersCount: number;
  aboutMe: number;
  rvUse: number;
  rigType: number;
  rigManufacturer: number;
  rigBrand: number;
  rigModel: number;
  rigLength: number;
  worklife: number;
  yearOfBirth: number;
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
  boondock: number;
  offGridLiving: number;
  solarPower: number;
  hiking: number;
  fishing: number;
  hunting: number;
  kayaking: number;
  yoga: number;
  knitting: number;
  crocheting: number;
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
    rigManufacturer: 0,
    rigBrand: 0,
    rigModel: 0,
    rigLength: 0,
    worklife: 0,
    yearOfBirth: 0,
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
    boondock: 0,
    offGridLiving: 0,
    solarPower: 0,
    hiking: 0,
    fishing: 0,
    hunting: 0,
    kayaking: 0,
    yoga: 0,
    knitting: 0,
    crocheting: 0,
    allCounts: false
  };

  ngOnDestroy() {}

  private groupByItemCounts: IgroupByCounts = {
    aboutMe: [{
      _id: '',
      count: 0
    }],
    rvUse: [{
      _id: '',
      count: 0
    }],
    rigType: [{
      _id: '',
      count: 0
    }]
  }

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  private likeMeCountsSubscription: any;
  private _likeMeCounts = new BehaviorSubject<IlikeMeCounts>(this.likeMeUserCounts);
  private dataStore: { likeMeCounts: IlikeMeCounts } = { likeMeCounts: this.likeMeUserCounts }
  readonly likeMeCounts = this._likeMeCounts.asObservable();

  private _groupByCounts = new BehaviorSubject<IgroupByCounts>(this.groupByItemCounts);
  private dataStoreGroupBy: { groupByCounts: IgroupByCounts } = { groupByCounts: this.groupByItemCounts }
  readonly groupByCounts = this._groupByCounts.asObservable();


  constructor(private http: HttpClient,
              private profileSvc: ProfileService,
              private shared: SharedComponent) { }


  getAboutMeCounts(aboutMe: string) {
    let params = new HttpParams().set('aboutMe', aboutMe);

    return this.http.get<number>(`/api/aboutMe`, { params: params });
  }

  getRvUseCounts(rvUse: string) {
    let params = new HttpParams().set('rvUse', rvUse);

    return this.http.get<number>(`/api/rvuse`, { params: params });
  }

  getRigCounts(rvUse: string) {
    let params = new HttpParams().set('rigType', rvUse);

    return this.http.get<number>(`/api/rigtype`, { params: params });
  }

  getLikeMeCountsPriority() {
    this.likeMeCountsSubscription = this.http.get<IlikeMeCounts>(`/api/user-counts-priority`)
    .pipe(untilComponentDestroyed(this))
    .subscribe(counts => {
      this.dataStore.likeMeCounts.allUsersCount = counts.allUsersCount;
      this.dataStore.likeMeCounts.aboutMe = counts.aboutMe;
      this.dataStore.likeMeCounts.rvUse = counts.rvUse;
      this.dataStore.likeMeCounts.rigType = counts.rigType;
      this.dataStore.likeMeCounts.rigManufacturer = counts.rigManufacturer;

      this._likeMeCounts.next(Object.assign({}, this.dataStore).likeMeCounts);
      this.getLikeMeCountsSecondary();
    }, error => {
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    });
  }

  getLikeMeCountsSecondary() {
    this.likeMeCountsSubscription = this.http.get<IlikeMeCounts>(`/api/user-counts-secondary`)
    .pipe(untilComponentDestroyed(this))
    .subscribe(counts => {
      this.dataStore.likeMeCounts.allUsersCount = counts.allUsersCount;
      this.dataStore.likeMeCounts.aboutMe = counts.aboutMe;
      this.dataStore.likeMeCounts.rvUse = counts.rvUse;
      this.dataStore.likeMeCounts.rigType = counts.rigType;
      this.dataStore.likeMeCounts.rigManufacturer = counts.rigManufacturer;
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
      this.dataStore.likeMeCounts.rigLength = counts.rigLength;
      this.dataStore.likeMeCounts.rigBrand = counts.rigBrand;
      this.dataStore.likeMeCounts.rigModel = counts.rigModel;
      this.dataStore.likeMeCounts.rigYear = counts.rigYear;
      this.dataStore.likeMeCounts.travel = counts.travel;
      this.dataStore.likeMeCounts.traveling = counts.traveling;
      this.dataStore.likeMeCounts.worklife = counts.worklife;
      this.dataStore.likeMeCounts.yearOfBirth = counts.yearOfBirth;
      this.dataStore.likeMeCounts.boondock = counts.boondock;
      this.dataStore.likeMeCounts.offGridLiving = counts.offGridLiving;
      this.dataStore.likeMeCounts.solarPower = counts.solarPower;
      this.dataStore.likeMeCounts.hiking = counts.hiking;
      this.dataStore.likeMeCounts.fishing = counts.fishing;
      this.dataStore.likeMeCounts.hunting = counts.hunting;
      this.dataStore.likeMeCounts.kayaking = counts.kayaking;
      this.dataStore.likeMeCounts.yoga = counts.yoga;
      this.dataStore.likeMeCounts.knitting = counts.knitting;
      this.dataStore.likeMeCounts.crocheting = counts.crocheting;
      this.dataStore.likeMeCounts.allCounts = true;

      this._likeMeCounts.next(Object.assign({}, this.dataStore).likeMeCounts);
    }, (error) => {
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    });
  }

  getUserQueryCounts(query: Array<IuserQuery>): Observable<any> {
    let attribute: string;
    let attributeValue: any;
    let i: number = 0;
    let name: string;
    let value: any;


    // Append the user's multiple query profile attributes into name/value delimited strings
    query.forEach((item: IuserQuery) => {
      attribute = Object.keys(item)[0];
      attributeValue = Object.values(item)[0];

      if (i === 0) {
        name = attribute;
        value = attributeValue;
      } else {
        name = name + '|' + attribute;
        value = value + '|' + attributeValue;
      }
      i++
    });

    return this.http.get(`/api/user-query`, { params: {name, value}});
  }

  getGroupByCounts() {
    return this.http.get<IgroupByCounts>(`/api/analytics`)
    .pipe(untilComponentDestroyed(this))
    .subscribe(counts => {
      this.dataStoreGroupBy.groupByCounts = counts;

      this._groupByCounts.next(Object.assign({}, this.dataStoreGroupBy).groupByCounts);

    }, error => {
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    });
  }
}
