import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Publish current state of whether to show signin on toolbar
@Injectable({
  providedIn: 'root'
})
export class SigninVisibilityService {
  private signinVisible = new Subject<boolean>();
  signinVisible$ = this.signinVisible.asObservable();

  constructor() { }

  public toggleSignin(show: boolean): void {
    this.signinVisible.next(show);
  }
}
