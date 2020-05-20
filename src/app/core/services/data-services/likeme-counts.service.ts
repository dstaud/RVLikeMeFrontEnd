import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';

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
    allCounts: false
  };

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

  getLikeMeCountsPriority() {
    console.log('LikeMeCountsService:getLikeMeCountsPriority:')
    this.likeMeCountsSubscription = this.http.get<IlikeMeCounts>(`/api/user-counts-priority`)
    .subscribe(counts => {
      this.dataStore.likeMeCounts.allUsersCount = counts.allUsersCount;
      this.dataStore.likeMeCounts.aboutMe = counts.aboutMe;
      this.dataStore.likeMeCounts.rvUse = counts.rvUse;
      this.dataStore.likeMeCounts.rigType = counts.rigType;
      this.dataStore.likeMeCounts.rigManufacturer = counts.rigManufacturer;

      this._likeMeCounts.next(Object.assign({}, this.dataStore).likeMeCounts);
      console.log('LikeMeCountsService:getLikeMeCountsPriority: got priority and sent out, getting secondary')
      this.getLikeMeCountsSecondary();
    }, error => {
      console.error('LikeMeCountsService:getLikeMeCountsPriority: throw error ', error);
      throw new Error(error);
    });
  }

  getLikeMeCountsSecondary() {
    console.log('LikeMeCountsService:getLikeMeCountsSecondary:')
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
      this.dataStore.likeMeCounts.rigLength = counts.rigLength;
      this.dataStore.likeMeCounts.rigBrand = counts.rigBrand;
      this.dataStore.likeMeCounts.rigModel = counts.rigModel;
      this.dataStore.likeMeCounts.rigYear = counts.rigYear;
      this.dataStore.likeMeCounts.travel = counts.travel;
      this.dataStore.likeMeCounts.traveling = counts.traveling;
      this.dataStore.likeMeCounts.worklife = counts.worklife;
      this.dataStore.likeMeCounts.yearOfBirth = counts.yearOfBirth;
      this.dataStore.likeMeCounts.allCounts = true;

      this._likeMeCounts.next(Object.assign({}, this.dataStore).likeMeCounts);
      console.log('LikeMeCountsService:getLikeMeCountsSecondary: got like me counts secondary and sent out')
    }, (error) => {
      console.error('LikeMeCountsService:getLikeMeCountsSecondary: throw error ', error);
      throw new Error(error);
    });
  }

  getUserQueryCounts(query: Array<IuserQuery>): Observable<any> {
    let attribute: string;
    let attributeValue: any;
    let i: number = 0;
    let name: string;
    let value: any;

    console.log('getUserQueryCounts: query=', query);

    // Append the user's multiple query profile attributes into name/value delimited strings
    query.forEach((item: IuserQuery) => {
      console.log('getUserQueryCounts: item=', item);
      attribute = Object.keys(item)[0];
      attributeValue = Object.values(item)[0];
      console.log('getUserQueryCounts: attribute=', attribute, ' attributeValue=', attributeValue);
      if (i === 0) {
        name = attribute;
        value = attributeValue;
      } else {
        name = name + '|' + attribute;
        value = value + '|' + attributeValue;
      }
      i++
    });

    console.log('getUserQueryCounts: name=', name, ' value=', value);

    return this.http.get(`/api/user-query`, { params: {name, value}});
  }

  getGroupByCounts() {
    return this.http.get<IgroupByCounts>(`/api/analytics`)
    .subscribe(counts => {
      this.dataStoreGroupBy.groupByCounts = counts;

      this._groupByCounts.next(Object.assign({}, this.dataStoreGroupBy).groupByCounts);

    }, error => {
      console.error('LikeMeCountsService:getLikeMeCountsPriority: throw error ', error);
      throw new Error(error);
    });
  }
}
