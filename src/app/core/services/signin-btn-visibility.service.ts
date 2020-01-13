import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Publish current state of whether to show signin on toolbar
@Injectable({
  providedIn: 'root'
})
export class SigninButtonVisibleService {
  private signinButtonVisible = new Subject<boolean>();
  signinButtonVisible$ = this.signinButtonVisible.asObservable();

  constructor() { }

  public toggleSigninButtonVisible(show: boolean): void {
    this.signinButtonVisible.next(show);
  }
}
