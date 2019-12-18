import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SigninVisibilityService {
  private signinVisible = new Subject<boolean>();
  signinVisible$ = this.signinVisible.asObservable();

  constructor() { }

  public toggleSignin(show: boolean): void {
    console.log('in signin visibility');
    this.signinVisible.next(show);
  }
}
