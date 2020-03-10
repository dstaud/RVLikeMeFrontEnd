import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';

import { CommonDataService } from './common-data.service';

import { SharedComponent } from '@shared/shared.component';

export interface IlikeMeCounts {
  allUsersCount: number;
  aboutMeCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class LikemeCountsService {
  private likeMeUserCounts: IlikeMeCounts = {
    allUsersCount: 0,
    aboutMeCount: 0
  };
  private likeMeCountsSubscription: any;
  private dataSvcURL = this.commonData.getLocation();
  private _likeMeCounts = new BehaviorSubject<IlikeMeCounts>(this.likeMeUserCounts);
  private dataStore: { likeMeCounts: IlikeMeCounts } = { likeMeCounts: this.likeMeUserCounts }
  readonly likeMeCounts = this._likeMeCounts.asObservable();

  constructor(private commonData: CommonDataService,
              private http: HttpClient,
              private shared: SharedComponent) { }

  getLikeMeCounts() {
    this.likeMeCountsSubscription = this.http.get<IlikeMeCounts>(`${this.dataSvcURL}/user-counts`,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }})
    .subscribe(data => {
      console.log('data=', data);
      this.dataStore.likeMeCounts = data;
      this._likeMeCounts.next(Object.assign({}, this.dataStore).likeMeCounts);
    }, (error) => {
      console.warn('ERROR loading all users count: ', error);
      if (error.message.includes('Unknown Error')) {
        this.shared.openSnackBar('Oops! Having trouble connecting to the Internet.  Please check your connectivity settings.','error', 5000);
      }
    });
  }


  private handleBackendError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    if (error.status === 401) {
      return;
    } else {
      // return throwError(errorMessage);
    }
  }
}
