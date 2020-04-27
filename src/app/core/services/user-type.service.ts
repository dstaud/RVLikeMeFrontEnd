import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserTypeService {
  private _userType = new BehaviorSubject<string>('newbie');
  userType = this._userType.asObservable();

  constructor() { }

  setUserType(userType: string): void {
    this._userType.next(userType);
  }
}
