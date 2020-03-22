import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';

import { CommonDataService } from './common-data.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

import { SharedComponent } from '@shared/shared.component';

export interface IlikeMeCounts {
  allUsersCount: number;
  gender: number;
  yearOfBirth: number;
  homeCountry: number;
  homeState: number;
  aboutMe: number;
  rvUse: number;
  worklife: number;
  campsWithMe: number;
  boondocking: number;
  traveling: number;
  rigType: number;
  rigManufacturer: number;
  rigBrand: number;
  rigModel: number;
  rigYear: number;
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
}

@Injectable({
  providedIn: 'root'
})
export class LikemeCountsService {
  private likeMeUserCounts: IlikeMeCounts = {
    allUsersCount: 0,
    gender: 0,
    yearOfBirth: 0,
    homeCountry: 0,
    homeState: 0,
    aboutMe: 0,
    rvUse: 0,
    worklife: 0,
    campsWithMe: 0,
    boondocking: 0,
    traveling: 0,
    rigType: 0,
    rigManufacturer: 0,
    rigBrand: 0,
    rigModel: 0,
    rigYear: 0,
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
    mobileInternet: 0
  };

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private likeMeCountsSubscription: any;
  private dataSvcURL = this.commonData.getLocation();
  private _likeMeCounts = new BehaviorSubject<IlikeMeCounts>(this.likeMeUserCounts);
  private dataStore: { likeMeCounts: IlikeMeCounts } = { likeMeCounts: this.likeMeUserCounts }
  readonly likeMeCounts = this._likeMeCounts.asObservable();

  constructor(private commonData: CommonDataService,
              private http: HttpClient,
              private profileSvc: ProfileService,
              private shared: SharedComponent) { }

  getLikeMeCounts() {
    this.likeMeCountsSubscription = this.http.get<IlikeMeCounts>(`${this.dataSvcURL}/user-counts`,
    {
      headers: { Authorization: `Bearer ${this.commonData.getToken()}` }
    })
    .subscribe(data => {
      this.dataStore.likeMeCounts = data;
      this._likeMeCounts.next(Object.assign({}, this.dataStore).likeMeCounts);
      console.log('COUNTS=', this.dataStore.likeMeCounts);
      // this._likeMeCounts.complete();
    }, (error) => {
      console.warn('ERROR loading user counts: ', error);
      if (error.message.includes('Unknown Error')) {
        this.shared.openSnackBar('Oops! Having trouble connecting to the Internet.  Please check your connectivity settings.','error', 5000);
      }
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

    return this.http.get(`${this.dataSvcURL}/user-query`,
    {
      headers: { Authorization: `Bearer ${this.commonData.getToken()}` },
      params: {name, value}
    });
  }
}
