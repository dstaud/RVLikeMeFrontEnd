import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  private userAuth = new Subject<boolean>();
  userAuth$ = this.userAuth.asObservable();

  constructor() { }

  public userAuthorized(auth: boolean): void {
    this.userAuth.next(auth);
  }
}
